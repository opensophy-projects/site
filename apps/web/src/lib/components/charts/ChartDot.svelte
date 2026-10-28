<script lang="ts" module>
	export type DotVariant = 'default' | 'border' | 'colored-border';
</script>

<script lang="ts">
	type Props = {
		cx: number;
		cy: number;
		/** `url(#…)` of the series color gradient — painted across the full chart width. */
		gradientUrl: string;
		variant?: DotVariant;
		fillOpacity?: number;
		class?: string;
	};

	let { cx, cy, gradientUrl, variant = 'default', fillOpacity = 1, class: className }: Props =
		$props();

	const dotId = $props.id();
</script>

{#if variant === 'border'}
	{@const r = 6}
	{@const inner = r - 5 / 2}
	<g class={['text-background', className]}>
		<defs>
			<clipPath id="dot-clip-inner-{dotId}">
				<circle {cx} {cy} r={inner} />
			</clipPath>
		</defs>
		<circle {cx} {cy} {r} fill="currentColor" />
		<rect
			x="0"
			y={cy - inner}
			width="100%"
			height={inner * 2}
			fill={gradientUrl}
			fill-opacity={fillOpacity}
			clip-path="url(#dot-clip-inner-{dotId})"
		/>
	</g>
{:else if variant === 'colored-border'}
	{@const r = 3}
	{@const sw = 1}
	<g class={['text-background', className]}>
		<defs>
			<clipPath id="dot-clip-{dotId}">
				<circle {cx} {cy} r={r + sw / 2} />
			</clipPath>
		</defs>
		<rect
			x="0"
			y={cy - r - sw / 2}
			width="100%"
			height={(r + sw / 2) * 2}
			fill={gradientUrl}
			fill-opacity={fillOpacity}
			clip-path="url(#dot-clip-{dotId})"
		/>
		<circle {cx} {cy} r={r - sw / 2} fill="currentColor" />
	</g>
{:else}
	{@const r = 3}
	<g class={className}>
		<defs>
			<clipPath id="dot-clip-{dotId}">
				<circle {cx} {cy} {r} />
			</clipPath>
		</defs>
		<rect
			x="0"
			y={cy - r}
			width="100%"
			height={r * 2}
			fill={gradientUrl}
			fill-opacity={fillOpacity}
			clip-path="url(#dot-clip-{dotId})"
		/>
	</g>
{/if}
