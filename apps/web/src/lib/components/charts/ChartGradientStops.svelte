<script lang="ts">
	import { getColorStops, type ChartConfigItem } from './chart-utils';

	type Props = {
		/** Series / config key whose `--color-<key>-<n>` variables are used. */
		dataKey: string;
		item: ChartConfigItem | undefined;
		/** Optional per-stop opacity ramp (last value repeats). */
		opacities?: number[];
	};

	let { dataKey, item, opacities }: Props = $props();

	const stops = $derived(getColorStops(dataKey, item));
</script>

{#each stops as stop, index (stop.offset)}
	<stop
		offset={stop.offset}
		stop-color={stop.color}
		stop-opacity={opacities ? (opacities[index] ?? opacities[opacities.length - 1]) : undefined}
	/>
{/each}
