<script lang="ts">
	import BarChart from '$lib/components/charts/BarChart.svelte';
	import type { BarVariant } from '$lib/components/charts/types';
	import type { ChartConfig } from '$lib/components/charts/chart-utils';

	type Datum = { label: string; value: number };

	/**
	 * Compact single-series bar chart for `{ label, value }` data — the quick
	 * way to drop a chart into markdown without a `:::chart` block.
	 */
	let {
		data = [],
		title = 'Chart',
		variant = 'default',
		color = { light: '#047857', dark: '#10b981' },
		height = 260
	}: {
		data?: Datum[];
		title?: string;
		variant?: BarVariant;
		color?: { light: string; dark: string };
		height?: number;
	} = $props();

	const config = $derived<ChartConfig>({
		value: { label: title, colors: { light: [color.light], dark: [color.dark] } }
	});
</script>

<div class="inset-shadow my-8 rounded-lg bg-background-inset p-1.5">
	<div class="card rounded-md bg-background p-5">
		<div class="mb-3 text-base font-semibold text-foreground">{title}</div>
		<div style="height: {height}px">
			<BarChart
				{data}
				{config}
				xDataKey="label"
				{variant}
				barRadius={4}
				class="h-full w-full"
				ariaLabel={title}
			/>
		</div>
	</div>
</div>
