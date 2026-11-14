import type { RequestHandler } from './$types';
import { siteConfig } from '$lib/config/site';
import {
	contentSections,
	getContentSectionHref,
	getContentSectionManifest,
	getContentSectionSourcePath
} from '$lib/content/sections';
import { getLastModified } from '$lib/server/git-dates';

export const prerender = true;

type SitemapEntry = {
	path: string;
	lastmod: string;
};

const HOME_SOURCES = [
	'/src/routes/+page.svelte',
	'/src/lib/components/home/NginxionsSection.svelte',
	'/src/lib/components/home/ProductsPanel.svelte',
	'/src/lib/config/products.ts'
];

const customPage = (route: string, extension = 'svelte') =>
	`/src/routes/(custom-pages)/${route}/+page.${extension}`;

// Только канонические страницы с собственным содержимым. Корни секций
// (/article, /docs) — редиректы на первую статью, в карту сайта не входят.
const staticPages: SitemapEntry[] = [
	{ path: '/', lastmod: getLastModified(...HOME_SOURCES) },
	{ path: '/nginxions', lastmod: getLastModified(customPage('nginxions'), '/src/lib/config/products.ts') },
	{ path: '/solutions', lastmod: getLastModified(customPage('solutions')) },
	{ path: '/components', lastmod: getLastModified(customPage('components')) },
	{ path: '/mtls', lastmod: getLastModified(customPage('mtls')) },
	{ path: '/news', lastmod: getLastModified(customPage('news', 'svx')) },
	{ path: '/status', lastmod: getLastModified(customPage('status', 'svx')) },
	{ path: '/service-policy', lastmod: getLastModified(customPage('service-policy')) },
	{ path: '/data-policy', lastmod: getLastModified(customPage('data-policy')) }
];

const escapeXml = (value: string) =>
	value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const GET: RequestHandler = () => {
	const origin = new URL(siteConfig.url).origin;

	const contentPages: SitemapEntry[] = contentSections.flatMap((section) =>
		getContentSectionManifest(section.id).map((item) => {
			const source = getContentSectionSourcePath(section.id, item.slug);
			return {
				path: getContentSectionHref(section.id, item.slug),
				lastmod: source ? getLastModified(source) : getLastModified()
			};
		})
	);

	const entries = new Map<string, SitemapEntry>();
	for (const entry of [...staticPages, ...contentPages]) {
		if (!entries.has(entry.path)) entries.set(entry.path, entry);
	}

	const body =
		`<?xml version="1.0" encoding="UTF-8"?>\n` +
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
		Array.from(entries.values())
			.map(
				(entry) =>
					`<url><loc>${escapeXml(new URL(entry.path, origin).href)}</loc><lastmod>${entry.lastmod}</lastmod></url>`
			)
			.join('\n') +
		`\n</urlset>\n`;

	return new Response(body, {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
			'cache-control': 'public, max-age=3600'
		}
	});
};
