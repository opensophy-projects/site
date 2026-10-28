<script lang="ts" module>
	export type BarVariant =
		| 'default'
		| 'hatched'
		| 'duotone'
		| 'duotone-reverse'
		| 'gradient'
		| 'stripped';
</script>

<script lang="ts">
	import ChartGradientStops from './ChartGradientStops.svelte';
	import type { ChartConfigItem } from './chart-utils';

	/**
	 * Fill definitions for one bar series. Ids follow the pattern
	 * `{id}-{variant}-{dataKey}`; the base color gradient is `{id}-colors-{dataKey}`.
	 */
	type Props = {
		id: string;
		dataKey: string;
		item: ChartConfigItem | undefined;
		variant: BarVariant;
		/** Also define the hatched "buffer" fill for the last bar. */
		buffer?: boolean;
	};

	let { id, dataKey, item, variant, buffer = false }: Props = $props();

	const colors = $derived(`url(#${id}-colors-${dataKey})`);
</script>

{#snippet userSpaceFill(name: string)}
	<pattern id="{id}-{name}-{dataKey}" patternUnits="userSpaceOnUse" width="100%" height="100%">
		<rect width="100%" height="100%" fill={colors} mask="url(#{id}-{name}-mask-{dataKey})" />
	</pattern>
{/snippet}

{#snippet duotone(name: string, left: number, right: number)}
	<linearGradient
		id="{id}-{name}-mask-gradient-{dataKey}"
		gradientUnits="objectBoundingBox"
		x1="0"
		y1="0"
		x2="1"
		y2="0"
	>
		<stop offset="50%" stop-color="white" stop-opacity={left} />
		<stop offset="50%" stop-color="white" stop-opacity={right} />
	</linearGradient>
	<linearGradient
		id="{id}-{name}-colors-{dataKey}"
		gradientUnits="objectBoundingBox"
		x1="0"
		y1="0"
		x2="0"
		y2="1"
	>
		<ChartGradientStops {dataKey} {item} />
	</linearGradient>
	<mask id="{id}-{name}-mask-{dataKey}" maskContentUnits="objectBoundingBox">
		<rect x="0" y="0" width="1" height="1" fill="url(#{id}-{name}-mask-gradient-{dataKey})" />
	</mask>
	<pattern
		id="{id}-{name}-{dataKey}"
		patternUnits="objectBoundingBox"
		patternContentUnits="objectBoundingBox"
		width="1"
		height="1"
	>
		<rect
			x="0"
			y="0"
			width="1"
			height="1"
			fill="url(#{id}-{name}-colors-{dataKey})"
			mask="url(#{id}-{name}-mask-{dataKey})"
		/>
	</pattern>
{/snippet}

{#if variant === 'hatched'}
	<pattern
		id="{id}-hatched-mask-pattern-{dataKey}"
		x="0"
		y="0"
		width="5"
		height="5"
		patternUnits="userSpaceOnUse"
		patternTransform="rotate(-45)"
	>
		<rect width="5" height="5" fill="white" fill-opacity="0.3" />
		<rect width="1.5" height="5" fill="white" fill-opacity="1" />
	</pattern>
	<mask id="{id}-hatched-mask-{dataKey}">
		<rect width="100%" height="100%" fill="url(#{id}-hatched-mask-pattern-{dataKey})" />
	</mask>
	{@render userSpaceFill('hatched')}
{:else if variant === 'duotone'}
	{@render duotone('duotone', 0.4, 1)}
{:else if variant === 'duotone-reverse'}
	{@render duotone('duotone-reverse', 1, 0.4)}
{:else if variant === 'gradient'}
	<linearGradient id="{id}-gradient-mask-gradient-{dataKey}" x1="0" y1="0" x2="0" y2="1">
		<stop offset="20%" stop-color="white" stop-opacity="1" />
		<stop offset="90%" stop-color="white" stop-opacity="0" />
	</linearGradient>
	<mask id="{id}-gradient-mask-{dataKey}">
		<rect width="100%" height="100%" fill="url(#{id}-gradient-mask-gradient-{dataKey})" />
	</mask>
	{@render userSpaceFill('gradient')}
{:else if variant === 'stripped'}
	<mask id="{id}-stripped-mask-{dataKey}">
		<rect width="100%" height="100%" fill="white" fill-opacity="0.2" />
	</mask>
	{@render userSpaceFill('stripped')}
{/if}

{#if buffer}
	<pattern
		id="{id}-buffer-hatched-mask-pattern-{dataKey}"
		x="0"
		y="0"
		width="5"
		height="5"
		patternUnits="userSpaceOnUse"
		patternTransform="rotate(-45)"
	>
		<rect width="1" height="5" fill="white" fill-opacity="1" />
	</pattern>
	<mask id="{id}-buffer-hatched-mask-{dataKey}">
		<rect width="100%" height="100%" fill="url(#{id}-buffer-hatched-mask-pattern-{dataKey})" />
	</mask>
	{@render userSpaceFill('buffer-hatched')}
{/if}
