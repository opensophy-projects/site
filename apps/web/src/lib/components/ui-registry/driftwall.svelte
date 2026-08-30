<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  export type DriftWallItem = {
    image: string;
    title?: string;
    href?: string;
  }

  // ----- props -----
  export let items: DriftWallItem[] = Array.from({ length: 15 }, (_, i) => {
    const ids = [1015, 1025, 1039, 1043, 1044, 1050, 1062, 1069, 1074, 1080, 1084, 106, 110, 133, 164];
    return {
      image: `https://picsum.photos/id/${ids[i % ids.length]}/600/400`,
      title: `Tile ${i + 1}`,
      href: undefined
    };
  });
  export let columns = 5;
  export let tileWidth = 200;
  export let tileHeight = 132;
  export let gap = 18;
  export let radius = 14;
  export let tilt = 16;
  export let turn = -14;
  export let roll = 0;
  export let perspective = 1200;
  export let depth = 120;
  export let speed = 42;
  export let direction: 'up' | 'down' = 'up';
  export let variance = 0.45;
  export let parallax = 0.6;
  export let pauseOnHover = false;
  export let lift = 64;
  export let fade = 0.6;
  export let dim = 0.55;
  export let grayscale = false;
  export let overlayColor = '#060010';
  export let className = '';

  // ----- helpers -----
  const prefersReducedMotion = (): boolean =>
    typeof window !== 'undefined' && !!window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const columnFactor = (index: number, varianceVal: number): number => {
    const pseudo = ((index * 0.618033988 + 0.35) % 1) * 2 - 1;
    return 1 + varianceVal * pseudo;
  };


  // ----- refs -----
  let containerEl: HTMLDivElement;
  let planeEl: HTMLDivElement;
  let trackEls: (HTMLDivElement | null)[] = [];
  let rafId: number | null = null;
  let ro: ResizeObserver | null = null;
  let mq: MediaQueryList | null = null;

  // ----- mutable animation state (mirrors React refs) -----
  let offsets: number[] = [];
  let velocities: number[] = [];
  let hoveredCol = -1;
  let wallHovered = false;
  let pointer = { x: 0, y: 0 };
  let pointerDamped = { x: 0, y: 0 };
  let lastTs: number | null = null;
  let activeIdMutable: string | null = null;

  let containerHeight = 600;
  let activeId: string | null = null;
  let reduced = false;

  $: columnItems = (() => {
    const cols: DriftWallItem[][] = Array.from({ length: columns }, () => []);
    items.forEach((item, i) => cols[i % columns].push(item));
    return cols.map(col => (col.length ? col : items.slice(0, 1)));
  })();

  $: columnMeta = (() => {
    const unit = tileHeight + gap;
    return columnItems.map(col => {
      const copyHeight = Math.max(unit, col.length * unit);
      const copies = Math.max(2, Math.ceil((containerHeight * 1.6) / copyHeight) + 1);
      return { copyHeight, copies };
    });
  })();

  $: baseVelocities = (() => {
    const dirSign = direction === 'up' ? 1 : -1;
    return columnItems.map((_, c) => {
      const altSign = c % 2 === 0 ? 1 : -1;
      return speed * columnFactor(c, variance) * dirSign * altSign;
    });
  })();

  // reset offsets/velocities whenever the column layout changes
  let lastMetaKey = '';
  $: {
    const key = columnMeta.map(m => `${m.copyHeight}:${m.copies}`).join('|') + `#${columnItems.length}`;
    if (key !== lastMetaKey) {
      lastMetaKey = key;
      offsets = columnMeta.map((meta, c) => meta.copyHeight * ((c * 0.37) % 1));
      velocities = columnItems.map(() => 0);
    }
  }

  function applyPlaneTransform(px: number, py: number) {
    if (!planeEl) return;
    planeEl.style.transform =
      `translate(-50%, -50%) scale(1.18) ` +
      `rotateX(${tilt + py}deg) rotateY(${turn + px}deg) rotateZ(${roll}deg) ` +
      `translateZ(${-depth}px)`;
  }

  function animate(ts: number) {
    if (lastTs === null) lastTs = ts;
    const dt = Math.min(0.05, Math.max(0, ts - lastTs) / 1000);
    lastTs = ts;

    const maxTilt = parallax * 8;
    const targetX = pointer.x * maxTilt;
    const targetY = -pointer.y * maxTilt;
    const damp = 1 - Math.exp(-dt / 0.12);
    pointerDamped.x += (targetX - pointerDamped.x) * damp;
    pointerDamped.y += (targetY - pointerDamped.y) * damp;
    applyPlaneTransform(pointerDamped.x, pointerDamped.y);

    if (!reduced) {
      for (let c = 0; c < trackEls.length; c++) {
        const meta = columnMeta[c];
        if (!meta) continue;
        const paused = wallHovered && pauseOnHover;
        const factor = paused || hoveredCol === c ? 0 : 1;
        const target = baseVelocities[c] * factor;

        const ease = 1 - Math.exp(-dt / (target === 0 ? 0.16 : 0.28));
        velocities[c] = (velocities[c] ?? 0) + (target - (velocities[c] ?? 0)) * ease;
        let next = (offsets[c] ?? 0) + velocities[c] * dt;
        next = ((next % meta.copyHeight) + meta.copyHeight) % meta.copyHeight;
        offsets[c] = next;

        const el = trackEls[c];
        if (el) el.style.transform = `translate3d(0, ${-next}px, 0)`;
      }
    } else {
      for (let c = 0; c < trackEls.length; c++) {
        const el = trackEls[c];
        const meta = columnMeta[c];
        if (el && meta) el.style.transform = `translate3d(0, ${-(offsets[c] ?? 0)}px, 0)`;
      }
    }

    rafId = requestAnimationFrame(animate);
  }

  function activate(id: string, index: number) {
    activeIdMutable = id;
    hoveredCol = index;
    activeId = id;
  }

  function release() {
    activeIdMutable = null;
    hoveredCol = -1;
    activeId = null;
  }

  function handlePointerMove(e: PointerEvent) {
    const rect = containerEl?.getBoundingClientRect();
    if (!rect) return;
    if (parallax > 0 && !reduced) {
      pointer = {
        x: (e.clientX - rect.left) / rect.width - 0.5,
        y: (e.clientY - rect.top) / rect.height - 0.5
      };
    }
    const hit = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const tile = hit?.closest?.('[data-tile-id]') as HTMLElement | null;
    if (!tile) return;
    const id = tile.dataset.tileId ?? null;
    if (id === activeIdMutable) return;
    activeIdMutable = id;
    hoveredCol = Number(tile.dataset.col);
    activeId = id;
  }

  function handlePointerEnterWall() {
    wallHovered = true;
  }

  function handlePointerLeaveWall() {
    wallHovered = false;
    pointer = { x: 0, y: 0 };
    release();
  }

  $: cssVarsStyle = [
    `--dw-tile-w: ${tileWidth}px`,
    `--dw-tile-h: ${tileHeight}px`,
    `--dw-gap: ${gap}px`,
    `--dw-radius: ${radius}px`,
    `--dw-lift: ${lift}px`,
    `--dw-dim: ${dim}`,
    `--dw-gray: ${grayscale ? 1 : 0}`,
    `--dw-overlay: ${overlayColor}`,
    `--dw-edge: ${Math.max(0, (1 - fade) * 100)}%`,
    `perspective: ${perspective}px`,
    `perspective-origin: 50% 50%`
  ].join('; ');

  onMount(() => {
    reduced = prefersReducedMotion();
    if (typeof window !== 'undefined' && window.matchMedia) {
      mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const onChange = (e: MediaQueryListEvent) => (reduced = e.matches);
      mq.addEventListener('change', onChange);
    }

    ro = new ResizeObserver(([entry]) => {
      containerHeight = entry.contentRect.height || 600;
    });
    ro.observe(containerEl);

    rafId = requestAnimationFrame(animate);
  });

  onDestroy(() => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    lastTs = null;
    ro?.disconnect();
  });
</script>

<div
  bind:this={containerEl}
  class={`drift-wall-root ${className}`.trim()}
  style={cssVarsStyle}
  on:pointermove={handlePointerMove}
  on:pointerenter={handlePointerEnterWall}
  on:pointerleave={handlePointerLeaveWall}
  role="group"
  aria-label="Drifting wall of tiles"
>
  <div bind:this={planeEl} class="drift-wall-plane">
    {#each columnItems as col, c (c)}
      <div class="drift-wall-col">
        <div class="drift-wall-track" bind:this={trackEls[c]}>
          {#each Array(columnMeta[c]?.copies ?? 2) as _, copyIndex (copyIndex)}
            {#each col as item, itemIndex (itemIndex)}
              {@const id = `${c}-${copyIndex}-${itemIndex}`}
              {@const isActive = activeId === id}
              {#if item.href}
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  class="drift-wall-tile"
                  class:is-active={isActive}
                  data-tile-id={id}
                  data-col={c}
                  on:focus={() => { activate(id, c); }}
                  on:blur={release}
                >
                  <span class="drift-wall-inner">
                    <img
                      src={item.image}
                      alt={item.title ?? ''}
                      loading="lazy"
                      decoding="async"
                      draggable="false"
                      class="drift-wall-img"
                    />
                    <span class="drift-wall-overlay" aria-hidden="true"></span>
                  </span>
                </a>
              {:else}
                <div
                  tabindex="0"
                  role="button"
                  aria-label={item.title ?? 'tile'}
                  class="drift-wall-tile"
                  class:is-active={isActive}
                  data-tile-id={id}
                  data-col={c}
                  on:focus={() => { activate(id, c); }}
                  on:blur={release}
                >
                  <span class="drift-wall-inner">
                    <img
                      src={item.image}
                      alt={item.title ?? ''}
                      loading="lazy"
                      decoding="async"
                      draggable="false"
                      class="drift-wall-img"
                    />
                    <span class="drift-wall-overlay" aria-hidden="true"></span>
                  </span>
                </div>
              {/if}
            {/each}
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .drift-wall-root {
    position: relative;
    display: block;
    height: 100%;
    min-height: 320px;
    width: 100%;
    overflow: hidden;
  }

  .drift-wall-plane {
    position: absolute;
    z-index: 1;
    left: 50%;
    top: 50%;
    display: flex;
    cursor: pointer;
    flex-direction: row;
    transform-style: preserve-3d;
    transform-origin: 50% 50%;
    will-change: transform;
  }

  .drift-wall-col {
    position: relative;
    width: calc(var(--dw-tile-w) + var(--dw-gap));
    transform-style: preserve-3d;
  }

  .drift-wall-track {
    display: flex;
    flex-direction: column;
    transform-style: preserve-3d;
    will-change: transform;
  }

  .drift-wall-tile {
    position: relative;
    display: block;
    flex: none;
    cursor: pointer;
    outline: none;
    width: 100%;
    height: calc(var(--dw-tile-h) + var(--dw-gap));
    transform-style: preserve-3d;
    text-decoration: none;
  }

  .drift-wall-inner {
    pointer-events: none;
    position: absolute;
    inset: calc(var(--dw-gap) / 2);
    display: block;
    overflow: hidden;
    background: #0b0b12;
    border-radius: var(--dw-radius);
    opacity: var(--dw-dim);
    transform: translateZ(0);
    transition:
      transform 420ms cubic-bezier(0.22, 1, 0.36, 1),
      opacity 420ms cubic-bezier(0.22, 1, 0.36, 1),
      box-shadow 420ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .drift-wall-tile.is-active .drift-wall-inner,
  .drift-wall-tile:focus-visible .drift-wall-inner {
    opacity: 1;
    transform: translateZ(var(--dw-lift));
    box-shadow: 0 24px 60px -18px rgba(0, 0, 0, 0.7);
  }
  .drift-wall-tile:focus-visible .drift-wall-inner {
    box-shadow:
      0 24px 60px -18px rgba(0, 0, 0, 0.7),
      0 0 0 2px rgba(255, 255, 255, 0.9);
  }

  .drift-wall-img {
    display: block;
    height: 100%;
    width: 100%;
    -webkit-user-select: none;
    user-select: none;
    object-fit: cover;
    filter: grayscale(var(--dw-gray)) saturate(0.92);
    transition: filter 420ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .drift-wall-tile.is-active .drift-wall-img,
  .drift-wall-tile:focus-visible .drift-wall-img {
    filter: grayscale(0) saturate(1.05);
  }

  .drift-wall-overlay {
    pointer-events: none;
    position: absolute;
    inset: 0;
    background: var(--dw-overlay);
    opacity: 0.42;
    transition: opacity 420ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .drift-wall-tile.is-active .drift-wall-overlay,
  .drift-wall-tile:focus-visible .drift-wall-overlay {
    opacity: 0;
  }
</style>