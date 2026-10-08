<script lang="ts">
	import { onMount, tick, type Snippet } from 'svelte';
	import type { Orientation, Align, JunctionMarker } from './types';

	let { orientation = 'vertical', align = 'center', junctionMarker = 'square', canvas = false, children }: { orientation?: Orientation; align?: Align; junctionMarker?: JunctionMarker; canvas?: boolean; children: Snippet } = $props();

	let root: HTMLDivElement;
	let paths = $state<string[]>([]);
	let resizeObserver: ResizeObserver;

	function updateConnections() {
		if (!root) return;
		const bounds = root.getBoundingClientRect();
		const items = [...root.querySelectorAll<HTMLElement>('[data-flow-node]')];
		paths = items.slice(0, -1).map((item, index) => {
			const next = items[index + 1];
			const a = item.getBoundingClientRect();
			const b = next.getBoundingClientRect();
			if (orientation === 'horizontal') {
				const x1 = a.right - bounds.left;
				const y1 = a.top + a.height / 2 - bounds.top;
				const x2 = b.left - bounds.left;
				const y2 = b.top + b.height / 2 - bounds.top;
				return `M ${x1} ${y1} C ${x1 + 36} ${y1}, ${x2 - 36} ${y2}, ${x2} ${y2}`;
			}
			const x1 = a.left + a.width / 2 - bounds.left;
			const y1 = a.bottom - bounds.top;
			const x2 = b.left + b.width / 2 - bounds.left;
			const y2 = b.top - bounds.top;
			const middle = y1 + (y2 - y1) / 2;
			return `M ${x1} ${y1} C ${x1} ${middle}, ${x2} ${middle}, ${x2} ${y2}`;
		});
	}

	onMount(async () => {
		await tick();
		updateConnections();
		resizeObserver = new ResizeObserver(updateConnections);
		resizeObserver.observe(root);
		window.addEventListener('resize', updateConnections);
		return () => {
			resizeObserver?.disconnect();
			window.removeEventListener('resize', updateConnections);
		};
	});
</script>

<div bind:this={root} class="flow-root" class:flow-canvas={canvas}>
	<svg class="flow-connectors" aria-hidden="true">
		<defs>
			<marker id="flow-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
				<path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
			</marker>
		</defs>
		{#each paths as path}
			<path d={path} marker-end={junctionMarker === 'none' ? undefined : 'url(#flow-arrow)'} />
		{/each}
	</svg>
	<div class="flow-content" class:flow-horizontal={orientation === 'horizontal'} class:flow-start={align === 'start'}>
		{@render children?.()}
	</div>
</div>

<style>
	.flow-root { position: relative; width: 100%; min-height: 100%; padding: 2.5rem; overflow: auto; }
	.flow-canvas { cursor: grab; }
	.flow-canvas:active { cursor: grabbing; }
	.flow-connectors { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; color: var(--accent, #a3e635); pointer-events: none; z-index: 0; }
	.flow-connectors path { fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-dasharray: 5 5; opacity: .8; }
	.flow-content { position: relative; z-index: 1; display: flex; width: max-content; min-width: 100%; flex-direction: column; align-items: center; gap: 2.75rem; }
	.flow-content.flow-horizontal { min-width: max-content; flex-direction: row; align-items: center; }
	.flow-content.flow-start { align-items: flex-start; }
</style>
