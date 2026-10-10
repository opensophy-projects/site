<script lang="ts">
  import { onMount, tick } from 'svelte';

  /** Eight mesh points: 4 corners + 4 edge midpoints (hex colors). */
  export type MeshGradientColors = [string, string, string, string, string, string, string, string];

  const DEFAULT_COLORS: MeshGradientColors = [
    '#f43f5e', // rose — top-left corner
    '#0ea5e9', // sky — top-right corner
    '#22d3ee', // cyan — bottom-right corner
    '#a855f7', // purple — bottom-left corner
    '#fb7185', // light rose — top edge
    '#6366f1', // indigo — right edge
    '#fbbf24', // amber — bottom edge
    '#34d399', // emerald — left edge
  ];

  type Props = {
    /** CSS classes for the wrapper element. */
    class?: string;
    /** Eight mesh point colors: corners TL, TR, BR, BL, then edges top, right, bottom, left. */
    colors?: MeshGradientColors;
    /** Animation speed multiplier (higher is faster). */
    speed?: number;
    /** Drift amplitude of the mesh points, in UV units (0..1). */
    scale?: number;
    /** How strongly the edge colors blend into the corner mesh (0..1). */
    mix?: number;
    /** Content rendered above the gradient. */
    children?: import('svelte').Snippet;
  };

  let {
    class: className = '',
    colors = DEFAULT_COLORS,
    speed = 1,
    scale = 0.08,
    mix = 0.55,
    children,
  }: Props = $props();

  let wrapEl: HTMLDivElement | undefined = $state();
  let canvasEl: HTMLCanvasElement | undefined = $state();

  // Latest prop values readable from inside the imperative WebGL loop.
  let currentColors = $state(colors);
  let currentSpeed = $state(speed);
  let currentScale = $state(scale);
  let currentMix = $state(mix);
  $effect(() => {
    currentColors = colors;
    currentSpeed = speed;
    currentScale = scale;
    currentMix = mix;
  });

  const VERT = /* glsl */ `#version 300 es
  precision highp float;
  in vec2 aPosition;
  out vec2 vUv;
  void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }`;

  // Animated mesh gradient: eight control points drift along smooth
  // pseudo-noise paths and their colors are blended across the moving mesh.
  const FRAG = /* glsl */ `#version 300 es
  precision highp float;
  in vec2 vUv;
  out vec4 fragColor;

  uniform float uTime;
  uniform float uSpeed;
  uniform float uScale;
  uniform float uMix;
  uniform vec3 uColors[8];

  vec2 hash21(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(dot(hash21(i), f),
          dot(hash21(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
      mix(dot(hash21(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
          dot(hash21(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
      u.y);
  }

  vec2 drift(float seed, float t) {
    vec2 offs = vec2(seed * 7.13, seed * 3.71);
    return vec2(noise(offs + t), noise(offs + t * 0.8 + 13.7)) * uScale;
  }

  vec3 srgbToLinear(vec3 c) {
    return pow(c, vec3(2.2));
  }

  vec3 linearToSrgb(vec3 c) {
    return pow(c, vec3(1.0 / 2.2));
  }

  void main() {
    float t = uTime * uSpeed;
    vec2 uv = vUv;

    // Corner positions with drifting offsets.
    vec2 tl = vec2(0.0, 1.0) + drift(0.0, t);
    vec2 tr = vec2(1.0, 1.0) + drift(1.0, t);
    vec2 br = vec2(1.0, 0.0) + drift(2.0, t);
    vec2 bl = vec2(0.0, 0.0) + drift(3.0, t);

    // Barycentric-like blend of the four corner colors.
    float dTL = distance(uv, tl);
    float dTR = distance(uv, tr);
    float dBR = distance(uv, br);
    float dBL = distance(uv, bl);

    vec3 w = vec3(0.0);
    w.x = 1.0 / (dTL * dTL + 0.0015);
    w.y = 1.0 / (dTR * dTR + 0.0015);
    w.z = 1.0 / (dBR * dBR + 0.0015);
    float wSum = w.x + w.y + w.z + 1.0 / (dBL * dBL + 0.0015);

    vec3 col =
        (uColors[0] * w.x + uColors[1] * w.y + uColors[2] * w.z +
         uColors[3] / (dBL * dBL + 0.0015)) / wSum;

    // Edge midpoints add secondary hues where they are close to the pixel.
    vec2 te = mix(tr, tl, 0.5) + drift(4.0, t * 0.9);
    vec2 re = mix(br, tr, 0.5) + drift(5.0, t * 0.9);
    vec2 be = mix(bl, br, 0.5) + drift(6.0, t * 0.9);
    vec2 le = mix(tl, bl, 0.5) + drift(7.0, t * 0.9);

    float eTop = exp(-distance(uv, te) * 3.0);
    float eRight = exp(-distance(uv, re) * 3.0);
    float eBottom = exp(-distance(uv, be) * 3.0);
    float eLeft = exp(-distance(uv, le) * 3.0);

    col = mix(col, uColors[4], eTop * uMix);
    col = mix(col, uColors[5], eRight * uMix);
    col = mix(col, uColors[6], eBottom * uMix);
    col = mix(col, uColors[7], eLeft * uMix);

    fragColor = vec4(linearToSrgb(clamp(col, 0.0, 1.0)), 1.0);
  }`;

  function hexToRgb(hex: string): [number, number, number] {
    const value = hex.replace('#', '');
    const full =
      value.length === 3
        ? value
            .split('')
            .map((c) => c + c)
            .join('')
        : value;
    const num = Number.parseInt(full, 16);
    if (Number.isNaN(num)) return [0.956, 0.247, 0.369];
    return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
  }

  onMount(async () => {
    await tick();
    const canvas = canvasEl;
    const wrap = wrapEl;
    if (!canvas || !wrap) return;

    const gl = canvas.getContext('webgl2', { antialias: true, alpha: false });
    if (!gl) return;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    gl.useProgram(program);

    const quad = new Float32Array([-1, -1, 3, -1, -1, 3]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, 'uTime');
    const uSpeed = gl.getUniformLocation(program, 'uSpeed');
    const uScale = gl.getUniformLocation(program, 'uScale');
    const uMix = gl.getUniformLocation(program, 'uMix');
    const uColors = gl.getUniformLocation(program, 'uColors[0]');

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { clientWidth, clientHeight } = wrap;
      canvas.width = Math.max(1, Math.floor(clientWidth * dpr));
      canvas.height = Math.max(1, Math.floor(clientHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(wrap);

    const start = performance.now();
    let raf = 0;

    const render = (now: number) => {
      const t = (now - start) / 1000;
      gl.uniform1f(uTime, reducedMotion ? 4.2 : t);
      gl.uniform1f(uSpeed, currentSpeed);
      gl.uniform1f(uScale, currentScale);
      gl.uniform1f(uMix, currentMix);

      const flat = new Float32Array(24);
      currentColors.forEach((hex, i) => {
        const [r, g, b] = hexToRgb(hex);
        flat[i * 3] = r;
        flat[i * 3 + 1] = g;
        flat[i * 3 + 2] = b;
      });
      gl.uniform3fv(uColors, flat);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reducedMotion) raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
    };
  });
</script>

<div class="animated-mesh-gradient {className}" bind:this={wrapEl}>
  <canvas bind:this={canvasEl} aria-hidden="true"></canvas>
  {#if children}
    <div class="animated-mesh-gradient__content">
      {@render children()}
    </div>
  {/if}
</div>

<style>
  .animated-mesh-gradient {
    position: relative;
    overflow: hidden;
    isolation: isolate;
  }

  canvas {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
  }

  .animated-mesh-gradient__content {
    position: relative;
    z-index: 1;
  }
</style>
