<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { resolve } from '$app/paths';
	import { brandingConfig, siteConfig } from '$lib';
	import CardSection from '$lib/components/ui/CardSection.svelte';
	import CardProject from '$lib/components/ui/CardProject.svelte';
	import FloatingMenu from '$lib/components/ui/FloatingMenu.svelte';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
	import TextLoop from '$lib/components/ui/TextLoop.svelte';
	import Teamsection from '$lib/components/ui/Teamsection.svelte';
	import Email from 'carbon-icons-svelte/lib/Email.svelte';
	import LogoGithub from 'carbon-icons-svelte/lib/LogoGithub.svelte';
	import Close from 'carbon-icons-svelte/lib/Close.svelte';
	import ArrowRight from 'carbon-icons-svelte/lib/ArrowRight.svelte';

	const heroLoopTexts = ['знания', 'open-source', 'безопасность', 'разработку'];

	let contactsOpen = $state(false);

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
				{
					label: 'GitHub',
					href: 'https://github.com/opensophy-projects'
				}
			]
		},
		{
			title: 'Проект',
			links: [
				{
					label: 'Контакты',
					href: '#',
					onclick: (e: MouseEvent) => { e.preventDefault(); contactsOpen = true; }
				}
			]
		}
	];

	const contacts = [
		{
			label: 'GitHub',
			href: siteConfig.links.github,
			icon: LogoGithub
		},
		{
			label: siteConfig.links.email,
			href: `mailto:${siteConfig.links.email}`,
			icon: Email
		}
	];

	function closeContacts() {
		contactsOpen = false;
	}

	function handleContactsKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') closeContacts();
	}

	const projects = [
		{
			title: 'os.docs',
			description:
				'Платформа для документации и публикации контента. Подходит для технических команд, авторов и всех, кто хочет красиво и структурировано делиться знаниями.',
			colors: ['#f43f5e', '#f43f5e', '#f43f5e'],
			glowColor: '330 70 65',
			wip: false,
		},
		{
			title: 'os.ui',
			description:
				'Библиотека готовых компонентов с живым превью и настройками. Анимации, интерактивные блоки, кастомные элементы и фирменные компоненты Opensophy — для разработчиков и дизайнеров.',
			colors: ['#f43f5e', '#f43f5e', '#f43f5e'],
			glowColor: '0 80 65',
			wip: false,
		},
		{
			title: 'os.net',
			description:
				'GUI-платформа управления безопасным удалённым доступом: P2P, VPN, proxy, mTLS — всё в одном интерфейсе.',
			colors: ['#f43f5e', '#f43f5e', '#f43f5e'],
			glowColor: '25 90 65',
			wip: true,
		},
		{
			title: 'os.mtls',
			description:
				'Инструмент для быстрого создания и управления mTLS-сертификатами. Для тех, кто хочет надёжно закрыть доступ к своим сервисам и серверам без лишней головной боли.',
			colors: ['#86efac', '#22c55e', '#bbf7d0'],
			glowColor: '142 70 60',
			wip: false,
		},
	];
</script>

<a
	href="#main-content"
	class="sr-only fixed top-3 left-3 z-100 bg-foreground px-4 py-2 text-sm text-background-inset focus:not-sr-only"
>
	Skip to main content
</a>

<main
	id="main-content"
	tabindex="-1"
	class="relative flex flex-col w-full min-h-dvh items-center bg-background"
>
	<FloatingMenu {menuGroups}>
		{#snippet centerContent()}
			<span class="font-medium lowercase tracking-tight text-foreground">{brandingConfig.name}</span>
		{/snippet}
		{#snippet actionsEnd()}
			<ThemeToggle />
		{/snippet}
	</FloatingMenu>

	<!-- Hero Section -->
	<section class="hero-section relative flex w-full items-center justify-center px-6 py-24 md:py-32">
		<div class="hero-card" aria-hidden="true">
			<div class="hero-bg"></div>
		</div>

		<div class="relative z-10 flex flex-col items-center gap-4 text-center max-w-5xl w-full">
			<p class="hero-name">{brandingConfig.name}</p>
			<p class="hero-lead">
				проект про <TextLoop texts={heroLoopTexts} interval={2200} class="text-accent" />
			</p>
		</div>
	</section>

	<!-- About Section -->
	<section class="section-block w-full max-w-5xl mx-auto px-4">
		<p class="section-overline">О проекте</p>
		<h2 class="section-lead text-foreground-muted">
			<span class="text-foreground">Opensophy</span> — <span class="text-accent">инициатива</span> открытой философии в IT. Качественные и доступные знания, услуги, инструменты и решения.
		</h2>
	</section>

	<!-- What We Do Section -->
	<section class="section-block w-full max-w-5xl mx-auto px-4">
		<p class="section-overline">Чем занимается</p>
		<div class="section-headlines">
			<h2 class="section-headline-plain">
				Учим безопасности, настраиваем защиту, автоматизируем рутину.
			</h2>
			<h2 class="section-headline-muted">
				От образовательных материалов до внедрения <span class="text-accent">DevSecOps</span> и <span class="text-accent">Zero Trust</span> в реальную инфраструктуру.
			</h2>
		</div>
		<CardSection />
	</section>

	<!-- Projects Section -->
	<section class="section-block w-full max-w-5xl mx-auto px-4">
		<p class="section-overline">Что разрабатывает</p>
		<h2 class="section-lead text-foreground-muted">
			<span class="text-foreground">Создаём</span> <span class="text-accent">open-source инструменты</span> для безопасной инфраструктуры и современных IT-команд.
		</h2>
		<div class="projects-grid">
			{#each projects as project (project.title)}
				<CardProject
					colors={project.colors}
					glowColor={project.glowColor}
					borderRadius={12}
				>
					<div class="project-card-body">
						<div class="project-card-header">
							<span class="project-slug">{project.title}</span>
							{#if project.wip}
								<span class="project-wip">В разработке</span>
							{/if}
						</div>
						<p class="project-desc">{project.description}</p>
					</div>
				</CardProject>
			{/each}
		</div>
	</section>

	<!-- About Creator Section -->
	<section class="w-full max-w-5xl mx-auto px-4">
		<Teamsection onContactsClick={() => { contactsOpen = true; }} />
	</section>

	<!-- CTA Section -->
	<section class="cta-section relative flex w-full items-center justify-center px-6 py-24 md:py-32">
		<div class="cta-card" aria-hidden="true">
			<div class="cta-bg"></div>
		</div>

		<div class="relative z-10 flex flex-col items-center gap-6 text-center max-w-5xl w-full">
			<p class="section-overline">Сотрудничество</p>
			<h2 class="cta-heading">
				Готовы к&nbsp;<span class="text-accent">сотрудничеству?</span>
			</h2>
			<p class="cta-sub">
				Нужна помощь с инфраструктурой, безопасностью или DevSecOps?<br />
				Напишите — отвечу в течение двух рабочих дней.
			</p>
			<button
				type="button"
				class="cta-button"
				onclick={() => { contactsOpen = true; }}
			>
				<span>Написать нам</span>
				<ArrowRight size={16} />
			</button>
		</div>
	</section>
</main>

{#if contactsOpen}
	<div
		class="contacts-overlay fixed inset-0 z-[100] flex items-center justify-center bg-background-inset/80 backdrop-blur-sm"
		onclick={closeContacts}
		onkeydown={handleContactsKeydown}
		role="button"
		tabindex="-1"
		aria-label="Закрыть контакты"
	>
		<div
			class="contacts-modal relative w-full max-w-sm rounded-lg border border-border bg-background p-6 shadow-2xl card"
			onclick={(e) => { e.stopPropagation(); }}
			onkeydown={(e) => { e.stopPropagation(); }}
			role="dialog"
			aria-modal="true"
			aria-label="Контакты"
			tabindex="-1"
		>
			<button
				type="button"
				class="absolute top-3 right-3 flex size-8 items-center justify-center rounded-sm text-foreground-muted transition-colors hover:bg-background-muted hover:text-foreground"
				onclick={closeContacts}
				aria-label="Закрыть"
			>
				<Close size={18} />
			</button>
			<h2 class="mb-1 text-lg font-medium tracking-tight text-foreground">Контакты</h2>
			<p class="mb-5 text-sm text-foreground-muted">Свяжитесь через удобный канал.</p>
			<div class="flex flex-col gap-2">
					{#each contacts as contact (contact.href)}
						<a
							href={contact.href}
							target={contact.href.startsWith('http') ? '_blank' : undefined}
							rel={contact.href.startsWith('http') ? 'external' : undefined}
							class="flex items-center gap-3 rounded-sm border border-border bg-background-inset px-4 py-3 text-sm font-medium text-foreground-muted transition-colors duration-150 ease-out hover:bg-background-muted hover:text-foreground"
						>
							<contact.icon size={18} />
							<span class="truncate">{contact.label}</span>
						</a>
					{/each}
			</div>
		</div>
	</div>
{/if}

<style>
	/* ─── Hero Section ─────────────────────────────────────────── */
	.hero-section {
		min-height: 70vh;
		position: relative;
	}

	.hero-card {
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



	.hero-bg {
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

	:global(.dark) .hero-bg {
		opacity: 0.22;
	}

	/* ─── Hero Typography ──────────────────────────────────────── */
	.hero-name {
		font-size: clamp(3rem, 8vw, 5.5rem);
		font-weight: 500;
		letter-spacing: -0.02em;
		color: var(--foreground);
		margin: 0;
		line-height: 1.1;
	}

	.hero-lead {
		font-size: clamp(1rem, 2.5vw, 1.5rem);
		font-weight: 500;
		line-height: 1.55;
		color: var(--foreground-muted);
		margin: 0;
	}

	/* ─── CTA Section ──────────────────────────────────────────── */
	.cta-section {
		position: relative;
	}

	/* Та же карточка что у hero — но градиент идёт сверху вниз */
	.cta-card {
		position: absolute;
		inset: 0;
		max-width: 80rem;
		margin-left: auto;
		margin-right: auto;
		left: 0;
		right: 0;
		overflow: hidden;
		/* Скругление сверху — зеркально hero */
		border-top-left-radius: var(--radius-3xl, 3.3rem);
		border-top-right-radius: var(--radius-3xl, 3.3rem);
		box-shadow: none;
	}



	/* Градиент сверху вниз (at 50% 0% → прозрачный внизу) */
	.cta-bg {
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

	:global(.dark) .cta-bg {
		opacity: 0.22;
	}

	/* CTA Typography */
	.cta-heading {
		font-size: clamp(2rem, 5vw, 3.5rem);
		font-weight: 500;
		letter-spacing: -0.02em;
		line-height: 1.15;
		color: var(--foreground);
		margin: 0;
	}

	.cta-sub {
		font-size: clamp(0.95rem, 1.5vw, 1.1rem);
		line-height: 1.7;
		color: var(--foreground-muted);
		margin: 0;
	}

	/* CTA Button */
	.cta-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.5rem;
		padding: 0.65rem 1.4rem;
		border-radius: var(--radius-sm, 0.55rem);
		background: var(--accent);
		color: #fff;
		font-size: 0.9rem;
		font-weight: 500;
		letter-spacing: 0.01em;
		border: none;
		cursor: pointer;
		transition:
			background 150ms ease-out,
			transform 150ms ease-out,
			box-shadow 150ms ease-out;
		box-shadow: 0 2px 12px rgba(244, 63, 94, 0.25);
	}

	.cta-button:hover {
		background: color-mix(in oklch, var(--accent) 85%, black);
		transform: translateY(-1px);
		box-shadow: 0 4px 20px rgba(244, 63, 94, 0.35);
	}

	.cta-button:active {
		transform: translateY(0);
		box-shadow: 0 2px 8px rgba(244, 63, 94, 0.2);
	}

	/* ─── Contacts Modal ───────────────────────────────────────── */
	.contacts-overlay {
		animation: fade-in 200ms ease-out;
	}

	.contacts-modal {
		animation: scale-in 250ms ease-out;
	}

	@keyframes fade-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes scale-in {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	/* ─── Section Layout ───────────────────────────────────────── */
	.section-block {
		padding-top: clamp(2rem, 4vw, 3rem);
		padding-bottom: clamp(4rem, 8vw, 7rem);
	}

	.section-overline {
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--foreground-muted);
		margin-bottom: 2rem;
	}

	.section-lead {
		font-size: clamp(1.75rem, 3.5vw, 2.6rem);
		font-weight: 500;
		line-height: 1.55;
		margin: 0;
		max-width: 100%;
	}

	.section-headlines {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		margin-bottom: 2.5rem;
	}

	.section-headline-plain {
		font-size: clamp(1.75rem, 3.5vw, 2.6rem);
		font-weight: 500;
		line-height: 1.55;
		color: var(--foreground);
		margin: 0;
		max-width: 100%;
	}

	.section-headline-muted {
		font-size: clamp(1.75rem, 3.5vw, 2.6rem);
		font-weight: 500;
		line-height: 1.55;
		color: var(--foreground-muted);
		margin: 0;
		max-width: 100%;
	}

	/* ─── Projects Grid ────────────────────────────────────────── */
	.projects-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}

	@media (max-width: 479px) {
		.projects-grid { grid-template-columns: 1fr; }
	}

	@media (min-width: 480px) and (max-width: 767px) {
		.projects-grid { grid-template-columns: repeat(2, 1fr); }
	}

	/* ─── Project Card ─────────────────────────────────────────── */
	.project-card-body {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding: 1.25rem 1.375rem 1.375rem;
		min-height: 10.5rem;
	}

	.project-card-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.project-slug {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.9rem;
		font-weight: 700;
		letter-spacing: -0.01em;
		color: var(--foreground);
	}

	@media (min-width: 768px) {
		.project-slug { font-size: 1rem; }
	}

	.project-wip {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.58rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--foreground-muted);
		background: var(--background-inset);
		border: 1px solid var(--border);
		padding: 0.15rem 0.45rem;
		border-radius: 999px;
	}

	.project-desc {
		font-size: 0.8rem;
		line-height: 1.6;
		color: var(--foreground-muted);
		margin: 0;
		flex: 1;
	}

	@media (min-width: 768px) {
		.project-desc { font-size: 0.85rem; }
	}
</style>