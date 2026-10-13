<script lang="ts">
  import { onMount } from 'svelte';

  type Pt = [number, number];

  /** Акцентный цвет трубки бесконечности. */
  export let accent = '#f43f5e';
  /** CSS-ширина всей фигуры. */
  export let width = 'min(92vw, 560px)';
  export let label = 'Isometric shield with infinity symbol';

  const D =
    'M0,-120 C40,-100 80,-95 100,-95 L100,-10 C100,60 55,100 0,125 C-55,100 -100,60 -100,-10 L-100,-95 C-80,-95 -40,-100 0,-120Z';
  const DEPTH = 14; // толщина щита (в локальных единицах)
  const H = 12; // толщина трубки бесконечности (в локальных единицах)
  const corners: Pt[] = [
    [0, -120],
    [100, -95],
    [0, 125],
    [-100, -95]
  ];

  // контур лемнискаты
  const M = 240;
  const pts: Pt[] = Array.from({ length: M + 1 }, (_, k): Pt => {
    const t = (k / M) * Math.PI * 2;
    const e = 1 + Math.sin(t) ** 2;
    return [(68 * Math.cos(t)) / e, (68 * Math.sin(t) * Math.cos(t)) / e];
  });
  const P = 'M' + pts.map((p) => p[0].toFixed(2) + ',' + p[1].toFixed(2)).join(' L') + 'Z';
  const slices = Array.from({ length: H }, (_, k) => {
    const i = H - k;
    return { i, mix: 25 + (1 - i / H) * 35 };
  });

  let front: SVGPathElement;
  let conn: Pt[] = []; // рёбра силуэта толщины щита
  let tgt = 0;
  let hov = 0;
  let ph = 0;
  let w = 7; // толщина обводки трубки, px
  let sc = 1; // масштаб пульсации трубки
  let ech = [
    { f: 0, o: 0 },
    { f: 0, o: 0 }
  ];

  onMount(() => {
    // рёбра, где контур идёт параллельно направлению глубины (только нижняя кривая)
    const len = front.getTotalLength();
    const N = 480;
    const out: Pt[] = [];
    let pv = 0;
    let pp: DOMPoint | null = null;
    for (let i = 0; i <= N; i++) {
      const q = front.getPointAtLength((len * i) / N);
      if (pp) {
        const d = q.x - pp.x + (q.y - pp.y);
        if (pv && d * pv < 0 && pp.y > 20) out.push([pp.x, pp.y]);
        if (d) pv = d;
      }
      pp = q;
    }
    conn = out;

    let raf = 0;
    let last = performance.now();
    const tick = (now: number): void => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      hov += (tgt - hov) * Math.min(1, dt * 8);
      ph += dt * hov * 1.5;
      const beat = Math.max(0, Math.sin(ph * Math.PI * 2)) ** 3;
      w = 7 + hov * (1 + 3 * beat);
      sc = 1 + hov * (0.04 + 0.07 * beat);
      ech = [0, 1].map((i) => {
        const f = (ph + (i + 1) / 2) % 1;
        return { f, o: (1 - f) * 0.55 * hov };
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  });
</script>

<svg
  class="hl"
  viewBox="0 0 600 600"
  role="img"
  aria-label={label}
  style="--hl-accent:{accent}; width:{width}"
  on:pointerenter={() => (tgt = 1)}
  on:pointerleave={() => (tgt = 0)}
  on:pointerdown={() => (tgt = 1)}
  on:pointerup={(e) => {
    if (e.pointerType !== 'mouse') tgt = 0;
  }}
>
  <g transform="translate(300 300) rotate(8) scale(1.15) matrix(0.866 0.5 0 1 0 0)">
    <!-- щит: задняя грань, рёбра толщины, передняя грань (непрозрачная, скрывает то, что за ней) -->
    <path class="l bk" d={D} transform="translate({DEPTH} {-DEPTH})" />
    <g>
      {#each corners as c, i (i)}
        <line class="l" x1={c[0]} y1={c[1]} x2={c[0] + DEPTH} y2={c[1] - DEPTH} />
      {/each}
      {#each conn as c, i (i)}
        <line class="l" x1={c[0]} y1={c[1]} x2={c[0] + DEPTH} y2={c[1] - DEPTH} />
      {/each}
    </g>
    <path class="l fl" d={D} bind:this={front} />
    <path class="l f" d={D} transform="scale(.86) translate(0 4)" />

    <!-- бесконечность: выдавленная трубка -->
    <g transform="translate(-4 10)">
      <g transform="scale({sc})">
        {#each slices as s (s.i)}
          <path
            class="tube"
            d={P}
            transform="translate({s.i} {-s.i})"
            style="stroke:color-mix(in srgb, var(--hl-accent) {s.mix}%, var(--hl-bg)); stroke-width:{w}px"
          />
        {/each}
        <path class="tube" d={P} style="stroke:var(--hl-accent); stroke-width:{w}px" />
      </g>
      {#each ech as e, i (i)}
        <g transform="translate({e.f * H * 0.5} {-e.f * H * 0.5}) scale({1 + e.f * 0.4})">
          <path class="echo" d={P} style="stroke-opacity:{e.o}" />
        </g>
      {/each}
    </g>
  </g>
</svg>

<style>
  .hl {
    /* переопределяются снаружи под тему */
    --hl-bg: #f6f4f1;
    --hl-line: #2b2f3a;
    --hl-faint: #2b2f3a55;
    display: block;
    height: auto;
    max-height: 80vh;
    cursor: pointer;
    touch-action: none;
  }
  @media (prefers-color-scheme: dark) {
    .hl {
      --hl-bg: #0e1016;
      --hl-line: #d7dbe6;
      --hl-faint: #d7dbe655;
    }
  }
  .l {
    fill: none;
    stroke: var(--hl-line);
    stroke-width: 1.2;
    stroke-linejoin: round;
    stroke-linecap: round;
    vector-effect: non-scaling-stroke;
  }
  .f {
    stroke: var(--hl-faint);
  }
  .bk {
    stroke-opacity: 0.6;
  }
  .fl {
    fill: var(--hl-bg);
  }
  .tube {
    fill: none;
    stroke-linejoin: round;
    stroke-linecap: round;
    vector-effect: non-scaling-stroke;
  }
  .echo {
    fill: none;
    stroke: var(--hl-accent);
    stroke-width: 1.4;
    vector-effect: non-scaling-stroke;
  }
</style>
