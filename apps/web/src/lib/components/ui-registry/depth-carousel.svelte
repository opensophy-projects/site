<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import gsap from 'gsap';

  export type DepthCarouselItem = string | { image: string; alt?: string };
  type TiltDirection = 'left' | 'right';

  // ----- props -----
  export let items: DepthCarouselItem[] = [
    { image: 'https://picsum.photos/seed/depth1/800/1000', alt: 'Slide 1' },
    { image: 'https://picsum.photos/seed/depth2/800/1000', alt: 'Slide 2' },
    { image: 'https://picsum.photos/seed/depth3/800/1000', alt: 'Slide 3' },
    { image: 'https://picsum.photos/seed/depth4/800/1000', alt: 'Slide 4' },
    { image: 'https://picsum.photos/seed/depth5/800/1000', alt: 'Slide 5' },
    { image: 'https://picsum.photos/seed/depth6/800/1000', alt: 'Slide 6' }
  ];
  export let cardWidth = 300;
  export let cardHeight = 380;
  export let radius = 18;
  export let tint = '#05060a';
  export let depth = 220;
  export let spread = 90;
  export let tilt = 22;
  export let tiltDirection: TiltDirection = 'right';
  export let perspective = 1400;
  export let visibleCards = 4;
  export let falloff = 0.2;
  export let blur = 6;
  export let duration = 700;
  export let ease = 'power3.out';
  export let autoplay = false;
  export let autoplayDelay = 3200;
  export let loop = true;
  export let showControls = true;
  export let showIndicators = true;
  export let className = '';

  const dispatch = createEventDispatcher<{
    change: { index: number; item: { image: string; alt?: string } };
  }>();

  // ----- helpers -----
  const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
  const normalizeItem = (it: DepthCarouselItem) =>
    typeof it === 'string' ? { image: it, alt: '' } : it;

  $: data = (Array.isArray(items) ? items : []).map(normalizeItem);
  $: count = data.length;

  // ----- refs -----
  let rootEl: HTMLDivElement;
  let cardEls: (HTMLDivElement | null)[] = [];
  let overlayEls: (HTMLSpanElement | null)[] = [];

  // ----- mutable state kept outside Svelte reactivity (mirrors React refs) -----
  let posRef = 0;
  let focusRef = 0;
  let tween: gsap.core.Tween | null = null;
  let scaleRef = 1;
  let dragState: {
    x: number;
    startPos: number;
    lastX: number;
    lastT: number;
    v: number;
    moved: boolean;
    id: number;
  } | null = null;
  let wheelTimer: ReturnType<typeof setTimeout> | null = null;
  let autoTimer: ReturnType<typeof setInterval> | null = null;
  let reduced = false;
  let ro: ResizeObserver | null = null;

  let active = 0;

  // config snapshot object, refreshed reactively whenever a relevant prop changes
  $: cfg = {
    count,
    depth,
    spread,
    tilt,
    tiltDirection,
    visibleCards,
    falloff,
    blur,
    duration,
    ease,
    loop,
    cardWidth,
    autoplayDelay
  };

  function layout(pos: number) {
    const n = cfg.count;
    if (!n) return;
    const dir = cfg.tiltDirection === 'left' ? -1 : 1;
    const sc = scaleRef;

    for (let i = 0; i < n; i++) {
      const el = cardEls[i];
      if (!el) continue;

      let d = i - pos;
      if (cfg.loop && n > 1) {
        d = ((d % n) + n) % n;
        if (d > n / 2) d -= n;
      }

      const back = Math.max(0, d);
      const az = Math.abs(d);
      const shown = az <= cfg.visibleCards + 0.5;

      const tz = -cfg.depth * d;
      const tx = dir * cfg.spread * d;
      const ry = dir * cfg.tilt * clamp(d, 0, 1);

      let opacity = d < 0 ? Math.max(0, 1 + d) : 1;
      if (!shown) opacity = 0;

      const brightness = Math.max(0.15, 1 - back * cfg.falloff);
      const blurPx =
        cfg.blur > 0 ? Math.min(cfg.blur, (back / Math.max(1, cfg.visibleCards)) * cfg.blur) : 0;
      const zi = Math.round(2000 - d * 20);

      el.style.transform = `translate(-50%, -50%) scale(${sc}) translateX(${tx.toFixed(
        2
      )}px) translateZ(${tz.toFixed(2)}px) rotateY(${ry.toFixed(3)}deg)`;
      el.style.opacity = opacity.toFixed(3);
      el.style.filter = `brightness(${brightness.toFixed(3)}) blur(${blurPx.toFixed(2)}px)`;
      el.style.zIndex = String(zi);
      el.style.pointerEvents = shown && opacity > 0.05 ? 'auto' : 'none';

      const ov = overlayEls[i];
      if (ov) ov.style.opacity = clamp(back * cfg.falloff * 1.25, 0, 0.86).toFixed(3);
    }
  }

  function notify(idx: number) {
    active = idx;
    dispatch('change', { index: idx, item: data[idx] });
  }

  function tweenTo(target: number, animate: boolean) {
    tween?.kill();
    const proxy = { p: posRef };
    const dur = animate && !reduced ? cfg.duration / 1000 : 0;
    tween = gsap.to(proxy, {
      p: target,
      duration: dur,
      ease: cfg.ease,
      onUpdate: () => {
        posRef = proxy.p;
        layout(proxy.p);
      },
      onComplete: () => {
        const n = cfg.count;
        if (n > 0) posRef = ((posRef % n) + n) % n;
        layout(posRef);
      }
    });
  }

  function setFocus(rawIndex: number, animate = true) {
    const n = cfg.count;
    if (!n) return;
    const idx = cfg.loop ? ((rawIndex % n) + n) % n : clamp(rawIndex, 0, n - 1);
    let delta = idx - posRef;
    if (cfg.loop && n > 1) {
      delta = ((delta % n) + n) % n;
      if (delta > n / 2) delta -= n;
    }
    tweenTo(posRef + delta, animate);
    if (idx !== focusRef) {
      focusRef = idx;
      notify(idx);
    }
  }

  function navigateBy(step: number) {
    setFocus(focusRef + step, true);
  }

  // ----- wheel -----
  function onWheel(e: WheelEvent) {
    if (cfg.count < 2) return;
    e.preventDefault();
    tween?.kill();
    const raw = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    const delta = e.deltaMode === 1 ? raw * 24 : raw;
    const step = clamp(delta / (cfg.cardWidth * 0.9), -0.6, 0.6);
    posRef += step;
    layout(posRef);
    if (wheelTimer) clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => setFocus(Math.round(posRef), true), 130);
  }

  // ----- pointer / drag -----
  function onPointerDown(e: PointerEvent) {
    if (cfg.count < 2) return;
    tween?.kill();
    dragState = {
      x: e.clientX,
      startPos: posRef,
      lastX: e.clientX,
      lastT: performance.now(),
      v: 0,
      moved: false,
      id: e.pointerId
    };
  }

  function onPointerMove(e: PointerEvent) {
    const drag = dragState;
    if (!drag) return;
    const stepPx = Math.max(cfg.cardWidth * 0.55 * scaleRef, 40);
    const dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 4) {
      drag.moved = true;
      rootEl?.setPointerCapture(drag.id);
    }
    if (!drag.moved) return;
    const now = performance.now();
    const dt = Math.max(now - drag.lastT, 1);
    drag.v = (e.clientX - drag.lastX) / dt;
    drag.lastX = e.clientX;
    drag.lastT = now;
    posRef = drag.startPos - dx / stepPx;
    layout(posRef);
  }

  function onPointerEnd() {
    const drag = dragState;
    if (!drag) return;
    dragState = null;
    if (!drag.moved) return;
    const stepPx = Math.max(cfg.cardWidth * 0.55 * scaleRef, 40);
    const projected = posRef - (drag.v * 180) / stepPx;
    setFocus(Math.round(projected), true);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      navigateBy(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      navigateBy(1);
    }
  }

  function onCardClick(index: number) {
    if (dragState?.moved) return;
    setFocus(index, true);
  }

  // ----- lifecycle -----
  onMount(() => {
    reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      const needed = cfg.cardWidth + Math.abs(cfg.spread) * 2 + 120;
      scaleRef = clamp(w / needed, 0.4, 1);
      layout(posRef);
    });
    ro.observe(rootEl);

    rootEl.addEventListener('wheel', onWheel, { passive: false });

    let hovered = false;
    let focused = false;
    const stopAuto = () => {
      if (autoTimer) clearInterval(autoTimer);
      autoTimer = null;
    };
    const startAuto = () => {
      stopAuto();
      autoTimer = setInterval(
        () => {
          if (!hovered && !focused) navigateBy(1);
        },
        Math.max(cfg.autoplayDelay, 600)
      );
    };
    const onEnter = () => (hovered = true);
    const onLeave = () => (hovered = false);
    const onFocusIn = () => (focused = true);
    const onFocusOut = () => (focused = false);

    if (autoplay && !reduced && count >= 2) {
      rootEl.addEventListener('mouseenter', onEnter);
      rootEl.addEventListener('mouseleave', onLeave);
      rootEl.addEventListener('focusin', onFocusIn);
      rootEl.addEventListener('focusout', onFocusOut);
      startAuto();
    }

    layout(posRef);

    return () => {
      stopAuto();
      rootEl.removeEventListener('wheel', onWheel);
      rootEl.removeEventListener('mouseenter', onEnter);
      rootEl.removeEventListener('mouseleave', onLeave);
      rootEl.removeEventListener('focusin', onFocusIn);
      rootEl.removeEventListener('focusout', onFocusOut);
    };
  });

  onDestroy(() => {
    tween?.kill();
    if (wheelTimer) clearTimeout(wheelTimer);
    if (autoTimer) clearInterval(autoTimer);
    ro?.disconnect();
  });

  // re-layout whenever visual config props change
  $: if (rootEl) {
    // touch every dependency explicitly so Svelte tracks them
    void (depth, spread, tilt, tiltDirection, visibleCards, falloff, blur, cardWidth, cardHeight, radius, count);
    layout(posRef);
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  bind:this={rootEl}
  class={`depth-carousel-root ${className}`.trim()}
  style={`perspective: ${perspective}px;`}
  role="group"
  aria-roledescription="carousel"
  aria-label="Depth carousel"
  tabindex="0"
  on:pointerdown={onPointerDown}
  on:pointermove={onPointerMove}
  on:pointerup={onPointerEnd}
  on:pointercancel={onPointerEnd}
  on:keydown={onKeyDown}
>
  <div class="depth-carousel-stage">
    {#each data as item, i (i)}
      <div
        class="depth-carousel-card"
        bind:this={cardEls[i]}
        style={`width:${cardWidth}px;height:${cardHeight}px;border-radius:${radius}px;`}
        aria-roledescription="slide"
        aria-label={`${i + 1} of ${count}`}
        aria-hidden={active !== i}
        on:click={() => onCardClick(i)}
      >
        <img class="depth-carousel-img" src={item.image} alt={item.alt || ''} draggable="false" />
        <span
          class="depth-carousel-overlay"
          bind:this={overlayEls[i]}
          style={`background:${tint};`}
        ></span>
      </div>
    {/each}
  </div>

  {#if showControls && count > 1}
    <button
      type="button"
      class="depth-carousel-btn depth-carousel-btn-prev"
      aria-label="Previous slide"
      on:click={() => navigateBy(-1)}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path
          d="M15 5l-7 7 7 7"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
    <button
      type="button"
      class="depth-carousel-btn depth-carousel-btn-next"
      aria-label="Next slide"
      on:click={() => navigateBy(1)}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path
          d="M9 5l7 7-7 7"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  {/if}

  {#if showIndicators && count > 1}
    <div class="depth-carousel-indicators" role="tablist" aria-label="Slides">
      {#each data as _, i (i)}
        <button
          type="button"
          role="tab"
          aria-selected={active === i}
          aria-label={`Go to slide ${i + 1}`}
          class="depth-carousel-dot"
          class:is-active={active === i}
          on:click={() => setFocus(i, true)}
        ></button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .depth-carousel-root {
    position: relative;
    display: flex;
    height: 100%;
    min-height: 320px;
    width: 100%;
    cursor: grab;
    touch-action: pan-y;
    -webkit-user-select: none;
    user-select: none;
    align-items: center;
    justify-content: center;
    outline: none;
    perspective-origin: 50% 50%;
  }
  .depth-carousel-root:active {
    cursor: grabbing;
  }
  .depth-carousel-root:focus-visible {
    border-radius: 0.75rem;
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: 4px;
  }

  .depth-carousel-stage {
    position: absolute;
    inset: 0;
    transform-style: preserve-3d;
  }

  .depth-carousel-card {
    position: absolute;
    left: 50%;
    top: 50%;
    cursor: pointer;
    overflow: hidden;
    background: #0b0d12;
    box-shadow:
      0 30px 60px -20px rgba(0, 0, 0, 0.65),
      0 8px 20px -10px rgba(0, 0, 0, 0.5);
    transform: translate(-50%, -50%);
    transform-origin: center;
    will-change: transform, opacity, filter;
  }

  .depth-carousel-img {
    display: block;
    height: 100%;
    width: 100%;
    -webkit-user-select: none;
    user-select: none;
    object-fit: cover;
    pointer-events: none;
    -webkit-user-drag: none;
  }

  .depth-carousel-overlay {
    pointer-events: none;
    position: absolute;
    inset: 0;
    opacity: 0;
    mix-blend-mode: multiply;
  }

  .depth-carousel-btn {
    position: absolute;
    top: 50%;
    z-index: 3000;
    display: grid;
    height: 42px;
    width: 42px;
    transform: translateY(-50%);
    place-items: center;
    border-radius: 9999px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(18, 20, 26, 0.55);
    color: #fff;
    backdrop-filter: blur(12px);
    transition:
      background 0.2s,
      border-color 0.2s,
      transform 0.2s;
    cursor: pointer;
  }
  .depth-carousel-btn:hover {
    border-color: rgba(255, 255, 255, 0.4);
    background: rgba(28, 31, 40, 0.85);
  }
  .depth-carousel-btn:active {
    transform: translateY(-50%) scale(0.95);
  }
  .depth-carousel-btn-prev {
    left: 1rem;
  }
  .depth-carousel-btn-next {
    right: 1rem;
  }

  .depth-carousel-indicators {
    position: absolute;
    bottom: 1rem;
    left: 50%;
    z-index: 3000;
    display: flex;
    transform: translateX(-50%);
    gap: 0.5rem;
    border-radius: 9999px;
    background: rgba(14, 16, 22, 0.4);
    padding: 0.5rem 0.75rem;
    backdrop-filter: blur(4px);
  }

  .depth-carousel-dot {
    height: 7px;
    width: 7px;
    cursor: pointer;
    border: none;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.3);
    padding: 0;
    transition:
      width 0.25s,
      background 0.25s;
  }
  .depth-carousel-dot.is-active {
    width: 20px;
    background: #fff;
  }
</style>