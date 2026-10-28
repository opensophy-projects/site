import { describe, expect, it } from 'vitest';
import {
	buildChartStyle,
	distributeColors,
	getNiceTicks,
	roundedRectPath,
	sectorPath,
	toChartKey
} from '$lib/components/charts/chart-utils';
import { stackSeries, computeBarSlots } from '$lib/components/charts/cartesian';
import { areaPath, curvePath, linePath } from '$lib/components/charts/curves';
import { computeSankeyLayout } from '$lib/components/charts/sankey';
import { CATEGORY_KEY, parseColorEntry, parseMarkdownChart } from '$lib/components/charts/markdown';

describe('chart utils', () => {
	it('distributes colors evenly across slots', () => {
		expect(distributeColors(['a', 'b'], 4)).toEqual(['a', 'a', 'b', 'b']);
		expect(distributeColors(['a', 'b', 'c'], 4)).toEqual(['a', 'b', 'c', 'c']);
		expect(distributeColors(['a', 'b'], 1)).toEqual(['a']);
	});

	it('builds theme scoped color variables', () => {
		const css = buildChartStyle('c1', {
			desktop: { colors: { light: ['#000'], dark: ['#fff', '#eee'] } }
		});
		expect(css).toContain('[data-chart="c1"]');
		expect(css).toContain('.dark [data-chart="c1"]');
		expect(css).toContain('--color-desktop-0: #000;');
		expect(css).toContain('--color-desktop-1: #000;');
		expect(css).toContain('--color-desktop-1: #eee;');
	});

	it('produces Recharts-like nice ticks', () => {
		expect(getNiceTicks(0, 925)).toEqual([0, 250, 500, 750, 1000]);
		expect(getNiceTicks(0, 100)).toEqual([0, 25, 50, 75, 100]);
		expect(getNiceTicks(0, 0)).toEqual([0, 0.25, 0.5, 0.75, 1]);
		const negative = getNiceTicks(-40, 90);
		expect(negative[0]).toBeLessThanOrEqual(-40);
		expect(negative[negative.length - 1]).toBeGreaterThanOrEqual(90);
	});

	it('creates css-safe keys from any label', () => {
		expect(toChartKey('Продукт А', 0)).toBe('series-0');
		expect(toChartKey('Desktop users', 2)).toBe('desktop-users-2');
	});

	it('draws rounded rects and sectors', () => {
		expect(roundedRectPath(0, 0, 10, 20, 2)).toMatch(/^M2,0H8A2,2/);
		expect(roundedRectPath(0, 0, 0, 20, 2)).toBe('');
		const sector = sectorPath({
			cx: 50,
			cy: 50,
			innerRadius: 20,
			outerRadius: 40,
			startAngle: 0,
			endAngle: 90,
			cornerRadius: 4
		});
		expect(sector.startsWith('M')).toBe(true);
		expect(sector.endsWith('Z')).toBe(true);
	});
});

describe('cartesian helpers', () => {
	const rows = [
		{ a: 1, b: 3 },
		{ a: 2, b: 2 }
	];

	it('stacks and expands series', () => {
		expect(stackSeries(rows, ['a', 'b'], 'stacked')).toEqual([
			[
				[0, 1],
				[0, 2]
			],
			[
				[1, 4],
				[2, 4]
			]
		]);
		const expanded = stackSeries(rows, ['a', 'b'], 'expanded');
		expect(expanded[1][0]).toEqual([0.25, 1]);
	});

	it('keeps missing values as gaps', () => {
		expect(stackSeries([{ a: null }], ['a'], 'default')).toEqual([[null]]);
	});

	it('splits a band between bars', () => {
		const slots = computeBarSlots({
			bandSize: 100,
			slots: 2,
			barGap: 4,
			barCategoryGap: '10%'
		});
		expect(slots.size).toBe(38);
		expect(slots.offsetFor(0)).toBe(-40);
		expect(slots.offsetFor(1)).toBe(2);
	});
});

describe('curves', () => {
	const points = [
		{ x: 0, y: 0 },
		{ x: 10, y: 10 },
		{ x: 20, y: 0 }
	];

	it('supports every curve type', () => {
		for (const type of ['linear', 'monotone', 'natural', 'step', 'bump', 'basis'] as const) {
			const d = curvePath(points, type);
			expect(d.startsWith('M0,0')).toBe(true);
			expect(d.includes('20,0')).toBe(true);
		}
	});

	it('breaks lines at nulls unless connectNulls is set', () => {
		const withGap = [points[0], null, points[2]];
		expect(linePath(withGap, 'linear').match(/M/g)).toHaveLength(2);
		expect(linePath(withGap, 'linear', true).match(/M/g)).toHaveLength(1);
	});

	it('closes areas back along the baseline', () => {
		const d = areaPath(
			points.map((p) => ({ ...p, y0: 30 })),
			'linear'
		);
		expect(d).toMatch(/^M0,0L10,10L20,0L20,30L10,30L0,30Z$/);
	});
});

describe('sankey layout', () => {
	it('places nodes by depth and conserves link widths', () => {
		const { nodes, links } = computeSankeyLayout(
			{
				nodes: [{ name: 'a' }, { name: 'b' }, { name: 'c' }],
				links: [
					{ source: 0, target: 1, value: 10 },
					{ source: 1, target: 2, value: 10 }
				]
			},
			{
				width: 200,
				height: 100,
				nodeWidth: 10,
				nodePadding: 10,
				iterations: 8,
				sort: true,
				align: 'justify',
				verticalAlign: 'justify'
			}
		);
		expect(nodes.map((n) => n.x)).toEqual([0, 95, 190]);
		expect(nodes[0].dy).toBeCloseTo(100);
		expect(links[0].dy).toBeCloseTo(100);
	});
});

describe('markdown chart block', () => {
	it('parses options, table and colors', () => {
		const chart = parseMarkdownChart(`
[type]area
[title]Рост
[colors]#047857|#10b981, #a>#b

| Месяц | Desktop | Mobile |
|-------|---------|--------|
| Янв   | 10      | 1 200  |
| Фев   | 20      |        |
`);
		expect(chart.type).toBe('area');
		expect(chart.title).toBe('Рост');
		expect(chart.keys).toEqual(['desktop-0', 'mobile-1']);
		expect(chart.rows[0]).toEqual({
			[CATEGORY_KEY]: 'Янв',
			'desktop-0': 10,
			'mobile-1': 1200
		});
		expect(chart.rows[1]['mobile-1']).toBeNull();
		expect(chart.config['desktop-0'].colors).toEqual({
			light: ['#047857'],
			dark: ['#10b981']
		});
		expect(chart.config['mobile-1'].colors).toEqual({
			light: ['#a', '#b'],
			dark: ['#a', '#b']
		});
	});

	it('maps legacy types', () => {
		expect(parseMarkdownChart('[type]ring\n| a | b |\n| x | 1 |').type).toBe('donut');
		expect(parseMarkdownChart('[type]scatter\n| a | b |\n| x | 1 |').type).toBe('line');
	});

	it('builds one sector per row for pie charts', () => {
		const chart = parseMarkdownChart(
			'[type]pie\n| Браузер | Доля |\n|---|---|\n| Chrome | 60 |\n| Safari | 40 |'
		);
		expect(chart.rows).toEqual([
			{ [CATEGORY_KEY]: 'chrome-0', value: 60 },
			{ [CATEGORY_KEY]: 'safari-1', value: 40 }
		]);
		expect(chart.config['safari-1'].label).toBe('Safari');
	});

	it('builds nodes and links for sankey charts', () => {
		const chart = parseMarkdownChart(
			'[type]sankey\n| Откуда | Куда | Объём |\n|---|---|---|\n| Поиск | Сайт | 40 |\n| Сайт | Заказ | 10 |'
		);
		expect(chart.sankey?.nodes).toHaveLength(3);
		expect(chart.sankey?.links).toEqual([
			{ source: 0, target: 1, value: 40 },
			{ source: 1, target: 2, value: 10 }
		]);
		expect(chart.config[chart.keys[0]].label).toBe('Поиск');
	});

	it('parses color entries', () => {
		expect(parseColorEntry('')).toBeNull();
		expect(parseColorEntry('#1>#2|#3')).toEqual({
			light: ['#1', '#2'],
			dark: ['#3']
		});
	});
});
