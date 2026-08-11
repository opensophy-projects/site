import type { PageLoad } from './$types';
import { getTemplateEntries } from '$lib/templates/registry';

export const prerender = true;

export const load: PageLoad = () => ({ templates: getTemplateEntries() });
