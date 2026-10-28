<script lang="ts" module>
	import type { AreaVariant } from './AreaPatternDefs.svelte';
	import type { DotVariant } from './ChartDot.svelte';
	import type { CurveType } from './curves';
	import type { StrokeVariant } from './chart-utils';

	export type { StrokeVariant };

	export type AreaSeries = {
		/** Series key — must exist on the data rows and in the config. */
		dataKey: string;
		/** Fill style of this area. */
		variant?: AreaVariant;
		strokeVariant?: StrokeVariant;
		strokeWidth?: number;
		curveType?: CurveType;
		connectNulls?: boolean;
		/** Clicking the area selects (or clears) the series. */
		isClickable?: boolean;
		/** Resting point marker, `false` hides it. */
		dot?: DotVariant | false;
		/** Hovered point marker, `false` hides it. */
		activeDot?: DotVariant | false;
	};
</script>

<script lang="ts">
	import ChartContainer from './ChartContainer.svelte';
	import CartesianFrame from './CartesianFrame.svelte';
	import ChartTooltip, { type TooltipOptions } from './ChartTooltip.svelte';
	import ChartLegend, { type LegendOptions } from './ChartLegend.svelte';
	import ChartBrush, { type BrushOptions, type BrushRange } from './ChartBrush.svelte';
	import ChartDot from './ChartDot.svelte';
	import type { BackgroundVariant } from './ChartBackground.svelte';
	import ChartLoadingPattern from './ChartLoadingPattern.svelte';
	import AreaPatternDefs from './AreaPatternDefs.svelte';
	import SeriesColorGradient from './SeriesColorGradient.svelte';
	import { areaPath, linePath } from './curves';
	import {
		computeCartesianLayout,
		computeValueTicks,
		resolveOptions,
		stackSeries,
		type AxisOptions,
		type GridOptions
	} from './cartesian';
	import {
		axisValueToPercentFormatter,
		toNumber,
		type ChartConfig,
		type ChartRow,
		type Margin
	} from './chart-utils';
	import { createLoadingData } from './loading.svelte';

	type Props = {
		data: ChartRow[];
		config: ChartConfig;
		/** Areas to draw. Defaults to every key of `config`. */
		series?: AreaSeries[];
		/** Category key for the x-axis, tooltip label and brush. */
		xDataKey?: string;
		class?: string;
		curveType?: CurveType;
		/** `stacked` piles areas up, `expanded` normalizes the stack to 100%. */
		stackType?: 'default' | 'stacked' | 'expanded';
		/** Defaults for every series (overridden per series). */
		variant?: AreaVariant;
		strokeVariant?: StrokeVariant;
		dot?: DotVariant | false;
		activeDot?: DotVariant | false;
		isClickable?: boolean;
		grid?: boolean | GridOptions;
		xAxis?: boolean | AxisOptions;
		yAxis?: boolean | AxisOptions;
		tooltip?: boolean | TooltipOptions;
		legend?: boolean | LegendOptions;
		brush?: boolean | BrushOptions;
		defaultSelectedDataKey?: string | null;
		onSelectionChange?: (dataKey: string | null) => void;
		/** Decorative pattern drawn behind the plot. */
		backgroundVariant?: BackgroundVariant;
		isLoading?: boolean;
		loadingPoints?: number;
		margin?: Margin;
		ariaLabel?: string;
	};

	let {
		data,
		config,
		series,
		xDataKey,
		class: className = '',
		curveType = 'linear',
		stackType = 'default',
		variant = 'gradient',
		strokeVariant = 'dashed',
		dot = false,
		activeDot = false,
		isClickable = false,
		grid = true,
		xAxis = true,
		yAxis = false,
		tooltip = true,
		legend = false,
		brush = false,
		defaultSelectedDataKey = null,
		onSelectionChange,
		backgroundVariant,
		isLoading = false,
		loadingPoints = 14,
		margin,
		ariaLabel = 'Area chart'
	}: Props = $props();

	const STROKE_WIDTH = 0.8;
	const chartId = $props.id();

	// svelte-ignore state_referenced_locally
	let selectedDataKey = $state<string | null>(defaultSelectedDataKey);
	let activeIndex = $state<number | null>(null);
	let pointer = $state<{ x: number; y: number } | null>(null);
	// svelte-ignore state_referenced_locally
	let range = $state<BrushRange>({ startIndex: 0, endIndex: Math.max(0, data.length - 1) });

	$effect(() => {
		range = { startIndex: 0, endIndex: Math.max(0, data.length - 1) };
	});

	const loading = createLoadingData(() => isLoading, { points: () => loadingPoints });

	const gridOpts = $derived(resolveOptions<GridOptions>(grid, true));
	const xAxisOpts = $derived(resolveOptions<AxisOptions>(xAxis, true));
	const yAxisOpts = $derived(resolveOptions<AxisOptions>(yAxis, false));
	const tooltipOpts = $derived(resolveOptions<TooltipOptions>(tooltip, true));
	const legendOpts = $derived(resolveOptions<LegendOptions>(legend, false));
	const brushOpts = $derived(resolveOptions<BrushOptions>(brush, false));

	const categoryKey = $derived(xDataKey ?? xAxisOpts?.dataKey);
	const isExpanded = $derived(stackType === 'expanded');
	const resolvedSeries = $derived(
		(series ?? Object.keys(config).map((dataKey): AreaSeries => ({ dataKey }))).map((s) => ({
			dataKey: s.dataKey,
			variant: s.variant ?? variant,
			strokeVariant: s.strokeVariant ?? strokeVariant,
			strokeWidth: s.strokeWidth ?? STROKE_WIDTH,
			curveType: s.curveType ?? curveType,
			connectNulls: s.connectNulls ?? false,
			isClickable: s.isClickable ?? isClickable,
			dot: s.dot ?? dot,
			activeDot: s.activeDot ?? activeDot
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
	const valueTicks = $derived(computeValueTicks(stacks, isLoading ? 'default' : stackType, yAxisOpts));

	function selectDataKey(key: string | null) {
		selectedDataKey = key;
		onSelectionChange?.(key);
	}

	function opacityFor(key: string) {
		if (selectedDataKey === null || selectedDataKey === key) return { fill: 0.8, stroke: 1, dot: 1 };
		return { fill: 0.1, stroke: 0.3, dot: 0.3 };
	}

	function categoryLabel(index: number) {
		const raw = categoryKey ? rows[index]?.[categoryKey] : index;
		const text = raw == null ? '' : String(raw);
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
				variant="area"
				{curveType}
				stacked={stackType !== 'default'}
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
			valueFormatter: isExpanded ? axisValueToPercentFormatter : undefined,
			categoryAxis: isLoading ? null : xAxisOpts,
			valueAxis: isLoading ? null : yAxisOpts,
			margin
		})}
		<CartesianFrame
			{width}
			{height}
			{layout}
			grid={gridOpts}
			{backgroundVariant}
			cursor={!isLoading && (tooltipOpts?.cursor ?? true) && tooltipOpts !== null}
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
						<SeriesColorGradient id={sid} dataKey={s.dataKey} item={config[s.dataKey]} />
						<AreaPatternDefs
							id={sid}
							dataKey={s.dataKey}
							variant={s.variant}
							unselected={selectedDataKey !== null && selectedDataKey !== s.dataKey}
						/>
					{/each}
				{/if}
			{/snippet}

			{#if isLoading}
				{@const points = rows.map((row, i) => {
					const v = toNumber(row.loading) ?? 0;
					return { x: layout.categoryPositions[i], y: layout.valueToPx(v), y0: layout.valueToPx(0) };
				})}
				<g style="mask: url(#{chartId}-loading-mask)">
					<path d={areaPath(points, curveType)} fill="currentColor" fill-opacity="0.05" class="text-foreground" />
					<path
						d={linePath(points, curveType)}
						fill="none"
						stroke="currentColor"
						stroke-opacity="0.5"
						class="text-foreground"
					/>
				</g>
			{:else}
				{#each resolvedSeries as s, index (s.dataKey)}
					{@const sid = `${chartId}-${index}`}
					{@const opacity = opacityFor(s.dataKey)}
					{@const showUnselected = selectedDataKey !== null && selectedDataKey !== s.dataKey}
					{@const points = rows.map((row, i) => {
						const pair = stacks[index]?.[i];
						if (!pair || toNumber(row[s.dataKey]) === null) return null;
						return {
							x: layout.categoryPositions[i],
							y: layout.valueToPx(pair[1]),
							y0: layout.valueToPx(pair[0])
						};
					})}
					{@const isAnimatedDashed = s.strokeVariant === 'animated-dashed'}
					{@const isDashed = s.strokeVariant === 'dashed' || isAnimatedDashed}
					<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
					<g
						style:cursor={s.isClickable ? 'pointer' : undefined}
						onclick={() => {
							if (s.isClickable) selectDataKey(selectedDataKey === s.dataKey ? null : s.dataKey);
						}}
					>
						<path
							d={areaPath(points, s.curveType, s.connectNulls)}
							fill={showUnselected ? `url(#${sid}-unselected)` : `url(#${sid}-${s.variant})`}
							fill-opacity={opacity.fill}
							stroke="none"
						/>
						<path
							d={linePath(points, s.curveType, s.connectNulls)}
							fill="none"
							stroke="url(#{sid}-colors-{s.dataKey})"
							stroke-opacity={opacity.stroke}
							stroke-width={s.strokeWidth}
							stroke-dasharray={isDashed ? '3 3' : undefined}
						>
							{#if isAnimatedDashed && selectedDataKey === null}
								<animate
									attributeName="stroke-dasharray"
									values="3 3; 0 3; 3 3"
									dur="1s"
									repeatCount="indefinite"
									keyTimes="0;0.5;1"
								/>
								<animate
									attributeName="stroke-dashoffset"
									values="0; -6"
									dur="1s"
									repeatCount="indefinite"
									keyTimes="0;1"
								/>
							{/if}
						</path>
						{#if s.dot}
							{#each points as p, i (i)}
								{#if p}
									<ChartDot
										cx={p.x}
										cy={p.y}
										variant={s.dot}
										gradientUrl="url(#{sid}-colors-{s.dataKey})"
										fillOpacity={opacity.dot}
									/>
								{/if}
							{/each}
						{/if}
					</g>
				{/each}

				{#if activeIndex !== null}
					{#each resolvedSeries as s, index (s.dataKey)}
						{@const pair = stacks[index]?.[activeIndex]}
						{#if s.activeDot && pair && toNumber(rows[activeIndex]?.[s.dataKey]) !== null}
							<ChartDot
								cx={layout.categoryPositions[activeIndex]}
								cy={layout.valueToPx(pair[1])}
								variant={s.activeDot}
								gradientUrl="url(#{chartId}-{index}-colors-{s.dataKey})"
								fillOpacity={opacityFor(s.dataKey).dot}
								class="pointer-events-none"
							/>
						{/if}
					{/each}
				{/if}
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
