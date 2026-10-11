<script module lang="ts">
  import { circ, clamp, open, poly, rad, type Vec2, type Vec3 } from "$lib/core/iso";

  /**
   * Query: знак вопроса как тело на круглом постаменте. Крюк — одна изогнутая
   * балка вдоль осевой линии (дуга, шейка, ножка), точка — шар, лежащий на
   * постаменте. Указатель поворачивает крюк вокруг ножки, шар катится за ним
   * позже и мягче и возвращается под ножку. Слайдер — максимальный поворот в градусах.
   */

  export const PR = 27, PH = 6, B = 1.6;                    // постамент: радиус, высота, фаска
  export const T = 4.3, R = 16, ZC = 66, A0 = 200, A1 = -35; // балка: радиус, радиус крюка, высота центра дуги, начало и конец дуги
  export const ZK = 38, ZS = 29, BR = 6, SWAY = 0.2, TRAVEL = 4;
  export const FACE = -45, REST = 36, REACH = 150, S = 2.6;
  export const LIGHT: Vec2 = [-Math.SQRT1_2, -Math.SQRT1_2], GLEAM = 0.4;

  /** Осевая линия в плоскости крюка (s поперёк, z вверх): дуга, шейка, ножка. */
  export const LINE: Vec2[] = /* @__PURE__ */ (() => {
    const pts: Vec2[] = [];
    for (let i = 0; i <= 30; i++) {
      const a = rad(A0 + ((A1 - A0) * i) / 30);
      pts.push([R * Math.cos(a), ZC + R * Math.sin(a)]);
    }
    const e = pts[pts.length - 1], a = rad(A1), t: Vec2 = [Math.sin(a), -Math.cos(a)];
    const c1: Vec2 = [e[0] + t[0] * 10, e[1] + t[1] * 10], c2: Vec2 = [0, ZK + 10];
    for (let i = 1; i <= 20; i++) {
      const u = i / 20, w = 1 - u;
      pts.push([
        w * w * w * e[0] + 3 * w * w * u * c1[0] + 3 * w * u * u * c2[0],
        w * w * w * e[1] + 3 * w * w * u * c1[1] + 3 * w * u * u * c2[1] + u * u * u * ZK,
      ]);
    }
    pts.push([0, ZS]);
    return pts;
  })();

  /** Участок LINE, вдоль которого идёт блик: дуга без кончика и шейки. */
  export const ARC = [2, 28];

  /** Точка i экранной осевой линии, сдвинутая на d к свету поперёк балки. */
  export function lean(Q: readonly Vec2[], i: number, d: number): Vec2 {
    const a = Q[Math.max(i - 1, 0)], b = Q[Math.min(i + 1, Q.length - 1)];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const nx = -(b[1] - a[1]) / l, ny = (b[0] - a[0]) / l, k = d * (nx * LIGHT[0] + ny * LIGHT[1]);
    return [Q[i][0] + nx * k, Q[i][1] + ny * k];
  }

  /** Пересечение двух экранных отрезков или null. */
  function cross(p: Vec2, q: Vec2, r: Vec2, s: Vec2): Vec2 | null {
    const e0 = q[0] - p[0], e1 = q[1] - p[1], f0 = s[0] - r[0], f1 = s[1] - r[1], g0 = r[0] - p[0], g1 = r[1] - p[1];
    const d = e0 * f1 - e1 * f0;
    if (!d) return null;
    const t = (g0 * f1 - g1 * f0) / d, u = (g0 * e1 - g1 * e0) / d;
    return t > 0 && t < 1 && u > 0 && u < 1 ? [p[0] + t * e0, p[1] + t * e1] : null;
  }

  /** Вырезает петли, которые даёт внутренний офсет там, где балка изгибается круче своего радиуса. */
  function untangle(L: Vec2[]): Vec2[] {
    for (let i = 0; i < L.length - 3; i++)
      for (let j = L.length - 2; j > i + 1; j--) {
        const x = cross(L[i], L[i + 1], L[j], L[j + 1]);
        if (x) { L.splice(i + 1, j - i, x); break; }
      }
    return L;
  }

  /** Контур балки: экранная осевая линия со смещением на радиус. Кончик — купол, ножка срезана плоско. */
  export function tube(Q: readonly Vec2[], rho: number): string {
    const n = Q.length, A: Vec2[] = [], Bk: Vec2[] = [], tan: Vec2[] = [];
    for (let i = 0; i < n; i++) {
      const a = Q[Math.max(i - 1, 0)], c = Q[i], b = Q[Math.min(i + 1, n - 1)];
      const l0 = Math.hypot(c[0] - a[0], c[1] - a[1]) || 1, l1 = Math.hypot(b[0] - c[0], b[1] - c[1]) || 1;
      let tx = (c[0] - a[0]) / l0 + (b[0] - c[0]) / l1, ty = (c[1] - a[1]) / l0 + (b[1] - c[1]) / l1;
      const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
      tan.push([tx, ty]);
      A.push([c[0] - ty * rho, c[1] + tx * rho]);
      Bk.push([c[0] + ty * rho, c[1] - tx * rho]);
    }
    const dome = (c: Vec2, t: Vec2) =>
      Array.from({ length: 9 }, (_, k): Vec2 => {
        const a = (Math.PI * (k + 1)) / 10, cs = -Math.cos(a), sn = -Math.sin(a);
        return [c[0] + rho * (-t[1] * cs + t[0] * sn), c[1] + rho * (t[0] * cs + t[1] * sn)];
      });
    const cut = (c: Vec2) =>
      Array.from({ length: 7 }, (_, k): Vec2 => {
        const a = (Math.PI * (7 - k)) / 8;
        return [c[0] + rho * Math.cos(a), c[1] + rho * 0.5 * Math.sin(a)];
      });
    return poly([...untangle(A), ...cut(Q[n - 1]), ...untangle(Bk).reverse(), ...dome(Q[0], tan[0])]);
  }
</script>

<script lang="ts">
  import { onDestroy } from "svelte";
  import { Cam, facing, fit, prism, proj } from "$lib/core/iso";
  import { spring, stepS } from "$lib/core/motion";
  import { TABLE } from "$lib/intensity";

  let { value, readout = $bindable("rest") }: { value: number; readout?: string } = $props();

  const TMAX = TABLE.query[2];

  /** Плоскость крюка, повёрнутая на th градусов от лицом к камере: точка (s, z) в мире. */
  const at = (th: number) => {
    const a = rad(FACE - th), c = Math.cos(a), n = Math.sin(a);
    return (s: number, z: number): Vec3 => [s * c, s * n, z];
  };
  /** Центр шара: на оси под ножкой, смещён поперёк плоскости крюка на величину отставания. */
  const ball = (lag: number, th: number): Vec3 => at(th)(clamp(lag * SWAY, -TRAVEL, TRAVEL), PH + BR);

  // Камера подогнана под постамент и крюк на обоих концах самого широкого поворота.
  const C = Cam(45, 0.5, S);
  const ext: Vec3[] = [[-PR, 0, 0], [PR, 0, 0], [0, -PR, 0], [0, PR, 0]];
  for (const th of [-TMAX, -TMAX / 2, 0, TMAX / 2, TMAX])
    for (const p of LINE) {
      const q = at(th)(p[0], p[1]);
      ext.push([q[0], q[1], q[2] + T], [q[0], q[1], q[2] - T]);
    }
  fit(C, ext, 200, 166);
  C.ox += 200 - proj(C)(0, 0, 0)[0]; // ножка стоит в середине кадра
  const P = proj(C), front = facing(C), rho = T * S;
  const cx = P(0, 0, 0)[0];

  // Статичные формы
  const plinth = prism(P, front, circ(PR, 72), circ(PR - B, 72), 0, PH); // записи вида { sil, crease, ... } -> path d
  const disc = circ(BR * S, 40), shine = circ(BR * S * 0.62, 40).slice(23, 31);

  // Пружины и состояние
  const restTurn = () => -Math.min(REST, 0.9 * value);
  const sp = spring(restTurn()), roll = spring(restTurn(), { k: 36, c: 7 });
  let hook = $state(sp.x), rolled = $state(roll.x);
  let over = $state(false), px = $state(cx);

  // Производные пути
  const Q = $derived.by(() => {
    const w = at(hook);
    return LINE.map((p) => P(...w(p[0], p[1])));
  });
  const barD = $derived(tube(Q, rho));
  const gleamD = $derived(open(Q.slice(ARC[0], ARC[1]).map((_, i) => lean(Q, ARC[0] + i, GLEAM * rho))));
  const ballC = $derived(P(...ball(hook - rolled, rolled)));
  const dotD = $derived(poly(disc.map((q) => [ballC[0] + q.u, ballC[1] + q.v] as Vec2)));
  const shineD = $derived(open(shine.map((q): Vec2 => [ballC[0] + q.u, ballC[1] + q.v])));

  // Цикл анимации (замена register/wake)
  let raf = 0, last = 0;
  function frame(t: number) {
    const dt = Math.min((t - last) / 1000, 0.05);
    last = t;
    roll.t = sp.x; // шар катится за тем, где крюк сейчас, а не куда идёт
    const a = stepS(sp, dt), b = stepS(roll, dt);
    hook = sp.x;
    rolled = roll.x;
    raf = a || b ? requestAnimationFrame(frame) : 0;
  }
  function wake() {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  onDestroy(() => cancelAnimationFrame(raf));

  // Цель — по указателю и слайдеру, а не по повороту на экране
  $effect(() => {
    sp.t = over ? value * clamp((px - cx) / REACH, -1, 1) : restTurn();
    readout = over ? `turn ${Math.abs(Math.round(sp.t))}° · 0` : "rest";
    wake();
  });

  // Указатель в координатах viewBox
  let svg: SVGSVGElement;
  function onmove(e: PointerEvent) {
    const m = svg.getScreenCTM();
    if (!m) return;
    px = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse()).x;
    over = true;
  }
</script>

<svg bind:this={svg} viewBox="0 0 400 332" onpointermove={onmove} onpointerleave={() => (over = false)}>
  <g>
    <!-- Сзади вперёд: постамент, шар на нём, крюк над ним -->
    {#each Object.entries(plinth) as [cls, d]}
      <path class={cls} {d} />
    {/each}
    <path class="sil" class:hi={!over} d={dotD} />
    <path class="crease" d={shineD} />
    <path class="sil" class:hi={over} d={barD} />
    <path class="nf lo" d={gleamD} />
  </g>
</svg>