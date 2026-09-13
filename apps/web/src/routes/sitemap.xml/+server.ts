import type { RequestHandler } from './$types';
import { siteConfig } from '$lib';
import { getTemplateEntries } from '$lib/templates/registry';

export const prerender = true;
import { contentSections, getContentSectionHref, getContentSectionManifest } from '$lib/content/sections';

type SitemapEntry = {
	path: string;
	changefreq?: string;
	priority?: string;
};

const staticPages: SitemapEntry[] = [
	{ path: '/', changefreq: 'weekly', priority: '1.0' },
	{ path: '/llms.txt', changefreq: 'weekly', priority: '0.4' },
	{ path: '/solutions/security', changefreq: 'monthly', priority: '0.8' },
	{ path: '/solutions/automation', changefreq: 'monthly', priority: '0.8' },
	{ path: '/solutions/infrastructure', changefreq: 'monthly', priority: '0.8' },
	{ path: '/mtls', changefreq: 'weekly', priority: '0.8' },
	{ path: '/dokploy', changefreq: 'weekly', priority: '0.8' },
	{ path: '/templates', changefreq: 'weekly', priority: '0.8' },
	{ path: '/templates/docker', changefreq: 'weekly', priority: '0.7' },
	{ path: '/news', changefreq: 'weekly', priority: '0.7' },
	{ path: '/cases', changefreq: 'monthly', priority: '0.7' },
	{ path: '/status', changefreq: 'daily', priority: '0.6' },
	{ path: '/service-policy', changefreq: 'yearly', priority: '0.5' }
];

const buildTimestamp = new Date().toISOString();

const toAbsoluteUrl = (origin: string, path: string) => new URL(path, origin).href;

const createUrlEntry = (origin: string, entry: SitemapEntry) => {
	const loc = toAbsoluteUrl(origin, entry.path);
	const changefreqTag = entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : '';
	const priorityTag = entry.priority ? `<priority>${entry.priority}</priority>` : '';
	return `<url><loc>${loc}</loc><lastmod>${buildTimestamp}</lastmod>${changefreqTag}${priorityTag}</url>`;
};

const dedupeEntries = (entries: SitemapEntry[]) => {
	const map = new Map<string, SitemapEntry>();
	for (const entry of entries) {
		if (!map.has(entry.path)) {
			map.set(entry.path, entry);
		}
	}
	return Array.from(map.values());
};

export const GET: RequestHandler = () => {
	const canonicalOrigin = new URL(siteConfig.url).origin;

	const sectionRootEntries: SitemapEntry[] = contentSections.map((section) => ({
		path: `/${section.id}`,
		changefreq: 'weekly',
		priority: '0.9'
	}));

	const sectionEntries: SitemapEntry[] = contentSections.flatMap((section) =>
		getContentSectionManifest(section.id).map((item) => ({
			path: getContentSectionHref(section.id, item.slug),
			changefreq: 'weekly',
			priority: '0.8'
		}))
	);
	const templateEntries: SitemapEntry[] = getTemplateEntries().map((template) => ({
		path: `/templates/${template.slug}`,
		changefreq: 'weekly',
		priority: '0.7'
	}));

	const uniqueEntries = dedupeEntries([
		...staticPages,
		...templateEntries,
		...sectionRootEntries,
		...sectionEntries
	]);

	const body =
		`<?xml version="1.0" encoding="UTF-8"?>` +
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
		uniqueEntries.map((entry) => createUrlEntry(canonicalOrigin, entry)).join('') +
		`</urlset>`;

	return new Response(body, {
		headers: {
			'content-type': 'application/xml',
			'cache-control': 'public, max-age=3600'
		}
	});
};
