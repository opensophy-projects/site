<script lang="ts">
 import { onMount, type Snippet } from 'svelte';
 import type { Orientation, Align, JunctionMarker } from './types';
 export let orientation: Orientation = 'vertical';
 export let align: Align = 'center';
 export let junctionMarker: JunctionMarker = 'square';
 export let canvas = false;
 export let children: Snippet;
 let root: HTMLDivElement;
 let nodes: HTMLElement[] = [];
 let connectors: string[] = [];
 const update = () => {
  if (!root) return;
  const base = root.getBoundingClientRect();
  const items = [...root.querySelectorAll<HTMLElement>('[data-flow-node]')];
  nodes = items;
  connectors = items.slice(0, -1).map((item, index) => {
   const a = item.getBoundingClientRect(); const b = items[index + 1].getBoundingClientRect();
   const x1 = (a.left + a.width / 2) - base.left; const x2 = (b.left + b.width / 2) - base.left;
   const y1 = a.bottom - base.top; const y2 = b.top - base.top;
   return orientation === 'horizontal' ? `M ${a.right-base.left} ${a.top+a.height/2-base.top} L ${b.left-base.left} ${b.top+b.height/2-base.top}` : `M ${x1} ${y1} L ${x1} ${(y1+y2)/2} L ${x2} ${(y1+y2)/2} L ${x2} ${y2}`;
  });
 };
 onMount(() => { update(); const observer = new ResizeObserver(update); observer.observe(root); window.addEventListener('resize', update); return () => { observer.disconnect(); window.removeEventListener('resize', update); }; });
</script>
<div bind:this={root} class="relative overflow-hidden" class:cursor-grab={canvas}>
 <svg class="pointer-events-none absolute inset-0 z-0 h-full w-full text-kumo-inactive" aria-hidden="true">
  <defs><marker id="flow-arrow" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto"><path d="M0 0L6 4L0 8Z" fill="currentColor"/></marker></defs>
  {#each connectors as path}<path d={path} fill="none" stroke="currentColor" stroke-width="2" marker-end="url(#flow-arrow)"/>{/each}
 </svg>
 <div class:mx-auto={align === 'center'} class="relative z-10 flex gap-6" class:flex-col={orientation === 'vertical'} class:flex-row={orientation === 'horizontal'}>
  {@render children?.()}
 </div>
</div>
<style>:global(.kumo-flow-node) { position: relative; }</style>
