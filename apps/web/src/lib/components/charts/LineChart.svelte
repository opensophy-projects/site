<script lang="ts" module>
	import type { DotVariant } from './ChartDot.svelte';
	import type { CurveType } from './curves';
	import type { StrokeVariant } from './chart-utils';

	export type LineSeries = {
		/** Series key — must exist on the data rows and in the config. */
		dataKey: string;
		strokeVariant?: StrokeVariant;
		strokeWidth?: number;
		curveType?: CurveType;
		connectNulls?: boolean;
		/** Clicking the line selects (or clears) the series. */
		isClickable?: boolean;
		/** Soft outer glow around the line. */
		glowing?: boolean;
		/** Draws the last segment dashed — an unfinished "buffer" period. */
		enableBufferLine?: boolean;
		dot?: DotVariant | false;
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
	import SeriesColorGradient from './SeriesColorGradient.svelte';
	import GlowFilter from './GlowFilter.svelte';
	import { linePath } from './curves';
	import { bufferLine } from './buffer-line';
	import {
		computeCartesianLayout,
		computeValueTicks,
		resolveOptions,
		stackSeries,
		type AxisOptions,
		type GridOptions
	} from './cartesian';
	import { toNumber, type ChartConfig, type ChartRow, type Margin } from './chart-utils';
	import { createLoadingData } from './loading.svelte';

	type Props = {
		data: ChartRow[];
		config: ChartConfig;
		/** Lines to draw. Defaults to every key of `config`. */
		series?: LineSeries[];
		/** Category key for the x-axis, tooltip label and brush. */
		xDataKey?: string;
		class?: string;
		curveType?: CurveType;
		/** Defaults for every series (overridden per series). */
		strokeVariant?: StrokeVariant;
		dot?: DotVariant | false;
		activeDot?: DotVariant | false;
		isClickable?: boolean;
		glowing?: boolean;
		grid?: boolean | GridOptions;
		xAxis?: boolean | AxisOptions;
		yAxis?: boolean | AxisOptions;
		tooltip?: boolean | TooltipOptions;
		legend?: boolean | LegendOptions;
		brush?: boolean | BrushOptions;
		backgroundVariant?: BackgroundVariant;
		defaultSelectedDataKey?: string | null;
		onSelectionChange?: (dataKey: string | null) => void;
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
		strokeVariant = 'solid',
		dot = false,
		activeDot = false,
		isClickable = false,
		glowing = false,
		grid = true,
		xAxis = true,
		yAxis = false,
		tooltip = true,
		legend = false,
		brush = false,
		backgroundVariant,
		defaultSelectedDataKey = null,
		onSelectionChange,
		isLoading = false,
		loadingPoints = 14,
		margin,
		ariaLabel = 'Line chart'
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

	const resolvedSeries = $derived(
		(series ?? Object.keys(config).map((dataKey): LineSeries => ({ dataKey }))).map((s) => ({
			dataKey: s.dataKey,
			strokeVariant: s.strokeVariant ?? strokeVariant,
			strokeWidth: s.strokeWidth ?? STROKE_WIDTH,
			curveType: s.curveType ?? curveType,
			connectNulls: s.connectNulls ?? false,
			isClickable: s.isClickable ?? isClickable,
			glowing: s.glowing ?? glowing,
			enableBufferLine: s.enableBufferLine ?? false,
			dot: s.dot ?? dot,
			activeDot: s.activeDot ?? activeDot
		}))
	);
	const keys = $derived(resolvedSeries.map((s) => s.dataKey));

	const visibleData = $derived(
		brushOpts && !isLoading ? data.slice(range.startIndex, range.endIndex + 1) : data
	);
	const rows = $derived(isLoading ? (loading.data as ChartRow[]) : visibleData);
	const stacks = $derived(stackSeries(rows, isLoading ? ['loading'] : keys, 'default'));
	const valueTicks = $derived(computeValueTicks(stacks, 'default', yAxisOpts));

	function selectDataKey(key: string | null) {
		selectedDataKey = key;
		onSelectionChange?.(key);
	}

	function toggle(key: string) {
		selectDataKey(selectedDataKey === key ? null : key);
	}

	function opacityFor(key: string) {
		if (selectedDataKey === null || selectedDataKey === key) return { stroke: 1, dot: 1 };
		return { stroke: 0.3, dot: 0.3 };
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
				variant="line"
				{curveType}
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
			cursor={!isLoading && tooltipOpts !== null && (tooltipOpts.cursor ?? true)}
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
						{#if s.glowing}
							<GlowFilter id="{sid}-glow-{s.dataKey}" stdDeviation={10} alpha={2} region={50} />
						{/if}
					{/each}
				{/if}
			{/snippet}

			{#if isLoading}
				{@const points = rows.map((row, i) => ({
					x: layout.categoryPositions[i],
					y: layout.valueToPx(toNumber(row.loading) ?? 0)
				}))}
				<path
					d={linePath(points, curveType)}
					fill="none"
					stroke="currentColor"
					stroke-opacity="0.5"
					class="text-foreground"
					style="mask: url(#{chartId}-loading-mask)"
				/>
			{:else}
				{#each resolvedSeries as s, index (s.dataKey)}
					{@const sid = `${chartId}-${index}`}
					{@const opacity = opacityFor(s.dataKey)}
					{@const points = rows.map((row, i) => {
						const value = toNumber(row[s.dataKey]);
						return value === null
							? null
							: { x: layout.categoryPositions[i], y: layout.valueToPx(value) };
					})}
					{@const d = linePath(points, s.curveType, s.connectNulls)}
					{@const drawn = points.filter((p) => p !== null)}
					{@const isAnimatedDashed = s.strokeVariant === 'animated-dashed'}
					{@const isDashed = s.strokeVariant === 'dashed' || isAnimatedDashed}
					<g>
						{#if s.isClickable}
							<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
							<path
								{d}
								fill="none"
								stroke="transparent"
								stroke-width="15"
								style="cursor: pointer"
								onclick={() => toggle(s.dataKey)}
							/>
						{/if}
						<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
						<path
							{d}
							fill="none"
							stroke="url(#{sid}-colors-{s.dataKey})"
							stroke-opacity={opacity.stroke}
							stroke-width={s.strokeWidth}
							stroke-dasharray={!s.enableBufferLine && isDashed ? '5 5' : undefined}
							filter={s.glowing ? `url(#${sid}-glow-${s.dataKey})` : undefined}
							style:cursor={s.isClickable ? 'pointer' : undefined}
							onclick={() => {
								if (s.isClickable) toggle(s.dataKey);
							}}
							use:bufferLine={{
								splitX: s.enableBufferLine && drawn.length >= 2 ? drawn[drawn.length - 2].x : null,
								d
							}}
						>
							{#if isAnimatedDashed && selectedDataKey === null && !s.enableBufferLine}
								<animate
									attributeName="stroke-dasharray"
									values="5 5; 0 5; 5 5"
									dur="1s"
									repeatCount="indefinite"
									keyTimes="0;0.5;1"
								/>
								<animate
									attributeName="stroke-dashoffset"
									values="0; -10"
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
										class="pointer-events-none"
									/>
								{/if}
							{/each}
						{/if}
					</g>
				{/each}

				{#if activeIndex !== null}
					{#each resolvedSeries as s, index (s.dataKey)}
						{@const value = toNumber(rows[activeIndex]?.[s.dataKey])}
						{#if s.activeDot && value !== null}
							<ChartDot
								cx={layout.categoryPositions[activeIndex]}
								cy={layout.valueToPx(value)}
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
