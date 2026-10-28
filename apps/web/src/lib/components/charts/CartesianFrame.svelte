<script lang="ts">
	import type { BackgroundVariant } from './types';
	import type { Snippet } from 'svelte';
	import ChartBackground from './ChartBackground.svelte';
	import { nearestIndex, type CartesianLayout, type GridOptions } from './cartesian';

	/**
	 * Shared SVG frame for cartesian charts: background, grid, axes, cursor and
	 * pointer tracking. Series are rendered by the chart through `children`,
	 * the HTML tooltip through `tooltip`.
	 */
	type Props = {
		width: number;
		height: number;
		layout: CartesianLayout;
		grid: GridOptions | null;
		/** Vertical dashed cursor that follows the active category. */
		cursor?: boolean;
		backgroundVariant?: BackgroundVariant;
		/** Active category index (hovered or `defaultIndex`). */
		activeIndex?: number | null;
		/** Pointer position relative to the frame, null when outside. */
		pointer?: { x: number; y: number } | null;
		defaultIndex?: number;
		ariaLabel?: string;
		onpointerstatechange?: (inside: boolean) => void;
		defs?: Snippet;
		children: Snippet;
		tooltip?: Snippet<[{ index: number; x: number; y: number }]>;
	};

	let {
		width,
		height,
		layout,
		grid,
		cursor = false,
		backgroundVariant,
		activeIndex = $bindable(null),
		pointer = $bindable(null),
		defaultIndex,
		ariaLabel = 'Chart',
		onpointerstatechange,
		defs,
		children,
		tooltip
	}: Props = $props();

	const plot = $derived(layout.plot);
	const horizontal = $derived(layout.horizontal);

	function onPointerMove(event: PointerEvent) {
		const svg = event.currentTarget as SVGSVGElement;
		const rect = svg.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		const inside = x >= plot.left && x <= plot.right && y >= plot.top && y <= plot.bottom;
		if (!inside) {
			onPointerLeave();
			return;
		}
		pointer = { x, y };
		activeIndex = nearestIndex(layout.categoryPositions, horizontal ? y : x);
		onpointerstatechange?.(true);
	}

	function onPointerLeave() {
		pointer = null;
		activeIndex = null;
		onpointerstatechange?.(false);
	}

	const shownIndex = $derived(
		activeIndex ??
			(defaultIndex !== undefined && defaultIndex < layout.categoryPositions.length
				? defaultIndex
				: null)
	);

	const tooltipAnchor = $derived.by(() => {
		if (shownIndex === null) return null;
		if (pointer) return pointer;
		const position = layout.categoryPositions[shownIndex] ?? 0;
		return horizontal
			? { x: plot.left + plot.width / 2, y: position }
			: { x: position, y: plot.top + plot.height / 2 };
	});

	const gridLines = $derived.by(() => {
		if (!grid) return { horizontal: [] as number[], vertical: [] as number[] };
		const valueLines = layout.valueTicks.map((tick) => layout.valueToPx(tick));
		const categoryLines = layout.categoryPositions;
		const showHorizontal = grid.horizontal ?? true;
		const showVertical = grid.vertical ?? false;
		return {
			horizontal: showHorizontal ? (horizontal ? categoryLines : valueLines) : [],
			vertical: showVertical ? (horizontal ? valueLines : categoryLines) : []
		};
	});
</script>

<svg
	{width}
	{height}
	viewBox="0 0 {width} {height}"
	class="absolute inset-0 block touch-pan-y select-none"
	role="img"
	aria-label={ariaLabel}
	onpointermove={onPointerMove}
	onpointerdown={onPointerMove}
	onpointerleave={onPointerLeave}
>
	{#if defs}
		<defs>{@render defs()}</defs>
	{/if}

	{#if backgroundVariant}
		<ChartBackground variant={backgroundVariant} />
	{/if}

	{#if grid}
		<g class="stroke-foreground/10" stroke-dasharray={grid.strokeDasharray ?? '3 3'} fill="none">
			{#each gridLines.horizontal as y, i (i)}
				<line x1={plot.left} x2={plot.right} y1={y} y2={y} />
			{/each}
			{#each gridLines.vertical as x, i (i)}
				<line x1={x} x2={x} y1={plot.top} y2={plot.bottom} />
			{/each}
		</g>
	{/if}

	<!-- Horizontal (bottom) axis -->
	{#if horizontal ? layout.showValueAxis : layout.showCategoryAxis}
		{@const margin = (horizontal ? layout.valueAxis : layout.categoryAxis).tickMargin ?? 8}
		<g class="fill-foreground-muted" font-size="12">
			{#if horizontal}
				{#each layout.valueTicks as tick, i (i)}
					<text x={layout.valueToPx(tick)} y={plot.bottom + margin} dy="0.71em" text-anchor="middle">
						{layout.valueTickLabels[i]}
					</text>
				{/each}
			{:else}
				{#each layout.visibleCategoryTicks as i (i)}
					<text
						x={layout.categoryPositions[i]}
						y={plot.bottom + margin}
						dy="0.71em"
						text-anchor="middle"
					>
						{layout.categoryLabels[i]}
					</text>
				{/each}
			{/if}
		</g>
	{/if}

	<!-- Vertical (left) axis -->
	{#if horizontal ? layout.showCategoryAxis : layout.showValueAxis}
		{@const margin = (horizontal ? layout.categoryAxis : layout.valueAxis).tickMargin ?? 8}
		<g class="fill-foreground-muted" font-size="12">
			{#if horizontal}
				{#each layout.visibleCategoryTicks as i (i)}
					<text x={plot.left - margin} y={layout.categoryPositions[i]} dy="0.355em" text-anchor="end">
						{layout.categoryLabels[i]}
					</text>
				{/each}
			{:else}
				{#each layout.valueTicks as tick, i (i)}
					<text x={plot.left - margin} y={layout.valueToPx(tick)} dy="0.355em" text-anchor="end">
						{layout.valueTickLabels[i]}
					</text>
				{/each}
			{/if}
		</g>
	{/if}

	{#if cursor && shownIndex !== null}
		{@const position = layout.categoryPositions[shownIndex]}
		<line
			class="pointer-events-none stroke-foreground/30"
			stroke-width="0.8"
			stroke-dasharray="3 3"
			x1={horizontal ? plot.left : position}
			x2={horizontal ? plot.right : position}
			y1={horizontal ? position : plot.top}
			y2={horizontal ? position : plot.bottom}
		/>
	{/if}

	{@render children()}
</svg>

{#if tooltip && tooltipAnchor && shownIndex !== null}
	{@render tooltip({ index: shownIndex, x: tooltipAnchor.x, y: tooltipAnchor.y })}
{/if}
