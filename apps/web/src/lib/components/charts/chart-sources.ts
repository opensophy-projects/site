import type { SourceTab } from '$lib/components/docs/component-preview/types';

import chartUtils from './chart-utils.ts?raw';
import cartesian from './cartesian.ts?raw';
import curves from './curves.ts?raw';
import sankey from './sankey.ts?raw';
import loading from './loading.svelte.ts?raw';
import bufferLine from './buffer-line.ts?raw';
import markdown from './markdown.ts?raw';
import chartContainer from './ChartContainer.svelte?raw';
import chartTooltip from './ChartTooltip.svelte?raw';
import chartLegend from './ChartLegend.svelte?raw';
import chartBrush from './ChartBrush.svelte?raw';
import chartDot from './ChartDot.svelte?raw';
import chartBackground from './ChartBackground.svelte?raw';
import chartLoadingPattern from './ChartLoadingPattern.svelte?raw';
import chartGradientStops from './ChartGradientStops.svelte?raw';
import seriesColorGradient from './SeriesColorGradient.svelte?raw';
import glowFilter from './GlowFilter.svelte?raw';
import cartesianFrame from './CartesianFrame.svelte?raw';
import areaPatternDefs from './AreaPatternDefs.svelte?raw';
import barPatternDefs from './BarPatternDefs.svelte?raw';
import areaChart from './AreaChart.svelte?raw';
import lineChart from './LineChart.svelte?raw';
import barChart from './BarChart.svelte?raw';
import composedChart from './ComposedChart.svelte?raw';
import pieChart from './PieChart.svelte?raw';
import radarChart from './RadarChart.svelte?raw';
import radialChart from './RadialChart.svelte?raw';
import sankeyChart from './SankeyChart.svelte?raw';
import markdownChart from '../docs/markdown/MarkdownChart.svelte?raw';

const svelte = (name: string, code: string): SourceTab => ({
	name,
	code,
	language: 'svelte'
});
const ts = (name: string, code: string): SourceTab => ({
	name,
	code,
	language: 'typescript'
});

/** Shared by every chart: config → CSS variables, container, tooltip, gradients. */
const core: SourceTab[] = [
	ts('chart-utils.ts', chartUtils),
	ts('cartesian.ts', cartesian),
	svelte('ChartContainer.svelte', chartContainer),
	svelte('ChartTooltip.svelte', chartTooltip),
	svelte('ChartGradientStops.svelte', chartGradientStops),
	svelte('SeriesColorGradient.svelte', seriesColorGradient),
	svelte('ChartBackground.svelte', chartBackground)
];

/** Extra pieces of the cartesian (x/y) charts. */
const cartesianParts: SourceTab[] = [
	svelte('CartesianFrame.svelte', cartesianFrame),
	ts('curves.ts', curves),
	svelte('ChartLegend.svelte', chartLegend),
	svelte('ChartBrush.svelte', chartBrush),
	svelte('ChartDot.svelte', chartDot),
	svelte('ChartLoadingPattern.svelte', chartLoadingPattern),
	ts('loading.svelte.ts', loading)
];

export const chartSources = {
	area: [
		svelte('AreaChart.svelte', areaChart),
		svelte('AreaPatternDefs.svelte', areaPatternDefs),
		...cartesianParts,
		...core
	],
	line: [
		svelte('LineChart.svelte', lineChart),
		ts('buffer-line.ts', bufferLine),
		svelte('GlowFilter.svelte', glowFilter),
		...cartesianParts,
		...core
	],
	bar: [
		svelte('BarChart.svelte', barChart),
		svelte('BarPatternDefs.svelte', barPatternDefs),
		svelte('GlowFilter.svelte', glowFilter),
		...cartesianParts,
		...core
	],
	composed: [
		svelte('ComposedChart.svelte', composedChart),
		svelte('BarPatternDefs.svelte', barPatternDefs),
		svelte('GlowFilter.svelte', glowFilter),
		...cartesianParts,
		...core
	],
	pie: [
		svelte('PieChart.svelte', pieChart),
		svelte('ChartLegend.svelte', chartLegend),
		svelte('GlowFilter.svelte', glowFilter),
		...core
	],
	radar: [
		svelte('RadarChart.svelte', radarChart),
		svelte('ChartLegend.svelte', chartLegend),
		svelte('ChartDot.svelte', chartDot),
		svelte('GlowFilter.svelte', glowFilter),
		...core
	],
	radial: [
		svelte('RadialChart.svelte', radialChart),
		svelte('ChartLegend.svelte', chartLegend),
		...core
	],
	sankey: [svelte('SankeyChart.svelte', sankeyChart), ts('sankey.ts', sankey), ...core],
	markdown: [svelte('MarkdownChart.svelte', markdownChart), ts('markdown.ts', markdown)],
	shared: [
		...core,
		svelte('ChartLegend.svelte', chartLegend),
		svelte('ChartDot.svelte', chartDot),
		svelte('ChartBrush.svelte', chartBrush),
		svelte('GlowFilter.svelte', glowFilter),
		svelte('ChartLoadingPattern.svelte', chartLoadingPattern),
		ts('loading.svelte.ts', loading)
	]
} satisfies Record<string, SourceTab[]>;
