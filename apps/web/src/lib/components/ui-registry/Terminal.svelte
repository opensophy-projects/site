<script lang="ts">
  import { onMount } from 'svelte';

  type Pt = [number, number];
  type Spring = { x: number; t: number; v: number; e: number };
  type Prism = { b: SVGElement; c: SVGElement; f: SVGElement; i: SVGElement };
  type Seg = { x0: number; x1: number; p: Prism };
  type Row = { j: number; segs: Seg[]; sp: Spring; drawn: string };
  type Api = { setSpread: (v: number) => void };

  /** Цвет подсвеченной строки, шеврона и курсора. */
  export let accent = '#f43f5e';
  /** Насколько широко распространяется подъём, в строках. Можно биндить. */
  export let spread = 3;
  export let width = 'min(88vw, 420px)';
  export let showControls = true;
  export let label = 'Terminal window as an isometric slab with scrolling lines';

  const N = 24, V = 7, G = 11, T = 2.1, LH = 1.8, LIFT = 5.5, HB = 3.4, SLAB = 3;
  const W = 150, TB = 17, PB = 17, PAD = 11, IN = 2.5, FIRST = 37, CH = 3.9;
  const VB = PB, VA = PB + V * G, H = VA + TB, E = 4;
  const K = 2.1, C = 0.7071, OX = 70, OY = 360;
  const NS = 'http://www.w3.org/2000/svg';
  /** История, от старых строк к новым: отступ в ячейках, затем длина каждого токена в ячейках. */
  const HIST = [
    '0 5 12', '2 7 3 9', '2 14', '4 6 10', '4 18', '2 3', '0 2', '0 2 6 8',
    '0 26', '0 20', '0 11 4', '2 9 12', '2 5 3 7', '4 16', '4 8 8', '2 4',
    '0 3 14', '0 24', '0 30', '0 17', '2 6 11', '2 13', '0 9 5', '0 4 7'
  ];
  const REST_TOP = N - V - 2.6, REST_LINE = 18, REST_R = 2;

  const clamp = (x: number, a: number, b: number): number => Math.min(b, Math.max(a, x));
  const smooth = (t: number): number => t * t * (3 - 2 * t);
  /** Система координат плиты: u поперёк, v вверх, w из плоскости лица. */
  const P2 = (u: number, v: number, w: number): Pt => [OX + (u + w) * C * K, OY + ((w - u) * C * 0.5 - v) * K];
  const onFace = (sx: number, sy: number, w: number): Pt => {
    const u = (sx - OX) / (C * K) - w;
    return [u, (w - u) * C * 0.5 - (sy - OY) / K];
  };
  function rr(x0: number, y0: number, x1: number, y1: number, r: number, S = 8): Pt[] {
    const p: Pt[] = [];
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
  const pd = (pts: Pt[], close: boolean): string =>
    pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ',' + q[1].toFixed(1)).join('') + (close ? 'Z' : '');
  const cut = (ring: Pt[]): Pt[] => ring.map((q): Pt => [q[0], clamp(q[1], VB, VA)]);
  const spring = (x: number, e: number): Spring => ({ x, t: x, v: 0, e });
  function step(sp: Spring, dt: number): boolean {
    const k = 170, c = 24, n = Math.max(1, Math.ceil(dt / 0.008)), h = dt / n;
    for (let i = 0; i < n; i++) {
      sp.v += ((sp.t - sp.x) * k - sp.v * c) * h;
      sp.x += sp.v * h;
    }
    if (Math.abs(sp.t - sp.x) < sp.e && Math.abs(sp.v) < sp.e * 4) {
      sp.x = sp.t;
      sp.v = 0;
      return false;
    }
    return true;
  }
  /** Очистка узла вынесена в функцию: правило svelte/no-dom-manipulating ругается на прямой вызов у bind:this-элемента. */
  const clearNode = (el: Element): void => el.replaceChildren();

  let svg: SVGSVGElement;
  let readout = 'rest';
  let api: Api | null = null;
  $: if (api) api.setSpread(spread);

  onMount(() => {
    const mk = (n: string, a: Record<string, string>, p?: Element): SVGElement => {
      const e = document.createElementNS(NS, n);
      for (const k in a) e.setAttribute(k, a[k]);
      (p ?? svg).appendChild(e);
      return e;
    };
    /** Призма: задний контур, рёбра силуэта, непрозрачная передняя грань, сгиб. */
    const mkP = (par: Element): Prism => {
      const g = mk('g', {}, par);
      return { b: mk('path', { class: 'n' }, g), c: mk('path', { class: 'n' }, g), f: mk('path', { class: 'f' }, g), i: mk('path', { class: 'lo' }, g) };
    };
    function setP(p: Prism, ring: Pt[], inner: Pt[] | null, w0: number, w1: number): void {
      const f = ring.map((q) => P2(q[0], q[1], w1));
      const b = ring.map((q) => P2(q[0], q[1], w0));
      const n = f.length;
      const dx = b[0][0] - f[0][0], dy = b[0][1] - f[0][1];
      const cs: number[] = [];
      let cn = '';
      for (let i = 0; i < n; i++) {
        const a = f[i], c = f[(i + 1) % n];
        cs.push((c[0] - a[0]) * dy - (c[1] - a[1]) * dx);
      }
      // рёбра, где контур идёт параллельно направлению глубины
      for (let i = 0; i < n; i++) {
        if (cs[i] * cs[(i + n - 1) % n] < 0) cn += 'M' + f[i][0].toFixed(1) + ',' + f[i][1].toFixed(1) + 'L' + b[i][0].toFixed(1) + ',' + b[i][1].toFixed(1);
      }
      p.b.setAttribute('d', pd(b, true));
      p.c.setAttribute('d', cn);
      p.f.setAttribute('d', pd(f, true));
      p.i.setAttribute('d', inner ? pd(inner.map((q) => P2(q[0], q[1], w1)), true) : '');
    }
    const clr = (p: Prism): void => {
      p.b.setAttribute('d', '');
      p.c.setAttribute('d', '');
      p.f.setAttribute('d', '');
      p.i.setAttribute('d', '');
    };

    const g = mk('g', {});
    const base = mkP(g);
    setP(base, rr(0, 0, W, H, 9), rr(2, 2, W - 2, H - 2, 7), -SLAB, 0);

    const rows: Row[] = HIST.map((str, j) => {
      const a = str.split(' ').map(Number), segs: Seg[] = [];
      let pos = a[0];
      for (let q = 1; q < a.length; q++) {
        const x0 = PAD + pos * CH;
        segs.push({ x0, x1: x0 + a[q] * CH - 1.4, p: mkP(g) });
        pos += a[q] + 1;
      }
      return { j, segs, sp: spring(0, 0.01), drawn: '' };
    });

    // строка ввода, шеврон, курсор; затем заголовок окна и кнопки, они рисуются поверх строк
    const prompt = mkP(g);
    setP(prompt, rr(IN, IN, W - IN, VB, 6, 5), rr(IN + 1.4, IN + 1.4, W - IN - 1.4, VB - 1.4, 4.6, 5), 0, HB);
    const cy = (IN + VB) / 2;
    const chev = mk('path', { class: 'n' }, g);
    const chevPts: Pt[] = [[0, 6.2], [8.5, 0], [0, -6.2], [0, -3.1], [4.25, 0], [0, 3.1]];
    chev.setAttribute('d', pd(chevPts.map((q) => P2(PAD + q[0], cy + q[1], HB)), true));
    const cursor = mkP(g);
    setP(cursor, rr(PAD + 13, cy - 5.2, PAD + 13 + CH * 1.5, cy + 5.2, 1.2, 3), rr(PAD + 13.7, cy - 4.5, PAD + 13 + CH * 1.5 - 0.7, cy + 4.5, 0.8, 3), HB, HB + 2.8);
    const title = mkP(g);
    setP(title, rr(IN, VA, W - IN, H - IN, 6, 5), rr(IN + 1.4, VA + 1.4, W - IN - 1.4, H - IN - 1.4, 4.6, 5), 0, HB);
    for (let i = 0; i < 3; i++) {
      const cx = PAD + i * 8.5, cv = (VA + H - IN) / 2;
      setP(mkP(g), rr(cx - 2.8, cv - 2.8, cx + 2.8, cv + 2.8, 2.8, 5), null, HB, HB + 1.3);
    }

    /** Строка j при прокрутке окна до `top`: обрезается по окну, приподнимается слабее у краёв. */
    function drawRow(rw: Row, top: number): void {
      const key = `${top}|${rw.sp.x}`;
      if (key === rw.drawn) return;
      rw.drawn = key;
      const vc = VA - (rw.j - top + 0.5) * G, v0 = Math.max(vc - T, VB), v1 = Math.min(vc + T, VA);
      const env = smooth(clamp((VA - vc - T) / E, 0, 1)) * smooth(clamp((vc - T - VB) / E, 0, 1));
      const w0 = rw.sp.x * env;
      for (const sg of rw.segs) {
        if (v1 - v0 < 0.05) { clr(sg.p); continue; }
        setP(sg.p, cut(rr(sg.x0, vc - T, sg.x1, vc + T, T, 4)), cut(rr(sg.x0 + 0.7, vc - T + 0.7, sg.x1 - 0.7, vc + T - 0.7, T - 0.7, 4)), w0, w0 + LH);
      }
    }

    let lit: SVGElement[] = [];
    const light = (els: SVGElement[]): void => {
      lit.forEach((e) => e.classList.remove('hi'));
      lit = els;
      lit.forEach((e) => e.classList.add('hi'));
    };

    const top = spring(REST_TOP, 0.002);
    let R = spread;
    let over: 'prompt' | number | null = null;

    /** Где указатель: "prompt", глубина по строкам от 0 до 1 или null вне окна. */
    function hit(sx: number, sy: number): 'prompt' | number | null {
      const qb = onFace(sx, sy, HB), inU = (q: Pt) => q[0] > IN && q[0] < W - IN;
      if (inU(qb) && qb[1] > IN && qb[1] < VB) return 'prompt';
      if (inU(qb) && qb[1] > VA && qb[1] < H - IN) return 0;
      const q = onFace(sx, sy, 0);
      if (q[0] < 0 || q[0] > W || q[1] < 0 || q[1] > H) return null;
      return q[1] <= VB ? 'prompt' : clamp((VA - G / 2 - q[1]) / ((V - 1) * G), 0, 1);
    }
    function retarget(): void {
      let t: number, c: number, r = R;
      if (over === null) { t = REST_TOP; c = REST_LINE; r = REST_R; readout = 'rest'; }
      else if (over === 'prompt') { t = N - V; c = -1; readout = 'prompt'; }
      else {
        t = over * (N - V);
        c = clamp(Math.round(over * (N - 1)), Math.ceil(t), Math.floor(t + V - 1));
        readout = `line ${FIRST + c}`;
      }
      top.t = t;
      for (const rw of rows) rw.sp.t = c < 0 ? 0 : LIFT * clamp(1 - Math.abs(rw.j - c) / r, 0, 1);
      light(c < 0 ? [cursor.f, chev] : rows[c].segs.map((sg) => sg.p.f));
    }
    retarget();
    rows.forEach((rw) => (rw.sp.x = rw.sp.t));

    const toSvg = (e: PointerEvent): DOMPoint => {
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const m = svg.getScreenCTM();
      return m ? pt.matrixTransform(m.inverse()) : pt;
    };
    const mv = (e: PointerEvent): void => { const q = toSvg(e); over = hit(q.x, q.y); retarget(); };
    const lv = (): void => { over = null; retarget(); };
    const up = (e: PointerEvent): void => { if (e.pointerType !== 'mouse') lv(); };
    svg.addEventListener('pointermove', mv);
    svg.addEventListener('pointerdown', mv);
    svg.addEventListener('pointerleave', lv);
    svg.addEventListener('pointerup', up);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0, last = performance.now();
    const tick = (now: number): void => {
      const dt = reduce ? 1 : Math.min(0.05, (now - last) / 1000);
      last = now;
      step(top, dt);
      for (const rw of rows) { step(rw.sp, dt); drawRow(rw, top.x); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    api = { setSpread: (v: number) => { R = v; if (over !== null) retarget(); } };

    return () => {
      cancelAnimationFrame(raf);
      svg.removeEventListener('pointermove', mv);
      svg.removeEventListener('pointerdown', mv);
      svg.removeEventListener('pointerleave', lv);
      svg.removeEventListener('pointerup', up);
      clearNode(svg);
      api = null;
    };
  });
</script>

<div class="hl-wrap" style="--hl-hi:{accent}">
  <svg class="hl" bind:this={svg} viewBox="0 0 380 380" role="img" aria-label={label} style="width:{width}" />
  {#if showControls}
    <div class="read">{readout}</div>
    <label class="ctl">
      lift spread
      <input type="range" min="1" max="6" step="0.1" bind:value={spread} />
      <span>{spread.toFixed(1)} lines</span>
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
    max-height: 72vh;
    cursor: crosshair;
    touch-action: none;
  }
  .hl :global(*) {
    vector-effect: non-scaling-stroke;
  }
  .hl :global(.n) {
    fill: none;
    stroke: var(--hl-line);
    stroke-width: 1.1;
    stroke-linejoin: round;
    stroke-linecap: round;
  }
  .hl :global(.f) {
    fill: var(--hl-bg);
    stroke: var(--hl-line);
    stroke-width: 1.1;
    stroke-linejoin: round;
  }
  .hl :global(.lo) {
    fill: none;
    stroke: var(--hl-faint);
    stroke-width: 1;
  }
  .hl :global(.hi) {
    stroke: var(--hl-hi);
    stroke-width: 1.8;
  }
  .read { min-height: 1.2em; }
  .ctl {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .ctl input {
    width: min(56vw, 220px);
    accent-color: var(--hl-hi);
  }
</style>
