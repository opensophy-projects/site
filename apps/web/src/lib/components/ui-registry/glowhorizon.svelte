<script lang="ts">
	export type GlowHorizonVariant = 'top' | 'bottom' | 'left' | 'right';

	type Props = {
		class?: string;
		variant?: GlowHorizonVariant;
	};

	let { class: className = '', variant = 'top' }: Props = $props();

	const gradients: Record<GlowHorizonVariant, string> = {
		top: 'radial-gradient(ellipse 90% 70% at 50% 0%, #ffffff 0%, #a558fb 18%, #4922e5 38%, transparent 70%)',
		bottom:
			'radial-gradient(ellipse 90% 70% at 50% 100%, #ffffff 0%, #a558fb 18%, #4922e5 38%, transparent 70%)',
		left: 'radial-gradient(ellipse 70% 90% at 0% 50%, #ffffff 0%, #a558fb 18%, #4922e5 38%, transparent 70%)',
		right:
			'radial-gradient(ellipse 70% 90% at 100% 50%, #ffffff 0%, #a558fb 18%, #4922e5 38%, transparent 70%)'
	};
</script>

<div class="glow-horizon {className}" style="background: {gradients[variant]}"></div>

<style>
	.glow-horizon {
		position: absolute;
		inset: 0;
		z-index: 0;
		pointer-events: none;
	}
</style>
