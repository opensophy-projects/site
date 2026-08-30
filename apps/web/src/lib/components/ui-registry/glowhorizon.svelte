<script lang="ts">
	import { onMount } from 'svelte';

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
		delay: number;
	}

	let { className = '', variant = 'top' }: { className?: string; variant?: GlowHorizonVariant } =
		$props();

	const DURATION = 2000;
	const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

	const config = $derived(VARIANTS[variant]);
	const axisProp = $derived(config.axis);
	const restVal = $derived(config.restPct);

	let mounted = $state(false);
	onMount(() => {
		requestAnimationFrame(() => {
			mounted = true;
		});
	});

	const arcs: ArcSpec[] = [
		{ color: '#FFFFFF', size: 132, boxShadow: '0px -4px 23px 0px #ffffffb5', delay: 1.2 },
		{ color: '#A558FB', size: 120, blur: 31, delay: 0.6 },
		{ color: '#4922E5', size: 124, blur: 21, delay: 0 },
		{ color: 'transparent', size: 120, blur: 51, delay: 0 }
	];

	const gradientFor = (v: GlowHorizonVariant): string => {
		switch (v) {
			case 'bottom':
				return 'radial-gradient(ellipse 85% 65% at 50% 100%, #ffffff 0%, #a558fb 22%, #4922e5 42%, transparent 72%)';
			case 'left':
				return 'radial-gradient(ellipse 65% 85% at 0% 50%, #ffffff 0%, #a558fb 22%, #4922e5 42%, transparent 72%)';
			case 'right':
				return 'radial-gradient(ellipse 65% 85% at 100% 50%, #ffffff 0%, #a558fb 22%, #4922e5 42%, transparent 72%)';
			default:
				return 'radial-gradient(ellipse 85% 65% at 50% 0%, #ffffff 0%, #a558fb 22%, #4922e5 42%, transparent 72%)';
		}
	};
</script>

<div
	class={'glow-horizon-root ' + className}
	class:axis-x={axisProp === 'x'}
	class:axis-y={axisProp === 'y'}
	class:side-top={variant === 'top'}
	class:side-bottom={variant === 'bottom'}
	class:side-left={variant === 'left'}
	class:side-right={variant === 'right'}
	style="
		--duration: {DURATION}ms;
		--ease: {EASE};
		--rest-pct: {restVal}%;
		--gradient: {gradientFor(variant)};
	"
>
	{#each arcs as arc}
		<div
			aria-hidden="true"
			class="glow-arc"
			class:axis-x={axisProp === 'x'}
			class:axis-y={axisProp === 'y'}
			class:settled={mounted}
			style="
				--arc-scale: {arc.size / 100};
				--arc-color: {arc.color};
				--arc-blur: {arc.blur}px;
				--arc-box-shadow: {arc.boxShadow ?? 'none'};
				--arc-delay: {arc.delay}s;
				--arc-duration: {DURATION}ms;
				--arc-ease: {EASE};
			"
		></div>
	{/each}
</div>

<style>
	.glow-horizon-root {
		position: absolute;
		z-index: 1;
		inset: 0;
		display: block;
		overflow: hidden;
		isolation: isolate;
		opacity: 1;
		background: var(--gradient);
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

	.glow-arc.axis-y.settled {
		transform: scale(var(--arc-scale)) translateY(var(--rest-pct));
	}

	.glow-arc.axis-x.settled {
		transform: scale(var(--arc-scale)) translateX(var(--rest-pct));
	}
</style>
