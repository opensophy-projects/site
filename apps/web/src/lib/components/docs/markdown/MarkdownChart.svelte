<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import AreaChart from '$lib/components/charts/AreaChart.svelte';
	import LineChart from '$lib/components/charts/LineChart.svelte';
	import BarChart from '$lib/components/charts/BarChart.svelte';
	import ComposedChart from '$lib/components/charts/ComposedChart.svelte';
	import PieChart from '$lib/components/charts/PieChart.svelte';
	import RadarChart from '$lib/components/charts/RadarChart.svelte';
	import RadialChart from '$lib/components/charts/RadialChart.svelte';
	import SankeyChart from '$lib/components/charts/SankeyChart.svelte';
	import type { AreaVariant } from '$lib/components/charts/AreaPatternDefs.svelte';
	import type { BarVariant } from '$lib/components/charts/BarPatternDefs.svelte';
	import type { DotVariant } from '$lib/components/charts/ChartDot.svelte';
	import type { StrokeVariant } from '$lib/components/charts/chart-utils';
	import type { ComposedSeries } from '$lib/components/charts/ComposedChart.svelte';
	import type { SankeyLinkVariant } from '$lib/components/charts/SankeyChart.svelte';
	import type { LegendOptions, ChartLegendVariant } from '$lib/components/charts/ChartLegend.svelte';
	import type { TooltipOptions, TooltipVariant } from '$lib/components/charts/ChartTooltip.svelte';
	import {
		BACKGROUND_VARIANTS,
		type BackgroundVariant
	} from '$lib/components/charts/ChartBackground.svelte';
	import type { CurveType } from '$lib/components/charts/curves';
	import {
		CATEGORY_KEY,
		isTruthyOption,
		parseMarkdownChart
	} from '$lib/components/charts/markdown';

	/**
	 * Renders a markdown `:::chart` block (see `charts/markdown.ts` for the
	 * syntax) with the Svelte chart components.
	 */
	let { source = '', class: className = '' }: { source?: string; class?: string } = $props();

	const chart = $derived(parseMarkdownChart(source));
	const o = $derived(chart.options);

	const pick = <T extends string>(value: string | undefined, allowed: readonly T[]) =>
		value && (allowed as readonly string[]).includes(value.trim()) ? (value.trim() as T) : undefined;
	const num = (value: string | undefined) => {
		if (value === undefined || value.trim() === '') return undefined;
		const n = Number(value.trim());
		return Number.isFinite(n) ? n : undefined;
	};
	const sizeOrPercent = (value: string | undefined) =>
		value?.trim().endsWith('%') ? value.trim() : num(value);

	const height = $derived(num(o.height) ?? 320);
	const curveType = $derived(
		pick<CurveType>(o.curve, [
			'linear',
			'monotone',
			'natural',
			'step',
			'stepBefore',
			'stepAfter',
			'bump',
			'basis'
		]) ?? 'linear'
	);
	const strokeVariant = $derived(
		pick<StrokeVariant>(o.stroke, ['solid', 'dashed', 'animated-dashed'])
	);
	const dot = $derived<DotVariant | false>(
		pick<DotVariant>(o.dots, ['default', 'border', 'colored-border']) ??
			(chart.type === 'line' && o.type?.trim() === 'scatter' ? 'border' : false)
	);
	const activeDot = $derived<DotVariant | false>(
		o.activedot !== undefined && !isTruthyOption(o.activedot)
			? false
			: (pick<DotVariant>(o.activedot, ['default', 'border', 'colored-border']) ?? 'colored-border')
	);
	const glow = $derived(isTruthyOption(o.glow));
	const brush = $derived(isTruthyOption(o.brush));
	const grid = $derived(o.grid === undefined ? true : isTruthyOption(o.grid));
	const xAxis = $derived(o.xaxis === undefined ? true : isTruthyOption(o.xaxis));
	const yAxis = $derived(isTruthyOption(o.yaxis));
	const background = $derived(pick<BackgroundVariant>(o.background, BACKGROUND_VARIANTS));
	const buffer = $derived(isTruthyOption(o.buffer));

	const legend = $derived.by((): LegendOptions | false => {
		const value = o.legend?.trim().toLowerCase();
		if (value !== undefined && !isTruthyOption(value)) return false;
		const seriesCount =
			chart.type === 'pie' || chart.type === 'donut' || chart.type === 'radial'
				? chart.rows.length
				: chart.keys.length;
		if (value === undefined && seriesCount < 2) return false;
		const polar = ['pie', 'donut', 'radar', 'radial'].includes(chart.type);
		return {
			isClickable: true,
			variant: pick<ChartLegendVariant>(o['legend-variant'], [
				'square',
				'circle',
				'circle-outline',
				'rounded-square',
				'rounded-square-outline',
				'vertical-bar',
				'horizontal-bar'
			]),
			verticalAlign: value === 'bottom' ? 'bottom' : value === 'top' ? 'top' : polar ? 'bottom' : 'top',
			align: polar ? 'center' : 'right'
		};
	});

	const tooltip = $derived.by((): TooltipOptions | false => {
		const value = o.tooltip?.trim().toLowerCase();
		if (value !== undefined && !isTruthyOption(value)) return false;
		return { variant: pick<TooltipVariant>(value, ['default', 'frosted-glass']) };
	});

	const composedSeries = $derived.by((): ComposedSeries[] => {
		const lineLabels = (o.lines ?? '')
			.split(',')
			.map((label) => label.trim().toLowerCase())
			.filter(Boolean);
		return chart.keys.map((key, i) => {
			const label = String(chart.config[key]?.label ?? '').toLowerCase();
			const isLine = lineLabels.length ? lineLabels.includes(label) : i > 0;
			return isLine
				? { type: 'line', dataKey: key }
				: {
						type: 'bar',
						dataKey: key,
						variant: pick<BarVariant>(o.variant, [
							'default',
							'hatched',
							'duotone',
							'duotone-reverse',
							'gradient',
							'stripped'
						])
					};
		});
	});
</script>

<div class={cn('inset-shadow my-8 rounded-lg bg-background-inset p-1.5', className)}>
	<div class="card overflow-hidden rounded-md bg-background">
		{#if chart.title || chart.description}
			<div class="border-b border-border px-5 py-4">
				{#if chart.title}
					<div class="text-base font-semibold tracking-tight text-foreground">{chart.title}</div>
				{/if}
				{#if chart.description}
					<div class="mt-1 text-sm text-foreground-muted">{chart.description}</div>
				{/if}
			</div>
		{/if}

		<div class="p-4" style="height: {height}px">
			{#if chart.type === 'area'}
				<AreaChart
					data={chart.rows}
					config={chart.config}
					xDataKey={CATEGORY_KEY}
					{curveType}
					stackType={pick(o.stack, ['default', 'stacked', 'expanded'] as const) ?? 'default'}
					variant={pick<AreaVariant>(o.variant, [
						'gradient',
						'gradient-reverse',
						'solid',
						'dotted',
						'lines',
						'hatched'
					]) ?? 'gradient'}
					strokeVariant={strokeVariant ?? 'dashed'}
					{dot}
					{activeDot}
					isClickable
					{grid}
					{xAxis}
					{yAxis}
					{legend}
					{tooltip}
					{brush}
					backgroundVariant={background}
					ariaLabel={chart.title ?? 'Area chart'}
					class="h-full w-full"
				/>
			{:else if chart.type === 'line'}
				<LineChart
					data={chart.rows}
					config={chart.config}
					xDataKey={CATEGORY_KEY}
					{curveType}
					strokeVariant={strokeVariant ?? 'solid'}
					{dot}
					{activeDot}
					glowing={glow}
					isClickable
					series={chart.keys.map((dataKey) => ({ dataKey, enableBufferLine: buffer }))}
					{grid}
					{xAxis}
					{yAxis}
					{legend}
					{tooltip}
					{brush}
					backgroundVariant={background}
					ariaLabel={chart.title ?? 'Line chart'}
					class="h-full w-full"
				/>
			{:else if chart.type === 'bar'}
				<BarChart
					data={chart.rows}
					config={chart.config}
					xDataKey={CATEGORY_KEY}
					stackType={pick(o.stack, ['default', 'stacked', 'percent'] as const) ??
						(o.stack === 'expanded' ? 'percent' : 'default')}
					layout={o.layout?.trim() === 'horizontal' ? 'horizontal' : 'vertical'}
					variant={pick<BarVariant>(o.variant, [
						'default',
						'hatched',
						'duotone',
						'duotone-reverse',
						'gradient',
						'stripped'
					]) ?? 'default'}
					barRadius={num(o.radius) ?? 2}
					glowing={glow}
					bufferBar={buffer}
					enableHoverHighlight={isTruthyOption(o.highlight)}
					isClickable
					{grid}
					xAxis={o.layout?.trim() === 'horizontal' ? yAxis : xAxis}
					yAxis={o.layout?.trim() === 'horizontal' ? xAxis : yAxis}
					{legend}
					{tooltip}
					{brush}
					backgroundVariant={background}
					ariaLabel={chart.title ?? 'Bar chart'}
					class="h-full w-full"
				/>
			{:else if chart.type === 'composed'}
				<ComposedChart
					data={chart.rows}
					config={chart.config}
					xDataKey={CATEGORY_KEY}
					series={composedSeries}
					{curveType}
					strokeVariant={strokeVariant ?? 'solid'}
					dot={dot || 'border'}
					{activeDot}
					glow={glow}
					enableHoverHighlight={isTruthyOption(o.highlight)}
					isClickable
					{grid}
					{xAxis}
					{yAxis}
					{legend}
					{tooltip}
					{brush}
					backgroundVariant={background}
					ariaLabel={chart.title ?? 'Composed chart'}
					class="h-full w-full"
				/>
			{:else if chart.type === 'pie' || chart.type === 'donut'}
				<PieChart
					data={chart.rows}
					config={chart.config}
					dataKey="value"
					nameKey={CATEGORY_KEY}
					innerRadius={sizeOrPercent(o.innerradius) ?? (chart.type === 'donut' ? '55%' : 0)}
					outerRadius={sizeOrPercent(o.outerradius) ?? '80%'}
					paddingAngle={num(o.padding) ?? (chart.type === 'donut' ? 3 : 0)}
					cornerRadius={num(o.radius) ?? (chart.type === 'donut' ? 6 : 0)}
					glowingSectors={glow ? chart.keys : []}
					label={o.labels === undefined ? true : isTruthyOption(o.labels)}
					isClickable
					{legend}
					{tooltip}
					backgroundVariant={background}
					ariaLabel={chart.title ?? 'Pie chart'}
					class="h-full w-full"
				/>
			{:else if chart.type === 'radar'}
				<RadarChart
					data={chart.rows}
					config={chart.config}
					angleKey={CATEGORY_KEY}
					variant={o.variant?.trim() === 'lines' ? 'lines' : 'filled'}
					polarGrid={{ gridType: o.grid?.trim() === 'circle' ? 'circle' : 'polygon' }}
					radiusAxis={yAxis}
					{dot}
					{activeDot}
					isGlowing={glow}
					isClickable
					{legend}
					{tooltip}
					backgroundVariant={background}
					ariaLabel={chart.title ?? 'Radar chart'}
					class="h-full w-full"
				/>
			{:else if chart.type === 'radial'}
				<RadialChart
					data={chart.rows}
					config={chart.config}
					dataKey="value"
					nameKey={CATEGORY_KEY}
					variant={o.variant?.trim() === 'semi' ? 'semi' : 'full'}
					max={num(o.max)}
					barSize={num(o.barsize) ?? 14}
					isClickable
					{legend}
					{tooltip}
					backgroundVariant={background}
					ariaLabel={chart.title ?? 'Radial chart'}
					class="h-full w-full"
				/>
			{:else if chart.type === 'sankey' && chart.sankey}
				<SankeyChart
					data={chart.sankey}
					config={chart.config}
					node={{ isClickable: true, radius: num(o.radius) ?? 2 }}
					nodeLabel={o.labels !== undefined && !isTruthyOption(o.labels)
						? false
						: {
								position: o.labels?.trim() === 'inside' ? 'inside' : 'outside',
								showValues: isTruthyOption(o.values)
							}}
					nodeWidth={num(o.nodewidth) ?? 10}
					link={{
						variant:
							pick<SankeyLinkVariant>(o.variant, ['gradient', 'solid', 'source', 'target']) ??
							'gradient'
					}}
					{tooltip}
					backgroundVariant={background}
					ariaLabel={chart.title ?? 'Sankey chart'}
					class="h-full w-full"
				/>
			{/if}
		</div>
	</div>
</div>
