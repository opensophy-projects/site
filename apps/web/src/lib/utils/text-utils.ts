export type TextToken =
	| { kind: 'text'; value: string }
	| { kind: 'whitespace'; value: string };

function createSegmenter(granularity: Intl.SegmenterOptions['granularity']) {
	if (typeof Intl === 'undefined' || !('Segmenter' in Intl)) return null;
	return new Intl.Segmenter(undefined, { granularity });
}

export function normalizeSourceText(value: string | null | undefined) {
	return value?.replace(/\r\n?/g, '\n') ?? '';
}

export function readNormalizedTextContent(node: Node | null | undefined) {
	return normalizeSourceText(node?.textContent ?? '');
}

export function splitGraphemes(value: string) {
	const segmenter = createSegmenter('grapheme');
	return segmenter ? Array.from(segmenter.segment(value), ({ segment }) => segment) : Array.from(value);
}

export function segmentText(value: string): TextToken[] {
	if (!value) return [];
	const segmenter = createSegmenter('word');
	if (!segmenter) {
		return (value.match(/\S+|\s+/g) ?? []).map((segment) =>
			/^\s+$/.test(segment) ? { kind: 'whitespace', value: segment } : { kind: 'text', value: segment }
		);
	}

	const tokens: TextToken[] = [];
	for (const { segment } of segmenter.segment(value)) {
		const kind = /^\s+$/.test(segment) ? 'whitespace' : 'text';
		tokens.push({ kind, value: segment });
	}
	return tokens;
}
