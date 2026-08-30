<script lang="ts">
	import { onMount } from 'svelte';

	export type GlowHorizonVariant = 'top' | 'bottom' | 'left' | 'right';

	interface VariantConfig {
		axis: 'x' | 'y';
		enterPct: number;
		restPct: number;
	}

	const VARIANTS: Record<GlowHorizonVariant, VariantConfig> = {
		top: { axis: 'y', enterPct: -100, restPct: -50 },
		bottom: { axis: 'y', enterPct: 100, restPct: 50 },
		left: { axis: 'x', enterPct: 100, restPct: 50 },
		right: { axis: 'x', enterPct: -100, restPct: -50 }
	};

	interface ArcSpec {
		color: string;
		size: number;
		blur: number;
		boxShadow?: string;
		delay: number;
		// offset applied to the arc's own start position, like the original initialOffset
		hasOffset?: boolean;
	}

	let { className = '', variant = 'top' }: { className?: string; variant?: GlowHorizonVariant } =
		$props();

	const DURATION = 2000;
	const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

	const config = $derived(VARIANTS[variant]);
	const axisProp = $derived(config.axis);
	const enterVal = $derived(config.enterPct);
	const restVal = $derived(config.restPct);
	const sign = $derived(config.enterPct < 0 ? -1 : 1);

	let mounted = $state(false);
	onMount(() => {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				mounted = true;
			});
		});
	});

	const arcs: ArcSpec[] = [
		{ color: '#FFFFFF', size: 132, blur: 0, boxShadow: '0px -4px 23px 0px #ffffffb5', delay: 1.2 },
		{ color: '#A558FB', size: 120, blur: 31, delay: 0.6, hasOffset: true },
		{ color: '#4922E5', size: 124, blur: 21, delay: 0, hasOffset: true },
		{ color: '#000000', size: 120, blur: 51, delay: 0, hasOffset: true }
	];

	// mirrors original: startPct = sign * |offset - 50|, with offset fixed at 10%
	const arcStartOffset = $derived(sign * Math.abs(10 - 50));
</script>

<div
	class={'glow-horizon-root ' + className}
	class:axis-x={axisProp === 'x'}
	class:axis-y={axisProp === 'y'}
	style="
		--duration: {DURATION}ms;
		--ease: {EASE};
		--enter-pct: {enterVal}%;
		--rest-pct: {mounted ? restVal : enterVal}%;
		--scale: {mounted ? 1 : 1.5};
		--opacity: {mounted ? 1 : 0};
		--blur: {mounted ? 0 : 15}px;
	"
>
	{#each arcs as arc}
		<div
			aria-hidden="true"
			class="glow-arc"
			class:axis-x={axisProp === 'x'}
			class:axis-y={axisProp === 'y'}
			class:has-offset={arc.hasOffset}
			class:settled={mounted}
			style="
				--arc-scale: {arc.size / 100};
				--arc-color: {arc.color};
				--arc-blur: {arc.blur}px;
				--arc-box-shadow: {arc.boxShadow ?? 'none'};
				--arc-delay: {arc.delay}s;
				--arc-duration: {DURATION}ms;
				--arc-ease: {EASE};
				--arc-start: {arcStartOffset}%;
				--arc-end: 0%;
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
		opacity: var(--opacity);
		filter: blur(var(--blur));
		transition:
			transform var(--duration) var(--ease),
			opacity var(--duration) var(--ease),
			filter var(--duration) var(--ease);
	}

	.glow-horizon-root.axis-y {
		transform: translateY(var(--rest-pct)) scaleY(var(--scale));
	}

	.glow-horizon-root.axis-x {
		transform: translateX(var(--rest-pct)) scaleX(var(--scale));
	}

	.glow-arc {
		position: absolute;
		inset: 0;
		border-radius: 100%;
		background: var(--arc-color, #ffffff);
		filter: blur(var(--arc-blur, 0px));
		box-shadow: var(--arc-box-shadow);
		transform: scale(var(--arc-scale)) translate(0, 0);
		transition: transform var(--arc-duration) var(--arc-ease) var(--arc-delay);
	}

	.glow-arc.has-offset.axis-y {
		transform: scale(var(--arc-scale)) translateY(var(--arc-start));
	}
	.glow-arc.has-offset.axis-y.settled {
		transform: scale(var(--arc-scale)) translateY(var(--arc-end));
	}

	.glow-arc.has-offset.axis-x {
		transform: scale(var(--arc-scale)) translateX(var(--arc-start));
	}
	.glow-arc.has-offset.axis-x.settled {
		transform: scale(var(--arc-scale)) translateX(var(--arc-end));
	}
</style>