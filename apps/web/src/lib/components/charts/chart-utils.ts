import type { Component } from 'svelte';

// ─────────────────────────────────────────────────────────────────────────────
// Chart config
// ─────────────────────────────────────────────────────────────────────────────

/** Theme name → CSS selector prefix. Matches the site `.dark` class strategy. */
export const CHART_THEMES = { light: '', dark: '.dark' } as const;

export type ChartThemeKey = keyof typeof CHART_THEMES;

export type ChartConfigItem = {
	/** Human readable label shown in legends and tooltips. */
	label?: string;
	/** Optional icon component rendered instead of the color indicator. */
	icon?: Component;
	/**
	 * Colors per theme. One color paints a flat series, several colors build a
	 * left-to-right gradient. At least one theme key is required.
	 */
	colors?: Partial<Record<ChartThemeKey, string[]>>;
};

export type ChartConfig = Record<string, ChartConfigItem>;

export type ChartRow = Record<string, unknown>;

/** Line stroke style shared by area, line and composed charts. */
export type StrokeVariant = 'solid' | 'dashed' | 'animated-dashed';

const VALID_THEME_KEYS = Object.keys(CHART_THEMES) as ChartThemeKey[];

/** Throws when a config entry declares `colors` without any theme key. */
export function validateChartConfigColors(config: ChartConfig): void {
	for (const [key, value] of Object.entries(config)) {
		if (!value.colors) continue;
		const hasValidThemeKey = VALID_THEME_KEYS.some((themeKey) => value.colors?.[themeKey]);
		if (!hasValidThemeKey) {
			throw new Error(
				`[Charts] Invalid chart config for "${key}": colors must have at least one theme key (${VALID_THEME_KEYS.join(', ')}).`
			);
		}
	}
}

/** Max color count across all themes for a config entry. */
export function getColorsCount(item: ChartConfigItem | undefined): number {
	if (!item?.colors) return 1;
	const counts = VALID_THEME_KEYS.map((theme) => item.colors?.[theme]?.length ?? 0);
	return Math.max(...counts, 1);
}

/**
 * Distribute colors evenly across slots, extra slots go to the last color(s).
 * 2 colors for 4 slots → [a, a, b, b]; 3 colors for 4 slots → [a, b, c, c].
 */
export function distributeColors(colors: string[], maxCount: number): string[] {
	const available = colors.length;
	if (available >= maxCount) return colors.slice(0, maxCount);

	const result: string[] = [];
	const baseSlots = Math.floor(maxCount / available);
	const extraSlots = maxCount % available;
	colors.forEach((color, colorIdx) => {
		const isExtra = colorIdx >= available - extraSlots;
		for (let j = 0; j < baseSlots + (isExtra ? 1 : 0); j++) result.push(color);
	});
	return result;
}

/** Builds the `--color-<key>-<slot>` variables for every theme of a chart. */
export function buildChartStyle(id: string, config: ChartConfig): string {
	const entries = Object.entries(config).filter(([, item]) => item.colors);
	if (!entries.length) return '';

	const varsFor = (theme: ChartThemeKey) =>
		entries
			.flatMap(([key, item]) => {
				const colors = item.colors?.[theme];
				if (!colors?.length) return [];
				return distributeColors(colors, getColorsCount(item)).map(
					(color, index) => `  --color-${key}-${String(index)}: ${color};`
				);
			})
			.join('\n');

	return (Object.entries(CHART_THEMES) as [ChartThemeKey, string][])
		.map(([theme, prefix]) => {
			const vars = varsFor(theme);
			return vars ? `${prefix} [data-chart="${id}"] {\n${vars}\n}` : '';
		})
		.filter(Boolean)
		.join('\n');
}

/** Gradient stops (offset + CSS color) for a config entry. */
export function getColorStops(key: string, item: ChartConfigItem | undefined) {
	const count = getColorsCount(item);
	if (count === 1) {
		const color = `var(--color-${key}-0)`;
		return [
			{ offset: '0%', color },
			{ offset: '100%', color }
		];
	}
	return Array.from({ length: count }, (_, index) => ({
		offset: `${String((index / (count - 1)) * 100)}%`,
		color: `var(--color-${key}-${String(index)}, var(--color-${key}-0))`
	}));
}

/** CSS background for legend/tooltip indicators (flat color or gradient). */
export function getIndicatorBackground(key: string, item: ChartConfigItem | undefined): string {
	const count = getColorsCount(item);
	if (count <= 1) return `var(--color-${key}-0)`;
	const stops = Array.from(
		{ length: count },
		(_, i) => `var(--color-${key}-${String(i)}) ${String((i / (count - 1)) * 100)}%`
	).join(', ');
	return `linear-gradient(to right, ${stops})`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Values & formatting
// ─────────────────────────────────────────────────────────────────────────────

export function toNumber(value: unknown): number | null {
	if (typeof value === 'number') return Number.isFinite(value) ? value : null;
	if (typeof value === 'string' && value.trim() !== '') {
		const n = Number(value.replace(',', '.').replace(/[^\d.eE+-]/g, ''));
		return Number.isFinite(n) ? n : null;
	}
	return null;
}

export function formatValue(value: unknown): string {
	if (typeof value === 'number') return value.toLocaleString();
	return value == null ? '' : String(value);
}

/** Expanded (100%) stacks format their axis as percentages. */
export function axisValueToPercentFormatter(value: number) {
	return `${Math.round(value * 100).toFixed(0)}%`;
}

/** Random skeleton data, values are a percentage of the range. */
export function getLoadingData(points = 10, min = 0, max = 70) {
	const range = max - min;
	return Array.from({ length: points }, () => ({
		loading: Math.floor(Math.random() * range) + min
	}));
}

/** Bell-curve eased gradient stops for the loading shimmer. */
export function generateEasedGradientStops(steps = 17, minOpacity = 0.05, maxOpacity = 0.9) {
	return Array.from({ length: steps }, (_, i) => {
		const t = i / (steps - 1);
		const eased = Math.sin(t * Math.PI) ** 2;
		return {
			offset: `${(t * 100).toFixed(0)}%`,
			opacity: Number((minOpacity + eased * (maxOpacity - minOpacity)).toFixed(3))
		};
	});
}

/** Sanitizes an arbitrary label into a CSS-variable-safe key. */
export function toChartKey(value: string, index: number) {
	const ascii = value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return ascii ? `${ascii}-${String(index)}` : `series-${String(index)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Scales
// ─────────────────────────────────────────────────────────────────────────────

function getDigitCount(value: number) {
	return value === 0 ? 1 : Math.floor(Math.log10(Math.abs(value))) + 1;
}

/** "Nice" step for a rough step. */
function getFormatStep(roughStep: number, correction: number) {
	if (roughStep <= 0) return 1;
	const digitCount = getDigitCount(roughStep);
	const digitValue = 10 ** digitCount;
	const ratio = roughStep / digitValue;
	const scale = digitCount !== 1 ? 0.05 : 0.1;
	const amended = Math.ceil(ratio / scale) * scale + correction * scale;
	return Number((amended * digitValue).toPrecision(12));
}

/** Nice tick values covering [min, max] with ~`count` ticks. */
export function getNiceTicks(min: number, max: number, count = 5): number[] {
	if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
	if (min === max) {
		if (min === 0) return Array.from({ length: count }, (_, i) => i / (count - 1));
		const lo = Math.min(0, min);
		const hi = Math.max(0, max);
		return getNiceTicks(lo, hi, count);
	}
	const lo = Math.min(min, max);
	const hi = Math.max(min, max);
	for (let correction = 0; correction < 40; correction++) {
		const step = getFormatStep((hi - lo) / (count - 1), correction);
		const start = Math.floor(lo / step) * step;
		const ticks = Array.from({ length: count }, (_, i) =>
			Number((start + i * step).toPrecision(12))
		);
		if (ticks[ticks.length - 1] >= hi) return ticks;
	}
	return [lo, hi];
}

export type Point = { x: number; y: number };

export type Margin = {
	top: number;
	right: number;
	bottom: number;
	left: number;
};

export const DEFAULT_MARGIN: Margin = { top: 5, right: 5, bottom: 5, left: 5 };

/** Rough text width estimate for 12px UI text (used for axis layout). */
export function estimateTextWidth(text: string, fontSize = 12) {
	let width = 0;
	for (const char of text) {
		if (/[ilI.,:;|!'`]/.test(char)) width += 0.3;
		else if (/[mwMW]/.test(char)) width += 0.85;
		else if (/[A-ZА-Я0-9]/.test(char)) width += 0.65;
		else width += 0.56;
	}
	return width * fontSize;
}

/**
 * Indices of category ticks that fit without overlapping, keeping the last
 * tick.
 */
export function getVisibleTickIndices(
	labels: string[],
	positions: number[],
	minTickGap = 8,
	fontSize = 12
): number[] {
	const result: number[] = [];
	let boundary = Infinity;
	for (let i = labels.length - 1; i >= 0; i--) {
		const half = estimateTextWidth(labels[i], fontSize) / 2;
		const right = positions[i] + half;
		if (right + minTickGap <= boundary || result.length === 0) {
			result.push(i);
			boundary = positions[i] - half;
		}
	}
	return result.reverse();
}

// ─────────────────────────────────────────────────────────────────────────────
// Shapes
// ─────────────────────────────────────────────────────────────────────────────

/** Rect path with per-corner radii [topLeft, topRight, bottomRight, bottomLeft]. */
export function roundedRectPath(
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number | [number, number, number, number]
) {
	if (width <= 0 || height <= 0) return '';
	const max = Math.min(width / 2, height / 2);
	const [tl, tr, br, bl] = (Array.isArray(radius) ? radius : [radius, radius, radius, radius]).map(
		(r) => Math.max(0, Math.min(r, max))
	);
	return [
		`M${String(x + tl)},${String(y)}`,
		`H${String(x + width - tr)}`,
		tr ? `A${String(tr)},${String(tr)} 0 0 1 ${String(x + width)},${String(y + tr)}` : '',
		`V${String(y + height - br)}`,
		br ? `A${String(br)},${String(br)} 0 0 1 ${String(x + width - br)},${String(y + height)}` : '',
		`H${String(x + bl)}`,
		bl ? `A${String(bl)},${String(bl)} 0 0 1 ${String(x)},${String(y + height - bl)}` : '',
		`V${String(y + tl)}`,
		tl ? `A${String(tl)},${String(tl)} 0 0 1 ${String(x + tl)},${String(y)}` : '',
		'Z'
	].join('');
}

const RADIAN = Math.PI / 180;

/** Polar → cartesian using chart angles (0° = 3 o'clock, counter-clockwise). */
export function polarToCartesian(cx: number, cy: number, radius: number, angle: number): Point {
	return {
		x: cx + Math.cos(-RADIAN * angle) * radius,
		y: cy + Math.sin(-RADIAN * angle) * radius
	};
}

/**
 * Annular sector path between two chart angles. Supports rounded corners
 * via `cornerRadius` (corner circles tangent to arcs and edges).
 */
export function sectorPath({
	cx,
	cy,
	innerRadius,
	outerRadius,
	startAngle,
	endAngle,
	cornerRadius = 0
}: {
	cx: number;
	cy: number;
	innerRadius: number;
	outerRadius: number;
	startAngle: number;
	endAngle: number;
	cornerRadius?: number;
}) {
	const delta = endAngle - startAngle;
	if (outerRadius <= 0 || Math.abs(delta) < 1e-6) return '';
	const sign = Math.sign(delta);
	const sweep = Math.min(Math.abs(delta), 359.999);
	const end = startAngle + sign * sweep;
	const ri = Math.max(0, innerRadius);
	const ro = outerRadius;
	const p = (r: number, a: number) => polarToCartesian(cx, cy, r, a);
	const fmt = (pt: Point) => `${String(pt.x)},${String(pt.y)}`;
	// SVG sweep flag: chart angles are counter-clockwise in screen space
	const arcSweep = sign > 0 ? 0 : 1;
	const reverseSweep = sign > 0 ? 1 : 0;
	const large = (a: number) => (Math.abs(a) > 180 ? 1 : 0);

	const cr = Math.max(0, Math.min(cornerRadius, (ro - ri) / 2));
	if (cr > 0 && sweep < 359.9) {
		const outerDeltaDeg = Math.asin(cr / (ro - cr)) / RADIAN;
		const innerDeltaDeg = ri > 0 ? Math.asin(cr / (ri + cr)) / RADIAN : 0;
		if (outerDeltaDeg * 2 < sweep && innerDeltaDeg * 2 < sweep) {
			const outerLine = Math.sqrt((ro - cr) ** 2 - cr ** 2);
			const outerStartArc = p(ro, startAngle + sign * outerDeltaDeg);
			const outerEndArc = p(ro, end - sign * outerDeltaDeg);
			const outerStartLine = p(outerLine, startAngle);
			const outerEndLine = p(outerLine, end);
			const outerArc = sweep - 2 * outerDeltaDeg;
			let d = `M${fmt(outerStartLine)}A${String(cr)},${String(cr)} 0 0 ${String(arcSweep)} ${fmt(outerStartArc)}`;
			d += `A${String(ro)},${String(ro)} 0 ${String(large(outerArc))} ${String(arcSweep)} ${fmt(outerEndArc)}`;
			d += `A${String(cr)},${String(cr)} 0 0 ${String(arcSweep)} ${fmt(outerEndLine)}`;
			if (ri > 0) {
				const innerLine = Math.sqrt((ri + cr) ** 2 - cr ** 2);
				const innerEndLine = p(innerLine, end);
				const innerEndArc = p(ri, end - sign * innerDeltaDeg);
				const innerStartArc = p(ri, startAngle + sign * innerDeltaDeg);
				const innerStartLine = p(innerLine, startAngle);
				const innerArc = sweep - 2 * innerDeltaDeg;
				d += `L${fmt(innerEndLine)}A${String(cr)},${String(cr)} 0 0 ${String(arcSweep)} ${fmt(innerEndArc)}`;
				d += `A${String(ri)},${String(ri)} 0 ${String(large(innerArc))} ${String(reverseSweep)} ${fmt(innerStartArc)}`;
				d += `A${String(cr)},${String(cr)} 0 0 ${String(arcSweep)} ${fmt(innerStartLine)}Z`;
			} else {
				d += `L${String(cx)},${String(cy)}Z`;
			}
			return d;
		}
	}

	const os = p(ro, startAngle);
	const oe = p(ro, end);
	let d = `M${fmt(os)}A${String(ro)},${String(ro)} 0 ${String(large(sweep))} ${String(arcSweep)} ${fmt(oe)}`;
	if (ri > 0) {
		const ie = p(ri, end);
		const is = p(ri, startAngle);
		d += `L${fmt(ie)}A${String(ri)},${String(ri)} 0 ${String(large(sweep))} ${String(reverseSweep)} ${fmt(is)}Z`;
	} else {
		d += `L${String(cx)},${String(cy)}Z`;
	}
	return d;
}

/** Resolves a radius (`number` or `"80%"`) against a max radius. */
export function resolveRadius(value: number | string, maxRadius: number) {
	if (typeof value === 'number') return value;
	if (value.endsWith('%')) return (Number(value.slice(0, -1)) / 100) * maxRadius;
	return Number(value) || 0;
}

/** Resolves a percentage/number position against a length. */
export function resolvePosition(value: number | string, length: number) {
	if (typeof value === 'number') return value;
	if (value.endsWith('%')) return (Number(value.slice(0, -1)) / 100) * length;
	return Number(value) || 0;
}
