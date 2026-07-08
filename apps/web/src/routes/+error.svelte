<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { brandingConfig, siteConfig } from '$lib';
	import { searchState } from '$lib/stores/search.svelte';
	import FloatingMenu from '$lib/components/ui/FloatingMenu.svelte';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
	import Search from 'carbon-icons-svelte/lib/Search.svelte';
	import ArrowLeft from 'carbon-icons-svelte/lib/ArrowLeft.svelte';

	const status = $derived(page.status);
	const message = $derived(page.error?.message ?? 'Что-то пошло не так');

	const is404 = $derived(status === 404);

	const errorTitle = $derived(is404 ? 'Страница не найдена' : `Ошибка ${String(status)}`);
	const errorDescription = $derived(
		is404
			? 'Страница, которую вы ищете, не существует или была перемещена. Воспользуйтесь поиском или вернитесь на главную.'
			: message
	);

	const menuGroups = [
		{
			title: 'Платформа',
			links: [
				{ label: 'Документация', href: resolve('/docs') },
				{ label: 'Статьи', href: resolve('/article') },
				{ label: 'Компоненты', href: resolve('/components') }
			]
		},
		{
			title: 'Ресурсы',
			links: [
				{ label: 'GitHub', href: siteConfig.links.github }
			]
		},
		{
			title: 'Проект',
			links: [
				{ label: 'На главную', href: resolve('/') }
			]
		}
	];
</script>

<svelte:head>
	<title>{errorTitle} — {siteConfig.name}</title>
	<meta name="description" content={errorDescription} />
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<FloatingMenu {menuGroups}>
	{#snippet centerContent()}
		<span class="font-medium lowercase tracking-tight text-foreground">{brandingConfig.name}</span>
	{/snippet}
	{#snippet actionsEnd()}
		<ThemeToggle />
	{/snippet}
</FloatingMenu>

<main class="error-page">
	<p class="error-code" aria-hidden="true">{status}</p>

	<div class="error-content">
		<h1 class="error-title">{errorTitle}</h1>

		<p class="error-desc">{errorDescription}</p>

		<div class="error-actions">
			<a href={resolve('/')} class="home-btn">
				<ArrowLeft size={18} />
				<span>На главную</span>
			</a>

			<button
				type="button"
				class="search-btn"
				onclick={() => {
					searchState.open();
				}}
			>
				<Search size={18} />
				<span>Поиск</span>
				<kbd class="search-kbd">⌘K</kbd>
			</button>
		</div>
	</div>
</main>

<style>
	.error-page {
		position: relative;
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--background);
		overflow: hidden;
	}

	.error-code {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: clamp(8rem, 30vw, 18rem);
		font-weight: 900;
		letter-spacing: -0.04em;
		line-height: 1;
		color: var(--foreground);
		margin: 0;
		opacity: 0.055;
		pointer-events: none;
		user-select: none;
		white-space: nowrap;
		z-index: 1;
	}

	.error-content {
		position: relative;
		z-index: 10;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 1.25rem;
		padding: 2rem 1.5rem;
		max-width: 36rem;
		width: 100%;
		animation: fade-up 500ms cubic-bezier(0.4, 0, 0.2, 1) both;
	}

	@keyframes fade-up {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.error-title {
		font-size: clamp(1.75rem, 5vw, 2.75rem);
		font-weight: 500;
		letter-spacing: -0.02em;
		line-height: 1.15;
		color: var(--foreground);
		margin: 0;
	}

	.error-desc {
		font-size: clamp(0.9rem, 2vw, 1.05rem);
		line-height: 1.7;
		color: var(--foreground-muted);
		margin: 0;
		max-width: 26rem;
	}

	.error-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}

	.search-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.7rem 1.5rem;
		border-radius: var(--radius-sm, 0.55rem);
		background: var(--accent);
		color: #fff;
		font-size: 0.9rem;
		font-weight: 500;
		letter-spacing: 0.01em;
		cursor: pointer;
		border: none;
		transition:
			background 150ms ease-out,
			transform 150ms ease-out,
			box-shadow 150ms ease-out;
		box-shadow: 0 2px 12px rgba(244, 63, 94, 0.25);
	}

	.search-btn:hover {
		background: color-mix(in oklch, var(--accent) 85%, black);
		transform: translateY(-1px);
		box-shadow: 0 4px 20px rgba(244, 63, 94, 0.35);
	}

	.search-btn:active {
		transform: translateY(0);
		box-shadow: 0 2px 8px rgba(244, 63, 94, 0.2);
	}

	.search-kbd {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.7rem;
		font-weight: 600;
		padding: 0.1rem 0.35rem;
		border-radius: 0.25rem;
		background: rgba(255, 255, 255, 0.2);
		line-height: 1.4;
	}

	.home-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.7rem 1.5rem;
		border-radius: var(--radius-sm, 0.55rem);
		background: var(--background-inset);
		color: var(--foreground);
		font-size: 0.9rem;
		font-weight: 500;
		text-decoration: none;
		border: 1px solid var(--border);
		transition:
			background 150ms ease-out,
			transform 150ms ease-out,
			border-color 150ms ease-out;
	}

	.home-btn:hover {
		background: var(--background-muted);
		transform: translateY(-1px);
		border-color: var(--foreground-muted);
	}

	.home-btn:active {
		transform: translateY(0);
	}
</style>
