<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import gsap from 'gsap';

  export type AccordionGalleryItem = {
    image: string;
    label?: string;
    link?: string;
    alt?: string;
  }

  // ----- props -----
  export let items: AccordionGalleryItem[] = [
    { image: 'https://picsum.photos/id/1015/900/1200', label: 'Canyon', link: '#' },
    { image: 'https://picsum.photos/id/1018/900/1200', label: 'Ridgeline', link: '#' },
    { image: 'https://picsum.photos/id/1039/900/1200', label: 'Falls', link: '#' },
    { image: 'https://picsum.photos/id/1043/900/1200', label: 'Harbour', link: '#' },
    { image: 'https://picsum.photos/id/1044/900/1200', label: 'Skyline', link: '#' }
  ];
  export let defaultIndex = 2;
  export let accentColor = '#ffffff';
  export let overlayColor = '#060010';
  export let textColor = '#ffffff';
  export let height = 460;
  export let gap = 10;
  export let radius = 16;
  export let expandRatio = 0.52;
  export let orientation: 'horizontal' | 'vertical' = 'horizontal';
  export let duration = 0.6;
  export let ease = 'power3.out';
  export let parallax = 0.5;
  export let tilt = 8;
  export let stagger = 0.06;
  export let trigger: 'hover' | 'click' = 'hover';
  export let showLabels = true;
  export let grayscale = true;
  export let className = '';

  $: vertical = orientation === 'vertical';
  $: count = items.length;

  let active = Math.min(Math.max(defaultIndex, 0), count - 1);

  let rootEl: HTMLDivElement;
  let panelEls: (HTMLElement | null)[] = [];
  let mediaEls: (HTMLElement | null)[] = [];
  let barEls: (HTMLElement | null)[] = [];
  let textEls: (HTMLElement | null)[] = [];

  let tl: gsap.core.Timeline | null = null;
  let firstRun = true;
  let mediaSize = 320;
  let ro: ResizeObserver | null = null;

  let prefersReduced = false;

  $: overlayBg = `linear-gradient(180deg, transparent 45%, color-mix(in srgb, ${overlayColor} 78%, transparent) 100%), color-mix(in srgb, ${overlayColor} calc(var(--ag-dim, 0.35) * 100%), transparent)`;

  function applyLayout(animate: boolean) {
    const panels = panelEls;
    if (!panels.length) return;

    const r = Math.min(Math.max(expandRatio, 0.2), 0.9);
    const grow = count > 1 ? (r * (count - 1)) / (1 - r) : 1;

    tl?.kill();
    const dur = animate && !prefersReduced ? duration : 0;
    const timeline = gsap.timeline();

    panels.forEach((panel, i) => {
      if (!panel) return;
      const isActive = i === active;
      const media = mediaEls[i];
      const bar = barEls[i];
      const text = textEls[i];

      const rot = isActive ? 0 : i < active ? tilt : -tilt;
      const rotProp = vertical ? { rotateX: -rot } : { rotateY: rot };

      timeline.to(panel, { flexGrow: isActive ? grow : 1, ...rotProp, duration: dur, ease }, 0);

      if (media) {
        const drift = Math.max(-1.5, Math.min(1.5, active - i));
        const shift = drift * parallax * mediaSize * 0.06;
        const gray = grayscale ? (isActive ? 0 : 1) : 0;
        timeline.to(
          media,
          {
            xPercent: -50,
            yPercent: -50,
            x: vertical ? 0 : isActive ? 0 : shift,
            y: vertical ? (isActive ? 0 : shift) : 0,
            '--ag-gray': gray,
            '--ag-dim': isActive ? 0 : 0.35,
            duration: dur,
            ease
          },
          0
        );
      }

      if (showLabels && bar && text) {
        if (isActive) {
          timeline.to(
            [bar, text],
            { opacity: 1, x: 0, duration: dur, ease, stagger: prefersReduced ? 0 : stagger },
            0
          );
        } else {
          timeline.to([bar, text], { opacity: 0, x: -14, duration: dur * 0.6, ease }, 0);
        }
      }
    });

    tl = timeline;
  }

  function measure() {
    if (!rootEl) return;
    const rect = rootEl.getBoundingClientRect();
    const total = vertical ? rect.height : rect.width;
    const usable = Math.max(total - gap * (count - 1), 120);
    const size = Math.max(140, usable * Math.min(Math.max(expandRatio, 0.2), 0.9) * 1.22);
    mediaSize = size;
    rootEl.style.setProperty('--ag-media-size', `${size}px`);
    applyLayout(!firstRun);
  }

  function handleEnter(i: number) {
    if (trigger === 'hover') active = i;
  }

  function handleClick(i: number, e: MouseEvent) {
    if (i !== active) {
      e.preventDefault();
      active = i;
    }
  }

  function handleFocus(i: number) {
    active = i;
  }

  function handleKeyDown(i: number, e: KeyboardEvent) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      active = (i + 1) % count;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      active = (i - 1 + count) % count;
    }
  }

  onMount(() => {
    prefersReduced =
      typeof window !== 'undefined' && !!window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    measure();
    ro = new ResizeObserver(measure);
    ro.observe(rootEl);

    firstRun = false;
  });

  onDestroy(() => {
    tl?.kill();
    ro?.disconnect();
  });

  // re-run layout whenever active index or any layout-affecting prop changes
  $: if (rootEl) {
    // touch dependencies explicitly so Svelte tracks them
    void (active, count, expandRatio, duration, ease, vertical, tilt, parallax, grayscale, showLabels, stagger);
    applyLayout(!firstRun);
  }

  // re-measure whenever gap/expandRatio/orientation/count changes the usable space
  $: if (rootEl) {
    void (gap, expandRatio, vertical, count);
    measure();
  }
</script>

<div
  bind:this={rootEl}
  class={`accordion-gallery-root ${vertical ? 'is-vertical' : 'is-horizontal'} ${className}`.trim()}
  style={`gap:${gap}px; height:${vertical ? Math.round(height * 1.6) : height}px; --ag-accent:${accentColor};`}
  role="list"
  aria-label="Image accordion gallery"
>
  {#each items as item, i (i)}
    {@const isActive = i === active}
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <svelte:element
      this={item.link ? 'a' : 'div'}
      bind:this={panelEls[i]}
      class="accordion-gallery-panel"
      style={`border-radius:${radius}px;`}
      href={item.link || undefined}
      on:click={(e: MouseEvent) => { handleClick(i, e); }}
      on:mouseenter={() => { handleEnter(i); }}
      on:focus={() => { handleFocus(i); }}
      on:keydown={(e: KeyboardEvent) => { handleKeyDown(i, e); }}
      role="listitem"
      tabindex={0}
      aria-current={isActive ? 'true' : undefined}
      aria-label={item.label}
    >
      <span class="accordion-gallery-clip">
        <span
          bind:this={mediaEls[i]}
          class="accordion-gallery-media"
          style={`width:${vertical ? '100%' : 'var(--ag-media-size, 320px)'};height:${
            vertical ? 'var(--ag-media-size, 320px)' : '100%'
          };`}
        >
          <img
            src={item.image}
            alt={item.alt || item.label || ''}
            draggable="false"
            class="accordion-gallery-img"
          />
        </span>
        <span class="accordion-gallery-overlay" style={`background:${overlayBg};`} aria-hidden="true"
        ></span>
      </span>
      {#if showLabels}
        <span class="accordion-gallery-caption" aria-hidden="true">
          <span
            bind:this={barEls[i]}
            class="accordion-gallery-bar"
            style={`background:${accentColor}; box-shadow: 0 0 12px color-mix(in srgb, ${accentColor} 60%, transparent);`}
          ></span>
          <span bind:this={textEls[i]} class="accordion-gallery-label" style={`color:${textColor};`}>
            {item.label}
          </span>
        </span>
      {/if}
    </svelte:element>
  {/each}
</div>

<style>
  .accordion-gallery-root {
    display: flex;
    width: 100%;
    max-width: 100%;
    perspective: 1400px;
  }
  .accordion-gallery-root.is-horizontal {
    flex-direction: row;
  }
  .accordion-gallery-root.is-vertical {
    flex-direction: column;
  }
  @media (max-width: 520px) {
    .accordion-gallery-root {
      flex-direction: column !important;
      perspective: none !important;
    }
  }

  .accordion-gallery-panel {
    position: relative;
    display: block;
    min-width: 0;
    min-height: 0;
    flex: 1 1 0;
    cursor: pointer;
    overflow: hidden;
    background: #0a0713;
    text-decoration: none;
    outline: none;
    transform-style: preserve-3d;
    transform-origin: center;
    box-shadow: 0 10px 30px -18px rgba(0, 0, 0, 0.8);
    will-change: flex-grow, transform;
  }
  .accordion-gallery-panel:focus-visible {
    box-shadow:
      0 0 0 2px var(--ag-accent),
      0 10px 30px -18px rgba(0, 0, 0, 0.8);
  }
  @media (max-width: 520px) {
    .accordion-gallery-panel {
      min-height: 84px;
      transform: none !important;
    }
  }

  .accordion-gallery-clip {
    position: absolute;
    inset: 0;
    overflow: hidden;
    border-radius: inherit;
  }

  .accordion-gallery-media {
    position: absolute;
    top: 50%;
    left: 50%;
    filter: grayscale(var(--ag-gray, 1));
    will-change: transform, filter;
  }

  .accordion-gallery-img {
    display: block;
    height: 100%;
    width: 100%;
    -webkit-user-select: none;
    user-select: none;
    object-fit: cover;
    -webkit-user-drag: none;
  }

  .accordion-gallery-overlay {
    pointer-events: none;
    position: absolute;
    inset: 0;
  }

  .accordion-gallery-caption {
    pointer-events: none;
    position: absolute;
    bottom: 20px;
    left: 20px;
    right: 20px;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .accordion-gallery-bar {
    height: 26px;
    width: 3px;
    flex: none;
    border-radius: 3px;
    opacity: 0;
  }

  .accordion-gallery-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: clamp(1rem, 1.4vw, 1.4rem);
    font-weight: 600;
    letter-spacing: 0.01em;
    opacity: 0;
    text-shadow: 0 2px 14px rgba(0, 0, 0, 0.55);
  }
</style>