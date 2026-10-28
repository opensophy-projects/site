<script lang="ts" module>
	import type { BackgroundVariant, DotVariant, LegendOptions, TooltipOptions } from './types';

	export type RadarVariant = 'filled' | 'lines';

	export type RadarSeries = {
		/** Series key — must exist on the data rows and in the config. */
		dataKey: string;
		variant?: RadarVariant;
		/** Opacity of the fill when `variant="filled"`. */
		fillOpacity?: number;
		/** Soft outer glow around the polygon. */
		isGlowing?: boolean;
		isClickable?: boolean;
		dot?: DotVariant | false;
		activeDot?: DotVariant | false;
	};

	export type PolarGridOptions = {
		gridType?: 'polygon' | 'circle';
		strokeDasharray?: string;
		strokeOpacity?: number;
	};
</script>

<script lang="ts">
	import ChartContainer from './ChartContainer.svelte';
	import ChartTooltip from './ChartTooltip.svelte';
	import ChartLegend from './ChartLegend.svelte';
	import ChartBackground from './ChartBackground.svelte';
	import ChartDot from './ChartDot.svelte';
	import ChartGradientStops from './ChartGradientStops.svelte';
	import SeriesColorGradient from './SeriesColorGradient.svelte';
	import GlowFilter from './GlowFilter.svelte';
	import { resolveOptions } from './cartesian';
	import {
		DEFAULT_MARGIN,
		getColorsCount,
		getNiceTicks,
		polarToCartesian,
		resolveRadius,
		toNumber,
		type ChartConfig,
		type ChartRow,
		toLabel
	} from './chart-utils';

	type Props = {
		data: ChartRow[];
		config: ChartConfig;
		/** Polygons to draw. Defaults to every key of `config`. */
		series?: RadarSeries[];
		/** Key holding each axis (category) name. */
		angleKey: string;
		class?: string;
		/** Defaults for every series (overridden per series). */
		variant?: RadarVariant;
		fillOpacity?: number;
		isGlowing?: boolean;
		isClickable?: boolean;
		dot?: DotVariant | false;
		activeDot?: DotVariant | false;
		outerRadius?: number | string;
		polarGrid?: boolean | PolarGridOptions;
		/** Category labels around the chart. */
		angleAxis?: boolean | { tickFormatter?: (value: unknown, index: number) => string };
		/** Value ticks along the 3 o'clock spoke. */
		radiusAxis?: boolean | { tickFormatter?: (value: number) => string };
		tooltip?: boolean | TooltipOptions;
		legend?: boolean | LegendOptions;
		backgroundVariant?: BackgroundVariant;
		defaultSelectedDataKey?: string | null;
		onSelectionChange?: (dataKey: string | null) => void;
		isLoading?: boolean;
		loadingPoints?: number;
		ariaLabel?: string;
	};

	let {
		data,
		config,
		series,
		angleKey,
		class: className = '',
		variant = 'filled',
		fillOpacity = 0.3,
		isGlowing = false,
		isClickable = false,
		dot = false,
		activeDot = false,
		outerRadius = '80%',
		polarGrid = true,
		angleAxis = true,
		radiusAxis = false,
		tooltip = true,
		legend = false,
		backgroundVariant,
		defaultSelectedDataKey = null,
		onSelectionChange,
		isLoading = false,
		loadingPoints = 6,
		ariaLabel = 'Radar chart'
	}: Props = $props();

	const LOADING_DURATION = 1500;
	const chartId = $props.id();

	// svelte-ignore state_referenced_locally
	let selectedDataKey = $state<string | null>(defaultSelectedDataKey);
	let hovered = $state<{ index: number; x: number; y: number } | null>(null);
	let loadingRows = $state<ChartRow[]>([]);

	$effect(() => {
		if (!isLoading) return;
		const generate = () =>
			(loadingRows = Array.from({ length: loadingPoints }, (_, i) => ({
				[angleKey]: String.fromCharCode(65 + i),
				value: 30 + Math.random() * 70
			})));
		generate();
		const interval = setInterval(generate, LOADING_DURATION);
		return () => clearInterval(interval);
	});

	const gridOpts = $derived(resolveOptions<PolarGridOptions>(polarGrid, true));
	const angleAxisOpts = $derived(
		resolveOptions<{ tickFormatter?: (value: unknown, index: number) => string }>(angleAxis, true)
	);
	const radiusAxisOpts = $derived(
		resolveOptions<{ tickFormatter?: (value: number) => string }>(radiusAxis, false)
	);
	const tooltipOpts = $derived(resolveOptions<TooltipOptions>(tooltip, true));
	const legendOpts = $derived.by(() => {
		const opts = resolveOptions<LegendOptions>(legend, false);
		return opts ? { align: 'center' as const, verticalAlign: 'bottom' as const, ...opts } : null;
	});

	const resolvedSeries = $derived(
		(series ?? Object.keys(config).map((dataKey): RadarSeries => ({ dataKey }))).map((s) => ({
			dataKey: s.dataKey,
			variant: s.variant ?? variant,
			fillOpacity: s.fillOpacity ?? fillOpacity,
			isGlowing: s.isGlowing ?? isGlowing,
			isClickable: s.isClickable ?? isClickable,
			dot: s.dot ?? dot,
			activeDot: s.activeDot ?? activeDot
		}))
	);
	const keys = $derived(resolvedSeries.map((s) => s.dataKey));
	const rows = $derived(isLoading ? loadingRows : data);
	const radiusTicks = $derived.by(() => {
		const valueKeys = isLoading ? ['value'] : keys;
		let max = 0;
		for (const row of rows) for (const key of valueKeys) max = Math.max(max, toNumber(row[key]) ?? 0);
		return getNiceTicks(0, max, 5);
	});
	const radiusMax = $derived(radiusTicks[radiusTicks.length - 1] || 1);

	function selectDataKey(key: string | null) {
		selectedDataKey = key;
		onSelectionChange?.(key);
	}

	/** Radar: first axis at 12 o'clock, then clockwise. */
	function angleAt(index: number) {
		return 90 - (index * 360) / Math.max(1, rows.length);
	}

	function nearestAxis(x: number, y: number, cx: number, cy: number) {
		const angle = (Math.atan2(cy - y, x - cx) * 180) / Math.PI;
		let best = 0;
		let bestDistance = Infinity;
		rows.forEach((_, i) => {
			const diff = Math.abs((((angle - angleAt(i)) % 360) + 540) % 360 - 180);
			if (diff < bestDistance) {
				bestDistance = diff;
				best = i;
			}
		});
		return best;
	}

	function polygonPath(points: { x: number; y: number }[]) {
		return points.length
			? `M${points.map((p) => `${String(p.x)},${String(p.y)}`).join('L')}Z`
			: '';
	}

	function seriesOpacity(s: (typeof resolvedSeries)[number]) {
		const isDimmed = s.isClickable && selectedDataKey !== null && selectedDataKey !== s.dataKey;
		return { stroke: isDimmed ? 0.2 : 1, fill: isDimmed ? 0.1 : 1, dot: isDimmed ? 0.2 : 1 };
	}

	function fillOpacities(key: string) {
		const count = getColorsCount(config[key]);
		return count === 1 ? [0.8, 0.3] : Array.from({ length: count }, (_, i) => (i === 0 ? 0.8 : 0.3));
	}

	function axisLabel(index: number) {
		const raw = rows[index]?.[angleKey];
		return angleAxisOpts?.tickFormatter ? angleAxisOpts.tickFormatter(raw, index) : toLabel(raw);
	}
</script>

<ChartContainer id={chartId} {config} class={className} {isLoading}>
	{#snippet header()}
		{#if legendOpts && legendOpts.verticalAlign === 'top' && !isLoading}
			<ChartLegend {config} {keys} selected={selectedDataKey} onSelectChange={selectDataKey} options={legendOpts} />
		{/if}
	{/snippet}

	{#snippet bottom()}
		{#if legendOpts && legendOpts.verticalAlign !== 'top' && !isLoading}
			<ChartLegend {config} {keys} selected={selectedDataKey} onSelectChange={selectDataKey} options={legendOpts} />
		{/if}
	{/snippet}

	{#snippet children({ width, height }: { width: number; height: number })}
		{@const cx = width / 2}
		{@const cy = height / 2}
		{@const maxRadius =
			Math.min(width - DEFAULT_MARGIN.left - DEFAULT_MARGIN.right, height - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom) / 2}
		{@const ro = resolveRadius(outerRadius, maxRadius)}
		{@const pointAt = (index: number, value: number) =>
			polarToCartesian(cx, cy, (Math.max(0, value) / radiusMax) * ro, angleAt(index))}
		<svg
			{width}
			{height}
			viewBox="0 0 {width} {height}"
			class="absolute inset-0 block"
			role="img"
			aria-label={ariaLabel}
			onpointermove={(event) => {
				const rect = event.currentTarget.getBoundingClientRect();
				const x = event.clientX - rect.left;
				const y = event.clientY - rect.top;
				const distance = Math.hypot(x - cx, y - cy);
				hovered = rows.length && distance <= ro + 12 ? { index: nearestAxis(x, y, cx, cy), x, y } : null;
			}}
			onpointerleave={() => (hovered = null)}
		>
			<defs>
				{#each resolvedSeries as s, index (s.dataKey)}
					{@const sid = `${chartId}-${index}`}
					<SeriesColorGradient id={sid} dataKey={s.dataKey} item={config[s.dataKey]} />
					<SeriesColorGradient
						id={sid}
						dataKey={s.dataKey}
						item={config[s.dataKey]}
						direction="diagonal"
						gradientId="{sid}-radar-stroke-{s.dataKey}"
					/>
					{#if s.variant === 'filled'}
						<radialGradient id="{sid}-radar-fill-{s.dataKey}" cx="50%" cy="50%" r="50%">
							<ChartGradientStops
								dataKey={s.dataKey}
								item={config[s.dataKey]}
								opacities={fillOpacities(s.dataKey)}
							/>
						</radialGradient>
					{/if}
					{#if s.isGlowing}
						<GlowFilter id="{sid}-radar-glow-{s.dataKey}" stdDeviation={4} alpha={0.6} region={50} />
					{/if}
				{/each}
			</defs>

			{#if backgroundVariant}
				<ChartBackground variant={backgroundVariant} />
			{/if}

			{#if gridOpts && rows.length}
				<g
					fill="none"
					stroke="currentColor"
					stroke-opacity={gridOpts.strokeOpacity ?? 0.2}
					stroke-dasharray={gridOpts.strokeDasharray ?? '3 4'}
				>
					{#each rows as _, i (i)}
						{@const end = polarToCartesian(cx, cy, ro, angleAt(i))}
						<line x1={cx} y1={cy} x2={end.x} y2={end.y} />
					{/each}
					{#each radiusTicks.slice(1) as tick (tick)}
						{@const r = (tick / radiusMax) * ro}
						{#if (gridOpts.gridType ?? 'polygon') === 'circle'}
							<circle {cx} {cy} {r} />
						{:else}
							<path d={polygonPath(rows.map((_, i) => polarToCartesian(cx, cy, r, angleAt(i))))} />
						{/if}
					{/each}
				</g>
			{/if}

			{#if angleAxisOpts && !isLoading}
				<g fill="currentColor" font-size="12">
					{#each rows as _, i (i)}
						{@const angle = angleAt(i)}
						{@const p = polarToCartesian(cx, cy, ro + 8, angle)}
						{@const cos = Math.cos((angle * Math.PI) / 180)}
						{@const sin = Math.sin((angle * Math.PI) / 180)}
						<text
							x={p.x}
							y={p.y}
							text-anchor={cos > 1e-5 ? 'start' : cos < -1e-5 ? 'end' : 'middle'}
							dy={sin > 0.5 ? '0' : sin < -0.5 ? '0.71em' : '0.355em'}
						>
							{axisLabel(i)}
						</text>
					{/each}
				</g>
			{/if}

			{#if radiusAxisOpts && !isLoading}
				<g fill="currentColor" font-size="10" text-anchor="start">
					{#each radiusTicks as tick (tick)}
						{@const p = polarToCartesian(cx, cy, (tick / radiusMax) * ro, 0)}
						<text x={p.x} y={p.y} dy="0.355em" dx="4">
							{radiusAxisOpts.tickFormatter ? radiusAxisOpts.tickFormatter(tick) : String(tick)}
						</text>
					{/each}
				</g>
			{/if}

			{#if isLoading}
				<path
					class="chart-morph text-foreground"
					d={polygonPath(rows.map((row, i) => pointAt(i, toNumber(row.value) ?? 0)))}
					fill="currentColor"
					fill-opacity="0.1"
					stroke="currentColor"
					stroke-opacity="0.3"
					stroke-width="2"
				/>
			{:else}
				{#each resolvedSeries as s, index (s.dataKey)}
					{@const sid = `${chartId}-${index}`}
					{@const opacity = seriesOpacity(s)}
					{@const points = rows.map((row, i) => pointAt(i, toNumber(row[s.dataKey]) ?? 0))}
					<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
					<g
						style:cursor={s.isClickable ? 'pointer' : undefined}
						class="transition-opacity duration-200"
						onclick={() => {
							if (s.isClickable) selectDataKey(selectedDataKey === s.dataKey ? null : s.dataKey);
						}}
					>
						<path
							d={polygonPath(points)}
							stroke="url(#{sid}-radar-stroke-{s.dataKey})"
							stroke-opacity={opacity.stroke}
							stroke-width="1"
							fill={s.variant === 'filled' ? `url(#${sid}-radar-fill-${s.dataKey})` : 'none'}
							fill-opacity={s.variant === 'filled' ? s.fillOpacity * opacity.fill : 0}
							filter={s.isGlowing ? `url(#${sid}-radar-glow-${s.dataKey})` : undefined}
						/>
						{#if s.dot}
							{#each points as p, i (i)}
								<ChartDot
									cx={p.x}
									cy={p.y}
									variant={s.dot}
									gradientUrl="url(#{sid}-colors-{s.dataKey})"
									fillOpacity={opacity.dot}
								/>
							{/each}
						{/if}
					</g>
				{/each}
				{#if hovered}
					{#each resolvedSeries as s, index (s.dataKey)}
						{#if s.activeDot}
							{@const p = pointAt(hovered.index, toNumber(rows[hovered.index]?.[s.dataKey]) ?? 0)}
							<ChartDot
								cx={p.x}
								cy={p.y}
								variant={s.activeDot}
								gradientUrl="url(#{chartId}-{index}-colors-{s.dataKey})"
								fillOpacity={seriesOpacity(s).dot}
								class="pointer-events-none"
							/>
						{/if}
					{/each}
				{/if}
			{/if}
		</svg>

		{#if tooltipOpts && !isLoading}
			{@const defaultIndex = tooltipOpts.defaultIndex}
			{@const shown =
				hovered ??
				(defaultIndex !== undefined && rows[defaultIndex]
					? { index: defaultIndex, ...polarToCartesian(cx, cy, ro / 2, angleAt(defaultIndex)) }
					: null)}
			{#if shown}
				{@const raw = toLabel(rows[shown.index]?.[angleKey])}
				<ChartTooltip
					x={shown.x}
					y={shown.y}
					boundsWidth={width}
					boundsHeight={height}
					label={config[raw]?.label ?? raw}
					options={tooltipOpts}
					items={resolvedSeries.map((s) => ({
						key: s.dataKey,
						name: config[s.dataKey]?.label ?? s.dataKey,
						value: rows[shown.index]?.[s.dataKey],
						item: config[s.dataKey],
						dimmed: selectedDataKey !== null && selectedDataKey !== s.dataKey
					}))}
				/>
			{/if}
		{/if}
	{/snippet}
</ChartContainer>
