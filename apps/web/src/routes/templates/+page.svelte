<script lang="ts">
	import type { PageData } from './$types';
	import SiteMenu from '$lib/components/ui/SiteMenu.svelte';
	import Card from '$lib/components/docs/markdown/Card.svelte';
	import SearchTrigger from '$lib/components/content/search/SearchTrigger.svelte';
	import { resolve } from '$app/paths';

	const { data }: { data: PageData } = $props();
	const templates = $derived(data.templates);
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
		<div class="relative z-10 flex w-full max-w-5xl flex-col items-center gap-6 text-center">
			<h1 class="hero-heading">
				<span class="text-foreground">шаблоны docker compose</span>
			</h1>
			<SearchTrigger class="h-12 max-w-[min(62rem,100%)] rounded-2xl px-5 text-base" searchMode="registry" />
		</div>
	</section>

	<section class="section-block w-full px-4">
		<div class="templates-scroll w-full max-w-5xl">
			<div class="templates-grid">
				{#each templates as template (template.slug)}
					<a href={resolve(`/templates/${template.slug}`)} class="block h-full">
						<Card title={template.title} class="h-full">
							{template.description || 'Docker Compose шаблон'}
						</Card>
					</a>
				{/each}
			</div>
		</div>
		<div class="bottom-gradient-card" aria-hidden="true"><div class="bottom-gradient"></div></div>
	</section>
</main>

<style>
	.hero-section { min-height: 44vh; }
	.hero-card {
		position: absolute; inset: 0; max-width: 80rem; margin-inline: auto; overflow: hidden;
		border-bottom-left-radius: var(--radius-3xl, 3.3rem); border-bottom-right-radius: var(--radius-3xl, 3.3rem);
	}
	.hero-bg,
	.bottom-gradient {
		position: absolute; inset: 0; pointer-events: none;
		background: radial-gradient(125% 125% at 50% 100%, transparent 40%, #f43f5e 68%, #fda4af 86%, #fff1f2 100%);
		opacity: 0.28;
	}
	:global(.dark) .hero-bg, :global(.dark) .bottom-gradient { opacity: 0.22; }
	.hero-heading { display: flex; flex-wrap: nowrap; justify-content: center; gap: 0.25em; margin: 0; font-size: clamp(2.7rem, 7vw, 5.25rem); font-weight: 500; letter-spacing: -0.04em; line-height: 1.05; white-space: nowrap; }
	.section-block { position: relative; display: flex; flex-direction: column; align-items: center; overflow: hidden; padding-top: clamp(2rem, 4vw, 3rem); padding-bottom: clamp(10rem, 18vw, 18rem); }
	.templates-scroll { position: relative; z-index: 1; overflow-x: auto; overscroll-behavior-x: contain; padding-bottom: 1rem; }
	.templates-grid { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(16rem, 1fr); grid-template-rows: repeat(4, minmax(0, 1fr)); gap: 1rem; min-width: max-content; }
	.bottom-gradient-card { position: absolute; right: 0; bottom: 0; left: 0; height: min(24rem, 42vh); max-width: 80rem; margin-inline: auto; overflow: hidden; border-top-left-radius: var(--radius-3xl, 3.3rem); border-top-right-radius: var(--radius-3xl, 3.3rem); }
</style>
