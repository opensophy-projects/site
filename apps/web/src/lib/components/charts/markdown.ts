import { toChartKey, toNumber, type ChartConfig, type ChartRow } from './chart-utils';
import type { SankeyData } from './sankey';

/**
 * Parser for the markdown `:::chart` block.
 *
 * ```
 * :::chart
 * [type]area
 * [title]Рост подписчиков
 * [variant]gradient
 * [colors]#047857|#10b981, #be123c|#f43f5e
 *
 * | Месяц | Instagram | Telegram |
 * |-------|-----------|----------|
 * | Янв   | 2100      | 1400     |
 * :::
 * ```
 *
 * Options are `[name]value` lines, data is a markdown table. The first column
 * holds categories (or sector / node names), the others numeric series.
 */

export const MARKDOWN_CHART_TYPES = [
	'area',
	'line',
	'bar',
	'composed',
	'pie',
	'donut',
	'radar',
	'radial',
	'sankey'
] as const;

export type MarkdownChartType = (typeof MARKDOWN_CHART_TYPES)[number];

/** Legacy `[type]` values of the previous chart block. */
const TYPE_ALIASES: Record<string, MarkdownChartType> = {
	ring: 'donut',
	doughnut: 'donut',
	scatter: 'line',
	column: 'bar'
};

/** Default light / dark color pairs. */
export const DEFAULT_CHART_PALETTE: { light: string; dark: string }[] = [
	{ light: '#047857', dark: '#10b981' },
	{ light: '#be123c', dark: '#f43f5e' },
	{ light: '#2563eb', dark: '#60a5fa' },
	{ light: '#d97706', dark: '#fbbf24' },
	{ light: '#7c3aed', dark: '#a78bfa' },
	{ light: '#0891b2', dark: '#22d3ee' },
	{ light: '#ea580c', dark: '#fb923c' },
	{ light: '#6b7280', dark: '#9ca3af' }
];

export type ParsedMarkdownChart = {
	type: MarkdownChartType;
	/** Raw `[name]value` options (names lower-cased). */
	options: Record<string, string>;
	title: string | null;
	description: string | null;
	/** Header of the first (category) column. */
	categoryLabel: string;
	/** Rows keyed by `category` plus each series key. */
	rows: ChartRow[];
	/** Series keys in column order. */
	keys: string[];
	config: ChartConfig;
	/** Only for `sankey`: nodes + links built from `source | target | value` rows. */
	sankey: SankeyData | null;
};

const OPTION_LINE = /^\s*\[([^\]]+)]\s*(.*?)\s*$/;
const SEPARATOR_ROW = /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?$/;

export const CATEGORY_KEY = 'category';

function splitRow(line: string) {
	return line
		.trim()
		.replace(/^\|/, '')
		.replace(/\|$/, '')
		.split('|')
		.map((cell) => cell.trim());
}

/**
 * Parses one color entry: `#a` · `#a>#b` (gradient) · `#light|#dark` · `#a>#b|#c>#d`.
 */
export function parseColorEntry(entry: string): { light: string[]; dark: string[] } | null {
	const value = entry.trim();
	if (!value) return null;
	const [lightPart, darkPart] = value.split('|').map((part) => part.trim());
	const toList = (part: string) =>
		part
			.split('>')
			.map((color) => color.trim())
			.filter(Boolean);
	const light = toList(lightPart);
	const dark = darkPart ? toList(darkPart) : light;
	if (!light.length) return null;
	return { light, dark: dark.length ? dark : light };
}

export function isTruthyOption(value: string | undefined) {
	if (value === undefined) return false;
	return !['false', '0', 'no', 'off', 'none', 'нет'].includes(value.trim().toLowerCase());
}

export function parseMarkdownChart(source: string): ParsedMarkdownChart {
	const options: Record<string, string> = {};
	const tableLines: string[] = [];

	for (const line of source.trim().split(/\r?\n/)) {
		const option = OPTION_LINE.exec(line);
		if (option && !line.trim().startsWith('|')) {
			options[option[1].trim().toLowerCase()] = option[2].trim();
			continue;
		}
		if (line.trim().startsWith('|') && !SEPARATOR_ROW.test(line.trim())) tableLines.push(line);
	}

	const rawType = (options.type ?? 'line').trim().toLowerCase();
	const type: MarkdownChartType = (MARKDOWN_CHART_TYPES as readonly string[]).includes(rawType)
		? (rawType as MarkdownChartType)
		: (TYPE_ALIASES[rawType] ?? 'line');

	const headers = tableLines.length ? splitRow(tableLines[0]) : [];
	const body = tableLines.slice(1).map(splitRow);
	const categoryLabel = headers[0] ?? '';
	const seriesHeaders = headers.slice(1);

	const colorEntries = (options.colors ?? '')
		.split(',')
		.map(parseColorEntry)
		.filter((entry): entry is { light: string[]; dark: string[] } => entry !== null);

	const colorAt = (index: number) =>
		colorEntries[index] ?? {
			light: [DEFAULT_CHART_PALETTE[index % DEFAULT_CHART_PALETTE.length].light],
			dark: [DEFAULT_CHART_PALETTE[index % DEFAULT_CHART_PALETTE.length].dark]
		};

	const base = {
		type,
		options,
		title: options.title ?? null,
		description: options.description ?? null,
		categoryLabel
	};

	if (type === 'sankey') {
		const names: string[] = [];
		const indexOf = (name: string) => {
			let index = names.indexOf(name);
			if (index === -1) {
				names.push(name);
				index = names.length - 1;
			}
			return index;
		};
		const links = body
			.map((cells) => ({
				source: indexOf(cells[0] ?? ''),
				target: indexOf(cells[1] ?? ''),
				value: toNumber(cells[2]) ?? 0
			}))
			.filter((link) => link.value > 0);
		const keys = names.map((name, i) => toChartKey(name, i));
		const config: ChartConfig = Object.fromEntries(
			keys.map((key, i) => [key, { label: names[i], colors: colorAt(i) }])
		);
		return {
			...base,
			rows: [],
			keys,
			config,
			sankey: { nodes: keys.map((name) => ({ name })), links }
		};
	}

	const isSectorChart = type === 'pie' || type === 'donut' || type === 'radial';

	if (isSectorChart) {
		// One sector / ring per row; the first numeric column is the value
		const keys = body.map((cells, i) => toChartKey(cells[0] ?? '', i));
		const rows: ChartRow[] = body.map((cells, i) => ({
			[CATEGORY_KEY]: keys[i],
			value: toNumber(cells[1]) ?? 0
		}));
		const config: ChartConfig = Object.fromEntries(
			keys.map((key, i) => [key, { label: body[i][0] ?? key, colors: colorAt(i) }])
		);
		return { ...base, rows, keys, config, sankey: null };
	}

	const keys = seriesHeaders.map((header, i) => toChartKey(header, i));
	const rows: ChartRow[] = body.map((cells) => {
		const row: ChartRow = { [CATEGORY_KEY]: cells[0] ?? '' };
		keys.forEach((key, i) => {
			row[key] = toNumber(cells[i + 1]);
		});
		return row;
	});
	const config: ChartConfig = Object.fromEntries(
		keys.map((key, i) => [key, { label: seriesHeaders[i], colors: colorAt(i) }])
	);
	return { ...base, rows, keys, config, sankey: null };
}
