<script lang="ts">
	import type { PageData } from './$types';
	import SiteMenu from '$lib/components/ui/SiteMenu.svelte';
	import Card from '$lib/components/docs/markdown/Card.svelte';
	import SearchTrigger from '$lib/components/content/search/SearchTrigger.svelte';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	let {
		data,
		title = 'Шаблоны Docker Compose — opensophy',
		description = 'Реестр шаблонов Docker Compose для DevSecOps, безопасности инфраструктуры и автоматизации.'
	}: { data: PageData; title?: string; description?: string } = $props();
	const templates = $derived(data.templates);
	const isDockerRegistry = $derived(page.url.pathname === '/templates/docker');
	const title = $derived(
		isDockerRegistry ? 'Docker Compose шаблоны — opensophy' : 'Шаблоны Docker Compose — opensophy'
	);
	const description = $derived(
		isDockerRegistry
			? 'Готовые Docker Compose шаблоны Opensophy для DevSecOps, безопасности веб-приложений и автоматизации инфраструктуры.'
			: 'Реестр шаблонов Docker Compose для DevSecOps, безопасности инфраструктуры и автоматизации.'
	);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content="Готовые Docker Compose шаблоны для безопасности и автоматизации." />
	<meta property="og:type" content="website" />
</svelte:head>

<main class="relative flex min-h-dvh w-full flex-col items-center bg-background pt-20">
	<SiteMenu />

	<section class="hero-section relative flex w-full items-center justify-center px-6 py-20 md:py-28">
		<div class="hero-card" aria-hidden="true">
			<div class="hero-bg"></div>
		</div>
		<div class="relative z-10 flex w-full max-w-5xl flex-col items-center gap-7 text-center">
			<h1 class="hero-heading">
				<span class="text-foreground">шаблоны docker compose</span>
			</h1>
			<SearchTrigger class="h-12 w-full max-w-3xl rounded-2xl px-5 text-base" searchMode="registry" />
		</div>
	</section>

	<section class="section-block w-full max-w-5xl px-4">
		<div class="templates-grid">
			{#each templates as template (template.slug)}
				<a href={resolve(`/templates/${template.slug}`)} class="block h-full">
					<Card title={template.title} class="h-full">
						{template.description || 'Docker Compose шаблон'}
					</Card>
				</a>
			{/each}
		</div>
	</section>

	<section class="bottom-gradient-section" aria-hidden="true">
		<div class="bottom-gradient-card">
			<div class="bottom-gradient-bg"></div>
		</div>
	</section>
</main>

<style>
	.hero-section {
		min-height: 44vh;
	}

	.hero-card {
		position: absolute;
		/* pull the gradient up so it starts right under the fixed nav
		   instead of leaving a dark gap (offsets the main's pt-20) */
		top: -5rem;
		right: 0;
		bottom: 0;
		left: 0;
		max-width: 80rem;
		margin-left: auto;
		margin-right: auto;
		overflow: hidden;
		border-top-left-radius: var(--radius-3xl, 3.3rem);
		border-top-right-radius: var(--radius-3xl, 3.3rem);
		box-shadow: none;
	}

	.hero-bg {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: radial-gradient(
			125% 125% at 50% 100%,
			transparent 40%,
			#f43f5e 68%,
			#fda4af 86%,
			#fff1f2 100%
		);
		opacity: 0.28;
	}

	:global(.dark) .hero-bg,
	:global(.dark) .bottom-gradient-bg {
		opacity: 0.22;
	}

	.hero-heading {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.25em;
		margin: 0;
		font-size: clamp(2.1rem, 8vw, 5.25rem);
		font-weight: 500;
		letter-spacing: -0.03em;
		line-height: 1.15;
		white-space: normal;
		overflow-wrap: break-word;
		word-break: keep-all;
	}

	.section-block {
		position: relative;
		padding-top: clamp(2rem, 4vw, 3rem);
		padding-bottom: clamp(3rem, 6vw, 5rem);
	}

	.templates-grid {
		display: grid;
		grid-template-columns: repeat(1, minmax(0, 1fr));
		gap: 1rem;
	}

	.bottom-gradient-section {
		position: relative;
		min-height: clamp(12rem, 28vw, 22rem);
		width: 100%;
	}

	.bottom-gradient-card {
		position: absolute;
		inset: 0;
		max-width: 80rem;
		margin-left: auto;
		margin-right: auto;
		left: 0;
		right: 0;
		overflow: hidden;
		border-bottom-left-radius: var(--radius-3xl, 3.3rem);
		border-bottom-right-radius: var(--radius-3xl, 3.3rem);
		box-shadow: none;
	}

	.bottom-gradient-bg {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: radial-gradient(
			125% 125% at 50% 0%,
			transparent 40%,
			#f43f5e 68%,
			#fda4af 86%,
			#fff1f2 100%
		);
		opacity: 0.28;
	}

	@media (min-width: 640px) {
		.hero-heading {
			white-space: nowrap;
			letter-spacing: -0.04em;
		}

		.templates-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (min-width: 1024px) {
		.templates-grid {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}
</style>
