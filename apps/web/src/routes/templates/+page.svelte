<script lang="ts">
	import type { PageData } from './$types';
	import SiteMenu from '$lib/components/ui/SiteMenu.svelte';
	import Card from '$lib/components/docs/markdown/Card.svelte';
	import { resolve } from '$app/paths';

	const { data }: { data: PageData } = $props();
	let query = $state('');

	const templates = $derived(data.templates);
	const filteredTemplates = $derived.by(() => {
		const normalizedQuery = query.trim().toLowerCase();
		if (!normalizedQuery) return templates;
		return templates.filter((template) => {
			const haystack = `${template.title} ${template.description}`.toLowerCase();
			return haystack.includes(normalizedQuery);
		});
	});
</script>

<svelte:head>
	<title>Шаблоны Docker Compose — opensophy</title>
	<meta
		name="description"
		content="Реестр шаблонов Docker Compose для DevSecOps, безопасности инфраструктуры и автоматизации."
	/>
	<meta property="og:title" content="Шаблоны Docker Compose — opensophy" />
	<meta property="og:description" content="Готовые Docker Compose шаблоны для безопасности и автоматизации." />
	<meta property="og:type" content="website" />
</svelte:head>

<main class="relative flex min-h-dvh w-full flex-col items-center bg-background pt-20">
	<SiteMenu />

	<section class="hero-section relative flex w-full items-center justify-center px-6 py-20 md:py-28">
		<div class="hero-card" aria-hidden="true"><div class="hero-bg"></div></div>
		<div class="relative z-10 flex w-full max-w-5xl flex-col items-center gap-5 text-center">
			<p class="section-overline">Реестр</p>
			<h1 class="hero-heading">
				<span class="text-foreground">шаблоны docker compose</span>
				<span class="text-accent">для всего</span>
			</h1>
			<p class="hero-subtitle">
				Готовые контейнерные шаблоны для DevSecOps, кибербезопасности, автоматизации и open-source инфраструктуры.
			</p>
		</div>
	</section>

	<section class="section-block w-full max-w-5xl px-4">
		<label class="block w-full">
			<span class="mb-3 block text-sm font-semibold tracking-[0.14em] text-foreground-muted uppercase">Поиск шаблонов</span>
			<input
				bind:value={query}
				type="search"
				placeholder="Поиск шаблонов..."
				class="w-full rounded-2xl border border-border bg-background px-5 py-4 text-base text-foreground outline-none transition placeholder:text-foreground-muted/60 focus:border-accent focus:ring-2 focus:ring-accent/20"
			/>
		</label>

		{#if filteredTemplates.length > 0}
			<div class="templates-grid mt-8">
				{#each filteredTemplates as template (template.slug)}
					<a href={resolve(`/templates/${template.slug}`)} class="block h-full">
						<Card title={template.title} class="h-full">
							{template.description || 'Docker Compose шаблон'}
						</Card>
					</a>
				{/each}
			</div>
		{:else}
			<div class="mt-8 rounded-2xl border border-dashed border-border p-8 text-center text-foreground-muted">
				Шаблоны по запросу «{query}» не найдены.
			</div>
		{/if}
	</section>
</main>

<style>
	.hero-section { min-height: 54vh; }
	.hero-card {
		position: absolute; inset: 0; max-width: 80rem; margin-inline: auto; overflow: hidden;
		border-bottom-left-radius: var(--radius-3xl, 3.3rem); border-bottom-right-radius: var(--radius-3xl, 3.3rem);
	}
	.hero-bg {
		position: absolute; inset: 0; pointer-events: none;
		background: radial-gradient(125% 125% at 50% 0%, transparent 40%, #f43f5e 68%, #fda4af 86%, #fff1f2 100%);
		opacity: 0.28;
	}
	:global(.dark) .hero-bg { opacity: 0.22; }
	.hero-heading { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.25em; margin: 0; font-size: clamp(2.7rem, 7vw, 5.25rem); font-weight: 500; letter-spacing: -0.04em; line-height: 1.05; }
	.hero-subtitle { max-width: 46rem; margin: 0; color: var(--foreground-muted); font-size: clamp(1rem, 2vw, 1.2rem); line-height: 1.7; }
	.section-block { padding-top: clamp(2rem, 4vw, 3rem); padding-bottom: clamp(4rem, 8vw, 7rem); }
	.section-overline { margin: 0; font-size: 1rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--foreground-muted); }
	.templates-grid { display: grid; grid-template-columns: repeat(1, minmax(0, 1fr)); gap: 1rem; }
	@media (min-width: 640px) { .templates-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
	@media (min-width: 1024px) { .templates-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
</style>
