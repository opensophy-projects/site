import type { ChartConfigItem } from './chart-utils';

/** Shared option types for the chart components. */

export type DotVariant = 'default' | 'border' | 'colored-border';

export type AreaVariant = 'gradient' | 'gradient-reverse' | 'solid' | 'dotted' | 'lines' | 'hatched';

export type BarVariant = 'default' | 'hatched' | 'duotone' | 'duotone-reverse' | 'gradient' | 'stripped';

export type TooltipRoundness = 'sm' | 'md' | 'lg' | 'xl';
export type TooltipVariant = 'default' | 'frosted-glass';
export type TooltipIndicator = 'dot' | 'line' | 'dashed';

export type TooltipItem = {
	/** Config key used for the indicator color variables. */
	key: string;
	/** Text shown next to the indicator. */
	name: string;
	value: unknown;
	item?: ChartConfigItem;
	/** Dims the row (another series is selected). */
	dimmed?: boolean;
};

export type TooltipOptions = {
	variant?: TooltipVariant;
	roundness?: TooltipRoundness;
	indicator?: TooltipIndicator;
	/** Data index shown when the pointer is outside the chart. */
	defaultIndex?: number;
	/** Vertical cursor line (cartesian charts only). */
	cursor?: boolean;
	labelFormatter?: (label: unknown) => string;
	valueFormatter?: (value: unknown, key: string) => string;
};

export type ChartLegendVariant =
	| 'square'
	| 'circle'
	| 'circle-outline'
	| 'rounded-square'
	| 'rounded-square-outline'
	| 'vertical-bar'
	| 'horizontal-bar';

export type LegendOptions = {
	variant?: ChartLegendVariant;
	align?: 'left' | 'center' | 'right';
	verticalAlign?: 'top' | 'bottom';
	/** Each entry toggles selection of its series. */
	isClickable?: boolean;
};

export type BrushRange = { startIndex: number; endIndex: number };

export type BrushOptions = {
	/** Preview strip height in px. */
	height?: number;
	/** Formats the range-handle labels. */
	formatLabel?: (value: unknown, index: number) => string;
	onChange?: (range: BrushRange) => void;
};

export type BackgroundVariant =
	| 'dots'
	| 'grid'
	| 'cross-hatch'
	| 'diagonal-lines'
	| 'plus'
	| 'falling-triangles'
	| '4-pointed-star'
	| 'tiny-checkers'
	| 'overlapping-circles'
	| 'wiggle-lines'
	| 'bubbles';

export const BACKGROUND_VARIANTS: BackgroundVariant[] = [
	'dots',
	'grid',
	'cross-hatch',
	'diagonal-lines',
	'plus',
	'falling-triangles',
	'4-pointed-star',
	'tiny-checkers',
	'overlapping-circles',
	'wiggle-lines',
	'bubbles'
];
