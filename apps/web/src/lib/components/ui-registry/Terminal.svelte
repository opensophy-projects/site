<script>
  import { onMount } from 'svelte';

  /** Colour of the highlighted line, chevron and cursor. */
  export let accent = '#f43f5e';
  /** How far the lift spreads, in lines. Bindable. */
  export let spread = 3;
  export let width = 'min(88vw, 420px)';
  export let showControls = true;
  export let label = 'Terminal window as an isometric slab with scrolling lines';

  const N = 24, V = 7, G = 11, T = 2.1, LH = 1.8, LIFT = 5.5, HB = 3.4, SLAB = 3;
  const W = 150, TB = 17, PB = 17, PAD = 11, IN = 2.5, FIRST = 37, CH = 3.9;
  const VB = PB, VA = PB + V * G, H = VA + TB, E = 4;
  const K = 2.1, C = 0.7071, OX = 70, OY = 360;
  const NS = 'http://www.w3.org/2000/svg';
  const HIST = [
    '0 5 12', '2 7 3 9', '2 14', '4 6 10', '4 18', '2 3', '0 2', '0 2 6 8',
    '0 26', '0 20', '0 11 4', '2 9 12', '2 5 3 7', '4 16', '4 8 8', '2 4',
    '0 3 14', '0 24', '0 30', '0 17', '2 6 11', '2 13', '0 9 5', '0 4 7'
  ];
  const REST_TOP = N - V - 2.6, REST_LINE = 18, REST_R = 2;

  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const smooth = (t) => t * t * (3 - 2 * t);
  const P2 = (u, v, w) => [OX + (u + w) * C * K, OY + ((w - u) * C * 0.5 - v) * K];
  const onFace = (sx, sy, w) => {
    const u = (sx - OX) / (C * K) - w;
    return [u, (w - u) * C * 0.5 - (sy - OY) / K];
  };
  function rr(x0, y0, x1, y1, r, S = 8) {
    const p = [];
    [[x1 - r, y0 + r, -90], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, 90], [x0 + r, y0 + r, 180]].forEach((c) => {
      for (let i = 0; i <= S; i++) {
        const t = ((c[2] + (90 * i) / S) * Math.PI) / 180;
        p.push([c[0] + r * Math.cos(t), c[1] + r * Math.sin(t)]);
      }
    });
    return p;
  }
  const pd = (pts, close) =>
    pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ',' + q[1].toFixed(1)).join('') + (close ? 'Z' : '');
  const cut = (ring) => ring.map((q) => [q[0], clamp(q[1], VB, VA)]);
  const spring = (x, e) => ({ x, t: x, v: 0, e });
  function step(sp, dt) {
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

  let svg;
  let readout = 'rest';
  let api = null;
  $: if (api) api.setSpread(spread);

  onMount(() => {
    const mk = (n, a, p) => {
      const e = document.createElementNS(NS, n);
      for (const k in a) e.setAttribute(k, a[k]);
      (p || svg).appendChild(e);
      return e;
    };
    const mkP = (par) => {
      const g = mk('g', {}, par);
      return { b: mk('path', { class: 'n' }, g), c: mk('path', { class: 'n' }, g), f: mk('path', { class: 'f' }, g), i: mk('path', { class: 'lo' }, g) };
    };
    function setP(p, ring, inner, w0, w1) {
      const f = ring.map((q) => P2(q[0], q[1], w1));
      const b = ring.map((q) => P2(q[0], q[1], w0));
      const n = f.length;
      const dx = b[0][0] - f[0][0], dy = b[0][1] - f[0][1];
      const cs = [];
      let cn = '';
      for (let i = 0; i < n; i++) {
        const a = f[i], c = f[(i + 1) % n];
        cs.push((c[0] - a[0]) * dy - (c[1] - a[1]) * dx);
      }
      for (let i = 0; i < n; i++) {
        if (cs[i] * cs[(i + n - 1) % n] < 0) cn += 'M' + f[i][0].toFixed(1) + ',' + f[i][1].toFixed(1) + 'L' + b[i][0].toFixed(1) + ',' + b[i][1].toFixed(1);
      }
      p.b.setAttribute('d', pd(b, 1));
      p.c.setAttribute('d', cn);
      p.f.setAttribute('d', pd(f, 1));
      p.i.setAttribute('d', inner ? pd(inner.map((q) => P2(q[0], q[1], w1)), 1) : '');
    }
    const clr = (p) => ['b', 'c', 'f', 'i'].forEach((k) => p[k].setAttribute('d', ''));

    const g = mk('g', {});
    const base = mkP(g);
    setP(base, rr(0, 0, W, H, 9), rr(2, 2, W - 2, H - 2, 7), -SLAB, 0);

    const rows = HIST.map((str, j) => {
      const a = str.split(' ').map(Number), segs = [];
      let at = a[0];
      for (let q = 1; q < a.length; q++) {
        const x0 = PAD + at * CH;
        segs.push({ x0, x1: x0 + a[q] * CH - 1.4, p: mkP(g) });
        at += a[q] + 1;
      }
      return { j, segs, sp: spring(0, 0.01), drawn: '' };
    });

    const prompt = mkP(g);
    setP(prompt, rr(IN, IN, W - IN, VB, 6, 5), rr(IN + 1.4, IN + 1.4, W - IN - 1.4, VB - 1.4, 4.6, 5), 0, HB);
    const cy = (IN + VB) / 2;
    const chev = mk('path', { class: 'n' }, g);
    chev.setAttribute('d', pd([[0, 6.2], [8.5, 0], [0, -6.2], [0, -3.1], [4.25, 0], [0, 3.1]].map((q) => P2(PAD + q[0], cy + q[1], HB)), 1));
    const cursor = mkP(g);
    setP(cursor, rr(PAD + 13, cy - 5.2, PAD + 13 + CH * 1.5, cy + 5.2, 1.2, 3), rr(PAD + 13.7, cy - 4.5, PAD + 13 + CH * 1.5 - 0.7, cy + 4.5, 0.8, 3), HB, HB + 2.8);
    const title = mkP(g);
    setP(title, rr(IN, VA, W - IN, H - IN, 6, 5), rr(IN + 1.4, VA + 1.4, W - IN - 1.4, H - IN - 1.4, 4.6, 5), 0, HB);
    for (let i = 0; i < 3; i++) {
      const cx = PAD + i * 8.5, cv = (VA + H - IN) / 2;
      setP(mkP(g), rr(cx - 2.8, cv - 2.8, cx + 2.8, cv + 2.8, 2.8, 5), null, HB, HB + 1.3);
    }

    function drawRow(rw, top) {
      const key = top + '|' + rw.sp.x;
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

    let lit = [];
    const light = (els) => {
      lit.forEach((e) => e.classList.remove('hi'));
      lit = els;
      lit.forEach((e) => e.classList.add('hi'));
    };

    const top = spring(REST_TOP, 0.002);
    let R = spread, over = null;

    function hit(sx, sy) {
      const qb = onFace(sx, sy, HB), inU = (q) => q[0] > IN && q[0] < W - IN;
      if (inU(qb) && qb[1] > IN && qb[1] < VB) return 'prompt';
      if (inU(qb) && qb[1] > VA && qb[1] < H - IN) return 0;
      const q = onFace(sx, sy, 0);
      if (q[0] < 0 || q[0] > W || q[1] < 0 || q[1] > H) return null;
      return q[1] <= VB ? 'prompt' : clamp((VA - G / 2 - q[1]) / ((V - 1) * G), 0, 1);
    }
    function retarget() {
      let t, c, r = R;
      if (over === null) { t = REST_TOP; c = REST_LINE; r = REST_R; readout = 'rest'; }
      else if (over === 'prompt') { t = N - V; c = -1; readout = 'prompt'; }
      else {
        t = over * (N - V);
        c = clamp(Math.round(over * (N - 1)), Math.ceil(t), Math.floor(t + V - 1));
        readout = 'line ' + (FIRST + c);
      }
      top.t = t;
      for (const rw of rows) rw.sp.t = c < 0 ? 0 : LIFT * clamp(1 - Math.abs(rw.j - c) / r, 0, 1);
      light(c < 0 ? [cursor.f, chev] : rows[c].segs.map((sg) => sg.p.f));
    }
    retarget();
    rows.forEach((rw) => (rw.sp.x = rw.sp.t));

    const at = (e) => {
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      return pt.matrixTransform(svg.getScreenCTM().inverse());
    };
    const mv = (e) => { const q = at(e); over = hit(q.x, q.y); retarget(); };
    const lv = () => { over = null; retarget(); };
    const up = (e) => e.pointerType !== 'mouse' && lv();
    svg.addEventListener('pointermove', mv);
    svg.addEventListener('pointerdown', mv);
    svg.addEventListener('pointerleave', lv);
    svg.addEventListener('pointerup', up);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf, last = performance.now();
    const tick = (now) => {
      const dt = reduce ? 1 : Math.min(0.05, (now - last) / 1000);
      last = now;
      step(top, dt);
      for (const rw of rows) { step(rw.sp, dt); drawRow(rw, top.x); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    api = { setSpread: (v) => { R = v; if (over !== null) retarget(); } };

    return () => {
      cancelAnimationFrame(raf);
      svg.removeEventListener('pointermove', mv);
      svg.removeEventListener('pointerdown', mv);
      svg.removeEventListener('pointerleave', lv);
      svg.removeEventListener('pointerup', up);
      svg.replaceChildren();
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
      <span>{Number(spread).toFixed(1)} lines</span>
    </label>
  {/if}
</div>

<style>
  .hl-wrap {
    /* Theme follows the host page instead of the OS color-scheme. */
    --hl-bg: var(--background, #f6f4f1);
    --hl-line: var(--foreground, #2b2f3a);
    --hl-faint: color-mix(in srgb, var(--foreground, #2b2f3a) 34%, transparent);
    --hl-txt: var(--foreground-muted, #6b6f7a);
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
