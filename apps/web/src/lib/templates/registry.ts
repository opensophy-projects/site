import type { Component } from 'svelte';
import { parseContentSource } from '$lib/content/frontmatter';

export type TemplateEntry = {
	slug: string;
	title: string;
	description: string;
	component: Component;
};

type TemplateModule = { default: Component };

const rawTemplates = import.meta.glob<string>('../../../../templates/**/*.svx', {
	query: '?raw',
	eager: true,
	import: 'default'
});

const templateModules = import.meta.glob<TemplateModule>('../../../../templates/**/*.svx', {
	eager: true
});

export function slugFromTemplatePath(path: string) {
	return path
		.replace(/^.*\/templates\//, '')
		.replace(/\.svx$/, '')
		.split('/')
		.map((part) =>
			part
				.replace(/[^a-zA-Z0-9а-яА-ЯёЁ]+/g, '-')
				.replace(/^-+|-+$/g, '')
				.toLowerCase()
		)
		.filter(Boolean)
		.join('/');
}

export function getTemplateEntries(): TemplateEntry[] {
	return Object.entries(rawTemplates)
		.map(([path, source]) => {
			const { metadata } = parseContentSource(source);
			const slugValue = (metadata as Record<string, unknown>).slug;
			const slug = typeof slugValue === 'string' ? slugValue : slugFromTemplatePath(path);
			const title = metadata.title ?? metadata.name ?? slug;
			const description = metadata.description ?? '';
			return {
				slug,
				title,
				description,
				component: templateModules[path].default
			};
		})
		.filter((template): template is TemplateEntry => Boolean(template.component))
		.sort((a, b) => a.title.localeCompare(b.title));
}

export function getTemplateEntry(slug: string) {
	return getTemplateEntries().find((template) => template.slug === slug) ?? null;
}
