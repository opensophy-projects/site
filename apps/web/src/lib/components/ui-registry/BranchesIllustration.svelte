<script>
  import { onMount } from "svelte";
  export let reach = 3;

  const D = 30, FY = 58, RW = 7, RT = 2.6, PR = 8, PH = 2.4, CR = 6.6, CH = 6, LIFT = 36, STEP = 45;
  const BX0 = -15, BX1 = 225, BY0 = -16, BY1 = 72, PB = 6, ZTOP = RT + PH + CH;
  const K = 0.7071, ZK = 0.87;
  const P = (x, y, z) => [(x - y) * K, ((x + y) * K) / 2 - z * ZK];
  const poly = (a) => "M" + a.map((p) => p.join(" ")).join("L") + "Z";
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // history: lane, n, x, y, first parent
  const seeds = [];
  const at = (lane, n, x, y, parent) => (seeds.push({ lane, n, x, y, parent }), seeds.length - 1);
  const m = [];
  for (let i = 0; i < 8; i++) m.push(at("main", i + 1, i * D, 0, i ? m[i - 1] : -1));
  const f1 = at("feature", 1, 2.5 * D, FY, m[1]), f2 = at("feature", 2, 3.5 * D, FY, f1), f3 = at("feature", 3, 4.5 * D, FY, f2);
  const xy = (i) => [seeds[i].x, seeds[i].y];

  const bez = (a, b, ox, oy, ix, n) => {
    const out = [];
    for (let k = 0; k <= n; k++) {
      const t = k / n, u = 1 - t, w = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
      const px = [a[0], a[0] + ox, b[0] - ix, b[0]], py = [a[1], a[1] + oy, b[1], b[1]];
      out.push([w.reduce((s, v, j) => s + v * px[j], 0), w.reduce((s, v, j) => s + v * py[j], 0)]);
    }
    return out;
  };
  const fork = (a, b) => bez(a, b, (b[0] - a[0]) * 0.3, (b[1] - a[1]) * 0.5, (b[0] - a[0]) * 0.45, 14);
  const merge = (a, b) => bez(b, a, (a[0] - b[0]) * 0.3, (a[1] - b[1]) * 0.5, (a[0] - b[0]) * 0.45, 14).reverse();
  function strip(c) {
    const L = [], R = [];
    c.forEach((p, i) => {
      const a = c[Math.max(0, i - 1)], b = c[Math.min(c.length - 1, i + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
      L.push([p[0] + (nx * RW) / 2, p[1] + (ny * RW) / 2]);
      R.push([p[0] - (nx * RW) / 2, p[1] - (ny * RW) / 2]);
    });
    return L.concat(R.reverse());
  }
  const rails = [
    [xy(m[0]), xy(m[7])],
    [...fork(xy(m[1]), xy(f1)), ...merge(xy(f3), xy(m[6])).slice(1)],
  ].map((c) => {
    const s = strip(c);
    return { lo: poly(s.map((p) => P(p[0], p[1], 0))), top: poly(s.map((p) => P(p[0], p[1], RT))) };
  });

  const board = {
    top: poly([[BX0, BY0], [BX1, BY0], [BX1, BY1], [BX0, BY1]].map(([x, y]) => P(x, y, 0))),
    right: poly([[BX1, BY0, 0], [BX1, BY1, 0], [BX1, BY1, -PB], [BX1, BY0, -PB]].map((p) => P(...p))),
    left: poly([[BX1, BY1, 0], [BX0, BY1, 0], [BX0, BY1, -PB], [BX1, BY1, -PB]].map((p) => P(...p))),
  };

  // cylinder: side wall + top ellipse
  function cyl(x, y, r, b, h) {
    const [cx, yb] = P(x, y, b), [, yt] = P(x, y, b + h);
    return { side: `M${cx - r} ${yt}V${yb}A${r} ${r / 2} 0 0 0 ${cx + r} ${yb}V${yt}Z`, cx, yt, r };
  }

  const order = seeds.map((_, i) => i).sort((a, b) => seeds[a].x + seeds[a].y - (seeds[b].x + seeds[b].y));
  const chain = (a) => { const o = []; for (let i = a, k = 0; i >= 0; i = seeds[i].parent, k++) o.push([i, k]); return o; };
  const REST = f3, REST_REACH = 2.2, REST_DEPTH = 0.5;

  // tweens
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  let tw = seeds.map(() => ({ from: 0, to: 0, t0: 0, delay: 0 }));
  let zs = seeds.map(() => 0);
  const val = (t, now) => t.from + (t.to - t.from) * ease(clamp((now - t.t0 - t.delay) / 280, 0, 1));
  const done = (t, now) => now - t.t0 - t.delay >= 280;
  let raf = 0;
  function frame() {
    const now = performance.now();
    zs = tw.map((t) => val(t, now));
    raf = tw.every((t) => done(t, now)) ? 0 : requestAnimationFrame(frame);
  }
  const wake = () => { if (!raf) raf = requestAnimationFrame(frame); };

  let act = null, lit = null, held = new Map();
  function lift(a, r, depth, instant) {
    const now = performance.now(), want = new Map();
    for (const [i, k] of chain(a)) if (k <= r) want.set(i, [LIFT * depth * clamp(1 - k / (r + 1), 0, 1), k]);
    seeds.forEach((_, i) => {
      const [to, k] = want.get(i) || [0, (held.get(i) || [0, 0])[1]];
      tw[i] = instant ? { from: to, to, t0: 0, delay: 0 } : { from: val(tw[i], now), to, t0: now, delay: k * STEP };
    });
    if (instant) zs = tw.map((t) => t.to);
    held = want;
    lit = a;
    wake();
  }
  lift(REST, REST_REACH, REST_DEPTH, true);

  function choose(a) {
    if (a === act) return;
    act = a;
    if (a === null) lift(REST, REST_REACH, REST_DEPTH);
    else lift(a, reach, 1);
  }
  $: if (act !== null) { reach; lift(act, reach, 1); }

  let svg;
  function hit(e) {
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    const s = (p.y + ZTOP * ZK) / (K / 2), d = p.x / K, x = (s + d) / 2, y = (s - d) / 2;
    if (x < BX0 || x > BX1 || y < BY0 || y > BY1) return choose(null);
    let best = null, bd = Infinity;
    seeds.forEach((c, i) => { const q = Math.hypot(c.x - x, c.y - y); if (q < bd) { bd = q; best = i; } });
    choose(best);
  }
  onMount(() => () => cancelAnimationFrame(raf));
</script>

<figure>
  <svg bind:this={svg} viewBox="-70 -62 250 182" on:pointermove={hit} on:pointerdown={hit} on:pointerleave={() => choose(null)}>
    <path d={board.left} class="side2" /><path d={board.right} class="side" /><path d={board.top} class="board" />
    {#each rails as r}<path d={r.lo} class="lo" /><path d={r.top} class="rail" />{/each}
    {#each order as i}
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
