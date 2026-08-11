import type { PageLoad } from './$types';
import type { Component } from 'svelte';
import { parseContentSource } from '$lib/content/frontmatter';

export const prerender = true;

type TemplateModule = {
	default: Component;
};

const rawTemplates = import.meta.glob<string>('../../../../templates/**/*.svx', {
	query: '?raw',
	eager: true,
	import: 'default'
});

const templateModules = import.meta.glob<TemplateModule>('../../../../templates/**/*.svx', {
	eager: true
});

function slugFromPath(path: string) {
	return (
		path
			.split('/')
			.pop()
			?.replace(/\.svx$/, '')
			.replace(/[^a-zA-Z0-9а-яА-ЯёЁ]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.toLowerCase() ?? ''
	);
}

export const load: PageLoad = () => {
	const templates = Object.entries(rawTemplates).map(([path, source]) => {
		const { metadata } = parseContentSource(source);
		const slugValue = (metadata as Record<string, unknown>).slug;
		const slug = typeof slugValue === 'string' ? slugValue : slugFromPath(path);
		const title = metadata.title ?? metadata.name ?? slug;
		const description = metadata.description ?? '';

		return {
			slug,
			title,
			description,
			component: templateModules[path]?.default
		};
	});

	templates.sort((a, b) => a.title.localeCompare(b.title));

	return { templates };
};
