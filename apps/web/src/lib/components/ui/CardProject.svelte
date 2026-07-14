<script lang="ts">
  import { onMount } from 'svelte';

  export let className = '';
  export let edgeSensitivity = 30;
  export let glowColor = '40 80 80';
  export let backgroundColor = 'var(--background, #120F17)';
  export let borderRadius = 28;
  export let glowRadius = 40;
  export let glowIntensity = 1.0;
  export let coneSpread = 25;
  export let animated = false;
  export let colors: string[] = ['#c084fc', '#f472b6', '#38bdf8'];
  export let fillOpacity = 0.5;
  // цвет статичной обводки (видна всегда, даже без ховера)
  export let baseBorderColor = 'var(--border, rgba(255,255,255,0.1))';

  let cardEl: HTMLDivElement;
  let isHovered = false;
  let cursorAngle = 45;
  let edgeProximity = 0;
  let sweepActive = false;

  let ready = false;

  onMount(() => {
    const start = () => { ready = true; };
    if ('requestIdleCallback' in window) {
      requestIdleCallback(start, { timeout: 300 });
    } else {
      setTimeout(start, 50);
    }
  });

  function parseHSL(hslStr: string): { h: number; s: number; l: number } {
    const regex = /([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/;
	    const match = regex.exec(hslStr);
    if (!match) return { h: 40, s: 80, l: 80 };
    return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
  }

  function buildBoxShadow(glowColorStr: string, intensity: number): string {
    const { h, s, l } = parseHSL(glowColorStr);
    const base = `${String(h)}deg ${String(s)}% ${String(l)}%`;
    const layers: [number, number, number, number, number, boolean][] = [
      [0, 0, 0, 1, 100, true], [0, 0, 1, 0, 60, true], [0, 0, 3, 0, 50, true],
      [0, 0, 6, 0, 40, true], [0, 0, 15, 0, 30, true], [0, 0, 25, 2, 20, true],
      [0, 0, 50, 2, 10, true],
      [0, 0, 1, 0, 60, false], [0, 0, 3, 0, 50, false], [0, 0, 6, 0, 40, false],
      [0, 0, 15, 0, 30, false], [0, 0, 25, 2, 20, false], [0, 0, 50, 2, 10, false],
    ];
    return layers.map(([x, y, blur, spread, alpha, inset]) => {
      const a = Math.min(alpha * intensity, 100);
      return `${inset ? 'inset ' : ''}${String(x)}px ${String(y)}px ${String(blur)}px ${String(spread)}px hsl(${base} / ${String(a)}%)`;
    }).join(', ');
  }

  function easeOutCubic(x: number) { return 1 - Math.pow(1 - x, 3); }
  function easeInCubic(x: number) { return x * x * x; }

  type AnimateOpts = {
    start?: number; end?: number; duration?: number; delay?: number;
    ease?: (t: number) => number; onUpdate: (v: number) => void; onEnd?: () => void;
  }

  function animateValue({ start = 0, end = 100, duration = 1000, delay = 0, ease = easeOutCubic, onUpdate, onEnd }: AnimateOpts) {
    const t0 = performance.now() + delay;
    function tick() {
      const elapsed = performance.now() - t0;
      const t = Math.min(elapsed / duration, 1);
      onUpdate(start + (end - start) * ease(t));
      if (t < 1) requestAnimationFrame(tick);
      else if (onEnd) onEnd();
    }
    setTimeout(() => requestAnimationFrame(tick), delay);
  }

  const GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
  const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

  function buildMeshGradients(colorsArr: string[]): string[] {
    const gradients: string[] = [];
    for (let i = 0; i < 7; i++) {
      const c = colorsArr[Math.min(COLOR_MAP[i], colorsArr.length - 1)];
      gradients.push(`radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`);
    }
    gradients.push(`linear-gradient(${colorsArr[0]} 0 100%)`);
    return gradients;
  }

  function getCenterOfElement(el: HTMLElement): [number, number] {
    const { width, height } = el.getBoundingClientRect();
    return [width / 2, height / 2];
  }

  function getEdgeProximity(el: HTMLElement, x: number, y: number): number {
    const [cx, cy] = getCenterOfElement(el);
    const dx = x - cx;
    const dy = y - cy;
    let kx = Infinity;
    let ky = Infinity;
    if (dx !== 0) kx = cx / Math.abs(dx);
    if (dy !== 0) ky = cy / Math.abs(dy);
    return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
  }

  function getCursorAngle(el: HTMLElement, x: number, y: number): number {
    const [cx, cy] = getCenterOfElement(el);
    const dx = x - cx;
    const dy = y - cy;
    if (dx === 0 && dy === 0) return 0;
    const radians = Math.atan2(dy, dx);
    let degrees = radians * (180 / Math.PI) + 90;
    if (degrees < 0) degrees += 360;
    return degrees;
  }

  function handlePointerMove(e: PointerEvent) {
    const rect = cardEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    edgeProximity = getEdgeProximity(cardEl, x, y);
    cursorAngle = getCursorAngle(cardEl, x, y);
  }

  function handlePointerEnter() {
    isHovered = true;
  }

  function handlePointerLeave() {
    isHovered = false;
  }

  onMount(() => {
    if (!animated) return;
    const angleStart = 110;
    const angleEnd = 465;
    sweepActive = true;
    cursorAngle = angleStart;

    animateValue({ duration: 500, onUpdate: v => edgeProximity = v / 100 });
    animateValue({ ease: easeInCubic, duration: 1500, end: 50, onUpdate: v => {
      cursorAngle = (angleEnd - angleStart) * (v / 100) + angleStart;
    }});
    animateValue({ ease: easeOutCubic, delay: 1500, duration: 2250, start: 50, end: 100, onUpdate: v => {
      cursorAngle = (angleEnd - angleStart) * (v / 100) + angleStart;
    }});
    animateValue({ ease: easeInCubic, delay: 2500, duration: 1500, start: 100, end: 0,
      onUpdate: v => edgeProximity = v / 100,
      onEnd: () => sweepActive = false,
    });
  });

  $: colorSensitivity = edgeSensitivity + 20;
  $: isVisible = isHovered || sweepActive;
  $: borderOpacity = isVisible
    ? Math.max(0, (edgeProximity * 100 - colorSensitivity) / (100 - colorSensitivity))
    : 0;
  $: glowOpacity = isVisible
    ? Math.max(0, (edgeProximity * 100 - edgeSensitivity) / (100 - edgeSensitivity))
    : 0;

  // Всё, что ниже, зависит от `ready` — до первого свободного кадра
  // просто не считается, вместо этого используется дешёвый fallback.
  $: meshGradients = ready ? buildMeshGradients(colors) : [];
  $: borderBg = ready ? meshGradients.map(g => `${g} border-box`) : [];
  $: fillBg = ready ? meshGradients.map(g => `${g} padding-box`) : [];
  $: angleDeg = `${cursorAngle.toFixed(3)}deg`;

  $: outerBorderBackground = ready
    ? [
        `linear-gradient(${backgroundColor} 0 100%) padding-box`,
        'linear-gradient(rgb(255 255 255 / 0%) 0% 100%) border-box',
        ...borderBg,
      ].join(', ')
    : `linear-gradient(${backgroundColor} 0 100%)`;

  $: borderMaskImage = `conic-gradient(from ${angleDeg} at center, black ${String(coneSpread)}%, transparent ${String(coneSpread + 15)}%, transparent ${String(100 - coneSpread - 15)}%, black ${String(100 - coneSpread)}%)`;

  $: fillMaskImage = ready
    ? [
        'linear-gradient(to bottom, black, black)',
        'radial-gradient(ellipse at 50% 50%, black 40%, transparent 65%)',
        'radial-gradient(ellipse at 66% 66%, black 5%, transparent 40%)',
        'radial-gradient(ellipse at 33% 33%, black 5%, transparent 40%)',
        'radial-gradient(ellipse at 66% 33%, black 5%, transparent 40%)',
        'radial-gradient(ellipse at 33% 66%, black 5%, transparent 40%)',
        `conic-gradient(from ${angleDeg} at center, transparent 5%, black 15%, black 85%, transparent 95%)`,
      ].join(', ')
    : 'none';

  $: glowMaskImage = `conic-gradient(from ${angleDeg} at center, black 2.5%, transparent 10%, transparent 90%, black 97.5%)`;

  $: boxShadowGlow = ready ? buildBoxShadow(glowColor, glowIntensity) : 'none';

  $: transitionStyle = isVisible ? 'opacity 0.25s ease-out' : 'opacity 0.75s ease-in-out';
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  bind:this={cardEl}
  on:pointermove={handlePointerMove}
  on:pointerenter={handlePointerEnter}
  on:pointerleave={handlePointerLeave}
  class="relative grid isolate {className}"
  style="
    background: {backgroundColor};
    border-radius: {borderRadius}px;
    border: 1px solid {baseBorderColor};
    overflow: hidden;
    transform: translate3d(0, 0, 0.01px);
  "
>
  <!-- mesh gradient border -->
  <div
    class="absolute inset-0 -z-[1]"
    style="
      border-radius: inherit;
      border: 1px solid transparent;
      background: {outerBorderBackground};
      opacity: {borderOpacity};
      mask-image: {borderMaskImage};
      -webkit-mask-image: {borderMaskImage};
      transition: {transitionStyle};
    "
  ></div>

  <!-- mesh gradient fill near edges -->
  {#if ready}
    <div
      class="absolute inset-0 -z-[1]"
      style="
        border-radius: inherit;
        border: 1px solid transparent;
        background: {fillBg.join(', ')};
        mask-image: {fillMaskImage};
        -webkit-mask-image: {fillMaskImage};
        mask-composite: subtract, add, add, add, add, add;
        -webkit-mask-composite: source-out, source-over, source-over, source-over, source-over, source-over;
        opacity: {borderOpacity * fillOpacity};
        mix-blend-mode: soft-light;
        transition: {transitionStyle};
      "
    ></div>
  {/if}

  <!-- outer glow -->
  {#if ready}
    <span
      class="absolute pointer-events-none z-[1]"
      style="
        inset: {-glowRadius}px;
        border-radius: inherit;
        mask-image: {glowMaskImage};
        -webkit-mask-image: {glowMaskImage};
        opacity: {glowOpacity};
        mix-blend-mode: screen;
        transition: {transitionStyle};
      "
    >
      <span
        class="absolute"
        style="
          inset: {glowRadius}px;
          border-radius: inherit;
          box-shadow: {boxShadowGlow};
        "
      ></span>
    </span>
  {/if}

  <div class="flex flex-col relative overflow-auto z-[1]">
    <slot />
  </div>
</div>