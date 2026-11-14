import { getCustomPage } from '$lib/content/custom-pages';
import {
	getContentSectionSourcePath,
	getContentSectionSveltePath,
	type ContentModule,
	type ContentSectionId
} from '$lib/content/sections';

// Страницы контента подгружаются по одной, в момент перехода на них.
// Модуль намеренно отделён от sections.ts: его импортирует только маршрут
// страницы, поэтому главная и корневой layout не тянут за собой весь контент.
const svxModules = import.meta.glob<ContentModule>('/src/lib/content/**/*.svx');
const svelteModules = import.meta.glob<ContentModule>('/src/lib/content/**/*.svelte');

export async function getContentSectionModule(
	sectionId: ContentSectionId,
	slug: string
): Promise<ContentModule | null> {
	const svxKey = getContentSectionSourcePath(sectionId, slug);
	if (svxKey && svxKey in svxModules) {
		return svxModules[svxKey]();
	}

	const customPage = getCustomPage(sectionId, slug);
	if (customPage) {
		return { default: customPage.component };
	}

	const svelteKey = getContentSectionSveltePath(sectionId, slug);
	if (svelteKey && svelteKey in svelteModules) {
		return svelteModules[svelteKey]();
	}

	return null;
}
