import type { RequestHandler } from './$types';
import { siteConfig } from '$lib/config/site';
import { contentSections } from '$lib/content/sections';

export const prerender = true;

// Служебные адреса: сырой Markdown (дубли страниц) и поисковый индекс
const disallow = [
	...contentSections.map((section) => `Disallow: /${section.id}/raw/`),
	'Disallow: /search-index.json'
];

// ИИ-краулеры допущены явно: ассистенты цитируют сайт и берут
// машиночитаемую версию из llms.txt и raw-Markdown.
const aiCrawlers = [
	'GPTBot',
	'OAI-SearchBot',
	'ChatGPT-User',
	'ClaudeBot',
	'Claude-SearchBot',
	'PerplexityBot',
	'Google-Extended',
	'YandexAdditional',
	'Applebot-Extended'
];

export const GET: RequestHandler = () => {
	const origin = new URL(siteConfig.url).origin;
	const lines = [
		'User-agent: *',
		'Allow: /',
		...disallow,
		'',
		...aiCrawlers.map((agent) => `User-agent: ${agent}`),
		'Allow: /',
		'Disallow: /search-index.json',
		'',
		`Sitemap: ${new URL('/sitemap.xml', origin).href}`,
		`Host: ${new URL(origin).host}`
	];

	return new Response(lines.join('\n') + '\n', {
		headers: {
			'content-type': 'text/plain; charset=utf-8',
			'cache-control': 'public, max-age=3600'
		}
	});
};
