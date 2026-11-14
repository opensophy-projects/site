import { readFile } from 'node:fs/promises';
import type { Plugin } from 'vite';
import { parseContentSource } from '../src/lib/content/frontmatter';

/**
 * Лёгкие метаданные страницы контента, которые попадают в клиентский бандл
 * вместо полного исходника `.svx`.
 */
export type ContentMeta = {
	title?: string;
	name?: string;
	description?: string;
	keywords?: string;
	priority?: number;
	/** Заголовки документа вне блоков кода: [уровень, сырой текст]. */
	headings: [number, string][];
};

const META_QUERY = '?meta';
const VIRTUAL_PREFIX = '\0content-meta:';
const VIRTUAL_SUFFIX = '.meta.js';

function extractHeadings(body: string): [number, string][] {
	const headings: [number, string][] = [];
	let inFence = false;

	for (const line of body.split(/\r?\n/)) {
		if (/^\s*(```|~~~)/.test(line)) {
			inFence = !inFence;
			continue;
		}
		if (inFence) continue;

		const match = /^( {0,3})(#{1,6})\s+(.+?)\s*$/.exec(line);
		if (match) headings.push([match[2].length, match[3]]);
	}

	return headings;
}

export function buildContentMeta(rawSource: string): ContentMeta {
	const { metadata, body } = parseContentSource(rawSource);
	return {
		title: metadata.title,
		name: metadata.name,
		description: metadata.description,
		keywords: metadata.keywords,
		priority: metadata.priority,
		headings: extractHeadings(body)
	};
}

/**
 * `import.meta.glob('…/*.svx', { query: '?meta' })` отдаёт только frontmatter
 * и заголовки страницы. Навигации, SEO-тегам и оглавлению этого достаточно,
 * поэтому полный текст всех статей больше не едет в браузер на каждой странице.
 */
export function contentMeta(): Plugin {
	return {
		name: 'opensophy:content-meta',
		enforce: 'pre',
		async resolveId(source, importer) {
			if (!source.endsWith(`.svx${META_QUERY}`)) return null;
			const resolved = await this.resolve(source.slice(0, -META_QUERY.length), importer, {
				skipSelf: true
			});
			if (!resolved) return null;
			return `${VIRTUAL_PREFIX}${resolved.id}${VIRTUAL_SUFFIX}`;
		},
		async load(id) {
			if (!id.startsWith(VIRTUAL_PREFIX)) return null;
			const file = id.slice(VIRTUAL_PREFIX.length, -VIRTUAL_SUFFIX.length);
			this.addWatchFile(file);
			const meta = buildContentMeta(await readFile(file, 'utf8'));
			return `export default ${JSON.stringify(meta)};`;
		}
	};
}
