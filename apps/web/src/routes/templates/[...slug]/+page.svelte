<script lang="ts">
	import PageSeo from '$lib/components/seo/PageSeo.svelte';
	import type { PageData } from './$types';
	import SiteMenu from '$lib/components/ui/SiteMenu.svelte';
	import { siteConfig } from '$lib/config/site';
	import { resolve } from '$app/paths';
	import ArrowLeft from 'carbon-icons-svelte/lib/ArrowLeft.svelte';

	const { data }: { data: PageData } = $props();
	const template = $derived(data.template);
	const Component = $derived(template.component);
	const title = $derived(`${template.title} — Docker Compose шаблон`);
	const description = $derived(template.description || siteConfig.fallbackDescription);
</script>

<PageSeo {title} {description} type="article" />

<main class="relative min-h-dvh bg-background pt-20">
	<SiteMenu />
	<section class="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
		<a
			href={resolve('/templates')}
			class="inline-flex w-fit items-center gap-2 rounded-sm border border-border bg-background-inset px-3 py-2 text-sm font-medium text-foreground-muted transition hover:border-accent hover:text-foreground"
		>
			<ArrowLeft size={16} />
			<span>Вернуться к реестру шаблонов Docker</span>
		</a>

		<div class="space-y-4">
			<h1 class="text-4xl font-medium tracking-tight text-foreground sm:text-5xl">{template.title}</h1>
			{#if template.description}<p class="max-w-3xl text-base leading-7 text-foreground-muted">{template.description}</p>{/if}
		</div>

		<Component />
	</section>
</main>
