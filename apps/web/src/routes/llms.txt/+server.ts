import type { RequestHandler } from './$types';
import { siteConfig } from '$lib';
import { getTemplateEntries } from '$lib/templates/registry';

export const prerender = true;
import { contentSections } from '$lib/content/sections';
import {
	getContentSectionHref,
	getContentSectionManifest,
	getContentSectionMetadata,
	getContentSectionRawHref,
	type ContentSectionId,
} from '$lib/content/sections';

type ContentEntry = {
	sectionId: ContentSectionId;
	sectionLabel: string;
	slug: string;
	fallbackTitle: string;
};

const summary = `${siteConfig.name} is ${siteConfig.description}`;

const overviewParagraphs = [
	'Opensophy — инициатива открытой философии в IT. Качественные и доступные знания, услуги, инструменты и решения.',
	'',
	'## Что такое Opensophy?',
	'',
	'Opensophy — инициатива открытой философии в IT. Качественные и доступные знания, услуги, инструменты и решения. DevSecOps, кибербезопасность, автоматизация и open-source инструменты.',
	'',
	'## Чем занимается',
	'',
	'Учим безопасности, настраиваем защиту, автоматизируем рутину. От образовательных материалов до внедрения DevSecOps и Zero Trust в реальную инфраструктуру.',
	'',
	'Услуги:',
	'- Интеграция анализа безопасности — автоматический анализ кода на уязвимости на каждом этапе разработки (SCA, SAST, DAST, LINT, WAF, IaC) в CI/CD.',
	'- Проверка защищённости — этичная проверка сервиса или сервера на наличие уязвимостей: открытые точки входа, слабые конфигурации.',
	'- Автоматизация — от простого bash-скрипта до сложных решений под индивидуальные требования.',
	'- Разработка под заказ — сайты, лендинги и веб-системы под любой стек (React, Svelte, Next.js, Node.js и другие).',
	'- Настройка безопасного доступа — защищённый доступ к сервисам и серверам (mTLS, VPN, Zero Trust и другие подходы).',
	'- Знания каждому! — открытые статьи и гайды по DevSecOps и безопасности.',
	'',
	'## Что разрабатывает',
	'',
	'Создаём open-source инструменты для безопасной инфраструктуры и современных IT-команд.',
	'',
	'### os.docs (в процессе)',
	'Платформа для документации и публикации контента. Подходит для технических команд, авторов и всех, кто хочет структурированно делиться знаниями.',
	'',
	'### os.ui (в релизе)',
	'Библиотека готовых UI-компонентов с живым превью и гибкими настройками. Включает анимации, интерактивные блоки и фирменные компоненты Opensophy — для разработчиков и дизайнеров.',
	'',
	'### os.mtls (в релизе)',
	'Инструмент для быстрого создания и управления mTLS-сертификатами для Traefik. Позволяет надёжно закрыть доступ к сервисам и серверам без лишних сложностей.',
	'',
	'### os.dokploy (скоро в релизе)',
	'Форк проекта Dokploy — платформа для управления серверами и деплоя приложений. Бесплатная enterprise-версия с обновлённым дизайном, встроенным управлением mTLS и русификацией.',
	'',
	'## О создателе',
	'',
	'DevSecOps-инженер и исследователь безопасности. Внедрение DevSecOps, аудит приложений и инфраструктуры, автоматизация, ответственное раскрытие уязвимостей.',
	'',
	'Компетенции: DevSecOps, CI/CD Security, SAST / DAST / SCA, Docker Security, Bash & Python, Web App Audit, AI Security.',
	'',
	'Открыт к предложениям — ищет компанию или команду в роли DevSecOps-инженера.',
	'',
	'Контакты: Telegram @opensophy, email opensophy@gmail.com, GitHub https://github.com/opensophy-projects.',
	'',
	'## LLM guidance',
	'',
	'This file is the complete, curated index of public Opensophy pages. Prefer the canonical page URL when referring users to a page.',
	'For documentation, articles, and component-library entries, each item also includes a Raw Markdown link. Raw Markdown contains the source content without site navigation or interactive UI.',
	'Use `/sitemap.xml` for machine-readable URL discovery and `/robots.txt` for crawl guidance.',
];

type StaticPage = {
	title: string;
	path: string;
	description: string;
};

const staticPages: StaticPage[] = [
	{
		title: 'Главная',
		path: '/',
		description:
			'Обзор Opensophy, его услуг и open-source проектов: os.docs, os.ui, os.mtls и os.dokploy.',
	},
	{
		title: 'Безопасность',
		path: '/solutions/security',
		description:
			'Услуги безопасности: SAST, DAST, SCA, пентесты, поиск утечек и триаж уязвимостей.',
	},
	{
		title: 'Автоматизация',
		path: '/solutions/automation',
		description:
			'Услуги автоматизации: CI/CD, DevSecOps, инфраструктура, мониторинг и кастомные инструменты.',
	},
	{
		title: 'Инфраструктура',
		path: '/solutions/infrastructure',
		description:
			'Услуги инфраструктуры: серверы, прокси, контейнеризация, моделирование угроз и мониторинг.',
	},
	{
		title: 'os.mtls',
		path: '/mtls',
		description:
			'Инструмент для создания и управления mTLS-сертификатами для Traefik.',
	},
	{
		title: 'os.dokploy',
		path: '/dokploy',
		description:
			'Страница проекта — форка Dokploy с управлением серверами, деплоями и mTLS.',
	},
	{
		title: 'Шаблоны Docker Compose',
		path: '/templates',
		description:
			'Реестр готовых шаблонов Docker Compose для DevSecOps, безопасности и автоматизации.',
	},
	{
		title: 'Шаблоны Docker Compose: Docker',
		path: '/templates/docker',
		description: 'Тот же реестр, доступный по тематическому Docker URL.',
	},
	{
		title: 'Новости',
		path: '/news',
		description: 'Новости, обновления и материалы об Opensophy.',
	},
	{
		title: 'Кейсы',
		path: '/cases',
		description: 'Примеры задач, решений и результатов работы Opensophy.',
	},
	{
		title: 'Статус проектов',
		path: '/status',
		description: 'Текущий статус и прогресс проектов Opensophy.',
	},
	{
		title: 'Политика сервиса',
		path: '/service-policy',
		description: 'Условия и политика предоставления сервисов Opensophy.',
	},
];

const buildContentEntry = (origin: string, entry: ContentEntry) => {
	const pagePath = getContentSectionHref(entry.sectionId, entry.slug);
	const metadata = getContentSectionMetadata(entry.sectionId, pagePath);
	const title = metadata?.title ?? entry.fallbackTitle;
	const description =
		metadata?.description ?? `${entry.sectionLabel} page for ${title}.`;
	const rawPath = getContentSectionRawHref(entry.sectionId, entry.slug);
	const pageLink = new URL(pagePath, origin).href;
	const rawLink = new URL(rawPath, origin).href;
	return `- [${title}](${pageLink}): ${description} [Raw Markdown](${rawLink})`;
};

const buildStaticPageEntry = (origin: string, page: StaticPage) =>
	`- [${page.title}](${new URL(page.path, origin).href}): ${page.description}`;

const buildTemplateEntry = (
	origin: string,
	template: ReturnType<typeof getTemplateEntries>[number]
) =>
	`- [${template.title}](${new URL(`/templates/${template.slug}`, origin).href}): ${
		template.description || 'Docker Compose шаблон.'
	}`;

const dedupeEntries = (entries: ContentEntry[]) => {
	const map = new Map<string, ContentEntry>();
	for (const entry of entries) {
		const key = `${entry.sectionId}:${entry.slug}`;
		if (!map.has(key)) {
			map.set(key, entry);
		}
	}
	return Array.from(map.values());
};

const buildSection = (title: string, items: string[]) => {
	if (items.length === 0) return [];
	return [`## ${title}`, '', ...items];
};

export const GET: RequestHandler = () => {
	const canonicalOrigin = new URL(siteConfig.url).origin;
	const optionalLinks = [
		`- [GitHub](${siteConfig.links.github}): Source code, issues, and discussions.`,
		`- [Telegram](${siteConfig.links.telegram}): Project updates and direct contact.`,
		`- [Email](mailto:${siteConfig.links.email}): Direct contact with Opensophy.`,
		`- [Package](https://www.npmjs.com/package/${siteConfig.package.name}): Installation and release metadata.`,
		`- [Sitemap](${new URL('/sitemap.xml', canonicalOrigin).href}): Machine-readable list of public URLs.`,
		`- [Robots](${new URL('/robots.txt', canonicalOrigin).href}): Crawling guidance.`,
	];

	const sectionBlocks = contentSections.flatMap((section) => {
		const entries = dedupeEntries(
			getContentSectionManifest(section.id).map((item) => ({
				sectionId: section.id,
				sectionLabel: section.label,
				slug: item.slug,
				fallbackTitle: item.name,
			}))
		);

		return buildSection(
			section.label,
			[
				`- [${section.label}](${new URL(`/${section.id}`, canonicalOrigin).href}): ${
					section.description ?? `${section.label} section index.`
				}`,
				...entries.map((entry) => buildContentEntry(canonicalOrigin, entry))
			]
		);
	});

	const lines = [
		`# ${siteConfig.name}`,
		'',
		`> ${summary}`,
		'',
		...overviewParagraphs,
		'',
		...buildSection(
			'Основные страницы',
			staticPages.map((page) => buildStaticPageEntry(canonicalOrigin, page))
		),
		'',
		...buildSection(
			'Шаблоны Docker Compose',
			getTemplateEntries().map((template) =>
				buildTemplateEntry(canonicalOrigin, template)
			)
		),
		'',
		...sectionBlocks,
		'',
		...buildSection('Optional', optionalLinks),
		'',
	];

	const body =
		lines
			.join('\n')
			.replace(/\n{3,}/g, '\n\n')
			.trim() + '\n';

	return new Response(body, {
		headers: {
			'content-type': 'text/plain; charset=utf-8',
			'cache-control': 'public, max-age=3600',
		},
	});
};
