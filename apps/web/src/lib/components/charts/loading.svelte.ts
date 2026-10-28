import { getLoadingData } from './chart-utils';

/**
 * Skeleton data that regenerates while the chart is loading. The first swap
 * happens when the shimmer (x: -1 → 2 over `duration`) leaves the visible
 * area, later swaps every full cycle — so new data never pops in under it.
 */
export function createLoadingData(
	isLoading: () => boolean,
	options: {
		points: () => number;
		min?: number;
		max?: number;
		duration?: number;
		firstSwap?: number;
	}
) {
	const duration = options.duration ?? 2000;
	let data = $state(getLoadingData(options.points(), options.min, options.max));

	$effect(() => {
		if (!isLoading()) return;
		const points = options.points();
		data = getLoadingData(points, options.min, options.max);
		let interval: ReturnType<typeof setInterval> | undefined;
		const timeout = setTimeout(
			() => {
				data = getLoadingData(points, options.min, options.max);
				interval = setInterval(() => {
					data = getLoadingData(points, options.min, options.max);
				}, duration);
			},
			options.firstSwap ?? (duration * 2) / 3
		);
		return () => {
			clearTimeout(timeout);
			if (interval) clearInterval(interval);
		};
	});

	return {
		get data() {
			return data;
		}
	};
}
