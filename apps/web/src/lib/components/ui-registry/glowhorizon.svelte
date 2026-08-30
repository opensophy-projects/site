<script lang="ts">
	export type GlowHorizonVariant = 'top' | 'bottom' | 'left' | 'right';

	type Props = {
		class?: string;
		variant?: GlowHorizonVariant;
		opacity?: number;
	};

	let {
		class: className = '',
		variant = 'top',
		opacity = 0.28
	}: Props = $props();

	const gradients: Record<GlowHorizonVariant, string> = {
		top: 'radial-gradient(125% 125% at 50% 0%, transparent 40%, #f43f5e 68%, #fda4af 86%, #fff1f2 100%)',
		bottom:
			'radial-gradient(125% 125% at 50% 100%, transparent 40%, #f43f5e 68%, #fda4af 86%, #fff1f2 100%)',
		left: 'radial-gradient(125% 125% at 0% 50%, transparent 40%, #f43f5e 68%, #fda4af 86%, #fff1f2 100%)',
		right:
			'radial-gradient(125% 125% at 100% 50%, transparent 40%, #f43f5e 68%, #fda4af 86%, #fff1f2 100%)'
	};
</script>

<div
	class="glow-horizon {className}"
	style="background: {gradients[variant]}; opacity: {opacity};"
	aria-hidden="true"
></div>

<style>
	.glow-horizon {
		position: absolute;
		inset: 0;
		z-index: 0;
		pointer-events: none;
	}

	:global(.dark) .glow-horizon {
		opacity: calc(var(--glow-opacity, 0.28) * 0.79);
	}
</style>
