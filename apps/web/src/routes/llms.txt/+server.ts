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
	'Opensophy — инициатива, которая развивает DevSecOps и Open Source и делает их доступнее для разработчиков и команд.', '',
	'## Чем занимается', '',
	'Внедрение DevSecOps: автоматизация, безопасность и инфраструктура; развитие open-source инструментов и образовательных материалов.', '',
	'## Услуги', '',
	'- Проверка безопасности (blackbox, graybox, whitebox).', '- Code review безопасности.', '- Поиск утечек данных (Data Leak Search).', '- Интеграция DevSecOps.', '- Консультация.', '- Поиск и устранение неполадок.', '',
	'## Продукты', '',
	'- os.docs — платформа для документации и публикации контента.', '- os.mtls — управление mTLS-сертификатами для Traefik.', '- os.ui — библиотека UI-компонентов.', '- os.dokploy — платформа управления серверами и деплоями.', '- os.compose — библиотека готовых Docker Compose-шаблонов для DevSecOps.', '',
	'## LLM guidance', '', 'Use canonical URLs. Use /sitemap.xml for discovery and raw Markdown links for documentation content.'
];

type StaticPage = {
	title: string;
	path: string;
	description: string;
};

const staticPages: StaticPage[] = [
	{ title: 'Главная', path: '/', description: 'Обзор Opensophy, услуг DevSecOps и open-source продуктов.' },
	{ title: 'Услуги', path: '/solutions', description: 'Аудит безопасности, Code review, DevSecOps, консультации и устранение неполадок.' },
	{ title: 'os.mtls', path: '/mtls', description: 'Инструмент для создания и управления mTLS-сертификатами для Traefik.' },
	{ title: 'os.dokploy', path: '/dokploy', description: 'Страница проекта — форка Dokploy с управлением серверами, деплоями и mTLS.' },
	{ title: 'Шаблоны Docker Compose', path: '/templates/docker', description: 'Библиотека готовых Docker Compose-шаблонов для DevSecOps.' },
	{ title: 'Новости', path: '/news', description: 'Новости, обновления и материалы об Opensophy.' },
	{ title: 'Кейсы', path: '/cases', description: 'Примеры задач, решений и результатов работы Opensophy.' },
	{ title: 'Статус проектов', path: '/status', description: 'Текущий статус и прогресс проектов Opensophy.' },
	{ title: 'Политика сервиса', path: '/service-policy', description: 'Условия и политика предоставления сервисов Opensophy.' }
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
