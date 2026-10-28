<script lang="ts">
	import type { BackgroundVariant, LegendOptions, TooltipOptions } from './types';
	import ChartContainer from './ChartContainer.svelte';
	import ChartTooltip from './ChartTooltip.svelte';
	import ChartLegend from './ChartLegend.svelte';
	import ChartBackground from './ChartBackground.svelte';
	import SeriesColorGradient from './SeriesColorGradient.svelte';
	import { resolveOptions } from './cartesian';
	import {
		getNiceTicks,
		resolvePosition,
		resolveRadius,
		sectorPath,
		toNumber,
		type ChartConfig,
		type ChartRow,
		toLabel
	} from './chart-utils';

	type Props = {
		/** One bar per row. */
		data: ChartRow[];
		/** Bar colors + labels, keyed by each row's `nameKey` value. */
		config: ChartConfig;
		/** Key holding each bar's numeric value. */
		dataKey: string;
		/** Key holding each bar's name. */
		nameKey: string;
		class?: string;
		/** `full` circle or `semi` (half) circle. */
		variant?: 'full' | 'semi';
		/** Pins the value that equals a complete arc (otherwise auto). */
		max?: number;
		innerRadius?: number | string;
		outerRadius?: number | string;
		cornerRadius?: number;
		/** Thickness of each bar in px. */
		barSize?: number;
		/** Renders the unfilled track behind each bar. */
		showBackground?: boolean;
		isClickable?: boolean;
		tooltip?: boolean | TooltipOptions;
		legend?: boolean | LegendOptions;
		backgroundVariant?: BackgroundVariant;
		defaultSelectedDataKey?: string | null;
		onSelectionChange?: (selection: { dataKey: string; value: number } | null) => void;
		isLoading?: boolean;
		ariaLabel?: string;
	};

	let {
		data,
		config,
		dataKey,
		nameKey,
		class: className = '',
		variant = 'full',
		max,
		innerRadius = '30%',
		outerRadius = '100%',
		cornerRadius = 5,
		barSize = 14,
		showBackground = true,
		isClickable = false,
		tooltip = true,
		legend = false,
		backgroundVariant,
		defaultSelectedDataKey = null,
		onSelectionChange,
		isLoading = false,
		ariaLabel = 'Radial chart'
	}: Props = $props();

	const LOADING_BARS = 5;
	const LOADING_DURATION = 1500;
	const MARGIN = 5;
	const chartId = $props.id();

	// svelte-ignore state_referenced_locally
	let selectedBar = $state<string | null>(defaultSelectedDataKey);
	let hovered = $state<{ index: number; x: number; y: number } | null>(null);
	let loadingRows = $state<{ name: string; value: number }[]>([]);

	$effect(() => {
		if (!isLoading) return;
		const generate = () =>
			(loadingRows = Array.from({ length: LOADING_BARS }, (_, i) => ({
				name: `loading${String(i)}`,
				value: 40 + Math.random() * 60
			})));
		generate();
		const interval = setInterval(generate, LOADING_DURATION);
		return () => clearInterval(interval);
	});

	const tooltipOpts = $derived(resolveOptions<TooltipOptions>(tooltip, true));
	const legendOpts = $derived.by(() => {
		const opts = resolveOptions<LegendOptions>(legend, false);
		return opts ? { align: 'center' as const, verticalAlign: 'bottom' as const, ...opts } : null;
	});

	const geometry = $derived(
		variant === 'semi'
			? { startAngle: 180, endAngle: 0, cx: '50%', cy: '70%' }
			: { startAngle: 90, endAngle: -270, cx: '50%', cy: '50%' }
	);

	const rows = $derived(
		isLoading
			? loadingRows
			: data.map((row) => ({ name: toLabel(row[nameKey]), value: toNumber(row[dataKey]) ?? 0 }))
	);
	const names = $derived(data.map((row) => toLabel(row[nameKey])));
	const domainMax = $derived.by(() => {
		if (isLoading) return 100;
		if (max != null && max > 0) return max;
		const ticks = getNiceTicks(0, Math.max(0, ...rows.map((row) => row.value)), 5);
		return ticks[ticks.length - 1] || 1;
	});

	function selectBar(name: string | null) {
		selectedBar = name;
		if (name === null) {
			onSelectionChange?.(null);
			return;
		}
		onSelectionChange?.({ dataKey: name, value: rows.find((row) => row.name === name)?.value ?? 0 });
	}

	function pointerOf(event: PointerEvent) {
		const svg = (event.currentTarget as SVGElement).ownerSVGElement;
		const rect = (svg ?? (event.currentTarget as Element)).getBoundingClientRect();
		return { x: event.clientX - rect.left, y: event.clientY - rect.top };
	}
</script>

<ChartContainer id={chartId} {config} class={className} {isLoading}>
	{#snippet header()}
		{#if legendOpts && legendOpts.verticalAlign === 'top' && !isLoading}
			<ChartLegend {config} keys={names} selected={selectedBar} onSelectChange={selectBar} options={legendOpts} />
		{/if}
	{/snippet}

	{#snippet bottom()}
		{#if legendOpts && legendOpts.verticalAlign !== 'top' && !isLoading}
			<ChartLegend {config} keys={names} selected={selectedBar} onSelectChange={selectBar} options={legendOpts} />
		{/if}
	{/snippet}

	{#snippet children({ width, height }: { width: number; height: number })}
		{@const cx = MARGIN + resolvePosition(geometry.cx, width - MARGIN * 2)}
		{@const cy = MARGIN + resolvePosition(geometry.cy, height - MARGIN * 2)}
		{@const maxRadius = Math.min(width - MARGIN * 2, height - MARGIN * 2) / 2}
		{@const ri = resolveRadius(innerRadius, maxRadius)}
		{@const ro = resolveRadius(outerRadius, maxRadius)}
		{@const band = rows.length ? (ro - ri) / rows.length : 0}
		{@const thickness = Math.min(barSize, band)}
		{@const sweep = geometry.endAngle - geometry.startAngle}
		<svg
			{width}
			{height}
			viewBox="0 0 {width} {height}"
			class="absolute inset-0 block"
			role="img"
			aria-label={ariaLabel}
			onpointerleave={() => (hovered = null)}
		>
			<defs>
				{#each Object.entries(config) as [key, item] (key)}
					<SeriesColorGradient
						id={chartId}
						dataKey={key}
						{item}
						direction="diagonal"
						gradientId="{chartId}-radial-colors-{key}"
					/>
				{/each}
			</defs>

			{#if backgroundVariant}
				<ChartBackground variant={backgroundVariant} />
			{/if}

			{#each rows as row, i (row.name)}
				{@const inner = ri + band * i + (band - thickness) / 2}
				{@const outer = inner + thickness}
				{@const end = geometry.startAngle + sweep * Math.min(1, Math.max(0, row.value) / domainMax)}
				{@const isDimmed = isClickable && selectedBar !== null && selectedBar !== row.name}
				{#if showBackground || isLoading}
					<path
						d={sectorPath({
							cx,
							cy,
							innerRadius: inner,
							outerRadius: outer,
							startAngle: geometry.startAngle,
							endAngle: geometry.endAngle,
							cornerRadius
						})}
						class="fill-background-muted"
					/>
				{/if}
				{#if isLoading}
					<path
						class="chart-morph text-foreground"
						d={sectorPath({
							cx,
							cy,
							innerRadius: inner,
							outerRadius: outer,
							startAngle: geometry.startAngle,
							endAngle: end,
							cornerRadius
						})}
						fill="currentColor"
						fill-opacity="0.25"
					/>
				{:else}
					<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
					<path
						d={sectorPath({
							cx,
							cy,
							innerRadius: inner,
							outerRadius: outer,
							startAngle: geometry.startAngle,
							endAngle: end,
							cornerRadius
						})}
						fill="url(#{chartId}-radial-colors-{row.name})"
						opacity={isDimmed ? 0.15 : 1}
						class="drop-shadow-sm transition-opacity duration-200"
						style:cursor={isClickable ? 'pointer' : undefined}
						onpointermove={(event) => (hovered = { index: i, ...pointerOf(event) })}
						onclick={() => {
							if (isClickable) selectBar(selectedBar === row.name ? null : row.name);
						}}
					/>
				{/if}
			{/each}
		</svg>

		{#if tooltipOpts && !isLoading}
			{@const defaultIndex = tooltipOpts.defaultIndex}
			{@const shown =
				hovered ??
				(defaultIndex !== undefined && rows[defaultIndex]
					? { index: defaultIndex, x: cx, y: cy }
					: null)}
			{#if shown}
				{@const row = rows[shown.index]}
				<ChartTooltip
					x={shown.x}
					y={shown.y}
					boundsWidth={width}
					boundsHeight={height}
					hideLabel
					options={tooltipOpts}
					items={[
						{
							key: row.name,
							name: config[row.name]?.label ?? row.name,
							value: data[shown.index]?.[dataKey],
							item: config[row.name]
						}
					]}
				/>
			{/if}
		{/if}
	{/snippet}
</ChartContainer>
