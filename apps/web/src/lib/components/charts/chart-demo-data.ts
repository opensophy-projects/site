import type { ChartConfig } from './chart-utils';
import type { SankeyData } from './sankey';

/** Demo data shared by the chart documentation pages. */

export const monthlyData = [
	{ month: 'Январь', desktop: 342, mobile: 245 },
	{ month: 'Февраль', desktop: 876, mobile: 654 },
	{ month: 'Март', desktop: 512, mobile: 387 },
	{ month: 'Апрель', desktop: 629, mobile: 521 },
	{ month: 'Май', desktop: 458, mobile: 412 },
	{ month: 'Июнь', desktop: 781, mobile: 598 },
	{ month: 'Июль', desktop: 394, mobile: 312 },
	{ month: 'Август', desktop: 925, mobile: 743 },
	{ month: 'Сентябрь', desktop: 647, mobile: 489 },
	{ month: 'Октябрь', desktop: 532, mobile: 476 },
	{ month: 'Ноябрь', desktop: 803, mobile: 687 },
	{ month: 'Декабрь', desktop: 271, mobile: 198 }
];

export const monthlyConfig = {
	desktop: {
		label: 'Десктоп',
		colors: { light: ['#047857'], dark: ['#10b981'] }
	},
	mobile: {
		label: 'Мобильные',
		colors: { light: ['#be123c'], dark: ['#f43f5e'] }
	}
} satisfies ChartConfig;

export const gradientConfig = {
	desktop: {
		label: 'Десктоп',
		colors: {
			light: ['#047857', '#0891b2', '#7c3aed'],
			dark: ['#10b981', '#22d3ee', '#a78bfa']
		}
	},
	mobile: {
		label: 'Мобильные',
		colors: { light: ['#be123c', '#ea580c'], dark: ['#f43f5e', '#fbbf24'] }
	}
} satisfies ChartConfig;

/** Short month label for axis ticks. */
export const shortMonth = (value: unknown) => String(value).slice(0, 3);

export const browserData = [
	{ browser: 'chrome', visitors: 275 },
	{ browser: 'safari', visitors: 200 },
	{ browser: 'firefox', visitors: 187 },
	{ browser: 'edge', visitors: 173 },
	{ browser: 'other', visitors: 90 }
];

export const browserConfig = {
	chrome: {
		label: 'Chrome',
		colors: { light: ['#3b82f6'], dark: ['#60a5fa'] }
	},
	safari: {
		label: 'Safari',
		colors: { light: ['#10b981'], dark: ['#34d399'] }
	},
	firefox: {
		label: 'Firefox',
		colors: { light: ['#f59e0b'], dark: ['#fbbf24'] }
	},
	edge: { label: 'Edge', colors: { light: ['#8b5cf6'], dark: ['#a78bfa'] } },
	other: { label: 'Другие', colors: { light: ['#6b7280'], dark: ['#9ca3af'] } }
} satisfies ChartConfig;

export const browserGradientConfig = {
	chrome: {
		label: 'Chrome',
		colors: { light: ['#2563eb', '#7c3aed'], dark: ['#60a5fa', '#a78bfa'] }
	},
	safari: {
		label: 'Safari',
		colors: { light: ['#059669', '#0891b2'], dark: ['#34d399', '#22d3ee'] }
	},
	firefox: {
		label: 'Firefox',
		colors: { light: ['#d97706', '#dc2626'], dark: ['#fbbf24', '#f87171'] }
	},
	edge: {
		label: 'Edge',
		colors: { light: ['#7c3aed', '#db2777'], dark: ['#a78bfa', '#f472b6'] }
	},
	other: {
		label: 'Другие',
		colors: { light: ['#6b7280', '#374151'], dark: ['#9ca3af', '#e5e7eb'] }
	}
} satisfies ChartConfig;

export const skillsData = [
	{ skill: 'Скорость', desktop: 86, mobile: 65 },
	{ skill: 'Дизайн', desktop: 72, mobile: 90 },
	{ skill: 'Стабильность', desktop: 94, mobile: 70 },
	{ skill: 'Автономность', desktop: 40, mobile: 85 },
	{ skill: 'Цена', desktop: 60, mobile: 75 },
	{ skill: 'Камера', desktop: 30, mobile: 95 }
];

export const funnelData: SankeyData = {
	nodes: [
		{ name: 'organic' },
		{ name: 'ads' },
		{ name: 'social' },
		{ name: 'landing' },
		{ name: 'product' },
		{ name: 'cart' },
		{ name: 'purchase' },
		{ name: 'bounced' }
	],
	links: [
		{ source: 0, target: 3, value: 42000 },
		{ source: 1, target: 3, value: 28000 },
		{ source: 2, target: 3, value: 18000 },
		{ source: 3, target: 4, value: 52000 },
		{ source: 3, target: 7, value: 36000 },
		{ source: 4, target: 5, value: 31000 },
		{ source: 4, target: 7, value: 21000 },
		{ source: 5, target: 6, value: 24000 },
		{ source: 5, target: 7, value: 7000 }
	]
};

export const funnelConfig = {
	organic: {
		label: 'Поиск',
		colors: { light: ['#059669'], dark: ['#34d399'] }
	},
	ads: { label: 'Реклама', colors: { light: ['#dc2626'], dark: ['#f87171'] } },
	social: {
		label: 'Соцсети',
		colors: { light: ['#7c3aed'], dark: ['#a78bfa'] }
	},
	landing: {
		label: 'Лендинг',
		colors: { light: ['#0891b2'], dark: ['#22d3ee'] }
	},
	product: {
		label: 'Товар',
		colors: { light: ['#2563eb'], dark: ['#60a5fa'] }
	},
	cart: { label: 'Корзина', colors: { light: ['#ea580c'], dark: ['#fb923c'] } },
	purchase: {
		label: 'Покупка',
		colors: { light: ['#16a34a'], dark: ['#4ade80'] }
	},
	bounced: {
		label: 'Отказ',
		colors: { light: ['#f43f5e'], dark: ['#fb7185'] }
	}
} satisfies ChartConfig;
