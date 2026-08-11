<script lang="ts">
	import type { PageData } from './$types';
	import SiteMenu from '$lib/components/ui/SiteMenu.svelte';
	import { siteConfig } from '$lib/config/site';

	const { data }: { data: PageData } = $props();
	const template = $derived(data.template);
	const Component = $derived(template.component);
	const title = $derived(`${template.title} — Docker Compose шаблон`);
	const description = $derived(template.description || siteConfig.fallbackDescription);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="article" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
</svelte:head>

<main class="relative min-h-dvh bg-background pt-20">
	<SiteMenu />
	<section class="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
		<div class="space-y-4">
			<p class="text-sm font-semibold tracking-[0.24em] text-foreground-muted uppercase">Реестр</p>
			<h1 class="text-4xl font-medium tracking-tight text-foreground sm:text-5xl">{template.title}</h1>
			{#if template.description}<p class="max-w-3xl text-base leading-7 text-foreground-muted">{template.description}</p>{/if}
		</div>
		<div class="rounded-2xl border border-border bg-background p-6 card sm:p-8">
			<Component />
		</div>
	</section>
</main>
