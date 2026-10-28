<script lang="ts">
	/** Soft outer glow: blurred copy of the shape with boosted alpha, merged under it. */
	type Props = {
		id: string;
		stdDeviation?: number;
		/** Alpha multiplier of the blurred copy. */
		alpha?: number;
		/** Filter region as a percentage of the bounding box (each side). */
		region?: number;
	};

	let { id, stdDeviation = 10, alpha = 2, region = 50 }: Props = $props();
</script>

<filter {id} x="-{region}%" y="-{region}%" width="{100 + region * 2}%" height="{100 + region * 2}%">
	<feGaussianBlur in="SourceGraphic" {stdDeviation} result="blur" />
	<feColorMatrix
		in="blur"
		type="matrix"
		values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 {alpha} 0"
		result="glow"
	/>
	<feMerge>
		<feMergeNode in="glow" />
		<feMergeNode in="SourceGraphic" />
	</feMerge>
</filter>
