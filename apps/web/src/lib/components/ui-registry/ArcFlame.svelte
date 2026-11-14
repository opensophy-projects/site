<script lang="ts">
  import { onMount } from "svelte";

  type Props = {
    /** Элемент дуги (.hero-arc): огонь идёт по его эллипсу */
    arc?: HTMLElement | null;
    color?: [number, number, number];
    height?: number;
    intensity?: number;
    scale?: number;
    turbulence?: number;
    turbulenceScale?: number;
    sparks?: number;
    smoke?: number;
    rim?: number;
    melt?: number;
    speed?: number;
    class?: string;
  };

  let {
    arc = null,
    color = [0.956, 0.247, 0.369],
    height = 90,
    intensity = 0.5,
    scale = 0.75,
    turbulence = 0.5,
    turbulenceScale = 0.5,
    sparks = 1.2,
    smoke = 1,
    rim = 2.5,
    melt = 4.5,
    speed = 0.25,
    class: className = "",
  }: Props = $props();

  let canvas = $state<HTMLCanvasElement>();
  // Канвас проявляется только после первого реального кадра — без пустой вспышки
  let ready = $state(false);

  const VERT = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPos;
out vec2 vUv;
void main () {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

  const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uCenter;
uniform vec2 uRadii;
uniform vec3 uColor;
uniform float uIntensity;
uniform float uHeight;
uniform float uSpread;
uniform float uScale;
uniform float uTurbulence;
uniform float uTurbScale;
uniform float uSparks;
uniform float uSmoke;
uniform float uRim;
uniform float uMelt;

#define S(a, b, t) smoothstep(a, b, t)

vec3 permute (vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise (vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm (vec2 p) {
  mat2 m = mat2(0.8, -0.6, 0.6, 0.8);
  float v = 0.5 * snoise(p);
  p = m * p * 2.03 + vec2(11.3, 7.1);
  v += 0.27 * snoise(p);
  p = m * p * 1.97 + vec2(3.7, 19.1);
  v += 0.15 * snoise(p);
  p = m * p * 2.01 + vec2(8.3, 2.9);
  v += 0.08 * snoise(p);
  return v * 0.5 + 0.5;
}

float fbm2 (vec2 p) {
  float v = 0.62 * snoise(p);
  v += 0.31 * snoise(mat2(0.8, -0.6, 0.6, 0.8) * p * 2.13 + vec2(5.2, 1.3));
  return v * 0.54 + 0.5;
}

vec2 turbulence (vec2 p) {
  float freq = 12.0 * clamp(uScale, 0.05, 1.0) * clamp(uTurbScale, 0.2, 3.0);
  mat2 rot = mat2(0.6, -0.8, 0.8, 0.6);
  for (float i = 0.0; i < 7.0; i++) {
    float phase = freq * (p * rot).y + 6.0 * uTime + i;
    p += uTurbulence * rot[0] * sin(phase) / freq;
    rot *= mat2(0.6, -0.8, 0.8, 0.6);
    freq *= 1.2;
  }
  return p;
}

vec3 hash3 (vec2 p) {
  vec3 q = vec3(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)), dot(p, vec2(419.2, 371.9)));
  return fract(sin(q) * 43758.5453);
}

// Приближённое расстояние со знаком до эллипса (плюс — снаружи)
float sdEllipse (vec2 p, vec2 r) {
  float k0 = length(p / r);
  float k1 = length(p / (r * r));
  return k0 * (k0 - 1.0) / max(k1, 1e-6);
}

void main () {
  vec2 frag = vUv * uResolution;
  vec2 rel = frag - uCenter;
  float unit = max(uHeight, 24.0);
  float t = uTime;
  float detail = clamp(uScale, 0.05, 1.0);

  float d0 = sdEllipse(rel, uRadii);
  if (d0 > unit * 1.8 || d0 < -(uMelt * 4.0 + 12.0)) {
    outColor = vec4(0.0);
    return;
  }

  float px = rel.x / unit;
  float py = d0 / unit;
  float yA = max(d0, 0.0) / unit;

  float sway = snoise(vec2(px * 1.1, t * 0.5)) * 0.55
    + snoise(vec2(px * 2.4, t * 0.9 + 41.0)) * 0.25;
  float sx = px + yA * sway;
  float env = fbm2(vec2(sx * 1.6 * detail + 3.7, t * 0.55 - yA * 0.4));
  float env2 = fbm2(vec2(sx * 3.6 * detail, t * 0.85 + 17.0 - yA * 0.6));
  float tongue = clamp(0.75 * S(0.3, 0.9, env) + 0.5 * S(0.4, 0.95, env2), 0.0, 1.0);

  float biteTop = (3.0 + uMelt * 1.4) * (0.35 + 0.65 * tongue)
    + 2.0 * snoise(vec2(px * 5.0 * detail, t * 1.1 + 5.0));
  float front = d0 + biteTop;
  float reach = unit * (0.2 + 0.45 * tongue);
  float q = front / reach;

  vec2 np = vec2(px * 2.3, py * 1.25 - t * 1.85) * detail;
  np = turbulence(np);
  float n = fbm(np);

  float win = S(-0.08, 0.02, q);
  float root = exp(-abs(q) * 5.0);
  float ridge = 1.0 - abs(2.0 * n - 1.0);
  float flameH = 0.5 + 0.6 * tongue;
  float g = max(q, 0.0) / flameH;
  float shred = fbm2(np * 1.9 + 63.0);
  g *= 1.0 + 0.7 * (shred - 0.5) * S(0.2, 0.8, g);
  float dens = n * 0.95 + ridge * 0.45 - 0.18
    + (1.0 - min(g, 1.0)) * 0.3
    - g * (0.9 + 0.25 * n);
  dens = clamp(dens * 2.4, 0.0, 1.0) * win;
  dens *= 1.0 - S(0.9, 1.2, g);
  float body = dens * dens * (3.0 - 2.0 * dens);
  float emis = clamp(uIntensity, 0.0, 2.0);
  float e = body * (0.55 + 0.75 * root) * (0.45 + 0.55 * n)
    + win * root * (0.1 + 0.4 * n);
  e *= max(emis, 0.001);

  vec3 hot = mix(uColor, vec3(1.0), 0.35);
  vec3 deep = mix(uColor, uColor * uColor, 0.5) * 0.9;
  float ramp = 1.0 - exp(-e * 2.4);
  vec3 fireCol = mix(deep, uColor, S(0.0, 0.55, ramp));
  float core = ramp * (0.45 + 0.55 * exp(-g * 2.2)) * (0.5 + 0.5 * n);
  fireCol = mix(fireCol, hot, S(0.7, 1.05, core));
  fireCol *= 0.8 + 0.4 * ramp;
  float fireA = clamp(1.0 - exp(-e * 3.4), 0.0, 1.0);

  float halo = exp(-max(front, 0.0) / (uSpread * 1.2)) * S(0.0, 3.0, front)
    * (0.5 + 0.5 * n) * 0.3 * clamp(uRim, 0.0, 2.0);
  vec3 glow = uColor * halo * emis;

  if (uSparks > 0.001) {
    float gate = S(-0.05, 0.1, q) * (1.0 - S(1.3, 2.2, q));
    float spark = 0.0;
    for (float L = 0.0; L < 2.0; L++) {
      float speed = 1.5 * (0.75 + 0.5 * L);
      vec2 ps = vec2(px, py - t * speed);
      ps.x += 0.08 * snoise(vec2(py * 0.9 + L * 5.0, t * 0.5));
      float cells = 5.0 * (1.0 + 0.6 * L);
      vec2 cl = floor(ps * cells) + L * 19.0;
      vec2 fr = fract(ps * cells);
      vec3 rnd = hash3(cl);
      vec3 rnd2 = hash3(cl + 7.3);
      float on = step(rnd2.x, 0.42);
      float life = fract(rnd.z + t * (0.3 + 0.5 * rnd2.x));
      vec2 ppos = vec2(0.5) + 0.56 * (rnd.xy - 0.5);
      ppos.x += 0.14 * sin(t * (0.7 + rnd.z * 2.8) + rnd.y * 6.2832)
        + 0.1 * snoise(vec2(t * 0.6 + rnd.x * 9.0, cl.y * 0.7))
        + (life - 0.5) * 0.5 * (rnd2.y - 0.5);
      ppos.y += (life - 0.5) * 0.3 * rnd2.y;
      float tw = S(0.02, 0.2, life) * S(1.0, 0.55, life);
      tw *= 0.75 + 0.25 * sin(t * (6.0 + rnd2.z * 9.0) + rnd.x * 6.2832);
      vec2 pd = (fr - ppos) / cells * unit;
      pd.y *= 0.55 + 0.3 * rnd2.z;
      float dp = length(pd);
      float r = (0.004 + 0.014 * rnd.y * rnd.y) * unit * 0.35 * mix(1.15, 0.55, life);
      float bmask = S(0.5, 0.32, max(abs(fr.x - 0.5), abs(fr.y - 0.5)));
      float sbody = exp(-dp * dp / (r * r));
      float sbloom = exp(-dp * dp / (r * r * 6.0)) * 0.3;
      spark += (sbody + sbloom) * tw * tw * on * bmask * (1.0 - 0.35 * L);
    }
    spark *= gate * uSparks;
    fireCol += mix(uColor, vec3(1.0), 0.55) * spark * 1.6;
    fireA = clamp(fireA + spark * 0.85, 0.0, 1.0);
  }

  vec2 edgePx = min(frag, uResolution - frag);
  float fadeW = max(24.0, uSpread * 0.75);
  float fade = S(0.0, fadeW, edgePx.x) * S(0.0, fadeW, edgePx.y);
  fireA *= fade;
  glow *= fade;
  halo *= fade;

  float wisp = S(0.45, 0.9, fbm2(np * 0.55 + vec2(0.0, 17.0)));
  float smk = S(1.55, 1.05, g) * S(0.85, 1.15, g) * (1.0 - body)
    * wisp * 0.055 * clamp(uSmoke, 0.0, 2.0) * fade;
  vec3 smokeCol = mix(vec3(0.5), uColor, 0.5);
  float sA = clamp(smk, 0.0, 1.0);
  float a = clamp(fireA + sA * (1.0 - fireA), 0.0, 1.0);
  vec4 col = vec4(
    fireCol * fireA + glow + smokeCol * sA * (1.0 - fireA),
    clamp(a + halo * 0.6, 0.0, 1.0)
  );
  // Дизеринг только внутри огня и свечения: шум в полтора шага 8-битного
  // цвета убирает полосы, а полностью прозрачные пиксели не трогает
  if (col.a > 0.004) {
    float dn = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5;
    col += vec4(dn, dn, dn, dn) * (1.5 / 255.0);
    col = clamp(col, 0.0, 1.0);
    col.rgb = min(col.rgb, vec3(col.a));
  }
  outColor = col;
}`;

  /** GLSL ES 3.00 → 1.00 для устройств без WebGL2 (старые iOS/Android). */
  const toGL1 = (src: string, frag: boolean): string => {
    let out = src
      .replace("#version 300 es\n", "")
      .replace("layout(location = 0) in vec2 aPos;", "attribute vec2 aPos;");
    if (frag) {
      out = out
        .replace(/\bin vec2 vUv;/, "varying vec2 vUv;")
        .replace("out vec4 outColor;\n", "")
        .replace(/\boutColor\b/g, "gl_FragColor");
    } else {
      out = out.replace(/\bout vec2 vUv;/, "varying vec2 vUv;");
    }
    return out;
  };

  onMount(() => {
    const cv = canvas;
    if (!cv) return;

    const isCoarse = () =>
      window.matchMedia("(pointer: coarse)").matches ||
      Math.min(window.innerWidth, window.innerHeight) < 768;
    const coarse = isCoarse();
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let gl: WebGL2RenderingContext | WebGLRenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let quad: WebGLBuffer | null = null;
    const shaders: WebGLShader[] = [];
    let U: Record<string, WebGLUniformLocation | null> = {};

    let time = 0;
    let last = 0;
    let lastRender = 0;
    let raf = 0;
    let visible = true;
    let pageVisible = document.visibilityState !== "hidden";
    let dead = false;
    let lost = false;

    // Адаптивное качество: если кадры идут медленно, снижаем разрешение канваса
    let quality = 1;
    let slowFrames = 0;
    let fastFrames = 0;
    const baseBudget = coarse ? 360_000 : 900_000;
    const minQuality = 0.35;
    // Целевой FPS: огню не нужно 60, глазу хватает 30
    const frameInterval = 1000 / 30;

    // Геометрия кэшируется и обновляется только при ресайзе — никаких
    // getBoundingClientRect() в каждом кадре (они вызывают reflow).
    let geom: { w: number; h: number; cx: number; cy: number; rx: number; ry: number } | null = null;

    const measure = () => {
      const el = arc;
      if (!el) {
        geom = null;
        return;
      }
      const css = cv.getBoundingClientRect();
      const a = el.getBoundingClientRect();
      if (!css.width || !css.height || !a.width || !a.height) {
        geom = null;
        return;
      }
      geom = {
        w: css.width,
        h: css.height,
        cx: (a.left + a.right) / 2 - css.left,
        cy: css.bottom - (a.top + a.bottom) / 2,
        rx: a.width / 2,
        ry: a.height / 2,
      };
    };

    const syncSize = (): number => {
      if (!geom) return 1;
      const base = Math.min(window.devicePixelRatio || 1, coarse ? 1 : 1.25);
      const budget = baseBudget * quality * quality;
      const dpr = Math.min(base, Math.sqrt(budget / Math.max(1, geom.w * geom.h)));
      const w = Math.max(1, Math.round(geom.w * dpr));
      const h = Math.max(1, Math.round(geom.h * dpr));
      if (cv.width !== w || cv.height !== h) {
        cv.width = w;
        cv.height = h;
      }
      return w / Math.max(geom.w, 1);
    };

    const compile = (
      ctx: WebGLRenderingContext | WebGL2RenderingContext,
      type: number,
      src: string,
    ): WebGLShader | null => {
      const s = ctx.createShader(type);
      if (!s) return null;
      ctx.shaderSource(s, src);
      ctx.compileShader(s);
      if (!ctx.getShaderParameter(s, ctx.COMPILE_STATUS)) {
        console.error("ArcFlame shader error:", ctx.getShaderInfoLog(s));
        ctx.deleteShader(s);
        return null;
      }
      return s;
    };

    const init = (): boolean => {
      const attrs: WebGLContextAttributes = {
        alpha: true,
        depth: false,
        stencil: false,
        antialias: false,
        premultipliedAlpha: true,
        powerPreference: "low-power",
      };
      const gl2 = cv.getContext("webgl2", attrs);
      const ctx = gl2 ?? cv.getContext("webgl", attrs);
      if (!ctx) return false;
      const v = gl2 ? VERT : toGL1(VERT, false);
      const f = gl2 ? FRAG : toGL1(FRAG, true);
      const vs = compile(ctx, ctx.VERTEX_SHADER, v);
      const fs = compile(ctx, ctx.FRAGMENT_SHADER, f);
      if (!vs || !fs) return false;
      const prog = ctx.createProgram();
      if (!prog) return false;
      ctx.attachShader(prog, vs);
      ctx.attachShader(prog, fs);
      ctx.bindAttribLocation(prog, 0, "aPos");
      ctx.linkProgram(prog);
      if (!ctx.getProgramParameter(prog, ctx.LINK_STATUS)) {
        console.error("ArcFlame link error:", ctx.getProgramInfoLog(prog));
        return false;
      }
      U = {};
      const n = ctx.getProgramParameter(prog, ctx.ACTIVE_UNIFORMS) as number;
      for (let i = 0; i < n; i++) {
        const info = ctx.getActiveUniform(prog, i);
        if (info) U[info.name] = ctx.getUniformLocation(prog, info.name);
      }
      const buf = ctx.createBuffer();
      ctx.bindBuffer(ctx.ARRAY_BUFFER, buf);
      ctx.bufferData(
        ctx.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        ctx.STATIC_DRAW,
      );
      ctx.enableVertexAttribArray(0);
      ctx.vertexAttribPointer(0, 2, ctx.FLOAT, false, 0, 0);
      gl = ctx;
      program = prog;
      quad = buf;
      shaders.push(vs, fs);
      return true;
    };

    const render = (): boolean => {
      if (!gl || !program || lost) return false;
      if (!geom) measure();
      const g = geom;
      if (!g) return false;
      const dpr = syncSize();

      gl.viewport(0, 0, cv.width, cv.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform2f(U.uResolution, cv.width, cv.height);
      gl.uniform1f(U.uTime, time);
      // Эллипс дуги в координатах канваса (ось Y вверх)
      gl.uniform2f(U.uCenter, g.cx * dpr, g.cy * dpr);
      gl.uniform2f(U.uRadii, g.rx * dpr, g.ry * dpr);
      gl.uniform3f(U.uColor, color[0], color[1], color[2]);
      gl.uniform1f(U.uIntensity, intensity);
      gl.uniform1f(U.uHeight, Math.max(height, 24) * dpr);
      gl.uniform1f(U.uSpread, 24 * dpr);
      gl.uniform1f(U.uScale, scale);
      gl.uniform1f(U.uTurbulence, turbulence);
      gl.uniform1f(U.uTurbScale, turbulenceScale);
      gl.uniform1f(U.uSparks, sparks);
      gl.uniform1f(U.uSmoke, smoke);
      gl.uniform1f(U.uRim, rim);
      gl.uniform1f(U.uMelt, melt * dpr);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!ready) ready = true;
      return true;
    };

    const adapt = (gap: number) => {
      // gap — реальный интервал между отрисовками. Сильно больше целевого →
      // устройство не успевает, уменьшаем число пикселей.
      if (gap > frameInterval * 1.8) {
        fastFrames = 0;
        if (++slowFrames >= 8 && quality > minQuality) {
          quality = Math.max(minQuality, quality * 0.8);
          slowFrames = 0;
        }
      } else if (gap < frameInterval * 1.2) {
        slowFrames = 0;
        if (++fastFrames >= 120 && quality < 1) {
          quality = Math.min(1, quality * 1.1);
          fastFrames = 0;
        }
      }
    };

    const running = () => !dead && !lost && visible && pageVisible;

    const frame = (now: number) => {
      raf = 0;
      if (!running()) return;
      // Небольшой допуск, чтобы на 60 Гц не проскакивать в 20 FPS из-за джиттера
      if (!lastRender || now - lastRender >= frameInterval - 4) {
        const gap = lastRender ? now - lastRender : frameInterval;
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        lastRender = now;
        if (!motion.matches) time += dt * speed;
        render();
        adapt(gap);
      }
      if (motion.matches) return; // reduced-motion: один статичный кадр
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (raf || !running()) return;
      last = performance.now();
      lastRender = 0;
      raf = requestAnimationFrame(frame);
    };

    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const onLost = (e: Event) => {
      // Мобильные браузеры отбирают контекст под нагрузкой — просим вернуть
      e.preventDefault();
      lost = true;
      ready = false;
      stop();
    };
    const onRestored = () => {
      lost = false;
      shaders.length = 0;
      quality = Math.max(minQuality, quality * 0.8);
      if (init()) {
        render();
        start();
      }
    };
    cv.addEventListener("webglcontextlost", onLost);
    cv.addEventListener("webglcontextrestored", onRestored);

    if (!init()) return () => {
      cv.removeEventListener("webglcontextlost", onLost);
      cv.removeEventListener("webglcontextrestored", onRestored);
    };

    const ro = new ResizeObserver(() => {
      measure();
      render();
      start();
    });
    ro.observe(cv);
    if (arc) ro.observe(arc);

    const io = new IntersectionObserver((entries) => {
      visible = entries[entries.length - 1]?.isIntersecting ?? true;
      if (visible) start();
      else stop();
    });
    io.observe(cv);

    const onVisibility = () => {
      pageVisible = document.visibilityState !== "hidden";
      if (pageVisible) start();
      else stop();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onMotion = () => start();
    motion.addEventListener("change", onMotion);

    measure();
    render();
    start();

    return () => {
      dead = true;
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      motion.removeEventListener("change", onMotion);
      cv.removeEventListener("webglcontextlost", onLost);
      cv.removeEventListener("webglcontextrestored", onRestored);
      const ctx = gl;
      if (ctx) {
        ctx.deleteBuffer(quad);
        ctx.deleteProgram(program);
        for (const s of shaders) ctx.deleteShader(s);
      }
    };
  });

</script>

<canvas
  bind:this={canvas}
  class={className}
  aria-hidden="true"
  style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; display: block; opacity: {ready ? 1 : 0}; transition: opacity 400ms ease-out;"
></canvas>
