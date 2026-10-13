<!--
  Radar.svelte: параболическая антенна на двухосном подвесе, следит за курсором.

  Props
    reach   ход по азимуту в градусах (по углу места вдвое меньше).        по умолчанию 70
    scope   'self'   целится в курсор над компонентом,
            'window' целится в курсор в любом месте страницы.              по умолчанию 'self'
    az, el  bindable: текущие азимут и угол места антенны, градусы.
    class   дополнительный класс для <svg>.
    label   доступное имя.

  Темизация (CSS custom properties, все необязательны)
    --hl-ink       цвет линий            по умолчанию CanvasText
    --hl-surface   заливка под линиями   по умолчанию Canvas
    --hl-rim       яркий обод            по умолчанию #fff (белый)
    --hl-accent    контур фокуса         по умолчанию #1f62d0
    --hl-sw        толщина линии         по умолчанию 0.7 (единицы viewBox)

  Клавиатура: сфокусируй радар, стрелки наводят его, Escape возвращает в покой.
  Всё в одном файле: геометрия лежит в модульном скрипте ниже.
-->
<script module lang="ts">
  // ---- геометрия: параболическая антенна на двухосном подвесе, изометрия, чистые функции
  type V2 = [number, number];
  type V3 = [number, number, number];
  type Frame = { th: number; h: V3; e: V3; a: V3; u: V3 };
  type Side = ReturnType<typeof pose>['sides'][number];

  const R = 26, FOC = 17, SK = 1.4, DEP = (R * R) / (4 * FOC), ZE = 46, W = 31, T = 5, ZB = 10, ZY = 16;
  const AZ0 = 45, EL0 = 40;
  const REST: V2 = [-20, 30];
  const PIV: V3 = [0, 0, ZE];
  const ZZ: V3 = [0, 0, 1];
  const K = Math.sqrt(3) / 2;
  const S3 = Math.sqrt(3);
  const VD: V3 = [1 / S3, 1 / S3, 1 / S3]; // в сторону камеры

  const P = (x: number, y: number, z: number): V2 => [(x - y) * K, (x + y) / 2 - z];
  const Pv = (q: V3): V2 => P(q[0], q[1], q[2]);
  const ax = (p: V3, q: V3, s: number): V3 => [p[0] + q[0] * s, p[1] + q[1] * s, p[2] + q[2] * s];
  const dot3 = (p: V3, q: V3): number => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
  const rad = (d: number): number => (d * Math.PI) / 180;
  const r1 = (v: number): number => Math.round(v * 100) / 100;
  const pstr = (pts: V2[]): string => pts.map((p) => `${r1(p[0])} ${r1(p[1])}`).join('L');
  const poly = (pts: V2[]): string => (pts.length ? 'M' + pstr(pts) + 'Z' : '');
  const open = (pts: V2[]): string => (pts.length ? 'M' + pstr(pts) : '');

  function hull(pts: V2[]): V2[] {
    const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o: V2, a: V2, b: V2): number => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo: V2[] = [], up: V2[] = [];
    for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    up.pop(); lo.pop();
    return lo.concat(up);
  }

  /** Окружность из n точек вокруг центра c в плоскости, натянутой на x и y. */
  function disc(c: V3, x: V3, y: V3, r: number, n: number): V3[] {
    return Array.from({ length: n }, (_, i) => ax(ax(c, x, r * Math.cos((2 * Math.PI * i) / n)), y, r * Math.sin((2 * Math.PI * i) / n)));
  }

  /** Скруглённый прямоугольник в виде точек [u, v], n сегментов на угол. */
  function rr(x0: number, y0: number, x1: number, y1: number, r: number, n: number): V2[] {
    const out: V2[] = [];
    const corners: [number, number, number][] = [[x1 - r, y0 + r, -90], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, 90], [x0 + r, y0 + r, 180]];
    for (const [cx, cy, a0] of corners) {
      for (let i = 0; i <= n; i++) { const a = rad(a0 + (90 * i) / n); out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    }
    return out;
  }

  /** Система координат наведения: h и e лежат на земле (e — ось угла места), a — ось антенны, u — «верх» обода. */
  function frame(th: number, ph: number): Frame {
    const t = rad(th), f = rad(ph), c = Math.cos(f), s = Math.sin(f);
    const h: V3 = [Math.cos(t), Math.sin(t), 0], e: V3 = [-Math.sin(t), Math.cos(t), 0];
    return { th, h, e, a: [h[0] * c, h[1] * c, s], u: [-h[0] * s, -h[1] * s, c] };
  }
  /** Точка антенны: `along` вдоль оси от центра обода, rho в сторону от него под углом psi. */
  const onDish = (F: Frame, along: number, rho: number, psi: number): V3 =>
    ax(ax(ax(PIV, F.a, along), F.e, rho * Math.cos(psi)), F.u, rho * Math.sin(psi));
  /** Скруглённый прямоугольник, заданный в системе (h, e), поднятый на высоту z. */
  const turned = (F: Frame, pts: V2[], z: number): V3[] =>
    pts.map(([u, v]): V3 => [u * F.h[0] + v * F.e[0], u * F.h[1] + v * F.e[1], z]);

  // ---- viewBox, подогнанный под максимальный ход и положение покоя
  const fitPts: V3[] = [[-30, -30, 0], [30, 30, 0], [30, -30, 0], [-30, 30, 0]];
  const fitAims: V2[] = [[-25, 5], [-25, 75], [115, 5], [115, 75], REST];
  for (const [th, ph] of fitAims) {
    const F = frame(th, ph);
    fitPts.push(...disc(PIV, F.e, F.u, R, 16), onDish(F, FOC - DEP + 3, 0, 0));
    for (const s of [-1, 1]) fitPts.push(ax(ax(PIV, F.e, s * (W + T / 2)), ZZ, 6));
  }
  const fs = fitPts.map(Pv);
  const PAD = 8;
  const x0 = Math.min(...fs.map((p) => p[0])) - PAD, x1 = Math.max(...fs.map((p) => p[0])) + PAD;
  const y0 = Math.min(...fs.map((p) => p[1])) - PAD, y1 = Math.max(...fs.map((p) => p[1])) + PAD;
  const VW = x1 - x0, VH = y1 - y0;
  const VIEWBOX = `${r1(x0)} ${r1(y0)} ${r1(VW)} ${r1(VH)}`;
  const HUB = Pv(PIV);

  // ---- неподвижные части: плита основания, азимутальная шкала, поворотный стол
  const ringXY = (r: number, z: number, n = 64): V3[] => disc([0, 0, z], [1, 0, 0], [0, 1, 0], r, n);
  const plate = (inset: number, z: number): V3[] =>
    rr(-30 + inset, -30 + inset, 30 - inset, 30 - inset, 9 - inset, 6).map(([u, v]): V3 => [u, v, z]);
  const BASE = {
    plate: {
      sil: poly(hull(plate(0, 0).concat(plate(0, 5)).map(Pv))),
      top: poly(plate(0, 5).map(Pv)),
      inner: poly(plate(2, 5).map(Pv)),
    },
    scale: Array.from({ length: 36 }, (_, i) => {
      const t = (i / 36) * 2 * Math.PI, major = i % 9 === 0, r = major ? 26.5 : 25.5, rr0 = major ? 0.75 : 0.5;
      const c = Pv([r * Math.cos(t), r * Math.sin(t), 5]);
      return { cx: r1(c[0]), cy: r1(c[1]), rx: r1(rr0 * Math.sqrt(1.5)), ry: r1(rr0 * Math.SQRT1_2) };
    }),
    table: {
      sil: poly(hull(ringXY(20, 5).concat(ringXY(20, ZB)).map(Pv))),
      crease: poly(ringXY(18.8, ZB).map(Pv)),
    },
  };

  const BACK = [0, 0.35, 0.6, 0.78, 0.9, 0.97, 1];

  /** Шов на радиусе rho: участок, видимый сквозь апертуру; концы обрезаны там, где луч зрения пересекает обод. */
  function seen(F: Frame, rho: number, n: number): string {
    const along = (rho * rho) / (4 * FOC) - DEP, t = -along / dot3(F.a, VD);
    const q: V3[] = [], s: number[] = [];
    for (let i = 0; i < n; i++) {
      q.push(onDish(F, along, rho, (2 * Math.PI * i) / n));
      const hit = ax(q[i], VD, t);
      s.push(R - Math.hypot(hit[0] - PIV[0], hit[1] - PIV[1], hit[2] - PIV[2]));
    }
    if (s.every((x) => x > 0)) return poly(q.map(Pv));
    const i0 = s.findIndex((x, i) => x > 0 && s[(i + n - 1) % n] <= 0);
    if (i0 < 0) return '';
    const cut = (i: number, j: number): V2 =>
      Pv(ax(q[i], [q[j][0] - q[i][0], q[j][1] - q[i][1], q[j][2] - q[i][2]], s[i] / (s[i] - s[j])));
    const out: V2[] = [cut((i0 + n - 1) % n, i0)];
    let i = i0;
    while (s[i] > 0) { out.push(Pv(q[i])); i = (i + 1) % n; }
    out.push(cut((i + n - 1) % n, i));
    return open(out);
  }

  /** Всё, что поворачивается вместе с наведением, в виде данных SVG-путей. */
  function pose(az: number, el: number) {
    const F = frame(az, el);
    const idx = Pv([18 * F.h[0], 18 * F.h[1], ZB]);

    const yb = W + T / 2 + 1;
    const bo = rr(-9, -yb, 9, yb, 1.4, 3);
    const beam = {
      sil: poly(hull(turned(F, bo, ZB).concat(turned(F, bo, ZY)).map(Pv))),
      top: poly(turned(F, bo, ZY).map(Pv)),
    };

    const sides = [-1, 1].map((s) => {
      const foot = rr(-8, s * W - T / 2, 8, s * W + T / 2, 2.5, 4);
      const top = rr(-5.5, s * W - T / 2, 5.5, s * W + T / 2, 2.5, 4);
      const inner = rr(-4.5, s * W - T / 2 + 1, 4.5, s * W + T / 2 - 1, 1.5, 4);
      const out = ax(PIV, F.e, s * (W + T / 2));
      return {
        s,
        near: s * dot3(F.e, VD) > 0, // внешняя грань смотрит на камеру: рисуем её после антенны
        arm: {
          sil: poly(hull(turned(F, foot, ZY).concat(turned(F, top, ZE + 6)).map(Pv))),
          crease: poly(turned(F, inner, ZE + 6).map(Pv)),
        },
        ring: poly(disc(out, F.h, ZZ, 3.4, 24).map(Pv)),
        trun: poly(hull(disc(ax(PIV, F.e, s * R), F.h, ZZ, 2.2, 16).concat(disc(ax(PIV, F.e, s * (W - T / 2)), F.h, ZZ, 2.2, 16)).map(Pv))),
      };
    });

    // чаша: её контур — оболочка обода и тыла, толщина стенки SK
    const lip = disc(PIV, F.e, F.u, R, 72), back: V3[] = [];
    for (const f of BACK) for (let i = 0; i < 40; i++) back.push(onDish(F, (f * f * R * R) / (4 * FOC) - DEP - SK, f * R, (2 * Math.PI * i) / 40));
    const lipS = lip.map(Pv);
    const mouth = onDish(F, FOC - DEP - 3, 0, 0), tail = onDish(F, FOC - DEP + 3, 0, 0), mouthS = Pv(mouth);

    return {
      index: [r1(idx[0]), r1(idx[1])],
      mouth: mouthS,
      beam,
      sides,
      outline: poly(hull(lipS.concat(back.map(Pv)))),
      aperture: poly(lipS),
      seam: seen(F, 0.62 * R, 48),
      hub: seen(F, 3.2, 20),
      rim: poly(lipS),
      struts: [90, 210, 330].map((d) => 'M' + pstr([Pv(onDish(F, 0, R, rad(d))), mouthS])).join(''),
      feed: poly(hull(disc(mouth, F.e, F.u, 3.6, 16).concat(disc(tail, F.e, F.u, 2.4, 16)).map(Pv))),
      feedC: poly(disc(tail, F.e, F.u, 1.3, 16).map(Pv)),
    };
  }

  /** Наведение на курсор в точке (x, y) в единицах viewBox. Читает только смещение от оси: мерцать нечему. */
  function aim(x: number, y: number, reach = 70): V2 {
    return [
      AZ0 - reach * Math.tanh((x - HUB[0]) / (0.6 * VW)),
      EL0 + (reach / 2) * Math.tanh((HUB[1] - y) / (0.54 * VH)),
    ];
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte';

  type Props = {
    reach?: number;
    scope?: 'self' | 'window';
    az?: number;
    el?: number;
    class?: string;
    label?: string;
  };
  type Spring = { x: number; v: number; t: number };

  let {
    reach = 70,
    scope = 'self',
    az = $bindable(REST[0]),
    el = $bindable(REST[1]),
    class: klass = '',
    label = 'Радар: антенна следит за курсором'
  }: Props = $props();

  let svg = $state<SVGSVGElement | null>(null);
  const g = $derived(pose(az, el));

  // Две пружины, по одной на ось. Курсор двигает только их цели.
  const sa: Spring = { x: az, v: 0, t: az };
  const se: Spring = { x: el, v: 0, t: el };
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let raf = 0;
  let last = 0;

  function step(s: Spring, dt: number): boolean {
    if (reduced) { s.x = s.t; s.v = 0; return false; }
    const n = Math.max(1, Math.ceil(dt / 0.008)), h = dt / n;
    for (let i = 0; i < n; i++) { s.v += (120 * (s.t - s.x) - 16 * s.v) * h; s.x += s.v * h; }
    if (Math.abs(s.t - s.x) < 0.01 && Math.abs(s.v) < 0.01) { s.x = s.t; s.v = 0; return false; }
    return true;
  }

  function tick(now: number): void {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const a = step(sa, dt), b = step(se, dt);
    az = sa.x;
    el = se.x;
    raf = a || b ? requestAnimationFrame(tick) : 0;
  }

  function wake(): void {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }

  function toSvg(s: SVGSVGElement, ev: PointerEvent): DOMPoint {
    const p = s.createSVGPoint();
    p.x = ev.clientX;
    p.y = ev.clientY;
    const m = s.getScreenCTM();
    return m ? p.matrixTransform(m.inverse()) : p;
  }

  function move(ev: PointerEvent): void {
    if (!svg) return;
    const q = toSvg(svg, ev);
    [sa.t, se.t] = aim(q.x, q.y, reach);
    wake();
  }

  function rest(): void {
    [sa.t, se.t] = REST;
    wake();
  }

  const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));

  function key(ev: KeyboardEvent): void {
    const k = ev.key;
    if (k === 'ArrowLeft') sa.t = clamp(sa.t + 6, AZ0 - reach, AZ0 + reach);
    else if (k === 'ArrowRight') sa.t = clamp(sa.t - 6, AZ0 - reach, AZ0 + reach);
    else if (k === 'ArrowUp') se.t = clamp(se.t + 4, EL0 - reach / 2, EL0 + reach / 2);
    else if (k === 'ArrowDown') se.t = clamp(se.t - 4, EL0 - reach / 2, EL0 + reach / 2);
    else if (k === 'Escape') { [sa.t, se.t] = REST; }
    else return;
    ev.preventDefault();
    wake();
  }

  onMount(() => () => cancelAnimationFrame(raf));
</script>

<svelte:window
  onpointermove={scope === 'window' ? move : null}
  onpointerdown={scope === 'window' ? move : null}
/>
<svelte:document onmouseleave={scope === 'window' ? rest : null} />

{#snippet side(sd: Side)}
  {#if sd.near}
    <path class="sil" d={sd.trun} />
    <path class="sil" d={sd.arm.sil} />
    <path class="nf lo" d={sd.arm.crease} />
    <path class="nf" d={sd.ring} />
  {:else}
    <path class="nf" d={sd.ring} />
    <path class="sil" d={sd.arm.sil} />
    <path class="nf lo" d={sd.arm.crease} />
    <path class="sil" d={sd.trun} />
  {/if}
{/snippet}

<!-- svelte-ignore a11y_no_noninteractive_tabindex a11y_no_noninteractive_element_interactions -->
<svg
  bind:this={svg}
  class="radar {klass}"
  viewBox={VIEWBOX}
  role="application"
  aria-label={label}
  tabindex="0"
  onkeydown={key}
  onpointermove={scope === 'self' ? move : null}
  onpointerdown={scope === 'self' ? move : null}
  onpointerleave={scope === 'self' ? rest : null}
>
  <!-- плита основания, азимутальная шкала, поворотный стол -->
  <path class="sil" d={BASE.plate.sil} />
  <path class="nf lo" d={BASE.plate.top} />
  <path class="nf lo" d={BASE.plate.inner} />
  {#each BASE.scale as d, i (i)}
    <ellipse class="dot" class:major={i % 9 === 0} cx={d.cx} cy={d.cy} rx={d.rx} ry={d.ry} />
  {/each}
  <path class="sil" d={BASE.table.sil} />
  <path class="nf lo" d={BASE.table.crease} />
  <ellipse class="dot major" cx={g.index[0]} cy={g.index[1]} rx="0.98" ry="0.57" />

  <!-- подвес: балка, затем дальняя стойка, антенна, ближняя стойка -->
  <path class="sil" d={g.beam.sil} />
  <path class="nf lo" d={g.beam.top} />
  {#each g.sides.filter((sd) => !sd.near) as sd (sd.s)}{@render side(sd)}{/each}

  <path class="sil" d={g.outline} />
  <path class="ap" d={g.aperture} />
  <path class="nf lo" d={g.seam} />
  <path class="nf lo" d={g.hub} />
  <path class="nf" d={g.struts} />
  <path class="sil" d={g.feed} />
  <path class="nf lo" d={g.feedC} />
  <path class="nf hi" d={g.rim} />

  {#each g.sides.filter((sd) => sd.near) as sd (sd.s)}{@render side(sd)}{/each}
</svg>

<style>
  .radar {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
    touch-action: pan-y;
    user-select: none;
    -webkit-user-select: none;
    outline: none;
    --ink: var(--hl-ink, CanvasText);
    --surface: var(--hl-surface, Canvas);
    --accent: var(--hl-accent, #1f62d0);
    --rim: var(--hl-rim, #fff);
    --sw: var(--hl-sw, 0.7);
  }
  .radar:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; border-radius: 6px; }

  .sil, .nf, .ap {
    stroke: var(--ink);
    stroke-width: var(--sw);
    stroke-linejoin: round;
    stroke-linecap: round;
  }
  .sil { fill: var(--surface); }
  .nf { fill: none; }
  .ap { fill: color-mix(in srgb, var(--ink) 8%, var(--surface)); stroke: none; }
  .lo { opacity: 0.6; }
  .hi { stroke: var(--rim); stroke-width: calc(var(--sw) * 1.15); opacity: 1; }
  .dot { fill: var(--ink); opacity: 0.35; }
  .dot.major { opacity: 1; }
</style>
