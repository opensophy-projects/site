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
  outColor = vec4(
    fireCol * fireA + glow + smokeCol * sA * (1.0 - fireA),
    clamp(a + halo * 0.6, 0.0, 1.0)
  );
}`;

  onMount(() => {
    const cv = canvas;
    if (!cv) return;
    const gl = cv.getContext("webgl2", {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      premultipliedAlpha: true,
    });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error("ArcFlame shader error:", gl.getShaderInfoLog(s));
      }
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    const U: Record<string, WebGLUniformLocation | null> = {};
    const n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(program, i)!;
      U[info.name] = gl.getUniformLocation(program, info.name);
    }

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let time = 0;
    let last = performance.now();
    let raf = 0;
    let visible = true;
    let dead = false;

    const syncSize = () => {
      // Бюджет пикселей: на широких экранах не рисуем в полном dpr
      const css = cv.getBoundingClientRect();
      const base = Math.min(window.devicePixelRatio || 1, 1.5);
      const budget = 2.2e6;
      const dpr = Math.min(
        base,
        Math.sqrt(budget / Math.max(1, css.width * css.height)),
      );
      const w = Math.max(1, Math.round(css.width * dpr));
      const h = Math.max(1, Math.round(css.height * dpr));
      if (cv.width !== w || cv.height !== h) {
        cv.width = w;
        cv.height = h;
      }
      return { css, dpr: w / Math.max(css.width, 1) };
    };

    const render = () => {
      const el = arc;
      if (!el) return;
      const { css, dpr } = syncSize();
      const a = el.getBoundingClientRect();
      if (!a.width || !a.height) return;

      gl.viewport(0, 0, cv.width, cv.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform2f(U.uResolution, cv.width, cv.height);
      gl.uniform1f(U.uTime, time);
      // Эллипс дуги в координатах канваса (ось Y вверх)
      gl.uniform2f(
        U.uCenter,
        ((a.left + a.right) / 2 - css.left) * dpr,
        (css.bottom - (a.top + a.bottom) / 2) * dpr,
      );
      gl.uniform2f(U.uRadii, (a.width / 2) * dpr, (a.height / 2) * dpr);
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
    };

    const frame = (now: number) => {
      raf = 0;
      if (dead || !visible) return;
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      if (!motion.matches) time += dt * speed;
      render();
      if (motion.matches) return; // reduced-motion: один статичный кадр
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (raf || dead || !visible) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const ro = new ResizeObserver(() => {
      render();
      start();
    });
    ro.observe(cv);

    const io = new IntersectionObserver((entries) => {
      visible = entries[entries.length - 1]?.isIntersecting ?? true;
      if (visible) start();
    });
    io.observe(cv);

    const onMotion = () => start();
    motion.addEventListener("change", onMotion);

    start();

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      motion.removeEventListener("change", onMotion);
      gl.deleteBuffer(quad);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  });
</script>

<canvas
  bind:this={canvas}
  class={className}
  aria-hidden="true"
  style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; display: block;"
></canvas>