import type { Handle } from '@sveltejs/kit';

// Постер ASCII-логотипа — главный визуальный элемент первого экрана.
// Его предзагрузка ставится в самое начало <head>, до скриптов и стилей,
// чтобы на медленной сети картинка не ждала в очереди за JS.
const HOME_PRELOAD = [
	'<link rel="preload" as="image" href="/logo-ascii-wide.webp" type="image/webp" media="(min-width: 1024px)" fetchpriority="high" />',
	'<link rel="preload" as="image" href="/logo-ascii-narrow.webp" type="image/webp" media="(max-width: 1023px)" fetchpriority="high" />'
].join('');

export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname !== '/') return resolve(event);

	return resolve(event, {
		transformPageChunk: ({ html }) =>
			html.replace('<meta charset="utf-8" />', `<meta charset="utf-8" />${HOME_PRELOAD}`)
	});
};
