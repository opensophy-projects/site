<script lang="ts">
	import type { Component } from 'svelte';
	import DocumentMultiple_01 from 'carbon-icons-svelte/lib/DocumentMultiple_01.svelte';
	import Network_3 from 'carbon-icons-svelte/lib/Network_3.svelte';
	import QHintonPlot from 'carbon-icons-svelte/lib/QHintonPlot.svelte';
	import Badge from '$lib/components/ui-registry/Badge.svelte';

	/** Раздел «Продукты»: акцентная панель с карточками ui · mtls · docs. */
	type Project = {
		title: string;
		description: string;
		icon: Component<{ size?: number; class?: string }>;
		href: string;
	};

	const projects: Project[] = [
		{
			title: 'os.ui',
			icon: QHintonPlot,
			description:
				'Библиотека готовых UI-компонентов с живым превью и гибкими настройками. Включает анимации, интерактивные блоки и фирменные компоненты Opensophy — для разработчиков и дизайнеров.',
			href: '/components/overview'
		},
		{
			title: 'os.mtls',
			icon: Network_3,
			description:
				'Инструмент для быстрого создания и управления mTLS-сертификатами для Traefik. Позволяет надёжно закрыть доступ к сервисам и серверам без лишних сложностей.',
			href: '/mtls'
		},
		{
			title: 'os.docs',
			icon: DocumentMultiple_01,
			description:
				'Платформа для документации и публикации контента. Подходит для технических команд, авторов и всех, кто хочет структурированно делиться знаниями.',
			href: '/docs/opensophy-docs'
		}
	];
</script>

<section class="products" id="products" aria-labelledby="products-title">
	<div class="products-panel">
		<h2 id="products-title" class="products-overline"><Badge variant="default">Продукты</Badge></h2>

		<div class="projects-grid">
			{#each projects as project (project.title)}
				{@const Icon = project.icon}
				<div class="project-shell inset-shadow relative overflow-hidden rounded-xl bg-background-inset p-1.5">
					<!-- Карточка целиком — ссылка на продукт -->
					<a class="project-card card rounded-lg bg-background" href={project.href}>
						<span class="project-card-top">
							<span
								class="project-icon inset-shadow grid size-10 shrink-0 place-items-center rounded-sm bg-background-inset text-accent"
							>
								<Icon size={22} />
							</span>
							<span class="project-slug">{project.title}</span>
						</span>
						<span class="project-desc">{project.description}</span>
					</a>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.products {
		width: 100%;
		padding: clamp(0.75rem, 1.5vw, 1.25rem) 1rem clamp(1.5rem, 3vw, 2.5rem);
		box-sizing: border-box;
		scroll-margin-top: 6rem;
	}

	/* Акцентная панель */
	.products-panel {
		width: 100%;
		max-width: 92rem;
		margin: 0 auto;
		box-sizing: border-box;
		padding: 2.5rem 1.25rem;
		border-radius: var(--radius-3xl, 3.3rem);
		background: radial-gradient(
			farthest-corner at 50% 50%,
			color-mix(in srgb, color-mix(in srgb, #f43f5e 85%, white) 32%, transparent) 0%,
			color-mix(in srgb, #f43f5e 32%, transparent) 55%,
			color-mix(in srgb, color-mix(in srgb, #f43f5e 80%, black) 32%, transparent) 100%
		);
	}

	:global(.dark) .products-panel {
		background: radial-gradient(
			farthest-corner at 50% 50%,
			color-mix(in srgb, color-mix(in srgb, #f43f5e 85%, white) 22%, transparent) 0%,
			color-mix(in srgb, #f43f5e 22%, transparent) 55%,
			color-mix(in srgb, color-mix(in srgb, #f43f5e 80%, black) 22%, transparent) 100%
		);
	}

	.products-overline {
		display: flex;
		justify-content: center;
		margin: 0 0 1rem;
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	/* ui · mtls · docs — одна линия */
	.projects-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.75rem;
		max-width: 80rem;
		margin: 0 auto;
	}

	.project-shell {
		height: 100%;
		box-sizing: border-box;
	}

	.project-card {
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
		height: 100%;
		min-height: 11rem;
		padding: 1.25rem 1.375rem 1.375rem;
		box-sizing: border-box;
		text-decoration: none;
		transition: box-shadow 150ms ease-out;
	}

	.project-card:hover .project-slug {
		color: var(--accent);
	}

	.project-card-top {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.project-slug {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.9rem;
		font-weight: 700;
		letter-spacing: -0.01em;
		color: var(--foreground);
		transition: color 150ms ease-out;
	}

	.project-desc {
		flex: 1;
		margin: 0;
		font-size: clamp(1rem, 1.35vw, 1.2rem);
		font-weight: 500;
		line-height: 1.45;
		letter-spacing: -0.02em;
		color: var(--foreground-muted);
	}

	@media (min-width: 768px) {
		.project-slug {
			font-size: 1rem;
		}
	}

	@media (max-width: 1023px) {
		.projects-grid {
			grid-template-columns: 1fr;
			max-width: 40rem;
		}
	}

	@media (max-width: 767px) {
		.products-panel {
			padding: 2rem 0.75rem;
			border-radius: 1.75rem;
		}
	}
</style>
