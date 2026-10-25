<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils/cn';
	let {
		children,
		eyebrow,
		title,
		href,
		square = false,
		class: className = ''
	}: {
		children?: Snippet;
		eyebrow?: string;
		title?: string;
		href?: string;
		square?: boolean;
		class?: string;
	} = $props();
</script>

<div class={cn('inset-shadow bg-background-inset p-1.5', square ? 'rounded-none' : 'rounded-xl', className)}>
	<svelte:element
		this={href ? 'a' : 'div'}
		{href}
		class={cn(
			'group relative isolate block overflow-hidden border border-border bg-background p-5 card transition-colors duration-150 hover:border-accent/60',
			square ? 'rounded-none' : 'rounded-lg'
		)}
	>
		<div class="card-glow pointer-events-none absolute inset-0 -z-10" aria-hidden="true"></div>

		{#if eyebrow}<div class="mb-3 text-xs font-semibold tracking-widest text-accent uppercase">
				{eyebrow}
			</div>{/if}
		{#if title}<div class="text-lg font-semibold tracking-tight text-foreground">{title}</div>{/if}
		<div class="mt-2 text-sm leading-relaxed text-foreground-muted">{@render children?.()}</div>
	</svelte:element>
</div>

<style>
	.card-glow {
		background: radial-gradient(
			ellipse 130% 107.5% at 50% 10% in srgb,
			transparent 37%,
			var(--accent) 69%,
			color-mix(in srgb, var(--accent) 35%, transparent) 100%
		);
		filter: blur(clamp(0.75rem, 2.5vw, 1.5rem));
		opacity: 0.38;
	}
</style>
