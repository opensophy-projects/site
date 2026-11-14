import { execFileSync } from 'node:child_process';

/**
 * Даты последнего изменения файлов по истории git. Sitemap отдаёт их как
 * `lastmod`: поисковики доверяют полю только когда оно меняется вместе
 * с содержимым, а не на каждой сборке.
 */
const fileDates = new Map<string, string>();
let headDate = new Date().toISOString();
let repoPrefix = '';

function git(args: string[]) {
	return execFileSync('git', ['-c', 'core.quotepath=false', ...args], {
		encoding: 'utf8',
		maxBuffer: 64 * 1024 * 1024,
		stdio: ['ignore', 'pipe', 'ignore']
	});
}

try {
	// Путь текущего каталога (apps/web) относительно корня репозитория
	repoPrefix = git(['rev-parse', '--show-prefix']).trim();
	headDate = git(['log', '-1', '--format=%cI']).trim() || headDate;

	let currentDate = '';
	for (const line of git(['log', '--name-only', '--format=@%cI', '--', '.']).split('\n')) {
		if (line.startsWith('@')) {
			currentDate = line.slice(1);
		} else if (line && currentDate && !fileDates.has(line)) {
			// Журнал идёт от новых коммитов к старым: первая встреча — последнее изменение
			fileDates.set(line, currentDate);
		}
	}
} catch {
	// Нет git или истории (архив исходников): остаётся дата сборки
}

/**
 * @param paths Пути файлов от корня приложения, например `/src/routes/+page.svelte`.
 * @returns Самая свежая дата изменения среди файлов; для неизвестных — дата HEAD.
 */
export function getLastModified(...paths: string[]): string {
	let latest = '';
	for (const path of paths) {
		const date = fileDates.get(repoPrefix + path.replace(/^\//, ''));
		if (date && (!latest || new Date(date) > new Date(latest))) latest = date;
	}
	return new Date(latest || headDate).toISOString();
}
