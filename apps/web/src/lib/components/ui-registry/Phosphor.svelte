<script lang="ts">
  import { onMount } from 'svelte';

  type Pt = [number, number];
  type Slab = { hull: string; arc: string; edges: string[]; top: string };

  /** Цвет точек. */
  export let accent = '#f43f5e';
  /** Послесвечение τ в мс: как медленно гаснет зажжённая точка. Можно биндить. */
  export let tau = 320;
  export let width = 'min(94vw, 560px)';
  export let showControls = true;
  export let label = '7 by 7 phosphor dot matrix on an isometric tile';

  const N = 7, PITCH = 10, M = 8, EXT = M * 2 + PITCH * (N - 1);
  const T = 5, R = 2.5, DROP = 15, BT = 4, BO = 7;
  const K = 2.3, C = 0.7071, OX = 200, OY = 95;
  const FRAME = 110, RESUME = 1200, RAMP = 400;
  const SPLASH: [number, number, number][] = [[0, 0, 1], [1, 0, 0.45], [-1, 0, 0.45], [0, 1, 0.45], [0, -1, 0.45]];
  /** Семь байтов строк на кадр (старший бит = левая колонка): рябь, пауза, диагональный проход, пауза. */
  const LOOP: number[][] = [
    [0, 0, 0, 8, 0, 0, 0], [0, 0, 8, 20, 8, 0, 0], [0, 28, 34, 34, 34, 28, 0], [28, 34, 65, 65, 65, 34, 28], [65, 0, 0, 0, 0, 0, 65],
    [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0],
    [64, 0, 0, 0, 0, 0, 0], [32, 64, 0, 0, 0, 0, 0], [16, 32, 64, 0, 0, 0, 0], [8, 16, 32, 64, 0, 0, 0], [4, 8, 16, 32, 64, 0, 0], [2, 4, 8, 16, 32, 64, 0], [1, 2, 4, 8, 16, 32, 64],
    [0, 1, 2, 4, 8, 16, 32], [0, 0, 1, 2, 4, 8, 16], [0, 0, 0, 1, 2, 4, 8], [0, 0, 0, 0, 1, 2, 4], [0, 0, 0, 0, 0, 1, 2], [0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]
  ];
  const lit = (f: number, r: number, c: number): number => (LOOP[f][r] >> (N - 1 - c)) & 1;

  // ---- изометрическая проекция ----------------------------------------------
  const P = (u: number, v: number, z: number): Pt => [OX + (u - v) * C * K, OY + ((u + v) * C * 0.5 - z) * K];
  const U = (sx: number, sy: number, z: number): Pt => {
    const a = (sx - OX) / (C * K), b = ((sy - OY) / K + z) / (C * 0.5);
    return [(a + b) / 2, (b - a) / 2];
  };
  const path = (pts: Pt[], close = false): string =>
    pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ',' + q[1].toFixed(1)).join('') + (close ? 'Z' : '');

  function rr(x0: number, y0: number, x1: number, y1: number, r: number): Pt[] {
    const p: Pt[] = [], S = 8;
    const corners: [number, number, number][] = [
      [x1 - r, y0 + r, -90],
      [x1 - r, y1 - r, 0],
      [x0 + r, y1 - r, 90],
      [x0 + r, y0 + r, 180]
    ];
    corners.forEach((c) => {
      for (let i = 0; i <= S; i++) {
        const t = ((c[2] + (90 * i) / S) * Math.PI) / 180;
        p.push([c[0] + r * Math.cos(t), c[1] + r * Math.sin(t)]);
      }
    });
    return p;
  }

  function hull(pts: Pt[]): Pt[] {
    const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o: Pt, a: Pt, b: Pt): number => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo: Pt[] = [], up: Pt[] = [];
    p.forEach((q) => {
      while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
      lo.push(q);
    });
    for (let i = p.length - 1; i >= 0; i--) {
      const q = p[i];
      while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop();
      up.push(q);
    }
    lo.pop();
    up.pop();
    return lo.concat(up);
  }

  /** Плита: непрозрачная оболочка, видимая нижняя дуга, два бокововых ребра силуэта, верхний контур. */
  function slab(ring: Pt[], zt: number, zb: number): Slab {
    const t = ring.map((q) => P(q[0], q[1], zt));
    const b = ring.map((q) => P(q[0], q[1], zb));
    const n = ring.length;
    let iL = 0, iR = 0;
    b.forEach((q, i) => {
      if (q[0] < b[iL][0]) iL = i;
      if (q[0] > b[iR][0]) iR = i;
    });
    const walk = (d: number): { a: Pt[]; y: number } => {
      const a: Pt[] = [];
      let i = iL, y = 0;
      for (;;) {
        a.push(b[i]);
        y += b[i][1];
        if (i === iR) break;
        i = (i + d + n) % n;
      }
      return { a, y: y / a.length };
    };
    const w1 = walk(1), w2 = walk(-1);
    return {
      hull: path(hull(t.concat(b)), true),
      arc: path((w1.y > w2.y ? w1 : w2).a),
      edges: [iL, iR].map((i) => path([t[i], b[i]])),
      top: path(t, true)
    };
  }

  const plate = slab(rr(-BO, -BO, EXT + BO, EXT + BO, 11), -DROP, -DROP - BT);
  const plateInset = path(rr(-BO + 1.8, -BO + 1.8, EXT + BO - 1.8, EXT + BO - 1.8, 9.5).map((q) => P(q[0], q[1], -DROP)), true);
  const tileRing = rr(0, 0, EXT, EXT, 7);
  const tile = slab(tileRing, T, 0);
  const tileInset = path(rr(3.5, 3.5, EXT - 3.5, EXT - 3.5, 4.5).map((q) => P(q[0], q[1], T)), true);
  const drops: string[] = (() => {
    const t0 = tileRing.map((q) => P(q[0], q[1], 0));
    const ex = [0, 0, 0];
    t0.forEach((q, i) => {
      if (q[0] < t0[ex[0]][0]) ex[0] = i;
      if (q[0] > t0[ex[1]][0]) ex[1] = i;
      if (q[1] > t0[ex[2]][1]) ex[2] = i;
    });
    return ex.map((i) => path([P(tileRing[i][0], tileRing[i][1], 0), P(tileRing[i][0], tileRing[i][1], -DROP)]));
  })();
  const dots = Array.from({ length: N * N }, (_, i) => {
    const [cx, cy] = P(M + (i % N) * PITCH, M + Math.floor(i / N) * PITCH, T);
    return { cx, cy };
  });

  // ---- состояние ------------------------------------------------------------
  let svg: SVGSVGElement;
  let op: number[] = new Array<number>(N * N).fill(0.14);
  let readout = 'loop';
  const I = new Float32Array(N * N);
  let clock = 0, lastF = -1, leftAt = -1e9, painting = false;
  let prev: Pt | null = null;

  function excite(x: number, y: number, a: number): void {
    const c = Math.round((x - M) / PITCH), r = Math.round((y - M) / PITCH);
    for (const [dr, dc, k] of SPLASH) {
      const rr_ = r + dr, cc = c + dc;
      if (rr_ < 0 || rr_ >= N || cc < 0 || cc >= N) continue;
      I[rr_ * N + cc] = Math.max(I[rr_ * N + cc], a * k);
    }
  }
  function at(e: PointerEvent): Pt {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const m = svg.getScreenCTM();
    const q = m ? pt.matrixTransform(m.inverse()) : pt;
    return U(q.x, q.y, T);
  }
  function move(e: PointerEvent): void {
    painting = true;
    const q = at(e);
    if (prev) {
      // добиваем промежуток между событиями, чтобы быстрый штрих оставлял линию, а не точки
      const n = Math.max(1, Math.ceil(Math.hypot(q[0] - prev[0], q[1] - prev[1]) / 3));
      for (let k = 1; k <= n; k++) excite(prev[0] + ((q[0] - prev[0]) * k) / n, prev[1] + ((q[1] - prev[1]) * k) / n, 1);
    } else excite(q[0], q[1], 1);
    prev = q;
  }
  function leave(): void {
    painting = false;
    prev = null;
    leftAt = performance.now();
    clock = 0;
    lastF = -1;
  }

  onMount(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0, last = performance.now();
    const tick = (now: number): void => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const decay = Math.exp((-dt * 1000) / tau);
      if (reduce && !painting) {
        // без цикла: замираем на готовом кадре, самом широком кольце ряби
        for (let i = 0; i < N * N; i++) I[i] = Math.max(I[i] * decay, lit(3, Math.floor(i / N), i % N) * 0.8);
        readout = 'still';
      } else readout = painting ? 'paint' : 'afterglow';
      op = Array.from(I, (v) => 0.08 + 0.92 * Math.min(1, Math.max(0, v)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  });
</script>

<div class="hl-wrap" style="--hl-accent:{accent}">
  <svg
    class="hl"
    bind:this={svg}
    viewBox="0 0 400 340"
    role="img"
    aria-label={label}
    style="width:{width}"
    on:pointermove={move}
    on:pointerdown={move}
    on:pointerleave={leave}
    on:pointerup={(e) => {
      if (e.pointerType !== 'mouse') leave();
    }}
  >
    <!-- нижняя плита -->
    <path class="s nostroke" d={plate.hull} />
    <path class="n" d={plate.arc} />
    {#each plate.edges as d, i (i)}<path class="n" {d} />{/each}
    <path class="s" d={plate.top} />
    <path class="lo" d={plateInset} />

    <!-- пунктирные опоры, поверх них плитка -->
    {#each drops as d, i (i)}<path class="n dash" {d} />{/each}
    <path class="s nostroke" d={tile.hull} />
    <path class="n" d={tile.arc} />
    {#each tile.edges as d, i (i)}<path class="n" {d} />{/each}
    <path class="s" d={tile.top} />
    <path class="lo" d={tileInset} />

    {#each dots as d, i (i)}
      <ellipse class="dot" cx={d.cx} cy={d.cy} rx={R * K} ry={R * K * 0.5} opacity={op[i].toFixed(3)} />
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
    /* переопределяются снаружи под тему */
    --hl-bg: #f6f4f1;
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
