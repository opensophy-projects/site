<script lang="ts">
	export type GlowHorizonVariant = 'top' | 'bottom' | 'left' | 'right';

	interface VariantConfig {
		axis: 'x' | 'y';
		restPct: number;
	}

	const VARIANTS: Record<GlowHorizonVariant, VariantConfig> = {
		top: { axis: 'y', restPct: -50 },
		bottom: { axis: 'y', restPct: 50 },
		left: { axis: 'x', restPct: 50 },
		right: { axis: 'x', restPct: -50 }
	};

	interface ArcSpec {
		color: string;
		size: number;
		blur: number;
		boxShadow?: string;
		hasOffset?: boolean;
	}

	let { className = '', variant = 'top' }: { className?: string; variant?: GlowHorizonVariant } =
		$props();

	const config = $derived(VARIANTS[variant]);
	const axisProp = $derived(config.axis);
	const restVal = $derived(config.restPct);
	const sign = $derived(restVal < 0 ? -1 : 1);

	// order matters: painted back-to-front, so black goes first (bottom layer)
	const arcs: ArcSpec[] = [
		{ color: '#000000', size: 120, blur: 51, hasOffset: true },
		{ color: '#4922E5', size: 124, blur: 21, hasOffset: true },
		{ color: '#A558FB', size: 120, blur: 31, hasOffset: true },
		{ color: '#FFFFFF', size: 132, blur: 0, boxShadow: '0px -4px 23px 0px #ffffffb5' }
	];

	// same offset math as before, just applied statically (no transition)
	const arcOffset = $derived(sign * Math.abs(10 - 50));
</script>

<div
	class={'glow-horizon-root ' + className}
	class:axis-x={axisProp === 'x'}
	class:axis-y={axisProp === 'y'}
	style="--rest-pct: {restVal}%;"
>
	{#each arcs as arc}
		<div
			aria-hidden="true"
			class="glow-arc"
			class:axis-x={axisProp === 'x'}
			class:axis-y={axisProp === 'y'}
			class:has-offset={arc.hasOffset}
			style="
				--arc-scale: {arc.size / 100};
				--arc-color: {arc.color};
				--arc-blur: {arc.blur}px;
				--arc-box-shadow: {arc.boxShadow ?? 'none'};
				--arc-offset: {arcOffset}%;
			"
		></div>
	{/each}
</div>

<style>
	.glow-horizon-root {
		position: absolute;
		width: 100%;
		height: 100%;
		inset: 0;
		isolation: isolate;
	}

	.glow-horizon-root.axis-y {
		transform: translateY(var(--rest-pct));
	}

	.glow-horizon-root.axis-x {
		transform: translateX(var(--rest-pct));
	}

	.glow-arc {
		position: absolute;
		inset: 0;
		border-radius: 100%;
		background: var(--arc-color, #ffffff);
		filter: blur(var(--arc-blur, 0px));
		box-shadow: var(--arc-box-shadow);
		transform: scale(var(--arc-scale));
	}

	.glow-arc.has-offset.axis-y {
		transform: scale(var(--arc-scale)) translateY(var(--arc-offset));
	}

	.glow-arc.has-offset.axis-x {
		transform: scale(var(--arc-scale)) translateX(var(--arc-offset));
	}
</style>