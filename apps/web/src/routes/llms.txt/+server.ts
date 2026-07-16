import type { RequestHandler } from './$types';
import { siteConfig } from '$lib';

export const prerender = true;
import { contentSections } from '$lib/content/sections';
import {
	getContentSectionHref,
	getContentSectionManifest,
	getContentSectionMetadata,
	getContentSectionRawHref,
	type ContentSectionId
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
	'### os.net (в заморозке)',
	'Форк проекта Netbird. GUI-платформа для управления безопасным удалённым доступом: P2P, VPN, proxy, mTLS — всё в одном интерфейсе. Бесплатная enterprise-версия. Ожидаем, пока upstream-разработчики выведут proxy и расширенное управление из бета-версии.',
	'',
	'### os.mtls (в релизе)',
	'Инструмент для быстрого создания и управления mTLS-сертификатами для Traefik. Позволяет надёжно закрыть доступ к сервисам и серверам без лишних сложностей.',
	'',
	'### os.oasm (В разработке)',
	'Open App Sec Models — система защиты веб-приложений (WAF) на основе машинного обучения. Opensophy будет поставлять готовые модели для интеграции WAF в сторонние проекты.',
	'',
	'### os.port (В разработке)',
	'Форк проекта Dokploy — платформа для управления серверами и деплоя приложений. Бесплатная enterprise-версия с обновлённым дизайном, встроенным управлением mTLS и русификацией.',
	'',
	'### os.forum (разработка не начата)',
	'Платформа для создания форума на базе возможностей GitHub — Issues, Discussions, авторизация через GitHub.',
	'',
	'## О создателе',
	'',
	'DevSecOps-инженер и исследователь безопасности. Внедрение DevSecOps, аудит приложений и инфраструктуры, автоматизация, ответственное раскрытие уязвимостей.',
	'',
	'Компетенции: DevSecOps, CI/CD Security, SAST / DAST / SCA, Docker Security, Bash & Python, Web App Audit, AI Security.',
	'',
	'Открыт к предложениям — ищет компанию или команду в роли DevSecOps-инженера.',
	'',
	'## LLM guidance',
	'',
	'LLM-friendly Markdown for every page is available at `/<section>/raw/<slug>`; this is the source content without navigation chrome.',
	'Use `/sitemap.xml` for URL discovery and `/robots.txt` for crawl guidance.'
];

const buildContentEntry = (origin: string, entry: ContentEntry) => {
	const pagePath = getContentSectionHref(entry.sectionId, entry.slug);
	const metadata = getContentSectionMetadata(entry.sectionId, pagePath);
	const title = metadata?.title ?? entry.fallbackTitle;
	const description = metadata?.description ?? `${entry.sectionLabel} page for ${title}.`;
	const rawPath = getContentSectionRawHref(entry.sectionId, entry.slug);
	const link = new URL(rawPath, origin).href;
	return `- [${title}](${link}): ${description}`;
};

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
		`- [Package](https://www.npmjs.com/package/${siteConfig.package.name}): Installation and release metadata.`
	];

	const sectionBlocks = contentSections.flatMap((section) => {
		const entries = dedupeEntries(
			getContentSectionManifest(section.id).map((item) => ({
				sectionId: section.id,
				sectionLabel: section.label,
				slug: item.slug,
				fallbackTitle: item.name
			}))
		);

		return buildSection(
			section.label,
			entries.map((entry) => buildContentEntry(canonicalOrigin, entry))
		);
	});

	const lines = [
		`# ${siteConfig.name}`,
		'',
		`> ${summary}`,
		'',
		...overviewParagraphs,
		'',
		...sectionBlocks,
		'',
		...buildSection('Optional', optionalLinks),
		''
	];

	const body =
		lines
			.join('\n')
			.replace(/\n{3,}/g, '\n\n')
			.trim() + '\n';

	return new Response(body, {
		headers: {
			'content-type': 'text/plain; charset=utf-8',
			'cache-control': 'public, max-age=3600'
		}
	});
};
