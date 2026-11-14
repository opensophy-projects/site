import { getContentSectionSourcePath, type ContentSectionId } from '$lib/content/sections';

/**
 * Полные исходники страниц контента. Модуль серверный: он используется при
 * пререндере (raw-markdown, поисковый индекс, llms-full.txt) и не попадает
 * в клиентский бандл.
 */
export const contentRawSources = import.meta.glob<string>('/src/lib/content/**/*.svx', {
	query: '?raw',
	eager: true,
	import: 'default'
});

export function getContentSectionRawSource(
	sectionId: ContentSectionId,
	slug: string
): string | null {
	const key = getContentSectionSourcePath(sectionId, slug);
	if (!key) return null;
	return contentRawSources[key] ?? null;
}
