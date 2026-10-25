<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils/cn';

	let {
		title = 'Start with a working shader.',
		accent = 'working shader',
		description = 'Open an editable example in Svelte, React, or Vue. Change the shader and preview the result, then follow the setup guide to use Spektral in your app.',
		primaryLabel = 'Try an example',
		primaryHref = '/playground',
		secondaryLabel = 'Read the setup guide',
		secondaryHref = '/docs/getting-started',
		primaryIcon,
		secondaryIcon,
		class: className = ''
	}: {
		title?: string;
		/** Часть заголовка, подсвечиваемая цветом accent */
		accent?: string;
		description?: string;
		primaryLabel?: string;
		primaryHref?: string;
		secondaryLabel?: string;
		secondaryHref?: string;
		primaryIcon?: Snippet;
		secondaryIcon?: Snippet;
		class?: string;
	} = $props();

	const uid = $props.id();

	// делим заголовок на части вокруг accent
	const parts = $derived.by(() => {
		const i = accent ? title.indexOf(accent) : -1;
		return i < 0
			? { before: title, mark: '', after: '' }
			: { before: title.slice(0, i), mark: accent, after: title.slice(i + accent.length) };
	});

	const btn =
		'inline-flex h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 text-sm font-medium transition-all duration-150 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&_svg]:size-4 [&_svg]:shrink-0';
</script>

<!-- внешняя рамка — как в твоей Card -->
<section
	aria-labelledby="{uid}-title"
	class={cn('inset-shadow rounded-xl bg-background-inset p-1.5', className)}
>
	<!-- внутренняя панель — как в твоей Card, но с glow и центрированным контентом -->
	<div
		class="card relative isolate overflow-hidden rounded-lg border border-border bg-background px-6 py-16 text-center sm:px-12 sm:py-20"
	>
		<div class="cta-glow pointer-events-none absolute inset-0 -z-10" aria-hidden="true"></div>

		<div class="relative mx-auto flex max-w-3xl flex-col items-center gap-6">
			<h2
				id="{uid}-title"
				class="text-3xl leading-tight font-semibold tracking-tight text-balance text-foreground sm:text-4xl"
			>
				{parts.before}{#if parts.mark}<span class="text-accent">{parts.mark}</span>{/if}{parts.after}
			</h2>

			<p class="max-w-xl text-base leading-relaxed text-pretty text-foreground-muted">
				{description}
			</p>

			<div class="mt-2 flex flex-wrap items-center justify-center gap-3">
				<a
					href={primaryHref}
					class={cn(
						btn,
						'bg-accent text-white shadow-sm hover:brightness-110'
					)}
				>
					{#if primaryIcon}{@render primaryIcon()}{/if}
					{primaryLabel}
				</a>
				<a
					href={secondaryHref}
					class={cn(
						btn,
						'border border-border bg-background text-foreground hover:border-accent/60'
					)}
				>
					{#if secondaryIcon}{@render secondaryIcon()}{/if}
					{secondaryLabel}
				</a>
			</div>
		</div>
	</div>
</section>

<style>
	/* то же свечение, что .hero-glow в оригинале, но от твоего --color-accent */
	.cta-glow {
		background: radial-gradient(
			ellipse 130% 107.5% at 50% 10% in srgb,
			transparent 37%,
			var(--color-accent) 69%,
			color-mix(in srgb, var(--color-accent) 20%, white) 100%
		);
		filter: blur(clamp(1rem, 3.125vw, 2.5rem));
		opacity: 0.55;
	}
</style>
