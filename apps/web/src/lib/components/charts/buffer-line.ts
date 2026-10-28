const BUFFER_DASH_SIZE = 4;
const BUFFER_GAP_SIZE = 3;

function findLengthAtX(path: SVGPathElement, totalLength: number, targetX: number) {
	let lo = 0;
	let hi = totalLength;
	while (hi - lo > 0.5) {
		const mid = (lo + hi) / 2;
		if (path.getPointAtLength(mid).x < targetX) lo = mid;
		else hi = mid;
	}
	return (lo + hi) / 2;
}

/**
 * Svelte action: keeps the path solid up to `splitX` and dashes the rest —
 * the "buffer" look for the last, still-incomplete data point.
 */
export function bufferLine(path: SVGPathElement, params: { splitX: number | null; d: string }) {
	const apply = ({ splitX }: { splitX: number | null; d: string }) => {
		if (splitX === null || typeof path.getTotalLength !== 'function') {
			path.removeAttribute('stroke-dasharray');
			return;
		}
		const totalLength = path.getTotalLength();
		const solidLength = findLengthAtX(path, totalLength, splitX);
		const reps = Math.ceil((totalLength - solidLength) / (BUFFER_DASH_SIZE + BUFFER_GAP_SIZE)) + 1;
		const dashed = Array.from(
			{ length: reps },
			() => `${String(BUFFER_DASH_SIZE)} ${String(BUFFER_GAP_SIZE)}`
		).join(' ');
		path.setAttribute('stroke-dasharray', `${String(solidLength)} 0 ${dashed}`);
	};
	apply(params);
	return { update: apply };
}
