<script lang="ts">
	import { generateEasedGradientStops } from './chart-utils';

	/**
	 * Diagonal shimmer used as a mask for loading skeletons. The pattern is 3×
	 * wide and the highlight travels x: -1 → 2, so it is always off-screen when
	 * the skeleton data swaps (every `duration`).
	 */
	type Props = { id: string; duration?: number };

	let { id, duration = 2000 }: Props = $props();

	const stops = generateEasedGradientStops();
</script>

<linearGradient id="{id}-loading-gradient" x1="0" y1="0" x2="1" y2="0">
	{#each stops as stop (stop.offset)}
		<stop offset={stop.offset} stop-color="white" stop-opacity={stop.opacity} />
	{/each}
</linearGradient>
<pattern
	id="{id}-loading-pattern"
	patternUnits="objectBoundingBox"
	patternContentUnits="objectBoundingBox"
	patternTransform="rotate(25)"
	width="3"
	height="1"
	x="0"
	y="0"
>
	<rect x="-1" y="0" width="1" height="1" fill="url(#{id}-loading-gradient)">
		<animate
			attributeName="x"
			from="-1"
			to="2"
			dur="{duration}ms"
			repeatCount="indefinite"
		/>
	</rect>
</pattern>
<mask id="{id}-loading-mask" maskUnits="userSpaceOnUse">
	<rect width="100%" height="100%" fill="url(#{id}-loading-pattern)" />
</mask>
