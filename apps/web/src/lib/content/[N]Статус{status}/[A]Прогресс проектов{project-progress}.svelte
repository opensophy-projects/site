<script module lang="ts">
	import { type ContentFrontmatter } from '$lib/content/frontmatter';

	export const metadata: ContentFrontmatter = {
		name: 'Прогресс проектов',
		description: 'Актуальный статус и прогресс разработки открытых проектов Opensophy.'
	};
</script>

<script lang="ts">
	import Documentation from 'carbon-icons-svelte/lib/Documentation.svelte';
	import ApplicationWeb from 'carbon-icons-svelte/lib/ApplicationWeb.svelte';
	import Network_3 from 'carbon-icons-svelte/lib/Network_3.svelte';
	import Certificate from 'carbon-icons-svelte/lib/Certificate.svelte';
	import Security from 'carbon-icons-svelte/lib/Security.svelte';
	import Deploy from 'carbon-icons-svelte/lib/Deploy.svelte';
	import Forum from 'carbon-icons-svelte/lib/Forum.svelte';
	import Globe from 'carbon-icons-svelte/lib/Globe.svelte';
	import CheckmarkFilled from 'carbon-icons-svelte/lib/CheckmarkFilled.svelte';
	import Time from 'carbon-icons-svelte/lib/Time.svelte';
	import Warning from 'carbon-icons-svelte/lib/Warning.svelte';
	import type Component from 'carbon-icons-svelte/lib/Component.svelte';

	type ProjectStatus = 'active' | 'frozen' | 'planned';

	type Project = {
		slug: string;
		title: string;
		description: string;
		status: ProjectStatus;
		progress: number;
		statusText: string;
		tasksHeader: string;
		tasks: string[];
		icon: typeof Component;
	};

	const projects: Project[] = [
		{
			slug: 'os.docs',
			title: 'os.docs',
			description:
				'Платформа для документации и публикации контента. Подходит для технических команд, авторов и всех, кто хочет структурированно делиться знаниями.',
			status: 'active',
			progress: 80,
			statusText: 'в процессе',
			tasksHeader: 'Оставшиеся задачи:',
			tasks: [
				'разработка dev-панели для быстрого создания проектов и управления контентом'
			],
			icon: Documentation
		},
		{
			slug: 'os.ui',
			title: 'os.ui',
			description:
				'Библиотека готовых UI-компонентов с живым превью и гибкими настройками. Включает анимации, интерактивные блоки и фирменные компоненты Opensophy — для разработчиков и дизайнеров.',
			status: 'active',
			progress: 100,
			statusText: 'проект в релизе',
			tasksHeader: 'Ожидает обновления:',
			tasks: [
				'пополнение библиотеки новыми компонентами'
			],
			icon: ApplicationWeb
		},
		{
			slug: 'os.net',
			title: 'os.net',
			description:
				'Форк проекта Netbird. GUI-платформа для управления безопасным удалённым доступом: P2P, VPN, proxy, mTLS — всё в одном интерфейсе. Бесплатная enterprise-версия.',
			status: 'frozen',
			progress: 60,
			statusText: 'в заморозке. Ожидаем, пока upstream-разработчики выведут proxy и расширенное управление из бета-версии.',
			tasksHeader: 'Оставшиеся задачи:',
			tasks: [
				'русификация интерфейса',
				'модификация протокола WireGuard',
				'интеграция с community-решениями',
				'управление mTLS для Traefik и NGINX (под вопросом — ищем нативный способ интеграции, совместимый со всеми прокси)'
			],
			icon: Network_3
		},
		{
			slug: 'os.mtls',
			title: 'os.mtls',
			description:
				'Инструмент для быстрого создания и управления mTLS-сертификатами для Traefik. Позволяет надёжно закрыть доступ к сервисам и серверам без лишних сложностей.',
			status: 'active',
			progress: 100,
			statusText: 'проект в релизе',
			tasksHeader: 'Ожидает обновления:',
			tasks: [
				'расширение поддержки mTLS для Docker',
				'интеграция с os.port и os.net',
				'разработка версии под NGINX и публикация в NPM'
			],
			icon: Certificate
		},
		{
			slug: 'os.oasm',
			title: 'os.oasm',
			description:
				'Open App Sec Models — система защиты веб-приложений (WAF) на основе машинного обучения. Opensophy будет поставлять готовые модели для интеграции WAF в сторонние проекты.',
			status: 'planned',
			progress: 0,
			statusText: 'разработка не начата',
			tasksHeader: '',
			tasks: [],
			icon: Security
		},
		{
			slug: 'os.port',
			title: 'os.port',
			description:
				'Форк проекта Dokploy — платформа для управления серверами и деплоя приложений. Бесплатная enterprise-версия с обновлённым дизайном, встроенным управлением mTLS и русификацией.',
			status: 'planned',
			progress: 0,
			statusText: 'разработка не начата',
			tasksHeader: 'Примечание:',
			tasks: [
				'проект проходит пересмотр архитектуры и технологического стека под новые требования'
			],
			icon: Deploy
		},
		{
			slug: 'os.forum',
			title: 'os.forum',
			description:
				'Платформа для создания форума на базе возможностей GitHub — Issues, Discussions, авторизация через GitHub.',
			status: 'planned',
			progress: 0,
			statusText: 'разработка не начата',
			tasksHeader: '',
			tasks: [],
			icon: Forum
		}
	];

	const platforms = [
		{ url: 'opensophy.com', label: 'os.docs + os.ui' },
		{ url: 'forum.opensophy.com', label: 'os.forum (в разработке)' }
	];

	const statusMeta: Record<ProjectStatus, { label: string; color: string; dot: string; ring: string }> = {
		active:  { label: 'Активен',     color: 'text-emerald-500', dot: 'bg-emerald-500', ring: 'text-emerald-500' },
		frozen:  { label: 'Заморожен',   color: 'text-sky-500',     dot: 'bg-sky-500',     ring: 'text-sky-500'     },
		planned: { label: 'Планируется',  color: 'text-rose-500',    dot: 'bg-rose-500',    ring: 'text-rose-500'    }
	};
</script>

<div class="w-full space-y-8">
	<!-- Header -->
	<div class="space-y-3">
		<h1 class="text-3xl font-bold tracking-tight text-foreground">Прогресс проектов</h1>
		<p class="text-sm leading-relaxed text-foreground-muted max-w-2xl">
			Актуальный статус разработки открытых проектов Opensophy. Обновляется вручную по мере продвижения.
		</p>

		<!-- Legend -->
		<div class="flex flex-wrap items-center gap-4 pt-1">
			{#each Object.entries(statusMeta) as [, meta] (meta.label)}
				<span class="flex items-center gap-1.5 text-xs font-medium {meta.color}">
					<span class="size-2 rounded-full {meta.dot}"></span>
					{meta.label}
				</span>
			{/each}
		</div>
	</div>

	<!-- Projects grid -->
	<div class="inset-shadow w-full overflow-hidden rounded-xl bg-background-inset p-2">
		<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
			{#each projects as project (project.slug)}
			{@const meta = statusMeta[project.status]}
			{@const isComplete = project.progress === 100}
			{@const isPlanned = project.status === 'planned'}
				<div class="inset-shadow relative overflow-hidden rounded-lg bg-background-inset p-1.5">
					<article class="grid h-full min-h-64 rounded-md bg-background p-4 card sm:p-5">
						<!-- Top: icon + status -->
						<div class="flex items-start justify-between">
							<div
								class="inset-shadow grid size-12 place-items-center rounded-sm bg-background-inset {isComplete ? 'text-accent' : meta.ring}"
							>
								<project.icon size={28} />
							</div>
							<div class="flex items-center gap-1.5 text-xs font-medium {meta.color}">
								<span class="relative flex size-2">
									{#if project.status === 'active' && !isComplete}
										<span class="absolute inline-flex size-full animate-ping rounded-full opacity-60 {meta.dot}"></span>
									{/if}
									<span class="relative inline-flex size-2 rounded-full {meta.dot}"></span>
								</span>
								{meta.label}
							</div>
						</div>

						<!-- Middle: title + description -->
						<div class="mt-4 grid gap-2">
							<h3 class="font-mono text-lg font-bold tracking-tight text-foreground">
								{project.title}
							</h3>
							<p class="text-sm leading-relaxed text-foreground-muted">
								{project.description}
							</p>
						</div>

						<!-- Bottom: progress + tasks -->
						<div class="mt-auto grid gap-3 pt-4">
							<!-- Progress bar -->
							<div class="flex items-center gap-3">
								<div class="h-1.5 flex-1 overflow-hidden rounded-full bg-background-inset">
									<div
										class="h-full rounded-full transition-all duration-500 {isComplete ? 'bg-accent' : isPlanned ? 'bg-foreground-muted/30' : meta.dot}"
										style="width: {project.progress}%"
									></div>
								</div>
								<span class="shrink-0 font-mono text-sm font-bold tabular-nums {isComplete ? 'text-accent' : 'text-foreground-muted'}">
									{project.progress}%
								</span>
							</div>

							<!-- Status text -->
							<p class="text-xs leading-relaxed text-foreground-muted">
								{#if isComplete}
									<span class="inline-flex items-center gap-1 font-medium {meta.color}">
										<CheckmarkFilled size={14} />
										100% — {project.statusText}
									</span>
								{:else if isPlanned}
									<span class="inline-flex items-center gap-1 font-medium {meta.color}">
										<Time size={14} />
										{project.progress}% — {project.statusText}
									</span>
								{:else}
									<span class="inline-flex items-center gap-1 font-medium {meta.color}">
										{#if project.status === 'frozen'}
											<Time size={14} />
										{:else}
											<Warning size={14} />
										{/if}
										{project.progress}% — {project.statusText}
									</span>
								{/if}
							</p>

							<!-- Tasks / notes -->
							{#if project.tasks.length > 0}
								<div class="space-y-1.5">
									{#if project.tasksHeader}
										<p class="text-xs font-semibold tracking-wide uppercase text-foreground-muted/60">
											{project.tasksHeader}
										</p>
									{/if}
									<ul class="space-y-1">
										{#each project.tasks as task (task)}
											<li class="flex items-start gap-2 text-xs text-foreground-muted">
												<span class="mt-1 size-1.5 shrink-0 rounded-full {isComplete ? 'bg-accent' : 'bg-foreground-muted/30'}"></span>
												{task}
											</li>
										{/each}
									</ul>
								</div>
							{/if}
						</div>
					</article>
				</div>
			{/each}
		</div>
	</div>

	<!-- Platforms section -->
	<div class="inset-shadow rounded-xl bg-background-inset p-2">
		<div class="rounded-lg bg-background p-5 card space-y-3">
			<p class="text-xs font-semibold tracking-widest uppercase text-foreground-muted/60">
				Платформы
			</p>
			<div class="grid gap-2 sm:grid-cols-2">
				{#each platforms as platform (platform.url)}
					<div class="flex items-center gap-3 rounded-lg border border-border bg-background-inset px-4 py-3">
						<div class="inset-shadow grid size-10 place-items-center rounded-sm bg-background text-accent">
							<Globe size={22} />
						</div>
						<div class="min-w-0 space-y-0.5">
							<p class="font-mono text-sm font-semibold text-foreground truncate">
								{platform.url}
							</p>
							<p class="text-xs text-foreground-muted">
								{platform.label}
							</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
