<script lang="ts">
	import { cn } from '$lib/utils/cn';

	type Variant = 'dashed' | 'grid' | 'dots' | 'lines-h' | 'lines-v' | 'blank';

	type Props = {
		variant?: Variant;
		class?: string;
		children?: import('svelte').Snippet;
	};

	let { variant = 'dashed', class: className = '', children }: Props = $props();

	const variantClass: Record<Variant, string> = {
		dashed: 'texture-dashed',
		grid: 'texture-grid',
		dots: 'texture-dots',
		'lines-h': 'texture-lines-h',
		'lines-v': 'texture-lines-v',
		blank: ''
	};
</script>

<div class={cn('inset-shadow relative overflow-hidden rounded-xl bg-background-inset p-2', className)}>
	<div class={cn('h-full min-h-32 w-full rounded-lg', variantClass[variant])}>
		{@render children?.()}
	</div>
</div>

<style>
	.texture-dashed {
		background-image: linear-gradient(
			45deg,
			var(--color-border) 12.5%,
			transparent 12.5%,
			transparent 50%,
			var(--color-border) 50%,
			var(--color-border) 62.5%,
			transparent 62.5%,
			transparent 100%
		);
		background-size: 0.25rem 0.25rem;
	}

	.texture-grid {
		background-image:
			linear-gradient(var(--color-border) 1px, transparent 1px),
			linear-gradient(90deg, var(--color-border) 1px, transparent 1px);
		background-size: 1.5rem 1.5rem;
	}

	.texture-dots {
		background-image: radial-gradient(
			circle,
			var(--color-border) 1px,
			transparent 1px
		);
		background-size: 1.25rem 1.25rem;
	}

	.texture-lines-h {
		background-image: repeating-linear-gradient(
			0deg,
			var(--color-border) 0px,
			var(--color-border) 1px,
			transparent 1px,
			transparent 1.25rem
		);
	}

	.texture-lines-v {
		background-image: repeating-linear-gradient(
			90deg,
			var(--color-border) 0px,
			var(--color-border) 1px,
			transparent 1px,
			transparent 1.25rem
		);
	}
</style>
