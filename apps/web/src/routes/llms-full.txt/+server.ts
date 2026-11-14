import type { RequestHandler } from './$types';
import { siteConfig } from '$lib/config/site';
import { parseContentSource } from '$lib/content/frontmatter';
import {
	contentSections,
	getContentSectionHref,
	getContentSectionManifest,
	getContentSectionMetadata
} from '$lib/content/sections';
import { getContentSectionRawSource } from '$lib/server/content-raw';

export const prerender = true;

// Текстовые разделы: база знаний и документация. Страницы библиотеки
// компонентов состоят из интерактивных демо и в полный текст не входят.
const TEXT_SECTIONS = new Set(['article', 'docs']);

/** Убирает из `.svx` служебную разметку, оставляя читаемый Markdown. */
function toPlainMarkdown(body: string) {
	return body
		.replace(/<script[^>]*>[\s\S]*?<\/script>/g, '')
		.replace(/<style[^>]*>[\s\S]*?<\/style>/g, '')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

export const GET: RequestHandler = () => {
	const origin = new URL(siteConfig.url).origin;
	const blocks: string[] = [
		`# ${siteConfig.name} — полный текст`,
		'',
		`> ${siteConfig.description}`,
		''
	];

	for (const section of contentSections) {
		if (!TEXT_SECTIONS.has(section.id)) continue;

		for (const item of getContentSectionManifest(section.id)) {
			const raw = getContentSectionRawSource(section.id, item.slug);
			if (!raw) continue;

			const href = getContentSectionHref(section.id, item.slug);
			const metadata = getContentSectionMetadata(section.id, href);
			const { body } = parseContentSource(raw);

			blocks.push(
				'---',
				'',
				`# ${metadata?.title ?? item.name}`,
				'',
				`Источник: ${new URL(href, origin).href}`,
				...(metadata?.description ? ['', metadata.description] : []),
				'',
				toPlainMarkdown(body),
				''
			);
		}
	}

	return new Response(blocks.join('\n'), {
		headers: {
			'content-type': 'text/plain; charset=utf-8',
			'cache-control': 'public, max-age=3600'
		}
	});
};
