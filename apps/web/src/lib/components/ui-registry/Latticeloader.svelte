<script lang="ts">
  import { onDestroy } from 'svelte';

  export type LatticeStatus = 'working' | 'done' | 'error';
  export type LatticePatternName =
    | 'arrow'
    | 'dots'
    | 'orbit'
    | 'ripple'
    | 'snake'
    | 'spiral'
    | 'sweep'
    | 'spin'
    | 'rain'
    | 'pulse';
  export type LatticeGrid = 3 | 4;

  export interface LatticePattern {
    cells: (number | null)[];
    loop?: number;
    scale?: number;
    lit?: 0.25 | 0.35 | 0.45 | 0.62;
  }

  type ResolvedPattern = { cells: (number | null)[]; loop: number; scale: number; lit?: number };

  // ---- Static pattern data (unchanged from the React source) ----
  const PATTERNS: Record<LatticePatternName, Partial<Record<LatticeGrid, ResolvedPattern>>> = {
    arrow: { 3: { cells: [1, 2, 3, 0, 1, 2, 1, 2, 3], loop: 7.2, scale: 1 } },
    dots: { 3: { cells: [0, 1, 2, 0, 1, 2, 0, 1, 2], loop: 3, scale: 2.4 } },
    ripple: { 3: { cells: [2, 1, 2, 1, 0, 1, 2, 1, 2], loop: 4.8, scale: 1.5 } },
    spiral: { 3: { cells: [0, 1, 2, 7, 8, 3, 6, 5, 4], loop: 9, scale: 1.2, lit: 0.35 } },
    orbit: {
      3: { cells: [0, 1, 2, 7, null, 3, 6, 5, 4], loop: 8, scale: 1.2 },
      4: { cells: [0, 1, 2, 3, 11, null, null, 4, 10, null, null, 5, 9, 8, 7, 6], loop: 6, scale: 1.2, lit: 0.45 }
    },
    snake: {
      3: { cells: [0, 1, 2, 5, 4, 3, 6, 7, 8], loop: 9, scale: 1, lit: 0.35 },
      4: { cells: [0, 1, 2, 3, 7, 6, 5, 4, 8, 9, 10, 11, 15, 14, 13, 12], loop: 16, scale: 1, lit: 0.25 }
    },
    sweep: { 4: { cells: [0, 1, 2, 3, 1, 2, 3, 4, 2, 3, 4, 5, 3, 4, 5, 6], loop: 5, scale: 1, lit: 0.45 } },
    spin: { 4: { cells: [0, 0, 1, 1, 0, 0, 1, 1, 3, 3, 2, 2, 3, 3, 2, 2], loop: 4, scale: 1.6, lit: 0.35 } },
    rain: { 4: { cells: [0, 2, 1, 3, 1, 3, 2, 4, 2, 4, 3, 5, 3, 5, 4, 6], loop: 4, scale: 1.2, lit: 0.35 } },
    pulse: { 4: { cells: [2, 1, 1, 2, 1, 0, 0, 1, 1, 0, 0, 1, 2, 1, 1, 2], loop: 2.4, scale: 2.5, lit: 0.45 } }
  };
  const DEFAULT_PATTERN: Record<LatticeGrid, LatticePatternName> = { 3: 'orbit', 4: 'sweep' };
  const MARKS: Record<LatticeGrid, Record<'done' | 'error', number[]>> = {
    3: { done: [2, 3, 5, 7], error: [0, 2, 4, 6, 8] },
    4: { done: [7, 8, 10, 13], error: [0, 3, 5, 6, 9, 10, 12, 15] }
  };

  function resolvePattern(pattern: LatticePatternName | LatticePattern, grid: LatticeGrid): ResolvedPattern {
    if (typeof pattern === 'string') {
      const named = PATTERNS[pattern];
      return (named && named[grid]) || (PATTERNS[DEFAULT_PATTERN[grid]][grid] as ResolvedPattern);
    }
    const cells = Array.from({ length: grid * grid }, (_, i) => pattern.cells[i] ?? null);
    const max = Math.max(0, ...cells.filter((v) => v != null));
    return { cells, loop: pattern.loop ?? max + 4.2, scale: pattern.scale ?? 1, lit: pattern.lit ?? 0.62 };
  }

  const fmt = (ds: number) =>
    ds < 600 ? `${(ds / 10).toFixed(1)}s` : `${Math.floor(ds / 600)}m ${((ds % 600) / 10).toFixed(1)}s`;
  const spoken = (ds: number) =>
    ds < 600
      ? `${(ds / 10).toFixed(1)} seconds`
      : `${Math.floor(ds / 600)} minutes ${((ds % 600) / 10).toFixed(1)} seconds`;

  // ---- Props ----
  export let label = 'Thinking';
  export let doneLabel = 'Done in';
  export let errorLabel = 'Failed after';
  export let status: LatticeStatus = 'working';
  export let pattern: LatticePatternName | LatticePattern = 'orbit';
  export let grid: LatticeGrid = 3;
  export let shape: 'square' | 'round' = 'round';
  export let color = 'var(--accent, #f43f5e)';
  export let doneColor = '#22c55e';
  export let errorColor = '#ef4444';
  export let cellSize = 6;
  export let gap = 2;
  export let fontSize = 14;
  export let step = 90;
  export let idleOpacity = 0.15;
  export let glow = false;
  export let glowColor = '';
  export let showTimer = true;
  export let elapsed: number | undefined = undefined;
  export let style = '';
  let className = '';
  export { className as class };

  // ---- Derived pattern data ----
  $: n = (grid === 4 ? 4 : 3) as LatticeGrid;
  $: pat = resolvePattern(pattern, n);
  $: marks = MARKS[n];
  $: d = step * pat.scale;
  $: cycle = Math.round(pat.loop * d);
  $: litKey = Math.round((pat.lit ?? 0.62) * 100);

  // ---- Status → "mark" (done/error dots stay lit even while working resumes) ----
  let lastMark: 'done' | 'error' = 'done';
  $: if (status !== 'working') lastMark = status;
  $: mark = status === 'working' ? lastMark : status;

  // ---- Timer (mirrors the useLayoutEffect in the React version) ----
  let ds = 0;
  let intervalId: ReturnType<typeof setInterval> | undefined;

  function clearTimer() {
    if (intervalId !== undefined) {
      clearInterval(intervalId);
      intervalId = undefined;
    }
  }

  $: {
    clearTimer();
    if (elapsed != null) {
      ds = Math.round(elapsed * 10);
    } else if (status === 'working') {
      const startedAt = performance.now();
      ds = 0;
      intervalId = setInterval(() => {
        ds = Math.floor((performance.now() - startedAt) / 100);
      }, 100);
    }
  }

  onDestroy(clearTimer);

  $: announce =
    status === 'working'
      ? `${label}, in progress`
      : `${status === 'done' ? doneLabel : errorLabel}${showTimer ? ` ${spoken(ds)}` : ''}`;

  $: rootStyle = `--ll-n:${n};--ll-cell:${cellSize}px;--ll-gap:${gap}px;--ll-font:${fontSize}px;--ll-color:${color};--ll-mark:${
    status === 'error' ? errorColor : doneColor
  };--ll-idle:${idleOpacity};--ll-glow:${glowColor || color};--ll-mark-glow:${
    glowColor || (status === 'error' ? errorColor : doneColor)
  };--ll-cycle:${cycle}ms;--ll-peak:1;${style}`;
</script>

<span
  role="status"
  class="ll-root {className}"
  data-status={status}
  data-shape={shape}
  data-glow={glow ? '' : undefined}
  style={rootStyle}
>
  <span class="ll-grid-wrap" aria-hidden="true">
    <span class="ll-run">
      {#each pat.cells as unit, i (i)}
        {#if unit == null}
          <span class="ll-cell ll-hole"></span>
        {:else}
          <span class="ll-cell ll-lit-{litKey}" style="animation-delay:{Math.round(unit * d)}ms"></span>
        {/if}
      {/each}
    </span>
    <span class="ll-mark">
      {#each pat.cells as _, i (i)}
        <span class="ll-cell" class:ll-on={marks[mark].includes(i)}></span>
      {/each}
    </span>
  </span>

  <span class="ll-label" aria-hidden="true">
    <span class="ll-text" class:ll-active={status === 'working'}>{label}</span>
    <span class="ll-text" class:ll-active={status === 'done'}>{doneLabel}</span>
    <span class="ll-text" class:ll-active={status === 'error'}>{errorLabel}</span>
  </span>

  {#if showTimer}
    <span class="ll-timer" aria-hidden="true">{fmt(ds)}</span>
  {/if}

  <span class="sr-only">{announce}</span>
</span>

<style>
  .ll-root {
    position: relative;
    display: inline-flex;
    align-items: center;
    line-height: 1;
    font-family: inherit;
    gap: calc(var(--ll-font) * 0.625);
    font-size: var(--ll-font);
    --ll-ease-out: cubic-bezier(0.23, 1, 0.32, 1);
    --ll-ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  }

  .ll-grid-wrap {
    display: grid;
    flex-shrink: 0;
  }

  .ll-run,
  .ll-mark {
    grid-area: 1 / 1;
    display: grid;
    grid-template-columns: repeat(var(--ll-n), var(--ll-cell));
    gap: var(--ll-gap);
  }

  .ll-run {
    transition: opacity 200ms ease;
  }
  .ll-root[data-status='done'] .ll-run,
  .ll-root[data-status='error'] .ll-run {
    opacity: 0;
  }
  .ll-root[data-status='done'] .ll-run .ll-cell,
  .ll-root[data-status='error'] .ll-run .ll-cell {
    animation-play-state: paused;
  }

  .ll-mark {
    transform-origin: center;
    opacity: 0;
    transform: scale(0.9);
    transition: opacity 160ms var(--ll-ease-out), transform 160ms var(--ll-ease-out);
  }
  .ll-root[data-status='done'] .ll-mark,
  .ll-root[data-status='error'] .ll-mark {
    opacity: 1;
    transform: none;
    transition: opacity 200ms ease, transform 200ms var(--ll-ease-out);
  }

  .ll-cell {
    height: var(--ll-cell);
    width: var(--ll-cell);
    border-radius: max(1px, calc(var(--ll-cell) * 0.25));
    background: var(--ll-color);
    opacity: var(--ll-idle);
  }
  .ll-root[data-shape='round'] .ll-cell {
    border-radius: 50%;
  }
  .ll-hole {
    opacity: calc(var(--ll-idle) * 0.47);
  }

  .ll-lit-62 {
    animation: lattice-on var(--ll-cycle) infinite var(--ll-ease-in-out);
  }
  .ll-lit-45 {
    animation: lattice-on-45 var(--ll-cycle) infinite var(--ll-ease-in-out);
  }
  .ll-lit-35 {
    animation: lattice-on-35 var(--ll-cycle) infinite var(--ll-ease-in-out);
  }
  .ll-lit-25 {
    animation: lattice-on-25 var(--ll-cycle) infinite var(--ll-ease-in-out);
  }

  .ll-root[data-glow] .ll-run .ll-cell:not(.ll-hole) {
    box-shadow: 0 0 calc(var(--ll-cell) * 1.2) calc(var(--ll-cell) * 0.12) var(--ll-glow);
  }

  .ll-mark .ll-cell {
    transition: opacity 200ms ease, background-color 200ms ease;
  }
  .ll-mark .ll-cell.ll-on {
    background: var(--ll-mark);
    opacity: var(--ll-peak);
  }
  .ll-root[data-glow] .ll-mark .ll-cell.ll-on {
    box-shadow: 0 0 calc(var(--ll-cell) * 1.2) calc(var(--ll-cell) * 0.12) var(--ll-mark-glow);
  }

  .ll-label {
    position: relative;
    display: inline-block;
    font-weight: 500;
  }
  .ll-text {
    position: absolute;
    top: 0;
    left: 0;
    white-space: nowrap;
    opacity: 0;
    filter: blur(2px);
    transition: opacity 200ms ease, filter 200ms ease;
  }
  .ll-text.ll-active {
    position: static;
    opacity: 1;
    filter: blur(0);
  }

  .ll-timer {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-variant-numeric: tabular-nums;
    opacity: 0.6;
    font-size: calc(var(--ll-font) * 0.875);
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @keyframes lattice-on {
    0%, 100% { opacity: var(--ll-idle); }
    18%, 42% { opacity: var(--ll-peak); }
    62% { opacity: var(--ll-idle); }
  }
  @keyframes lattice-on-45 {
    0%, 100% { opacity: var(--ll-idle); }
    13%, 31% { opacity: var(--ll-peak); }
    45% { opacity: var(--ll-idle); }
  }
  @keyframes lattice-on-35 {
    0%, 100% { opacity: var(--ll-idle); }
    10%, 24% { opacity: var(--ll-peak); }
    35% { opacity: var(--ll-idle); }
  }
  @keyframes lattice-on-25 {
    0%, 100% { opacity: var(--ll-idle); }
    7%, 17% { opacity: var(--ll-peak); }
    25% { opacity: var(--ll-idle); }
  }

  @media (prefers-reduced-motion: reduce) {
    .ll-run { --ll-peak: 0.7; }
    .ll-run .ll-cell {
      animation-delay: 0ms !important;
      animation-duration: 1400ms !important;
    }
    .ll-mark { transform: none !important; }
    .ll-text { filter: none !important; }
  }
</style>
