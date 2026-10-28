<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils/cn';
	import { buildChartStyle, validateChartConfigColors, type ChartConfig } from './chart-utils';

	type Props = {
		/** Colon-free id used by `data-chart` and the generated color variables. */
		id: string;
		config: ChartConfig;
		class?: string;
		/** Shows the "Loading" badge above the chart. */
		isLoading?: boolean;
		/** Rendered above the plot (e.g. a top legend). */
		header?: Snippet;
		/** Rendered below the plot inside the measured area (e.g. a bottom legend). */
		bottom?: Snippet;
		/** Rendered after the measured area (e.g. the brush). */
		footer?: Snippet;
		/** Drops the default 16:9 aspect ratio (a footer/brush is shown). */
		hasFooter?: boolean;
		/** Plot renderer, receives the measured size of the plot area. */
		children: Snippet<[{ width: number; height: number }]>;
	};

	let {
		id,
		config,
		class: className = '',
		isLoading = false,
		header,
		bottom,
		footer,
		hasFooter = false,
		children
	}: Props = $props();

	let width = $state(0);
	let height = $state(0);

	const css = $derived.by(() => {
		validateChartConfigColors(config);
		return buildChartStyle(id, config);
	});
</script>

<div
	data-slot="chart"
	data-chart={id}
	class={cn(
		'chart-root relative flex min-h-0 w-full flex-1 flex-col justify-center text-xs',
		!hasFooter && 'aspect-video',
		className
	)}
>
	{#if css}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html `<style>${css}</style>`}
	{/if}

	{#if isLoading}
		<div class="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
			<div
				class="flex items-center justify-center gap-2 rounded-md border border-border bg-background px-2 py-0.5 text-sm text-foreground"
			>
				<div
					class="h-3 w-3 animate-spin rounded-full border border-border border-t-foreground"
				></div>
				<span>Загрузка</span>
			</div>
		</div>
	{/if}

	{#if header}
		{@render header()}
	{/if}

	<div class="relative min-h-0 w-full flex-1" bind:clientWidth={width} bind:clientHeight={height}>
		{#if width > 0 && height > 0}
			{@render children({ width, height })}
		{/if}
	</div>

	{#if bottom}
		{@render bottom()}
	{/if}

	{#if footer}
		{@render footer()}
	{/if}
</div>

<style>
	.chart-root :global(svg) {
		overflow: visible;
	}
	.chart-root :global(svg *:focus) {
		outline: none;
	}
	/* Loading skeleton pulse (pie / radial / sankey) */
	.chart-root :global(.chart-pulse) {
		opacity: 0.15;
		animation: chart-pulse var(--chart-pulse-duration, 2s) ease-in-out infinite;
	}
	.chart-root :global(.chart-pulse-soft) {
		opacity: 0.04;
		animation: chart-pulse-soft var(--chart-pulse-duration, 2s) ease-in-out infinite;
	}
	/* Skeleton shapes morph between random values instead of jumping */
	.chart-root :global(.chart-morph) {
		transition: d 1.5s ease-in-out;
	}
	@keyframes chart-pulse {
		0%,
		100% {
			opacity: 0.15;
		}
		50% {
			opacity: 0.5;
		}
	}
	@keyframes chart-pulse-soft {
		0%,
		100% {
			opacity: 0.04;
		}
		50% {
			opacity: 0.14;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.chart-root :global(.chart-pulse),
		.chart-root :global(.chart-pulse-soft) {
			animation: none;
		}
		.chart-root :global(.chart-morph) {
			transition: none;
		}
	}
</style>
