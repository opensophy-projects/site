<script lang="ts">
	import ChartGradientStops from './ChartGradientStops.svelte';
	import type { ChartConfigItem } from './chart-utils';

	/** `<linearGradient id="{id}-colors-{dataKey}">` in the given direction. */
	type Props = {
		id: string;
		dataKey: string;
		item: ChartConfigItem | undefined;
		direction?: 'horizontal' | 'vertical' | 'diagonal';
		/** Overrides the generated id. */
		gradientId?: string;
		opacities?: number[];
	};

	let { id, dataKey, item, direction = 'horizontal', gradientId, opacities }: Props = $props();

	const coords = $derived(
		direction === 'vertical'
			? { x2: '0', y2: '1' }
			: direction === 'diagonal'
				? { x2: '1', y2: '1' }
				: { x2: '1', y2: '0' }
	);
</script>

<linearGradient id={gradientId ?? `${id}-colors-${dataKey}`} x1="0" y1="0" x2={coords.x2} y2={coords.y2}>
	<ChartGradientStops {dataKey} {item} {opacities} />
</linearGradient>
