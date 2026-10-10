<script lang="ts" module>
  import type { Snippet } from "svelte";

  // Значения из ./const в сообщении не пришли, ниже разумные дефолты для веба.
  export const DEFAULT_INITIAL_COLORS: IMeshGradientColor[] = [
    "#7c3aed",
    "#06b6d4",
    "#f472b6",
    "#fbbf24",
  ];
  export const DEFAULT_PERFORMANCE = { undersampling: 0.5, fpsLock: 60 };

  /** CSS-цвет или {r,g,b}: 0..1 либо 0..255 */
  export type IMeshGradientColor = string | { r: number; g: number; b: number };

  export type IAnimatedMeshGradient = {
    /** До 4 цветов; если меньше, добираются из дефолтных */
    colors?: IMeshGradientColor[];
    speed?: number;
    /** 0..1 */
    noise?: number;
    /** 0..1 */
    blur?: number;
    /** 0..2 */
    contrast?: number;
    animated?: boolean;
    /** Число (px) или CSS-значение. По умолчанию 100% */
    width?: number | string;
    height?: number | string;
    performance?: {
      /** Масштаб разрешения канваса: 0.1..2 (меньше = быстрее) */
      undersampling?: number;
      /** Максимальный FPS */
      fpsLock?: number;
    };
    /** Inline-стили корневого элемента */
    style?: string;
    class?: string;
    children?: Snippet;
  };

  // Собственный GLSL-шейдер: SkSL из ./conf в WebGL напрямую не переносится.
  const VERTEX = `
    attribute vec2 a_pos;
    void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
  `;

  const FRAGMENT = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif

    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_noise;
    uniform float u_blur;
    uniform float u_contrast;
    uniform vec3 u_c1;
    uniform vec3 u_c2;
    uniform vec3 u_c3;
    uniform vec3 u_c4;

    float hash(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }

    vec2 orbit(float t, vec2 c, vec2 r, vec2 ph, vec2 f) {
      return c + r * vec2(sin(t * f.x + ph.x), cos(t * f.y + ph.y));
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      vec2 s = vec2(u_resolution.x / u_resolution.y, 1.0);
      float t = u_time * 0.5;

      // лёгкая волновая деформация для «живой» формы
      vec2 q = uv + 0.06 * vec2(sin(uv.y * 4.0 + t * 1.3), cos(uv.x * 4.0 - t * 1.1));

      vec2 p1 = orbit(t, vec2(0.25, 0.30), vec2(0.20, 0.20), vec2(0.0, 1.0), vec2(1.0, 0.8));
      vec2 p2 = orbit(t, vec2(0.75, 0.30), vec2(0.20, 0.25), vec2(2.0, 0.5), vec2(0.7, 1.1));
      vec2 p3 = orbit(t, vec2(0.30, 0.75), vec2(0.25, 0.20), vec2(4.0, 2.0), vec2(0.9, 0.6));
      vec2 p4 = orbit(t, vec2(0.75, 0.75), vec2(0.20, 0.20), vec2(1.0, 3.0), vec2(0.6, 1.0));

      // blur управляет мягкостью перехода: меньше экспонента = плавнее
      float e = mix(6.0, 1.5, u_blur);
      float w1 = 1.0 / pow(length((q - p1) * s) + 0.02, e);
      float w2 = 1.0 / pow(length((q - p2) * s) + 0.02, e);
      float w3 = 1.0 / pow(length((q - p3) * s) + 0.02, e);
      float w4 = 1.0 / pow(length((q - p4) * s) + 0.02, e);

      vec3 col = (w1 * u_c1 + w2 * u_c2 + w3 * u_c3 + w4 * u_c4) / (w1 + w2 + w3 + w4);

      col = (col - 0.5) * u_contrast + 0.5;

      float n = hash(gl_FragCoord.xy + fract(u_time) * 100.0) - 0.5;
      col += n * u_noise * 0.25;

      gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
    }
  `;

  function compile(gl: WebGLRenderingContext, type: number, src: string) {
    const sh = gl.createShader(type);
    if (!sh) return null;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn("[AnimatedMeshGradient] shader error:", gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  let colorCtx: CanvasRenderingContext2D | null = null;

  /** Любой цвет → [r,g,b] в диапазоне 0..1 (только в браузере) */
  function toRgb(c: IMeshGradientColor): [number, number, number] {
    if (typeof c !== "string") {
      const max = Math.max(c.r, c.g, c.b);
      const k = max > 1 ? 255 : 1;
      return [c.r / k, c.g / k, c.b / k];
    }
    colorCtx ??= document
      .createElement("canvas")
      .getContext("2d", { willReadFrequently: true });
    if (!colorCtx) return [0, 0, 0];
    colorCtx.clearRect(0, 0, 1, 1);
    colorCtx.fillStyle = "#000";
    colorCtx.fillStyle = c;
    colorCtx.fillRect(0, 0, 1, 1);
    const [r, g, b] = colorCtx.getImageData(0, 0, 1, 1).data;
    return [r / 255, g / 255, b / 255];
  }

  function toCss(c: IMeshGradientColor): string {
    if (typeof c === "string") return c;
    const k = Math.max(c.r, c.g, c.b) > 1 ? 1 : 255;
    return `rgb(${Math.round(c.r * k)}, ${Math.round(c.g * k)}, ${Math.round(c.b * k)})`;
  }
</script>

<script lang="ts">
  let {
    colors = DEFAULT_INITIAL_COLORS,
    speed = 1,
    noise = 0.15,
    blur = 0.4,
    contrast = 1,
    animated = true,
    width = "100%",
    height = "100%",
    performance: perf = {},
    style = "",
    class: className = "",
    children,
  }: IAnimatedMeshGradient = $props();

  let container: HTMLDivElement | undefined = $state();
  let canvas: HTMLCanvasElement | undefined = $state();

  const scale = $derived(
    Math.min(2, Math.max(0.1, perf?.undersampling ?? DEFAULT_PERFORMANCE.undersampling)),
  );
  const fpsLock = $derived(perf?.fpsLock ?? DEFAULT_PERFORMANCE.fpsLock);

  // Ровно 4 цвета
  const safeColors = $derived.by<IMeshGradientColor[]>(() => {
    const result = [...colors];
    while (result.length < 4) {
      result.push(DEFAULT_INITIAL_COLORS[result.length % DEFAULT_INITIAL_COLORS.length]);
    }
    return result.slice(0, 4);
  });

  // Вычисляется только в браузере (читается из draw/эффектов)
  const rgbColors = $derived(safeColors.map(toRgb));

  const fallbackBg = $derived(
    `linear-gradient(135deg, ${safeColors.map(toCss).join(", ")})`,
  );

  const toCssSize = (v: number | string) => (typeof v === "number" ? `${v}px` : v);

  // --- WebGL (не реактивное состояние) ---
  let gl: WebGLRenderingContext | null = null;
  let u: Record<string, WebGLUniformLocation | null> = {};
  let time = 0;

  function draw(noiseValue = noise, blurValue = blur, contrastValue = contrast, colorsValue = rgbColors) {
    if (!gl || !canvas) return;
    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
    const [c1, c2, c3, c4] = colorsValue;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(u.resolution, canvas.width, canvas.height);
    gl.uniform1f(u.time, time);
    gl.uniform1f(u.noise, clamp(noiseValue, 0, 1));
    gl.uniform1f(u.blur, clamp(blurValue, 0, 1));
    gl.uniform1f(u.contrast, clamp(contrastValue, 0, 2));
    gl.uniform3f(u.c1, c1[0], c1[1], c1[2]);
    gl.uniform3f(u.c2, c2[0], c2[1], c2[2]);
    gl.uniform3f(u.c3, c3[0], c3[1], c3[2]);
    gl.uniform3f(u.c4, c4[0], c4[1], c4[2]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  // 1) Инициализация WebGL
  $effect(() => {
    const el = canvas;
    if (!el) return;

    const ctx = el.getContext("webgl", {
      antialias: false,
      alpha: false,
      powerPreference: "low-power",
    });
    if (!ctx) return; // остаётся CSS-фолбэк

    const vs = compile(ctx, ctx.VERTEX_SHADER, VERTEX);
    const fs = compile(ctx, ctx.FRAGMENT_SHADER, FRAGMENT);
    const program = ctx.createProgram();
    if (!vs || !fs || !program) return;

    ctx.attachShader(program, vs);
    ctx.attachShader(program, fs);
    ctx.linkProgram(program);
    if (!ctx.getProgramParameter(program, ctx.LINK_STATUS)) {
      console.warn("[AnimatedMeshGradient] link error:", ctx.getProgramInfoLog(program));
      return;
    }
    ctx.useProgram(program);

    // Полноэкранный треугольник
    const buf = ctx.createBuffer();
    ctx.bindBuffer(ctx.ARRAY_BUFFER, buf);
    ctx.bufferData(
      ctx.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      ctx.STATIC_DRAW,
    );
    const loc = ctx.getAttribLocation(program, "a_pos");
    ctx.enableVertexAttribArray(loc);
    ctx.vertexAttribPointer(loc, 2, ctx.FLOAT, false, 0, 0);

    const get = (n: string) => ctx.getUniformLocation(program, n);
    u = {
      resolution: get("u_resolution"),
      time: get("u_time"),
      noise: get("u_noise"),
      blur: get("u_blur"),
      contrast: get("u_contrast"),
      c1: get("u_c1"),
      c2: get("u_c2"),
      c3: get("u_c3"),
      c4: get("u_c4"),
    };
    gl = ctx;
    draw();

    return () => {
      gl = null;
      ctx.deleteBuffer(buf);
      ctx.deleteProgram(program);
      ctx.deleteShader(vs);
      ctx.deleteShader(fs);
      ctx.getExtension("WEBGL_lose_context")?.loseContext();
    };
  });

  // 2) Размер канваса = размер контейнера × undersampling (аналог width*scale в оригинале)
  $effect(() => {
    const el = container;
    const cv = canvas;
    const k = scale;
    if (!el || !cv) return;

    const sync = (w: number, h: number) => {
      const cw = Math.max(1, Math.round(w * k));
      const ch = Math.max(1, Math.round(h * k));
      if (cv.width !== cw || cv.height !== ch) {
        cv.width = cw;
        cv.height = ch;
      }
      draw();
    };

    const ro = new ResizeObserver(([entry]) => {
      sync(entry.contentRect.width, entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  });

  // 3) Цикл анимации с ограничением FPS (аналог useFrameTime)
  $effect(() => {
    const lock = Math.max(1, fpsLock);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!animated || reduced) {
      draw();
      return;
    }

    const minDelta = 1000 / lock;
    let raf = 0;
    let last: number | undefined;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      last ??= now;
      const dt = now - last;
      if (dt < minDelta) return;
      last = now;
      time += (Math.min(dt, 100) / 1000) * speed;
      draw();
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  });

  // 4) Перерисовка при смене параметров (важно, когда animated=false)
  $effect(() => {
    draw(noise, blur, contrast, rgbColors);
  });
</script>

<div
  bind:this={container}
  class="mesh-gradient {className}"
  style="width: {toCssSize(width)}; height: {toCssSize(height)}; {style}"
>
  <!-- CSS-фолбэк: виден до первого кадра и если WebGL недоступен -->
  <div class="fallback" style="background: {fallbackBg};" aria-hidden="true"></div>
  <canvas bind:this={canvas} class="canvas" aria-hidden="true"></canvas>

  <div class="content">
    {@render children?.()}
  </div>
</div>

<style>
  .mesh-gradient {
    position: relative;
    overflow: hidden;
  }

  .fallback,
  .canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .content {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
  }
</style>