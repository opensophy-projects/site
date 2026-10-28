import type { Point } from './chart-utils';

/**
 * Curve interpolations with the common d3-shape names. Every generator
 * returns a path that starts with `M` for the first point.
 */
export type CurveType =
	| 'linear'
	| 'monotone'
	| 'monotoneX'
	| 'natural'
	| 'step'
	| 'stepBefore'
	| 'stepAfter'
	| 'bump'
	| 'bumpX'
	| 'basis';

type CurveFn = (points: Point[]) => string;

const n = (v: number) => String(Math.round(v * 1000) / 1000);
const pt = (p: Point) => `${n(p.x)},${n(p.y)}`;

const linear: CurveFn = (points) => points.map((p, i) => `${i === 0 ? 'M' : 'L'}${pt(p)}`).join('');

const step =
	(t: number): CurveFn =>
	(points) => {
		let d = '';
		points.forEach((p, i) => {
			if (i === 0) {
				d += `M${pt(p)}`;
				return;
			}
			const prev = points[i - 1];
			if (t <= 0) {
				d += `L${n(prev.x)},${n(p.y)}`;
			} else if (t >= 1) {
				d += `L${n(p.x)},${n(prev.y)}`;
			} else {
				const xm = prev.x * (1 - t) + p.x * t;
				d += `L${n(xm)},${n(prev.y)}L${n(xm)},${n(p.y)}`;
			}
			d += `L${pt(p)}`;
		});
		return d;
	};

const bumpX: CurveFn = (points) => {
	let d = '';
	points.forEach((p, i) => {
		if (i === 0) {
			d += `M${pt(p)}`;
			return;
		}
		const prev = points[i - 1];
		const xm = (prev.x + p.x) / 2;
		d += `C${n(xm)},${n(prev.y)} ${n(xm)},${n(p.y)} ${pt(p)}`;
	});
	return d;
};

// d3-shape curveMonotoneX
function sign(x: number) {
	return x < 0 ? -1 : 1;
}

function slope3(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number) {
	const h0 = x1 - x0;
	const h1 = x2 - x1;
	const s0 = (y1 - y0) / (h0 || (h1 < 0 ? -0 : 0));
	const s1 = (y2 - y1) / (h1 || (h0 < 0 ? -0 : 0));
	const p = (s0 * h1 + s1 * h0) / (h0 + h1);
	return (sign(s0) + sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0;
}

function slope2(x0: number, y0: number, x1: number, y1: number, t: number) {
	const h = x1 - x0;
	return h ? ((3 * (y1 - y0)) / h - t) / 2 : t;
}

const monotoneX: CurveFn = (points) => {
	if (points.length === 0) return '';
	if (points.length < 3) return linear(points);
	let d = `M${pt(points[0])}`;
	const segment = (p0: Point, p1: Point, t0: number, t1: number) => {
		const dx = (p1.x - p0.x) / 3;
		d += `C${n(p0.x + dx)},${n(p0.y + dx * t0)} ${n(p1.x - dx)},${n(p1.y - dx * t1)} ${pt(p1)}`;
	};
	const t: number[] = [];
	for (let i = 1; i < points.length - 1; i++) {
		const a = points[i - 1];
		const b = points[i];
		const c = points[i + 1];
		t[i] = slope3(a.x, a.y, b.x, b.y, c.x, c.y);
	}
	t[0] = slope2(points[0].x, points[0].y, points[1].x, points[1].y, t[1]);
	const last = points.length - 1;
	t[last] = slope2(
		points[last - 1].x,
		points[last - 1].y,
		points[last].x,
		points[last].y,
		t[last - 1]
	);
	for (let i = 0; i < last; i++) segment(points[i], points[i + 1], t[i], t[i + 1]);
	return d;
};

// d3-shape curveNatural
function controlPoints(x: number[]) {
	const size = x.length - 1;
	const a: number[] = new Array<number>(size);
	const b: number[] = new Array<number>(size);
	const r: number[] = new Array<number>(size);
	a[0] = 0;
	b[0] = 2;
	r[0] = x[0] + 2 * x[1];
	for (let i = 1; i < size - 1; ++i) {
		a[i] = 1;
		b[i] = 4;
		r[i] = 4 * x[i] + 2 * x[i + 1];
	}
	a[size - 1] = 2;
	b[size - 1] = 7;
	r[size - 1] = 8 * x[size - 1] + x[size];
	for (let i = 1; i < size; ++i) {
		const m = a[i] / b[i - 1];
		b[i] -= m;
		r[i] -= m * r[i - 1];
	}
	a[size - 1] = r[size - 1] / b[size - 1];
	for (let i = size - 2; i >= 0; --i) a[i] = (r[i] - a[i + 1]) / b[i];
	b[size - 1] = (x[size] + a[size - 1]) / 2;
	for (let i = 0; i < size - 1; ++i) b[i] = 2 * x[i + 1] - a[i + 1];
	return [a, b];
}

const natural: CurveFn = (points) => {
	if (points.length < 3) return linear(points);
	const xs = points.map((p) => p.x);
	const ys = points.map((p) => p.y);
	const px = controlPoints(xs);
	const py = controlPoints(ys);
	let d = `M${pt(points[0])}`;
	for (let i = 0; i < points.length - 1; i++) {
		d += `C${n(px[0][i])},${n(py[0][i])} ${n(px[1][i])},${n(py[1][i])} ${pt(points[i + 1])}`;
	}
	return d;
};

// d3-shape curveBasis
const basis: CurveFn = (points) => {
	if (points.length < 3) return linear(points);
	let d = `M${pt(points[0])}`;
	const p0 = points[0];
	const p1 = points[1];
	d += `L${n((5 * p0.x + p1.x) / 6)},${n((5 * p0.y + p1.y) / 6)}`;
	const bezier = (a: Point, b: Point, c: Point) => {
		d += `C${n((2 * a.x + b.x) / 3)},${n((2 * a.y + b.y) / 3)} ${n((a.x + 2 * b.x) / 3)},${n((a.y + 2 * b.y) / 3)} ${n((a.x + 4 * b.x + c.x) / 6)},${n((a.y + 4 * b.y + c.y) / 6)}`;
	};
	for (let i = 2; i < points.length; i++) bezier(points[i - 2], points[i - 1], points[i]);
	const last = points[points.length - 1];
	bezier(points[points.length - 2], last, last);
	d += `L${pt(last)}`;
	return d;
};

const CURVES: Record<CurveType, CurveFn> = {
	linear,
	monotone: monotoneX,
	monotoneX,
	natural,
	step: step(0.5),
	stepBefore: step(0),
	stepAfter: step(1),
	bump: bumpX,
	bumpX,
	basis
};

/** Path for a single continuous run of points. */
export function curvePath(points: Point[], type: CurveType = 'linear') {
	if (points.length === 0) return '';
	if (points.length === 1) return `M${pt(points[0])}`;
	return (CURVES[type] ?? linear)(points);
}

/**
 * Splits `(Point | null)[]` into continuous runs. With `connectNulls` the gaps
 * are skipped so the line joins across them.
 */
export function splitSegments<T extends Point>(points: (T | null)[], connectNulls = false): T[][] {
	if (connectNulls) {
		const filtered = points.filter((p): p is T => p !== null);
		return filtered.length ? [filtered] : [];
	}
	const segments: T[][] = [];
	let current: T[] = [];
	for (const p of points) {
		if (p === null) {
			if (current.length) segments.push(current);
			current = [];
		} else {
			current.push(p);
		}
	}
	if (current.length) segments.push(current);
	return segments;
}

/** Line path across nullable points. */
export function linePath(points: (Point | null)[], type: CurveType, connectNulls = false) {
	return splitSegments(points, connectNulls)
		.map((segment) => curvePath(segment, type))
		.join('');
}

/**
 * Area path: the top edge with the curve, then the baseline drawn back with
 * the same curve (d3 `area` behaviour, works for stacked baselines).
 */
export function areaPath(
	points: ({ x: number; y: number; y0: number } | null)[],
	type: CurveType,
	connectNulls = false
) {
	return splitSegments(points, connectNulls)
		.map((segment) => {
			const top = curvePath(segment, type);
			const base = curvePath(
				[...segment].reverse().map((p) => ({ x: p.x, y: p.y0 })),
				type
			).replace(/^M/, 'L');
			return `${top}${base}Z`;
		})
		.join('');
}
