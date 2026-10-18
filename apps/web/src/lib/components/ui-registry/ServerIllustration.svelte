<!--
  Server.svelte: a rack server drawn as an isometric line figure.

  Props
    units   number of rack units in the stack (1 to 6).                    default 3
    label   accessible name.
    class   extra class for the <svg>.

  Theming (CSS custom properties, all optional)
    --srv-ink       line colour                 default CanvasText
    --srv-surface   fill behind lines           default Canvas
    --srv-led       status light                default #2fbf7f
    --srv-accent    focus outline               default #1f62d0
    --srv-sw        stroke width                default 2.6 (view-box units)

  Hover or focus a unit and it slides out like a drawer. Tab moves between units.
  Everything is in this one file: the geometry sits in the module script below.
-->
<script module>
  // ---- geometry: isometric, pure functions
  const S = 2.5, K = Math.sqrt(3) / 2;
  const H = 32, UH = 18, UP = 20, PULL = 14, PAD = 14;

  const P = (x, y, z) => [(x - y) * K * S, ((x + y) / 2 - z) * S];
  const r1 = (v) => Math.round(v * 100) / 100;
  const pts = (list) => list.map((q) => P(q[0], q[1], q[2])).map((p) => r1(p[0]) + ' ' + r1(p[1])).join('L');
  const quad = (...q) => 'M' + pts(q) + 'Z';
  const seg = (a, b) => 'M' + pts([a, b]);
  const dot = (q) => { const p = P(q[0], q[1], q[2]); return 'M' + r1(p[0]) + ' ' + r1(p[1]) + 'h.01'; };

  /** One rack unit: its faces, drive bays, handle, side vents and lights. */
  function unitModel(k) {
    const z0 = k * UP, z1 = z0 + UH, y = H, c = 3;
    const bays = [-27, -15.67, -4.33, 7];
    return {
      front: quad([-H, y, z0], [H, y, z0], [H, y, z1], [-H, y, z1]),
      side: quad([H, -H, z0], [H, H, z0], [H, H, z1], [H, -H, z1]),
      top: quad([-H, -H, z1], [H, -H, z1], [H, H, z1], [-H, H, z1]),
      inset: quad([-H + c, -H + c, z1], [H - c, -H + c, z1], [H - c, H - c, z1], [-H + c, H - c, z1]),
      bay: quad([bays[0], y, z0 + 4], [bays[3], y, z0 + 4], [bays[3], y, z0 + 14], [bays[0], y, z0 + 14]),
      dividers: [bays[1], bays[2]].map((x) => seg([x, y, z0 + 4], [x, y, z0 + 14])).join(''),
      handles: bays.slice(0, 3).map((x, i) => seg([x + 2.2, y, z0 + 9 + 0], [bays[i + 1] - 2.2, y, z0 + 9])).join(''),
      power: dot([20, y, z0 + 9]),
      led: dot([26, y, z0 + 9]),
      vents: [-22, -15, -8, -1, 6, 13, 20].map((v) => seg([H, v, z0 + 5], [H, v, z1 - 5])).join(''),
    };
  }

  /** The whole stack and the view box that holds it, also when a drawer is pulled out. */
  function model(units) {
    const n = Math.max(1, Math.min(6, Math.round(units) || 1));
    const top = n * UP - (UP - UH);
    const corners = [];
    for (const x of [-H - 6, H + 6]) for (const y of [-H - 6, H + 6 + PULL]) for (const z of [0, top]) corners.push(P(x, y, z));
    const xs = corners.map((p) => p[0]), ys = corners.map((p) => p[1]);
    const x0 = Math.min(...xs) - PAD, x1 = Math.max(...xs) + PAD, y0 = Math.min(...ys) - PAD, y1 = Math.max(...ys) + PAD;
    return {
      viewBox: r1(x0) + ' ' + r1(y0) + ' ' + r1(x1 - x0) + ' ' + r1(y1 - y0),
      shadow: quad([-H - 6, -H - 6, 0], [H + 6, -H - 6, 0], [H + 6, H + 6, 0], [-H - 6, H + 6, 0]),
      pull: r1(-PULL * K * S) + 'px ' + r1((PULL / 2) * S) + 'px',
      units: Array.from({ length: n }, (_, k) => unitModel(k)),
    };
  }
</script>

<script>
  let { units = 3, label = 'Сервер: стойка из блоков', class: klass = '' } = $props();
  const m = $derived(model(units));
</script>

<svg class="server {klass}" viewBox={m.viewBox} role="group" aria-label={label} style:--pull={m.pull}>
  <path class="shadow" d={m.shadow} />
  {#each m.units as u, i (i)}
    <g class="unit" tabindex="0" role="group" aria-label={'Блок ' + (i + 1)} style:--i={i}>
      <path class="ln face-l" d={u.front} />
      <path class="ln face-r" d={u.side} />
      <path class="ln face-t" d={u.top} />
      <path class="ln lo" d={u.inset} />
      <path class="ln lo" d={u.bay} />
      <path class="ln lo" d={u.dividers} />
      <path class="ln lo" d={u.handles} />
      <path class="ln lo" d={u.vents} />
      <path class="light" d={u.power} />
      <path class="light blink" d={u.led} />
    </g>
  {/each}
</svg>

<style>
  .server {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
    --ink: var(--srv-ink, CanvasText);
    --surface: var(--srv-surface, Canvas);
    --led: var(--srv-led, #2fbf7f);
    --accent: var(--srv-accent, #1f62d0);
    --sw: var(--srv-sw, 2.6);
  }
  .shadow { fill: var(--ink); opacity: 0.07; }

  .ln {
    stroke: var(--ink);
    stroke-width: var(--sw);
    stroke-linejoin: round;
    stroke-linecap: round;
    fill: none;
  }
  .face-l { fill: color-mix(in srgb, var(--ink) 4%, var(--surface)); }
  .face-r { fill: color-mix(in srgb, var(--ink) 9%, var(--surface)); }
  .face-t { fill: var(--surface); }
  .lo { stroke-width: calc(var(--sw) * 0.6); opacity: 0.7; }

  .light { fill: none; stroke: var(--led); stroke-width: 6; stroke-linecap: round; }
  .blink { animation: blink 1.4s ease-in-out infinite; animation-delay: calc(var(--i) * 0.33s); }
  @keyframes blink { 50% { opacity: 0.25; } }

  .unit { outline: none; cursor: pointer; transition: transform 0.35s cubic-bezier(0.3, 1.3, 0.5, 1); }
  .unit:hover, .unit:focus-visible { transform: translate(var(--pull)); }
  .unit:hover .ln, .unit:focus-visible .ln { stroke: var(--accent); }
  .unit:hover .lo, .unit:focus-visible .lo { stroke: var(--accent); }

  @media (prefers-reduced-motion: reduce) {
    .unit { transition: none; }
    .blink { animation: none; }
  }
</style>