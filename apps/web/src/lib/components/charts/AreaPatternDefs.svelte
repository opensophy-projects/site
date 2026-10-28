<script lang="ts" module>
	export type AreaVariant = 'gradient' | 'gradient-reverse' | 'solid' | 'dotted' | 'lines' | 'hatched';
</script>

<script lang="ts">
	/**
	 * Fill definitions for one area. Every variant paints the full-width series
	 * color gradient (`{id}-colors-{dataKey}`) through a mask, so multi-color
	 * gradients flow across the whole area.
	 */
	type Props = {
		id: string;
		dataKey: string;
		variant: AreaVariant;
		/** Also define the diagonal-lines fill used for unselected series. */
		unselected?: boolean;
	};

	let { id, dataKey, variant, unselected = false }: Props = $props();

	const colors = $derived(`url(#${id}-colors-${dataKey})`);
</script>

{#snippet maskedFill(name: string)}
	<pattern id="{id}-{name}" patternUnits="userSpaceOnUse" width="100%" height="100%">
		<rect width="100%" height="100%" fill={colors} mask="url(#{id}-{name}-mask)" />
	</pattern>
{/snippet}

{#snippet diagonalLines(name: string)}
	<pattern
		id="{id}-{name}-texture"
		patternUnits="userSpaceOnUse"
		width="5"
		height="5"
		patternTransform="rotate(45)"
	>
		<line x1="0" y1="0" x2="0" y2="5" stroke="white" stroke-width="1" />
	</pattern>
	<mask id="{id}-{name}-mask">
		<rect width="100%" height="100%" fill="url(#{id}-{name}-texture)" fill-opacity="0.3" />
	</mask>
	{@render maskedFill(name)}
{/snippet}

{#if variant === 'gradient'}
	<linearGradient id="{id}-vertical-fade" x1="0" y1="0" x2="0" y2="1">
		<stop offset="0%" stop-color="white" stop-opacity="0.1" />
		<stop offset="100%" stop-color="white" stop-opacity="0" />
	</linearGradient>
	<mask id="{id}-gradient-mask">
		<rect width="100%" height="100%" fill="url(#{id}-vertical-fade)" />
	</mask>
	{@render maskedFill('gradient')}
{:else if variant === 'gradient-reverse'}
	<linearGradient id="{id}-vertical-fade-reverse" x1="0" y1="0" x2="0" y2="1">
		<stop offset="0%" stop-color="white" stop-opacity="0" />
		<stop offset="100%" stop-color="white" stop-opacity="0.1" />
	</linearGradient>
	<mask id="{id}-gradient-reverse-mask">
		<rect width="100%" height="100%" fill="url(#{id}-vertical-fade-reverse)" />
	</mask>
	{@render maskedFill('gradient-reverse')}
{:else if variant === 'solid'}
	<mask id="{id}-solid-mask">
		<rect width="100%" height="100%" fill="white" fill-opacity="0.1" />
	</mask>
	{@render maskedFill('solid')}
{:else if variant === 'dotted'}
	<pattern id="{id}-dotted-texture" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
		<circle cx="4" cy="4" r="0.5" fill="white" />
	</pattern>
	<mask id="{id}-dotted-mask">
		<rect width="100%" height="100%" fill="url(#{id}-dotted-texture)" fill-opacity="0.5" />
	</mask>
	{@render maskedFill('dotted')}
{:else if variant === 'lines'}
	{@render diagonalLines('lines')}
{:else if variant === 'hatched'}
	<linearGradient id="{id}-hatched-stripe" x1="0" y1="0" x2="1" y2="0">
		<stop offset="50%" stop-color="white" stop-opacity="0.2" />
		<stop offset="50%" stop-color="white" stop-opacity="1" />
	</linearGradient>
	<pattern
		id="{id}-hatched-texture"
		x="0"
		y="0"
		width="20"
		height="10"
		patternUnits="userSpaceOnUse"
		overflow="visible"
		patternTransform="rotate(20)"
	>
		<rect width="20" height="10" fill="url(#{id}-hatched-stripe)" />
	</pattern>
	<mask id="{id}-hatched-mask">
		<rect width="100%" height="100%" fill="url(#{id}-hatched-texture)" fill-opacity="0.2" />
	</mask>
	{@render maskedFill('hatched')}
{/if}

{#if unselected}
	{@render diagonalLines('unselected')}
{/if}
