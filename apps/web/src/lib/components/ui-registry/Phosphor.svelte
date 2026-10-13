<script lang="ts">
  import { onMount } from 'svelte';

  type Frame = { I: number[]; C: number[]; LOOP?: boolean };

  export let accent = '#f43f5e';
  export let width = 'min(88vw, 420px)';
  export let showControls = true;
  export let label = 'Phosphor animation';
  export let tau = 260;

  const W = 36;
  const H = 36;
  const N = W * H;
  const FRAME_MS = 95;

  const frames: Frame[] = [
    { I: [], C: [], LOOP: true }
  ];

  let I = new Array<number>(N).fill(0);
  let frameIndex = 0;
  let api: { setTau: (v: number) => void } | null = null;
  let svg: SVGSVGElement;
  let over = false;
  let readout = 'rest';

  $: if (api) api.setTau(tau);

  const clamp = (x: number, a: number, b: number): number => Math.min(b, Math.max(a, x));

  onMount(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let last = performance.now();
    let renderClock = 0;
    let frameClock = 0;
    let currentTau = tau;

    const render = (): void => {
      if (!svg) return;
      const cells = svg.querySelectorAll<SVGElement>('.cell');
      for (let i = 0; i < cells.length; i++) {
        const v = clamp(I[i], 0, 1);
        cells[i].setAttribute('opacity', String(0.08 + v * 0.92));
      }
    };

    const applyFrame = (frame: Frame): void => {
      if (!frame.I.length) return;
      for (let i = 0; i < Math.min(N, frame.I.length); i++) {
        I[i] = Math.max(I[i], frame.I[i]);
      }
      frame.C?.forEach((idx) => {
        if (idx >= 0 && idx < N) I[idx] = 1;
      });
    };

    const tick = (now: number): void => {
      const dt = reduce ? 1 : Math.min(0.05, (now - last) / 1000);
      last = now;

      if (!reduce) {
        frameClock += dt * 1000;
        while (frameClock >= FRAME_MS) {
          frameClock -= FRAME_MS;
          const frame = frames[frameIndex % frames.length];
          if (frame.LOOP) {
            applyFrame(frame);
          }
          frameIndex = (frameIndex + 1) % frames.length;
        }
      }

      const decay = Math.exp((-dt * 1000) / Math.max(1, currentTau));
      let active = false;
      for (let i = 0; i < N; i++) {
        I[i] *= decay;
        if (I[i] > 0.01) active = true;
      }

      renderClock += dt * 1000;
      if (active || over || reduce || renderClock >= 33) {
        renderClock = 0;
        render();
      }

      raf = requestAnimationFrame(tick);
    };

    const move = (e: PointerEvent): void => {
      over = true;
      readout = 'active';
      const r = svg.getBoundingClientRect();
      const x = clamp((e.clientX - r.left) / r.width, 0, 1);
      const y = clamp((e.clientY - r.top) / r.height, 0, 1);
      const cx = Math.floor(x * W);
      const cy = Math.floor(y * H);
      for (let oy = -2; oy <= 2; oy++) {
        for (let ox = -2; ox <= 2; ox++) {
          const px = cx + ox;
          const py = cy + oy;
          if (px < 0 || px >= W || py < 0 || py >= H) continue;
          const d = Math.sqrt(ox * ox + oy * oy);
          if (d <= 2) I[py * W + px] = Math.max(I[py * W + px], 1 - d / 2);
        }
      }
      render();
    };
    const leave = (): void => {
      over = false;
      readout = 'rest';
    };

    svg.addEventListener('pointermove', move);
    svg.addEventListener('pointerleave', leave);
    raf = requestAnimationFrame(tick);

    api = { setTau: (v: number) => { currentTau = Math.max(60, v); } };

    return () => {
      cancelAnimationFrame(raf);
      svg.removeEventListener('pointermove', move);
      svg.removeEventListener('pointerleave', leave);
      api = null;
    };
  });
</script>

<div class="hl-wrap" style="--hl-accent:{accent}">
  <svg class="hl" bind:this={svg} viewBox="0 0 360 360" role="img" aria-label={label} style="width:{width}">
    {#each Array(N) as _, i (i)}
      <rect
        class="cell"
        x={(i % W) * 10}
        y={Math.floor(i / W) * 10}
        width="6"
        height="6"
        rx="1"
        fill="var(--hl-line)"
        opacity="0.08"
      />
    {/each}
  </svg>
  {#if showControls}
    <div class="read">{readout}</div>
    <label class="tau">
      persistence τ
      <input type="range" min="60" max="1200" step="10" bind:value={tau} />
      <span>{tau} ms</span>
    </label>
  {/if}
</div>

<style>
  .hl-wrap {
    --hl-bg: #ffffff;
    --hl-line: #2b2f3a;
    --hl-faint: #2b2f3a66;
    --hl-txt: #6b6f7a;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    color: var(--hl-txt);
    font: 12px ui-monospace, Menlo, Consolas, monospace;
    letter-spacing: 0.06em;
  }
  :global(.dark) .hl-wrap {
    --hl-bg: #090909;
    --hl-line: oklch(0.9674 0.0013 var(--base-hue));
    --hl-faint: color-mix(in srgb, oklch(0.9674 0.0013 var(--base-hue)) 22%, transparent);
    --hl-txt: oklch(0.669 0.0107 var(--base-hue));
  }
  .hl {
    display: block;
    height: auto;
    max-height: 70vh;
    cursor: crosshair;
    touch-action: none;
  }
  .hl * {
    vector-effect: non-scaling-stroke;
  }
  .s {
    fill: var(--hl-bg);
    stroke: var(--hl-line);
    stroke-width: 1.2;
    stroke-linejoin: round;
    stroke-linecap: round;
  }
  .nostroke { stroke: none; }
  .n {
    fill: none;
    stroke: var(--hl-line);
    stroke-width: 1.2;
    stroke-linecap: round;
  }
  .lo {
    fill: none;
    stroke: var(--hl-faint);
    stroke-width: 1.2;
  }
  .dash {
    stroke: var(--hl-faint);
    stroke-dasharray: 3 4;
  }
  .dot {
    fill: var(--hl-accent);
  }
  .read { min-height: 1.2em; }
  .tau {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .tau input {
    width: min(60vw, 240px);
    accent-color: var(--hl-accent);
  }
</style>
