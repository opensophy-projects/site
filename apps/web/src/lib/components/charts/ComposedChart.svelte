<script lang="ts" module>
	import type { BarVariant } from './BarPatternDefs.svelte';
	import type { DotVariant } from './ChartDot.svelte';
	import type { CurveType } from './curves';
	import type { StrokeVariant } from './chart-utils';

	export type ComposedSeries =
		| {
				type: 'bar';
				dataKey: string;
				variant?: BarVariant;
				radius?: number;
				/** Soft neon glow around the bars. */
				glow?: boolean;
				isClickable?: boolean;
				/** Dims every column except the hovered one. */
				enableHoverHighlight?: boolean;
		  }
		| {
				type: 'line';
				dataKey: string;
				strokeVariant?: StrokeVariant;
				curveType?: CurveType;
				connectNulls?: boolean;
				/** Soft neon glow around the line. */
				glow?: boolean;
				isClickable?: boolean;
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
	import BarPatternDefs from './BarPatternDefs.svelte';
	import SeriesColorGradient from './SeriesColorGradient.svelte';
	import GlowFilter from './GlowFilter.svelte';
	import { linePath } from './curves';
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
		roundedRectPath,
		toNumber,
		type ChartConfig,
		type ChartRow,
		type Margin
	} from './chart-utils';
	import { createLoadingData } from './loading.svelte';

	type Props = {
		data: ChartRow[];
		config: ChartConfig;
		/** Bars and lines, drawn in order. Defaults to: first key → bar, the rest → lines. */
		series?: ComposedSeries[];
		/** Category key for the x-axis, tooltip label and brush. */
		xDataKey?: string;
		class?: string;
		curveType?: CurveType;
		barGap?: number;
		barCategoryGap?: number | string;
		/** Defaults for bars / lines (overridden per series). */
		barVariant?: BarVariant;
		strokeVariant?: StrokeVariant;
		dot?: DotVariant | false;
		activeDot?: DotVariant | false;
		isClickable?: boolean;
		enableHoverHighlight?: boolean;
		glow?: boolean;
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
		curveType = 'linear',
		barGap = 4,
		barCategoryGap = '10%',
		barVariant = 'default',
		strokeVariant = 'solid',
		dot = false,
		activeDot = false,
		isClickable = false,
		enableHoverHighlight = false,
		glow = false,
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
		loadingBars = 12,
		margin,
		ariaLabel = 'Composed chart'
	}: Props = $props();

	const STROKE_WIDTH = 2;
	const BAR_RADIUS = 4;
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

	const loading = createLoadingData(() => isLoading, {
		points: () => loadingBars,
		min: 20,
		max: 80
	});

	const gridOpts = $derived(resolveOptions<GridOptions>(grid, true));
	const xAxisOpts = $derived(resolveOptions<AxisOptions>(xAxis, true));
	const yAxisOpts = $derived(resolveOptions<AxisOptions>(yAxis, false));
	const tooltipOpts = $derived(resolveOptions<TooltipOptions>(tooltip, true));
	const legendOpts = $derived(resolveOptions<LegendOptions>(legend, false));
	const brushOpts = $derived(resolveOptions<BrushOptions>(brush, false));
	const categoryKey = $derived(xDataKey ?? xAxisOpts?.dataKey);

	const resolvedSeries = $derived(
		(
			series ??
			Object.keys(config).map(
				(dataKey, i): ComposedSeries => (i === 0 ? { type: 'bar', dataKey } : { type: 'line', dataKey })
			)
		).map((s) =>
			s.type === 'bar'
				? {
						type: 'bar' as const,
						dataKey: s.dataKey,
						variant: s.variant ?? barVariant,
						radius: s.radius ?? BAR_RADIUS,
						glow: s.glow ?? glow,
						isClickable: s.isClickable ?? isClickable,
						enableHoverHighlight: s.enableHoverHighlight ?? enableHoverHighlight,
						strokeVariant: strokeVariant,
						curveType: curveType,
						connectNulls: false,
						dot: false as const,
						activeDot: false as const
					}
				: {
						type: 'line' as const,
						dataKey: s.dataKey,
						variant: barVariant,
						radius: BAR_RADIUS,
						glow: s.glow ?? glow,
						isClickable: s.isClickable ?? isClickable,
						enableHoverHighlight: false,
						strokeVariant: s.strokeVariant ?? strokeVariant,
						curveType: s.curveType ?? curveType,
						connectNulls: s.connectNulls ?? false,
						dot: s.dot ?? dot,
						activeDot: s.activeDot ?? activeDot
					}
		)
	);
	const keys = $derived(resolvedSeries.map((s) => s.dataKey));
	const barKeys = $derived(resolvedSeries.filter((s) => s.type === 'bar').map((s) => s.dataKey));

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

	function lineOpacity(key: string) {
		if (selectedDataKey === null || selectedDataKey === key) return { stroke: 1, dot: 1 };
		return { stroke: 0.3, dot: 0.3 };
	}

	function barOpacity(s: (typeof resolvedSeries)[number], index: number) {
		const isSelected = selectedDataKey === null || selectedDataKey === s.dataKey;
		const clickOpacity = s.isClickable && selectedDataKey !== null ? (isSelected ? 1 : 0.15) : 1;
		if (s.enableHoverHighlight && activeIndex !== null) {
			return activeIndex === index ? clickOpacity : clickOpacity * 0.3;
		}
		return clickOpacity;
	}

	function barFill(s: (typeof resolvedSeries)[number], sid: string) {
		return s.variant === 'default'
			? `url(#${sid}-colors-${s.dataKey})`
			: `url(#${sid}-${s.variant}-${s.dataKey})`;
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
			band: true,
			margin
		})}
		{@const slots = computeBarSlots({
			bandSize: layout.bandSize,
			slots: isLoading ? 1 : Math.max(1, barKeys.length),
			barGap,
			barCategoryGap
		})}
		{@const barRect = (pair: [number, number], index: number, slot: number) => {
			const a = layout.valueToPx(pair[0]);
			const b = layout.valueToPx(pair[1]);
			return {
				x: layout.categoryPositions[index] + slots.offsetFor(slot),
				y: Math.min(a, b),
				width: slots.size,
				height: Math.abs(b - a)
			};
		}}
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
						{#if s.type === 'bar'}
							<SeriesColorGradient id={sid} dataKey={s.dataKey} item={config[s.dataKey]} direction="vertical" />
							<BarPatternDefs id={sid} dataKey={s.dataKey} item={config[s.dataKey]} variant={s.variant} />
							{#if s.glow}
								<GlowFilter id="{sid}-glow" stdDeviation={8} alpha={0.5} region={100} />
							{/if}
						{:else}
							<SeriesColorGradient id={sid} dataKey={s.dataKey} item={config[s.dataKey]} />
							{#if s.glow}
								<GlowFilter id="{sid}-glow" stdDeviation={10} alpha={2} region={50} />
							{/if}
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
								d={roundedRectPath(r.x, r.y, r.width, r.height, BAR_RADIUS)}
								fill="currentColor"
								fill-opacity="0.15"
							/>
						{/if}
					{/each}
				</g>
			{:else}
				{#each resolvedSeries as s, index (s.dataKey)}
					{@const sid = `${chartId}-${index}`}
					{#if s.type === 'bar'}
						{@const slot = barKeys.indexOf(s.dataKey)}
						<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
						<g
							style:cursor={s.isClickable || s.enableHoverHighlight ? 'pointer' : undefined}
							onclick={() => {
								if (s.isClickable) toggle(s.dataKey);
							}}
						>
							{#each stacks[index] ?? [] as pair, i (i)}
								{#if pair && toNumber(rows[i]?.[s.dataKey]) !== null}
									{@const r = barRect(pair, i, slot)}
									{#if s.variant === 'stripped'}
										<g
											filter={s.glow ? `url(#${sid}-glow)` : undefined}
											opacity={barOpacity(s, i)}
											class="transition-opacity duration-200"
										>
											<rect x={r.x} y={r.y} width={r.width} height={r.height} fill={barFill(s, sid)} />
											<rect x={r.x} y={r.y} width={r.width} height={2} fill="url(#{sid}-colors-{s.dataKey})" />
										</g>
									{:else}
										<path
											d={roundedRectPath(r.x, r.y, r.width, r.height, s.radius)}
											fill={barFill(s, sid)}
											opacity={barOpacity(s, i)}
											filter={s.glow ? `url(#${sid}-glow)` : undefined}
											class="transition-opacity duration-200"
										/>
									{/if}
								{/if}
							{/each}
						</g>
					{:else}
						{@const opacity = lineOpacity(s.dataKey)}
						{@const points = rows.map((row, i) => {
							const value = toNumber(row[s.dataKey]);
							return value === null
								? null
								: { x: layout.categoryPositions[i], y: layout.valueToPx(value) };
						})}
						{@const d = linePath(points, s.curveType, s.connectNulls)}
						{@const isAnimatedDashed = s.strokeVariant === 'animated-dashed'}
						{@const isDashed = s.strokeVariant === 'dashed' || isAnimatedDashed}
						<g>
							{#if s.isClickable}
								<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
								<path
									{d}
									fill="none"
									stroke="transparent"
									stroke-width="20"
									style="cursor: pointer"
									onclick={() => toggle(s.dataKey)}
								/>
							{/if}
							<path
								{d}
								fill="none"
								stroke="url(#{sid}-colors-{s.dataKey})"
								stroke-opacity={opacity.stroke}
								stroke-width={STROKE_WIDTH}
								stroke-dasharray={isDashed ? '5 5' : undefined}
								filter={s.glow ? `url(#${sid}-glow)` : undefined}
								class="pointer-events-none"
							>
								{#if isAnimatedDashed && selectedDataKey === null}
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
					{/if}
				{/each}

				{#if activeIndex !== null}
					{#each resolvedSeries as s, index (s.dataKey)}
						{@const value = toNumber(rows[activeIndex]?.[s.dataKey])}
						{#if s.type === 'line' && s.activeDot && value !== null}
							<ChartDot
								cx={layout.categoryPositions[activeIndex]}
								cy={layout.valueToPx(value)}
								variant={s.activeDot}
								gradientUrl="url(#{chartId}-{index}-colors-{s.dataKey})"
								fillOpacity={lineOpacity(s.dataKey).dot}
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
