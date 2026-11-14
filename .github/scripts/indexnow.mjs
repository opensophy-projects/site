#!/usr/bin/env node
/**
 * Сообщает поисковикам об изменившихся страницах через IndexNow
 * (Яндекс, Bing, Seznam, Naver; Google протокол не поддерживает и
 * узнаёт об изменениях из sitemap.xml).
 *
 * Запускается после деплоя: читает опубликованный sitemap.xml и отправляет
 * адреса, у которых `lastmod` свежее заданного окна.
 *
 *   node .github/scripts/indexnow.mjs            # изменённые за последние 2 суток
 *   node .github/scripts/indexnow.mjs --all      # все адреса карты сайта
 *   node .github/scripts/indexnow.mjs --dry-run  # показать список, ничего не отправлять
 *
 * Переменные окружения: SITE_URL, INDEXNOW_KEY, INDEXNOW_WINDOW_HOURS.
 */
const SITE_URL = (process.env.SITE_URL ?? 'https://opensophy.com').replace(/\/+$/, '');
const KEY = process.env.INDEXNOW_KEY ?? '67c86cf011fb6bb4e8fa4133b28a5e10';
const WINDOW_HOURS = Number(process.env.INDEXNOW_WINDOW_HOURS ?? 48);
const ENDPOINT = 'https://api.indexnow.org/indexnow';

const args = new Set(process.argv.slice(2));
const sendAll = args.has('--all');
const dryRun = args.has('--dry-run');

const host = new URL(SITE_URL).host;
const keyLocation = `${SITE_URL}/${KEY}.txt`;

async function fetchText(url) {
	const response = await fetch(url, { headers: { 'cache-control': 'no-cache' } });
	if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
	return response.text();
}

// Ключ должен быть доступен на сайте, иначе запрос отклонят
const publishedKey = (await fetchText(keyLocation)).trim();
if (publishedKey !== KEY) {
	throw new Error(`Файл ключа ${keyLocation} не совпадает с INDEXNOW_KEY`);
}

const sitemap = await fetchText(`${SITE_URL}/sitemap.xml?t=${Date.now()}`);
const since = Date.now() - WINDOW_HOURS * 3600 * 1000;

const urls = [...sitemap.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*(?:<lastmod>([^<]+)<\/lastmod>)?/g)]
	.filter(([, , lastmod]) => sendAll || !lastmod || new Date(lastmod).getTime() >= since)
	.map(([, loc]) => loc.replace(/&amp;/g, '&'))
	.filter((loc) => new URL(loc).host === host);

if (urls.length === 0) {
	console.log(`IndexNow: за последние ${WINDOW_HOURS} ч изменённых страниц нет.`);
	process.exit(0);
}

console.log(`IndexNow: ${urls.length} адрес(ов):\n${urls.map((url) => `  ${url}`).join('\n')}`);
if (dryRun) process.exit(0);

const response = await fetch(ENDPOINT, {
	method: 'POST',
	headers: { 'content-type': 'application/json; charset=utf-8' },
	body: JSON.stringify({ host, key: KEY, keyLocation, urlList: urls })
});

// 200 — принято, 202 — принято, ключ проверяется
if (response.status !== 200 && response.status !== 202) {
	throw new Error(`IndexNow ответил HTTP ${response.status}: ${await response.text()}`);
}
console.log(`IndexNow: принято (HTTP ${response.status}).`);
