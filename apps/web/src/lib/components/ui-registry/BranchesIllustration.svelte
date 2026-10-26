<script lang="ts">
  import { onMount } from "svelte";
  import { SvelteMap } from "svelte/reactivity";

  export let reach: number = 3;

  type Point = [number, number];
  type Point3 = [number, number, number];
  type Seed = { lane: string; n: number; x: number; y: number; parent: number };
  type Rail = { lo: string; top: string };
  type Cylinder = { side: string; cx: number; yt: number; r: number };
  type Tween = { from: number; to: number; t0: number; delay: number };
  type Lift = [number, number];

  const D = 30, FY = 58, RW = 7, RT = 2.6, PR = 8, PH = 2.4, CR = 6.6, CH = 6, LIFT = 36, STEP = 45;
  const BX0 = -15, BX1 = 225, BY0 = -16, BY1 = 72, PB = 6, ZTOP = RT + PH + CH;
  const K = 0.7071, ZK = 0.87;
  const P = (x: number, y: number, z: number): Point => [(x - y) * K, ((x + y) * K) / 2 - z * ZK];
  const poly = (points: Point[]): string => "M" + points.map((p) => p.join(" ")).join("L") + "Z";
  const clamp = (v: number, a: number, b: number): number => Math.min(b, Math.max(a, v));

  // history: lane, n, x, y, first parent
  const seeds: Seed[] = [];
  const at = (lane: string, n: number, x: number, y: number, parent: number): number => {
    seeds.push({ lane, n, x, y, parent });
    return seeds.length - 1;
  };
  const m: number[] = [];
  for (let i = 0; i < 8; i++) m.push(at("main", i + 1, i * D, 0, i ? m[i - 1] : -1));
  const f1 = at("feature", 1, 2.5 * D, FY, m[1]), f2 = at("feature", 2, 3.5 * D, FY, f1), f3 = at("feature", 3, 4.5 * D, FY, f2);
  const xy = (i: number): Point => [seeds[i].x, seeds[i].y];

  const bez = (a: Point, b: Point, ox: number, oy: number, ix: number, n: number): Point[] => {
    const out: Point[] = [];
    for (let k = 0; k <= n; k++) {
      const t = k / n, u = 1 - t, w = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
      const px = [a[0], a[0] + ox, b[0] - ix, b[0]], py = [a[1], a[1] + oy, b[1], b[1]];
      out.push([w.reduce((sum, v, j) => sum + v * (px[j] ?? 0), 0), w.reduce((sum, v, j) => sum + v * (py[j] ?? 0), 0)]);
    }
    return out;
  };
  const fork = (a: Point, b: Point): Point[] => bez(a, b, (b[0] - a[0]) * 0.3, (b[1] - a[1]) * 0.5, (b[0] - a[0]) * 0.45, 14);
  const merge = (a: Point, b: Point): Point[] => bez(b, a, (a[0] - b[0]) * 0.3, (a[1] - b[1]) * 0.5, (a[0] - b[0]) * 0.45, 14).reverse();
  function strip(curve: Point[]): Point[] {
    const left: Point[] = [], right: Point[] = [];
    curve.forEach((p, i) => {
      const a = curve[Math.max(0, i - 1)] ?? p, b = curve[Math.min(curve.length - 1, i + 1)] ?? p;
      const dx = b[0] - a[0], dy = b[1] - a[1], length = Math.hypot(dx, dy), nx = -dy / length, ny = dx / length;
      left.push([p[0] + (nx * RW) / 2, p[1] + (ny * RW) / 2]);
      right.push([p[0] - (nx * RW) / 2, p[1] - (ny * RW) / 2]);
    });
    return left.concat(right.reverse());
  }
  const rails: Rail[] = [
    [xy(m[0] ?? 0), xy(m[7] ?? 0)],
    [...fork(xy(m[1] ?? 0), xy(f1)), ...merge(xy(f3), xy(m[6] ?? 0)).slice(1)],
  ].map((curve) => {
    const points = strip(curve);
    return { lo: poly(points.map((p) => P(p[0], p[1], 0))), top: poly(points.map((p) => P(p[0], p[1], RT))) };
  });

  const board = {
    top: poly([[BX0, BY0], [BX1, BY0], [BX1, BY1], [BX0, BY1]].map(([x, y]) => P(x ?? 0, y ?? 0, 0))),
    right: poly(([[BX1, BY0, 0], [BX1, BY1, 0], [BX1, BY1, -PB], [BX1, BY0, -PB]] as Point3[]).map(([x, y, z]) => P(x, y, z))),
    left: poly(([[BX1, BY1, 0], [BX0, BY1, 0], [BX0, BY1, -PB], [BX1, BY1, -PB]] as Point3[]).map(([x, y, z]) => P(x, y, z))),
  };

  // cylinder: side wall + top ellipse
  function cyl(x: number, y: number, r: number, base: number, h: number): Cylinder {
    const [cx, yb] = P(x, y, base), [, yt] = P(x, y, base + h);
    return { side: `M${cx - r} ${yt}V${yb}A${r} ${r / 2} 0 0 0 ${cx + r} ${yb}V${yt}Z`, cx, yt, r };
  }

  const order = seeds.map((_, i) => i).sort((a, b) => {
    const left = seeds[a], right = seeds[b];
    return left.x + left.y - right.x - right.y;
  });
  const chain = (a: number): Lift[] => {
    const result: Lift[] = [];
    for (let i = a, k = 0; i >= 0; i = seeds[i]?.parent ?? -1, k++) result.push([i, k]);
    return result;
  };
  const REST = f3, REST_REACH = 2.2, REST_DEPTH = 0.5;

  // tweens
  const ease = (t: number): number => 1 - Math.pow(1 - t, 3);
  let tw: Tween[] = seeds.map(() => ({ from: 0, to: 0, t0: 0, delay: 0 }));
  let zs: number[] = seeds.map(() => 0);
  const val = (t: Tween, now: number): number => t.from + (t.to - t.from) * ease(clamp((now - t.t0 - t.delay) / 280, 0, 1));
  const done = (t: Tween, now: number): boolean => now - t.t0 - t.delay >= 280;
  let raf = 0;
  function frame(): void {
    const now = performance.now();
    zs = tw.map((t) => val(t, now));
    raf = tw.every((t) => done(t, now)) ? 0 : requestAnimationFrame(frame);
  }
  const wake = (): void => { if (!raf) raf = requestAnimationFrame(frame); };

  let act: number | null = null, lit: number | null = null, held = new SvelteMap<number, Lift>();
  function lift(a: number, r: number, depth: number, instant = false): void {
    const now = performance.now(), want = new SvelteMap<number, Lift>();
    for (const [i, k] of chain(a)) {
      if (k <= r) want.set(i, [LIFT * depth * clamp(1 - k / (r + 1), 0, 1), k]);
    }
    seeds.forEach((_, i) => {
      const previous = held.get(i);
      const [to, k] = want.get(i) ?? [0, previous?.[1] ?? 0];
      const current = tw[i];
      if (!current) return;
      tw[i] = instant ? { from: to, to, t0: 0, delay: 0 } : { from: val(current, now), to, t0: now, delay: k * STEP };
    });
    if (instant) zs = tw.map((t) => t.to);
    held = want;
    lit = a;
    wake();
  }
  lift(REST, REST_REACH, REST_DEPTH, true);

  function choose(a: number | null): void {
    if (a === act) return;
    act = a;
    if (a === null) lift(REST, REST_REACH, REST_DEPTH);
    else lift(a, reach, 1);
  }
  $: if (act !== null) lift(act, reach, 1);

  let svg: SVGSVGElement;
  function hit(e: PointerEvent): void {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const matrix = svg.getScreenCTM();
    if (!matrix) return;
    const p = pt.matrixTransform(matrix.inverse());
    const s = (p.y + ZTOP * ZK) / (K / 2), d = p.x / K, x = (s + d) / 2, y = (s - d) / 2;
    if (x < BX0 || x > BX1 || y < BY0 || y > BY1) {
      choose(null);
      return;
    }
    let best: number | null = null, bd = Infinity;
    seeds.forEach((c, i) => {
      const q = Math.hypot(c.x - x, c.y - y);
      if (q < bd) { bd = q; best = i; }
    });
    choose(best);
  }
  onMount(() => () => cancelAnimationFrame(raf));
</script>

<figure>
  <svg bind:this={svg} viewBox="-70 -62 250 182" on:pointermove={hit} on:pointerdown={hit} on:pointerleave={() => choose(null)}>
    <path d={board.left} class="side2" /><path d={board.right} class="side" /><path d={board.top} class="board" />
    {#each rails as r (r.top)}<path d={r.lo} class="lo" /><path d={r.top} class="rail" />{/each}
    {#each order as i (i)}
      {@const c = seeds[i]}
      {@const pad = cyl(c.x, c.y, PR, RT, PH)}
      {@const b = PH + RT + zs[i]}
      {@const pk = cyl(c.x, c.y, CR, b, CH)}
      <path d={pad.side} class="side" />
      <ellipse cx={pad.cx} cy={pad.yt} rx={pad.r} ry={pad.r / 2} class="pad" />
      {#if zs[i] > 0.5}<line x1={pk.cx} y1={P(c.x, c.y, PH + RT)[1]} x2={pk.cx} y2={P(c.x, c.y, b)[1]} class="dash" />{/if}
      <g class:hi={lit === i}>
        <path d={pk.side} class="pside" />
        <ellipse cx={pk.cx} cy={pk.yt} rx={pk.r} ry={pk.r / 2} class="ptop" />
      </g>
    {/each}
  </svg>
</figure>

<style>
  figure { margin: 0 auto; width: 100%; max-width: 760px; font: 13px system-ui, sans-serif; color: var(--ink, CanvasText); }
  svg { width: 100%; height: auto; touch-action: none; display: block; }
  .board { fill: var(--board, Canvas); stroke: var(--line, CanvasText); stroke-width: .6 }
  .side { fill: var(--side, color-mix(in srgb, CanvasText 14%, Canvas)); stroke: var(--line, CanvasText); stroke-width: .6 }
  .side2 { fill: var(--side2, color-mix(in srgb, CanvasText 22%, Canvas)); stroke: var(--line, CanvasText); stroke-width: .6 }
  .lo { fill: var(--rail2, color-mix(in srgb, CanvasText 14%, Canvas)) } .rail { fill: var(--rail, Canvas); stroke: var(--line, CanvasText); stroke-width: .4 }
  .pad { fill: var(--board, Canvas); stroke: var(--line, CanvasText); stroke-width: .6 }
  .pside { fill: var(--pside, color-mix(in srgb, CanvasText 14%, Canvas)); stroke: var(--line, CanvasText); stroke-width: .6 }
  .ptop { fill: var(--ptop, Canvas); stroke: var(--line, CanvasText); stroke-width: .6 }
  .dash { stroke: var(--line, CanvasText); stroke-dasharray: 2 2; stroke-width: .6 }
  .hi .pside { fill: var(--hi2, color-mix(in srgb, CanvasText 55%, Canvas)) } .hi .ptop { fill: var(--hi, color-mix(in srgb, CanvasText 80%, Canvas)) }
  label { display: flex; align-items: center; gap: 10px; margin-top: 8px }
  input { flex: 1 } b { min-width: 1ch; font-variant-numeric: tabular-nums; }
</style>
