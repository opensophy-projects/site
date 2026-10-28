<script lang="ts" module>
	import type {
		BackgroundVariant,
		BarVariant,
		BrushOptions,
		BrushRange,
		LegendOptions,
		TooltipOptions
	} from './types';

	export type BarSeries = {
		/** Series key — must exist on the data rows and in the config. */
		dataKey: string;
		/** Fill style of this bar series. */
		variant?: BarVariant;
		/** Corner radius — falls back to the chart `barRadius`. */
		radius?: number;
		/** Clicking a bar selects (or clears) the series. */
		isClickable?: boolean;
		/** Dims every bar except the hovered category. */
		enableHoverHighlight?: boolean;
		/** Soft outer glow around the bars. */
		glowing?: boolean;
		/** Renders the last data point as a hatched "buffer" bar. */
		bufferBar?: boolean;
	};
</script>

<script lang="ts">
	import ChartContainer from './ChartContainer.svelte';
	import CartesianFrame from './CartesianFrame.svelte';
	import ChartTooltip from './ChartTooltip.svelte';
	import ChartLegend from './ChartLegend.svelte';
	import ChartBrush from './ChartBrush.svelte';
	import ChartLoadingPattern from './ChartLoadingPattern.svelte';
	import BarPatternDefs from './BarPatternDefs.svelte';
	import SeriesColorGradient from './SeriesColorGradient.svelte';
	import GlowFilter from './GlowFilter.svelte';
	import {
		computeBarSlots,
		computeCartesianLayout,
		computeValueTicks,
		resolveOptions,
		stackSeries,
		type AxisOptions,
		type GridOptions
	} from './cartesian';
	import {
		axisValueToPercentFormatter,
		roundedRectPath,
		toNumber,
		type ChartConfig,
		type ChartRow,
		type Margin,
		toLabel
	} from './chart-utils';
	import { createLoadingData } from './loading.svelte';

	type Props = {
		data: ChartRow[];
		config: ChartConfig;
		/** Bars to draw. Defaults to every key of `config`. */
		series?: BarSeries[];
		/** Category key for the category axis, tooltip label and brush. */
		xDataKey?: string;
		class?: string;
		/** `stacked` piles bars up, `percent` normalizes each stack to 100%. */
		stackType?: 'default' | 'stacked' | 'percent';
		/** `horizontal` lays bars out left-to-right with categories on the y-axis. */
		layout?: 'vertical' | 'horizontal';
		barRadius?: number;
		barGap?: number;
		barCategoryGap?: number | string;
		/** Defaults for every series (overridden per series). */
		variant?: BarVariant;
		isClickable?: boolean;
		enableHoverHighlight?: boolean;
		glowing?: boolean;
		bufferBar?: boolean;
		grid?: boolean | GridOptions;
		/** Bottom axis (categories, or values when horizontal). */
		xAxis?: boolean | AxisOptions;
		/** Left axis (values, or categories when horizontal). */
		yAxis?: boolean | AxisOptions;
		tooltip?: boolean | TooltipOptions;
		legend?: boolean | LegendOptions;
		brush?: boolean | BrushOptions;
		backgroundVariant?: BackgroundVariant;
		defaultSelectedDataKey?: string | null;
		onSelectionChange?: (dataKey: string | null) => void;
		isLoading?: boolean;
		loadingBars?: number;
		margin?: Margin;
		ariaLabel?: string;
	};

	let {
		data,
		config,
		series,
		xDataKey,
		class: className = '',
		stackType = 'default',
		layout: barLayout = 'vertical',
		barRadius = 2,
		barGap = 4,
		barCategoryGap = '10%',
		variant = 'default',
		isClickable = false,
		enableHoverHighlight = false,
		glowing = false,
		bufferBar = false,
		grid = true,
		xAxis,
		yAxis,
		tooltip = true,
		legend = false,
		brush = false,
		backgroundVariant,
		defaultSelectedDataKey = null,
		onSelectionChange,
		isLoading = false,
		loadingBars = 12,
		margin,
		ariaLabel = 'Bar chart'
	}: Props = $props();

	const chartId = $props.id();

	// svelte-ignore state_referenced_locally
	let selectedDataKey = $state<string | null>(defaultSelectedDataKey);
	let activeIndex = $state<number | null>(null);
	let pointer = $state<{ x: number; y: number } | null>(null);
	// Resets to the full range whenever the data changes; the brush overrides it.
	let range = $derived<BrushRange>({ startIndex: 0, endIndex: Math.max(0, data.length - 1) });

	const loading = createLoadingData(() => isLoading, {
		points: () => loadingBars,
		min: 20,
		max: 80
	});

	const isHorizontal = $derived(barLayout === 'horizontal');
	const isStacked = $derived(stackType !== 'default');
	const isPercent = $derived(stackType === 'percent');

	const gridOpts = $derived.by(() => {
		const opts = resolveOptions<GridOptions>(grid, true);
		if (!opts) return null;
		return {
			...opts,
			vertical: opts.vertical ?? isHorizontal,
			horizontal: opts.horizontal ?? !isHorizontal
		};
	});
	const xAxisOpts = $derived(resolveOptions<AxisOptions>(xAxis, !isHorizontal));
	const yAxisOpts = $derived(resolveOptions<AxisOptions>(yAxis, isHorizontal));
	const categoryAxisOpts = $derived(isHorizontal ? yAxisOpts : xAxisOpts);
	const valueAxisOpts = $derived(isHorizontal ? xAxisOpts : yAxisOpts);
	const tooltipOpts = $derived(resolveOptions<TooltipOptions>(tooltip, true));
	const legendOpts = $derived(resolveOptions<LegendOptions>(legend, false));
	const brushOpts = $derived(resolveOptions<BrushOptions>(brush, false));
	const categoryKey = $derived(xDataKey ?? categoryAxisOpts?.dataKey);

	const resolvedSeries = $derived(
		(series ?? Object.keys(config).map((dataKey): BarSeries => ({ dataKey }))).map((s) => ({
			dataKey: s.dataKey,
			variant: s.variant ?? variant,
			radius: s.radius ?? barRadius,
			isClickable: s.isClickable ?? isClickable,
			enableHoverHighlight: s.enableHoverHighlight ?? enableHoverHighlight,
			glowing: s.glowing ?? glowing,
			bufferBar: s.bufferBar ?? bufferBar
		}))
	);
	const keys = $derived(resolvedSeries.map((s) => s.dataKey));

	const visibleData = $derived(
		brushOpts && !isLoading ? data.slice(range.startIndex, range.endIndex + 1) : data
	);
	const rows = $derived(isLoading ? (loading.data as ChartRow[]) : visibleData);
	const stacks = $derived(
		isLoading ? stackSeries(rows, ['loading'], 'default') : stackSeries(rows, keys, stackType)
	);
	const valueTicks = $derived(
		computeValueTicks(stacks, isLoading ? 'default' : stackType, valueAxisOpts)
	);

	function selectDataKey(key: string | null) {
		selectedDataKey = key;
		onSelectionChange?.(key);
	}

	function barOpacity(s: (typeof resolvedSeries)[number], index: number) {
		const isSelectedKey = selectedDataKey === null || selectedDataKey === s.dataKey;
		const clickOpacity = s.isClickable && selectedDataKey !== null ? (isSelectedKey ? 1 : 0.15) : 1;
		if (s.enableHoverHighlight && activeIndex !== null) {
			return activeIndex === index ? clickOpacity : clickOpacity * 0.3;
		}
		return clickOpacity;
	}

	function fillFor(s: (typeof resolvedSeries)[number], sid: string) {
		return s.variant === 'default'
			? `url(#${sid}-colors-${s.dataKey})`
			: `url(#${sid}-${s.variant}-${s.dataKey})`;
	}

	function categoryLabel(index: number) {
		const raw = categoryKey ? rows[index]?.[categoryKey] : index;
		const text = toLabel(raw);
		return config[text]?.label ?? text;
	}
</script>

<ChartContainer id={chartId} {config} class={className} {isLoading} hasFooter={!!brushOpts}>
	{#snippet header()}
		{#if legendOpts && (legendOpts.verticalAlign ?? 'top') === 'top'}
			<ChartLegend {config} {keys} selected={selectedDataKey} onSelectChange={selectDataKey} options={legendOpts} />
		{/if}
	{/snippet}

	{#snippet bottom()}
		{#if legendOpts && legendOpts.verticalAlign === 'bottom'}
			<ChartLegend {config} {keys} selected={selectedDataKey} onSelectChange={selectDataKey} options={legendOpts} />
		{/if}
	{/snippet}

	{#snippet footer()}
		{#if brushOpts && !isLoading}
			<ChartBrush
				{data}
				{config}
				{keys}
				xDataKey={categoryKey}
				variant="bar"
				{barRadius}
				stacked={isStacked}
				options={brushOpts}
				bind:range
				class="mt-1"
			/>
		{/if}
	{/snippet}

	{#snippet children({ width, height }: { width: number; height: number })}
		{@const layout = computeCartesianLayout({
			width,
			height,
			rows,
			categoryKey,
			valueTicks,
			valueFormatter: isPercent ? axisValueToPercentFormatter : undefined,
			categoryAxis: isLoading ? null : categoryAxisOpts,
			valueAxis: isLoading ? null : valueAxisOpts,
			horizontal: isHorizontal,
			band: true,
			margin
		})}
		{@const slots = computeBarSlots({
			bandSize: layout.bandSize,
			slots: isStacked || isLoading ? 1 : resolvedSeries.length,
			barGap,
			barCategoryGap
		})}
		{@const barRect = (pair: [number, number], index: number, slot: number) => {
			const a = layout.valueToPx(pair[0]);
			const b = layout.valueToPx(pair[1]);
			const start = layout.categoryPositions[index] + slots.offsetFor(slot);
			return isHorizontal
				? { x: Math.min(a, b), y: start, width: Math.abs(b - a), height: slots.size }
				: { x: start, y: Math.min(a, b), width: slots.size, height: Math.abs(b - a) };
		}}
		<CartesianFrame
			{width}
			{height}
			{layout}
			grid={gridOpts}
			{backgroundVariant}
			cursor={false}
			defaultIndex={tooltipOpts?.defaultIndex}
			bind:activeIndex
			bind:pointer
			{ariaLabel}
		>
			{#snippet defs()}
				{#if isLoading}
					<ChartLoadingPattern id={chartId} />
				{:else}
					{#each resolvedSeries as s, index (s.dataKey)}
						{@const sid = `${chartId}-${index}`}
						<SeriesColorGradient
							id={sid}
							dataKey={s.dataKey}
							item={config[s.dataKey]}
							direction="vertical"
						/>
						<BarPatternDefs
							id={sid}
							dataKey={s.dataKey}
							item={config[s.dataKey]}
							variant={s.variant}
							buffer={s.bufferBar}
						/>
						{#if s.glowing}
							<GlowFilter id="{sid}-bar-glow-{s.dataKey}" stdDeviation={8} alpha={0.5} region={100} />
						{/if}
					{/each}
				{/if}
			{/snippet}

			{#if isLoading}
				<g style="mask: url(#{chartId}-loading-mask)" class="text-foreground">
					{#each stacks[0] ?? [] as pair, i (i)}
						{#if pair}
							{@const r = barRect(pair, i, 0)}
							<path
								d={roundedRectPath(r.x, r.y, r.width, r.height, barRadius)}
								fill="currentColor"
								fill-opacity="0.15"
							/>
						{/if}
					{/each}
				</g>
			{:else}
				{#each resolvedSeries as s, index (s.dataKey)}
					{@const sid = `${chartId}-${index}`}
					{@const isStripped = s.variant === 'stripped'}
					<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
					<g
						style:cursor={s.isClickable || s.enableHoverHighlight ? 'pointer' : undefined}
						onclick={() => {
							if (s.isClickable) selectDataKey(selectedDataKey === s.dataKey ? null : s.dataKey);
						}}
					>
						{#each stacks[index] ?? [] as pair, i (i)}
							{#if pair && toNumber(rows[i]?.[s.dataKey]) !== null}
								{@const r = barRect(pair, i, isStacked ? 0 : index)}
								{@const isLastBar = s.bufferBar && i === rows.length - 1}
								{@const fill = isLastBar ? `url(#${sid}-buffer-hatched-${s.dataKey})` : fillFor(s, sid)}
								<g>
									<rect x={r.x} y={r.y} width={r.width} height={r.height} fill="transparent" />
									<path
										d={roundedRectPath(
											r.x,
											r.y,
											r.width,
											Math.max(0, r.height - 3),
											isStripped ? [s.radius, s.radius, 0, 0] : s.radius
										)}
										opacity={barOpacity(s, i)}
										{fill}
										filter={s.glowing ? `url(#${sid}-bar-glow-${s.dataKey})` : undefined}
										stroke={isLastBar ? `url(#${sid}-colors-${s.dataKey})` : undefined}
										stroke-width={isLastBar ? 1 : undefined}
										class="transition-opacity duration-200"
									/>
									{#if isStripped}
										<path
											d={roundedRectPath(r.x, r.y - 4, r.width, 2, 1)}
											fill="url(#{sid}-colors-{s.dataKey})"
											opacity={barOpacity(s, i)}
											class="transition-opacity duration-200"
										/>
									{/if}
								</g>
							{/if}
						{/each}
					</g>
				{/each}
			{/if}

			{#snippet tooltip({ index, x, y }: { index: number; x: number; y: number })}
				{#if tooltipOpts && !isLoading}
					<ChartTooltip
						{x}
						{y}
						boundsWidth={width}
						boundsHeight={height}
						label={categoryLabel(index)}
						options={tooltipOpts}
						items={resolvedSeries
							.filter((s) => rows[index]?.[s.dataKey] != null)
							.map((s) => ({
								key: s.dataKey,
								name: config[s.dataKey]?.label ?? s.dataKey,
								value: rows[index]?.[s.dataKey],
								item: config[s.dataKey],
								dimmed: selectedDataKey !== null && selectedDataKey !== s.dataKey
							}))}
					/>
				{/if}
			{/snippet}
		</CartesianFrame>
	{/snippet}
</ChartContainer>
