<script lang="ts" module>
	export type PieLabelOptions = {
		/** Data key for the label text — defaults to the pie value key. */
		dataKey?: string;
		formatter?: (value: unknown) => string;
	};
</script>

<script lang="ts">
	import type { BackgroundVariant, LegendOptions, TooltipOptions } from './types';
	import ChartContainer from './ChartContainer.svelte';
	import ChartTooltip from './ChartTooltip.svelte';
	import ChartLegend from './ChartLegend.svelte';
	import ChartBackground from './ChartBackground.svelte';
	import SeriesColorGradient from './SeriesColorGradient.svelte';
	import GlowFilter from './GlowFilter.svelte';
	import { resolveOptions } from './cartesian';
	import {
		DEFAULT_MARGIN,
		formatValue,
		polarToCartesian,
		resolveRadius,
		sectorPath,
		toNumber,
		type ChartConfig,
		type ChartRow,
		toLabel
	} from './chart-utils';

	type Props = {
		data: ChartRow[];
		/** Sector colors + labels, keyed by each row's `nameKey` value. */
		config: ChartConfig;
		/** Key holding each sector's numeric value. */
		dataKey: string;
		/** Key holding each sector's name. */
		nameKey: string;
		class?: string;
		/** Inner radius — above 0 turns the pie into a donut. */
		innerRadius?: number | string;
		outerRadius?: number | string;
		cornerRadius?: number;
		/** Gap between sectors in degrees — negative values overlap them. */
		paddingAngle?: number;
		startAngle?: number;
		endAngle?: number;
		isClickable?: boolean;
		/** Sector names rendered with a soft outer glow. */
		glowingSectors?: string[];
		/** Value labels in the middle of each sector. */
		label?: boolean | PieLabelOptions;
		tooltip?: boolean | TooltipOptions;
		legend?: boolean | LegendOptions;
		backgroundVariant?: BackgroundVariant;
		defaultSelectedSector?: string | null;
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
		innerRadius = 0,
		outerRadius = '80%',
		cornerRadius = 0,
		paddingAngle = 0,
		startAngle = 0,
		endAngle = 360,
		isClickable = false,
		glowingSectors = [],
		label = false,
		tooltip = true,
		legend = false,
		backgroundVariant,
		defaultSelectedSector = null,
		onSelectionChange,
		isLoading = false,
		ariaLabel = 'Pie chart'
	}: Props = $props();

	const LOADING_SECTORS = 5;
	const chartId = $props.id();

	// svelte-ignore state_referenced_locally
	let selectedSector = $state<string | null>(defaultSelectedSector);
	let hovered = $state<{ index: number; x: number; y: number } | null>(null);

	const tooltipOpts = $derived(resolveOptions<TooltipOptions>(tooltip, true));
	const legendOpts = $derived.by(() => {
		const opts = resolveOptions<LegendOptions>(legend, false);
		return opts ? { align: 'center' as const, verticalAlign: 'bottom' as const, ...opts } : null;
	});
	const labelOpts = $derived(resolveOptions<PieLabelOptions>(label, false));

	const names = $derived(data.map((row) => toLabel(row[nameKey])));
	const rows = $derived(
		isLoading
			? Array.from({ length: LOADING_SECTORS }, (_, i) => ({
					name: `loading${String(i)}`,
					value: 100 / LOADING_SECTORS
				}))
			: data.map((row) => ({ name: toLabel(row[nameKey]), value: toNumber(row[dataKey]) ?? 0 }))
	);

	const sectors = $derived.by(() => {
		const delta = endAngle - startAngle;
		const sign = Math.sign(delta) || 1;
		const absDelta = Math.min(360, Math.abs(delta));
		const total = rows.reduce((sum, row) => sum + Math.max(0, row.value), 0);
		const nonZero = rows.filter((row) => row.value > 0).length;
		const paddingTotal = (absDelta >= 360 ? nonZero : Math.max(0, nonZero - 1)) * paddingAngle;
		const real = absDelta - paddingTotal;
		let prevEnd = startAngle;
		return rows.map((row, i) => {
			const angle = total > 0 ? (Math.max(0, row.value) / total) * real : 0;
			const start = i === 0 ? startAngle : prevEnd + sign * paddingAngle;
			const end = start + sign * angle;
			prevEnd = end;
			return { ...row, startAngle: start, endAngle: end, midAngle: (start + end) / 2 };
		});
	});

	function selectSector(name: string | null) {
		selectedSector = name;
		if (name === null) {
			onSelectionChange?.(null);
			return;
		}
		const value = rows.find((row) => row.name === name)?.value;
		if (value !== undefined) onSelectionChange?.({ dataKey: name, value });
	}

	function pointerOf(event: PointerEvent) {
		const svg = (event.currentTarget as SVGElement).ownerSVGElement;
		const rect = (svg ?? (event.currentTarget as Element)).getBoundingClientRect();
		return { x: event.clientX - rect.left, y: event.clientY - rect.top };
	}

	function labelText(index: number) {
		const key = labelOpts?.dataKey ?? dataKey;
		const value = data[index]?.[key];
		return labelOpts?.formatter ? labelOpts.formatter(value) : formatValue(value);
	}
</script>

<ChartContainer id={chartId} {config} class={className} {isLoading}>
	{#snippet header()}
		{#if legendOpts && legendOpts.verticalAlign === 'top' && !isLoading}
			<ChartLegend {config} keys={names} selected={selectedSector} onSelectChange={selectSector} options={legendOpts} />
		{/if}
	{/snippet}

	{#snippet bottom()}
		{#if legendOpts && legendOpts.verticalAlign !== 'top' && !isLoading}
			<ChartLegend {config} keys={names} selected={selectedSector} onSelectChange={selectSector} options={legendOpts} />
		{/if}
	{/snippet}

	{#snippet children({ width, height }: { width: number; height: number })}
		{@const cx = width / 2}
		{@const cy = height / 2}
		{@const maxRadius =
			Math.min(width - DEFAULT_MARGIN.left - DEFAULT_MARGIN.right, height - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom) / 2}
		{@const ro = resolveRadius(outerRadius, maxRadius)}
		{@const ri = resolveRadius(innerRadius, maxRadius)}
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
					<SeriesColorGradient id={chartId} dataKey={key} {item} direction="diagonal" />
				{/each}
				{#each glowingSectors as name (name)}
					<GlowFilter id="{chartId}-glow-{name}" stdDeviation={8} alpha={0.5} region={100} />
				{/each}
			</defs>

			{#if backgroundVariant}
				<ChartBackground variant={backgroundVariant} />
			{/if}

			{#if isLoading}
				<g class="text-foreground">
					{#each sectors as sector, i (sector.name)}
						<path
							class="chart-pulse"
							style="animation-delay: {(i / LOADING_SECTORS) * 2}s"
							d={sectorPath({
								cx,
								cy,
								innerRadius: ri,
								outerRadius: ro,
								startAngle: sector.startAngle,
								endAngle: sector.endAngle,
								cornerRadius
							})}
							fill="currentColor"
						/>
					{/each}
				</g>
			{:else}
				{#each sectors as sector, i (sector.name)}
					{@const isDimmed = isClickable && selectedSector !== null && selectedSector !== sector.name}
					<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
					<path
						d={sectorPath({
							cx,
							cy,
							innerRadius: ri,
							outerRadius: ro,
							startAngle: sector.startAngle,
							endAngle: sector.endAngle,
							cornerRadius
						})}
						fill="url(#{chartId}-colors-{sector.name})"
						filter={glowingSectors.includes(sector.name) ? `url(#${chartId}-glow-${sector.name})` : undefined}
						stroke={paddingAngle < 0 ? 'var(--color-background)' : 'none'}
						stroke-width={paddingAngle < 0 ? 5 : 0}
						opacity={isDimmed ? 0.15 : 1}
						class="transition-opacity duration-200"
						style:cursor={isClickable ? 'pointer' : undefined}
						onpointermove={(event) => (hovered = { index: i, ...pointerOf(event) })}
						onclick={() => {
							if (isClickable) selectSector(selectedSector === sector.name ? null : sector.name);
						}}
					/>
				{/each}
				{#if labelOpts}
					{#each sectors as sector, i (sector.name)}
						{@const position = polarToCartesian(cx, cy, (ri + ro) / 2, sector.midAngle)}
						<text
							x={position.x}
							y={position.y}
							text-anchor="middle"
							dominant-baseline="central"
							font-size="12"
							font-weight="500"
							class="pointer-events-none fill-background"
						>
							{labelText(i)}
						</text>
					{/each}
				{/if}
			{/if}
		</svg>

		{#if tooltipOpts && !isLoading}
			{@const shown =
				hovered ??
				(tooltipOpts.defaultIndex !== undefined && sectors[tooltipOpts.defaultIndex]
					? {
							index: tooltipOpts.defaultIndex,
							...polarToCartesian(cx, cy, (ri + ro) / 2, sectors[tooltipOpts.defaultIndex].midAngle)
						}
					: null)}
			{#if shown}
				{@const sector = sectors[shown.index]}
				<ChartTooltip
					x={shown.x}
					y={shown.y}
					boundsWidth={width}
					boundsHeight={height}
					hideLabel
					options={tooltipOpts}
					items={[
						{
							key: sector.name,
							name: config[sector.name]?.label ?? sector.name,
							value: data[shown.index]?.[dataKey],
							item: config[sector.name]
						}
					]}
				/>
			{/if}
		{/if}
	{/snippet}
</ChartContainer>
