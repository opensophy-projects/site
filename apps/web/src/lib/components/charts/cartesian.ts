import {
	DEFAULT_MARGIN,
	estimateTextWidth,
	getNiceTicks,
	getVisibleTickIndices,
	toNumber,
	type ChartRow,
	type Margin
} from './chart-utils';

export type AxisOptions = {
	/** Data key for the category axis (falls back to the chart `xDataKey`). */
	dataKey?: string;
	tickFormatter?: (value: unknown, index: number) => string;
	tickMargin?: number;
	minTickGap?: number;
	/** Height of a horizontal axis in px. */
	height?: number;
	/** Width of a vertical axis in px, `auto` measures the tick labels. */
	width?: number | 'auto';
	/** Explicit value domain for value axes. */
	domain?: [number, number];
	tickCount?: number;
};

export type GridOptions = {
	vertical?: boolean;
	horizontal?: boolean;
	strokeDasharray?: string;
};

export type StackType = 'default' | 'stacked' | 'expanded' | 'percent';

export type PlotRect = {
	left: number;
	top: number;
	right: number;
	bottom: number;
	width: number;
	height: number;
};

export type CartesianLayout = {
	plot: PlotRect;
	/** Center of each category along the category axis. */
	categoryPositions: number[];
	/** Width (or height when horizontal) of one category band. */
	bandSize: number;
	valueTicks: number[];
	valueTickLabels: string[];
	categoryLabels: string[];
	visibleCategoryTicks: number[];
	/** Maps a value to a pixel coordinate on the value axis. */
	valueToPx: (value: number) => number;
	horizontal: boolean;
	showCategoryAxis: boolean;
	showValueAxis: boolean;
	categoryAxis: AxisOptions;
	valueAxis: AxisOptions;
};

export function resolveOptions<T extends object>(
	value: boolean | T | undefined,
	fallback: boolean
) {
	if (value === undefined) return fallback ? ({} as T) : null;
	if (value === false) return null;
	if (value === true) return {} as T;
	return value;
}

/** Stack values per row. Returns `[y0, y1]` for each series/row (or null). */
export function stackSeries(
	rows: ChartRow[],
	keys: string[],
	stackType: StackType
): ([number, number] | null)[][] {
	const isStacked = stackType !== 'default';
	const isExpanded = stackType === 'expanded' || stackType === 'percent';
	return keys.map((key, keyIndex) =>
		rows.map((row) => {
			const value = toNumber(row[key]);
			if (value === null) return null;
			if (!isStacked) return [0, value];
			let total = 0;
			if (isExpanded) {
				for (const k of keys) total += Math.max(0, toNumber(row[k]) ?? 0);
			}
			let base = 0;
			for (let i = 0; i < keyIndex; i++) base += Math.max(0, toNumber(row[keys[i]]) ?? 0);
			const top = base + Math.max(0, value);
			if (isExpanded) return total > 0 ? [base / total, top / total] : [0, 0];
			return [base, top];
		})
	);
}

export function computeValueTicks(
	stacks: ([number, number] | null)[][],
	stackType: StackType,
	axis: AxisOptions | null
) {
	if (axis?.domain) {
		return getNiceTicks(axis.domain[0], axis.domain[1], axis.tickCount ?? 5);
	}
	if (stackType === 'expanded' || stackType === 'percent') return [0, 0.25, 0.5, 0.75, 1];
	let min = 0;
	let max = 0;
	for (const series of stacks) {
		for (const pair of series) {
			if (!pair) continue;
			min = Math.min(min, pair[0], pair[1]);
			max = Math.max(max, pair[0], pair[1]);
		}
	}
	return getNiceTicks(min, max, axis?.tickCount ?? 5);
}

export function computeCartesianLayout({
	width,
	height,
	rows,
	categoryKey,
	valueTicks,
	valueFormatter,
	categoryAxis,
	valueAxis,
	horizontal = false,
	band = false,
	margin = DEFAULT_MARGIN
}: {
	width: number;
	height: number;
	rows: ChartRow[];
	categoryKey?: string;
	valueTicks: number[];
	valueFormatter?: (value: number, index: number) => string;
	categoryAxis: AxisOptions | null;
	valueAxis: AxisOptions | null;
	horizontal?: boolean;
	band?: boolean;
	margin?: Margin;
}): CartesianLayout {
	const catOpts = categoryAxis ?? {};
	const valOpts = valueAxis ?? {};
	const key = catOpts.dataKey ?? categoryKey;
	const categoryLabels = rows.map((row, i) => {
		const raw = key ? row[key] : i;
		return catOpts.tickFormatter ? catOpts.tickFormatter(raw, i) : String(raw ?? i);
	});
	const valueTickLabels = valueTicks.map((tick, i) =>
		valOpts.tickFormatter
			? valOpts.tickFormatter(tick, i)
			: valueFormatter
				? valueFormatter(tick, i)
				: String(tick)
	);

	const verticalAxisLabels = horizontal ? categoryLabels : valueTickLabels;
	const verticalAxis = horizontal ? categoryAxis : valueAxis;
	const horizontalAxis = horizontal ? valueAxis : categoryAxis;

	const xAxisHeight = horizontalAxis ? (horizontalAxis.height ?? 30) : 0;
	let yAxisWidth = 0;
	if (verticalAxis) {
		if (typeof verticalAxis.width === 'number') yAxisWidth = verticalAxis.width;
		else {
			const longest = Math.max(0, ...verticalAxisLabels.map((label) => estimateTextWidth(label)));
			yAxisWidth = Math.ceil(longest + (verticalAxis.tickMargin ?? 8) + 4);
		}
	}

	const plot: PlotRect = {
		left: margin.left + yAxisWidth,
		top: margin.top,
		right: Math.max(margin.left + yAxisWidth + 1, width - margin.right),
		bottom: Math.max(margin.top + 1, height - margin.bottom - xAxisHeight),
		width: 0,
		height: 0
	};
	plot.width = plot.right - plot.left;
	plot.height = plot.bottom - plot.top;

	const count = rows.length;
	const catStart = horizontal ? plot.top : plot.left;
	const catLength = horizontal ? plot.height : plot.width;
	let bandSize: number;
	let categoryPositions: number[];
	if (band) {
		bandSize = count > 0 ? catLength / count : catLength;
		categoryPositions = rows.map((_, i) => catStart + bandSize * (i + 0.5));
	} else {
		bandSize = count > 1 ? catLength / (count - 1) : catLength;
		categoryPositions = rows.map((_, i) =>
			count > 1 ? catStart + (i / (count - 1)) * catLength : catStart + catLength / 2
		);
	}

	const d0 = valueTicks[0] ?? 0;
	const d1 = valueTicks[valueTicks.length - 1] ?? 1;
	const span = d1 - d0 || 1;
	const valueToPx = horizontal
		? (value: number) => plot.left + ((value - d0) / span) * plot.width
		: (value: number) => plot.bottom - ((value - d0) / span) * plot.height;

	const minTickGap = catOpts.minTickGap ?? 8;
	const visibleCategoryTicks = horizontal
		? getVisibleTickIndices(
				categoryLabels.map(() => 'M'),
				categoryPositions,
				minTickGap
			)
		: getVisibleTickIndices(categoryLabels, categoryPositions, minTickGap);

	return {
		plot,
		categoryPositions,
		bandSize,
		valueTicks,
		valueTickLabels,
		categoryLabels,
		visibleCategoryTicks,
		valueToPx,
		horizontal,
		showCategoryAxis: categoryAxis !== null,
		showValueAxis: valueAxis !== null,
		categoryAxis: catOpts,
		valueAxis: valOpts
	};
}

/** Nearest category index for a pointer coordinate along the category axis. */
export function nearestIndex(positions: number[], coordinate: number) {
	let best = -1;
	let bestDistance = Infinity;
	positions.forEach((position, index) => {
		const distance = Math.abs(position - coordinate);
		if (distance < bestDistance) {
			bestDistance = distance;
			best = index;
		}
	});
	return best;
}

/**
 * Bar sizes inside one category band: `barCategoryGap`
 * is taken from both sides of the band, bars share the rest with `barGap`.
 */
export function computeBarSlots({
	bandSize,
	slots,
	barGap = 4,
	barCategoryGap = '10%'
}: {
	bandSize: number;
	slots: number;
	barGap?: number;
	barCategoryGap?: number | string;
}) {
	const offset =
		typeof barCategoryGap === 'string' && barCategoryGap.endsWith('%')
			? (Number(barCategoryGap.slice(0, -1)) / 100) * bandSize
			: Number(barCategoryGap);
	const available = Math.max(0, bandSize - 2 * offset - (slots - 1) * barGap);
	const size = Math.max(1, available / Math.max(1, slots));
	return {
		size,
		offsetFor: (slot: number) => -bandSize / 2 + offset + slot * (size + barGap)
	};
}
