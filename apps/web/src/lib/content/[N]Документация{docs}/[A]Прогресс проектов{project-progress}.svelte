<script module lang="ts">
	import { type ContentFrontmatter } from '$lib/content/frontmatter';

	export const metadata: ContentFrontmatter = {
		name: 'Прогресс проектов',
		description: 'Актуальный статус и прогресс разработки открытых проектов Opensophy.'
	};
</script>

<script lang="ts">
	type ProjectStatus = 'active' | 'frozen' | 'planned';

	type Project = {
		slug: string;
		title: string;
		description: string;
		status: ProjectStatus;
		progress: number;
		tasks: string[];
	};

	const projects: Project[] = [
		{
			slug: 'os.docs',
			title: 'os.docs',
			status: 'active',
			progress: 80,
			description:
				'Платформа документации и публикации контента. Подходит для технических команд, авторов и всех, кто хочет красиво структурировать знания.',
			tasks: [
				'Доработать поиск — добавить fuzzy-search',
				'Добавить страницу с changelog',
				'Написать гайд по созданию кастомных секций',
				'Адаптировать мобильный вид TOC',
				'Добавить поддержку тёмного OG-изображения'
			]
		},
		{
			slug: 'os.ui',
			title: 'os.ui',
			status: 'active',
			progress: 100,
			description:
				'Библиотека готовых компонентов с живым превью и настройками. Анимации, интерактивные блоки, кастомные элементы.',
			tasks: []
		},
		{
			slug: 'os.net',
			title: 'os.net',
			status: 'frozen',
			progress: 60,
			description:
				'GUI-платформа управления безопасным удалённым доступом: P2P, VPN, proxy, mTLS — всё в одном интерфейсе.',
			tasks: [
				'Реализовать WebUI для управления туннелями',
				'Добавить поддержку WireGuard',
				'Реализовать мониторинг соединений в реальном времени',
				'Написать документацию по архитектуре'
			]
		},
		{
			slug: 'os.mtls',
			title: 'os.mtls',
			status: 'active',
			progress: 100,
			description:
				'Инструмент для быстрого создания и управления mTLS-сертификатами. Мгновенный отзыв доступа без CRL и OCSP.',
			tasks: []
		},
		{
			slug: 'os.oasm',
			title: 'os.oasm',
			status: 'planned',
			progress: 0,
			description:
				'Open Application Security Manager — единая платформа управления безопасностью приложений: SAST, DAST, SCA в одном интерфейсе.',
			tasks: [
				'Определить архитектуру и стек',
				'Разработать схему базы данных',
				'Реализовать интеграцию с Semgrep',
				'Реализовать интеграцию с Trivy',
				'Создать базовый UI для отображения результатов',
				'Написать документацию по установке'
			]
		},
		{
			slug: 'os.port',
			title: 'os.port',
			status: 'planned',
			progress: 0,
			description:
				'Портал управления проектами и сервисами Opensophy — единая точка входа для команды и клиентов.',
			tasks: [
				'Определить функциональные требования',
				'Разработать прототип интерфейса',
				'Выбрать стек и архитектуру',
				'Реализовать аутентификацию',
				'Написать базовую документацию'
			]
		},
		{
			slug: 'os.forum',
			title: 'os.forum',
			status: 'planned',
			progress: 0,
			description:
				'Форум сообщества Opensophy — место для обсуждений, вопросов и обмена опытом по DevSecOps, безопасности и open-source.',
			tasks: [
				'Выбрать движок форума (Discourse / Flarum / кастом)',
				'Настроить хостинг и домен forum.opensophy.com',
				'Разработать правила сообщества',
				'Создать начальные категории и теги',
				'Настроить SSO с opensophy.com'
			]
		}
	];

	const platforms = ['opensophy.com', 'forum.opensophy.com'];

	const statusMeta: Record<ProjectStatus, { label: string; color: string; dot: string }> = {
		active:  { label: 'Активен',   color: 'text-emerald-500', dot: 'bg-emerald-500' },
		frozen:  { label: 'Заморожен', color: 'text-sky-500',     dot: 'bg-sky-500'     },
		planned: { label: 'Планируется', color: 'text-rose-500',  dot: 'bg-rose-500'    }
	};

	function progressBarColor(status: ProjectStatus, progress: number): string {
		if (progress === 100) return 'bg-emerald-500';
		if (status === 'frozen') return 'bg-sky-500';
		if (status === 'planned') return 'bg-foreground-muted/30';
		return 'bg-accent';
	}
</script>

<div class="w-full space-y-10">
	<!-- Header -->
	<div class="space-y-3">
		<p class="text-xs font-semibold tracking-widest uppercase text-foreground-muted/60">
			Opensophy · Проекты
		</p>
		<p class="text-sm leading-relaxed text-foreground-muted max-w-2xl">
			Актуальный статус разработки открытых проектов. Обновляется вручную по мере продвижения.
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
	<div class="grid gap-4 sm:grid-cols-2">
		{#each projects as project (project.slug)}
			{@const meta = statusMeta[project.status]}
			<div class="inset-shadow rounded-xl bg-background-inset p-1.5">
				<div class="flex h-full flex-col rounded-lg border border-border bg-background p-5 card gap-4">

					<!-- Card header -->
					<div class="flex items-start justify-between gap-3">
						<div class="min-w-0 flex-1 space-y-1">
							<div class="flex items-center gap-2 flex-wrap">
								<span class="font-mono text-base font-bold tracking-tight text-foreground">
									{project.title}
								</span>
								<span class="flex items-center gap-1 text-xs font-medium {meta.color}">
									<span class="relative flex size-2">
										{#if project.status === 'active' && project.progress < 100}
											<span class="absolute inline-flex size-full animate-ping rounded-full opacity-60 {meta.dot}"></span>
										{/if}
										<span class="relative inline-flex size-2 rounded-full {meta.dot}"></span>
									</span>
									{meta.label}
								</span>
							</div>
							<p class="text-xs leading-relaxed text-foreground-muted">
								{project.description}
							</p>
						</div>
						<!-- Progress number -->
						<span class="shrink-0 font-mono text-xl font-bold tabular-nums {project.progress === 100 ? 'text-emerald-500' : project.status === 'frozen' ? 'text-sky-500' : project.status === 'planned' ? 'text-foreground-muted/50' : 'text-accent'}">
							{project.progress}%
						</span>
					</div>

					<!-- Progress bar -->
					<div class="space-y-1.5">
						<div class="h-1.5 w-full overflow-hidden rounded-full bg-background-inset">
							<div
								class="h-full rounded-full transition-all duration-500 {progressBarColor(project.status, project.progress)}"
								style="width: {project.progress}%"
							></div>
						</div>
					</div>

					<!-- Tasks / Completion -->
					{#if project.progress === 100}
						<div class="flex items-center gap-2 rounded-md bg-emerald-500/8 border border-emerald-500/20 px-3 py-2">
							<svg viewBox="0 0 16 16" fill="none" class="size-4 shrink-0 text-emerald-500" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M13.5 4.5L6.5 11.5L2.5 7.5"/>
							</svg>
							<span class="text-xs font-medium text-emerald-600 dark:text-emerald-400">
								Все задачи выполнены
							</span>
						</div>
					{:else if project.tasks.length > 0}
						<div class="space-y-1.5">
							<p class="text-xs font-semibold tracking-wide uppercase text-foreground-muted/60">
								Осталось сделать
							</p>
							<ul class="space-y-1">
								{#each project.tasks as task (task)}
									<li class="flex items-start gap-2 text-xs text-foreground-muted">
										<span class="mt-1 size-1.5 shrink-0 rounded-full bg-foreground-muted/30"></span>
										{task}
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<!-- Platforms section -->
	<div class="inset-shadow rounded-xl bg-background-inset p-1.5">
		<div class="rounded-lg border border-border bg-background p-5 card space-y-3">
			<p class="text-xs font-semibold tracking-widest uppercase text-foreground-muted/60">
				Платформы
			</p>
			<div class="flex flex-wrap gap-2">
				{#each platforms as platform (platform)}
					<span class="inline-flex items-center gap-1.5 rounded-md border border-border bg-background-inset px-3 py-1.5 font-mono text-xs font-medium text-foreground-muted">
						<span class="size-1.5 rounded-full bg-emerald-500"></span>
						{platform}
					</span>
				{/each}
			</div>
		</div>
	</div>
</div>
