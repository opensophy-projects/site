import type { RequestHandler } from './$types';
import { contentRawSources } from '$lib/server/content-raw';
import { buildSearchIndex } from '$lib/utils/search';

export const prerender = true;

export const GET: RequestHandler = () =>
	new Response(JSON.stringify(buildSearchIndex(contentRawSources)), {
		headers: {
			'content-type': 'application/json; charset=utf-8',
			'cache-control': 'public, max-age=3600'
		}
	});
