export type SankeyNodeInput = { name: string };
export type SankeyLinkInput = { source: number; target: number; value: number };
export type SankeyData = { nodes: SankeyNodeInput[]; links: SankeyLinkInput[] };

export type SankeyNode = {
	index: number;
	name: string;
	value: number;
	depth: number;
	x: number;
	y: number;
	dx: number;
	dy: number;
	sourceLinks: number[];
	targetLinks: number[];
};

export type SankeyLink = {
	index: number;
	source: number;
	target: number;
	value: number;
	dy: number;
	sy: number;
	ty: number;
};

export type SankeyLayoutOptions = {
	width: number;
	height: number;
	nodeWidth: number;
	nodePadding: number;
	iterations: number;
	sort: boolean;
	align: 'left' | 'justify';
	verticalAlign: 'justify' | 'top';
};

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

/**
 * Sankey layout: depth by longest path,
 * value-proportional heights, iterative relaxation and collision resolution.
 * Node `targetLinks` are incoming links, `sourceLinks` outgoing.
 */
export function computeSankeyLayout(data: SankeyData, options: SankeyLayoutOptions) {
	const { width, height, nodeWidth, nodePadding, iterations, sort, align, verticalAlign } = options;

	const links: SankeyLink[] = data.links.map((link, index) => ({
		index,
		source: link.source,
		target: link.target,
		value: link.value,
		dy: 0,
		sy: 0,
		ty: 0
	}));

	const nodes: SankeyNode[] = data.nodes.map((node, index) => {
		const outgoing = links.filter((link) => link.source === index);
		const incoming = links.filter((link) => link.target === index);
		return {
			index,
			name: node.name,
			value: Math.max(
				sum(incoming.map((link) => link.value)),
				sum(outgoing.map((link) => link.value))
			),
			depth: 0,
			x: 0,
			y: 0,
			dx: nodeWidth,
			dy: 0,
			sourceLinks: outgoing.map((link) => link.index),
			targetLinks: incoming.map((link) => link.index)
		};
	});

	// Depth = longest path from any source node
	const visit = (node: SankeyNode, depth: number, seen: Set<number>) => {
		node.depth = Math.max(node.depth, depth);
		for (const linkIndex of node.sourceLinks) {
			const target = nodes[links[linkIndex].target];
			if (target && !seen.has(target.index)) {
				seen.add(target.index);
				visit(target, depth + 1, seen);
				seen.delete(target.index);
			}
		}
	};
	for (const node of nodes) {
		if (node.targetLinks.length === 0) visit(node, 0, new Set([node.index]));
	}
	const maxDepth = Math.max(0, ...nodes.map((node) => node.depth));
	if (align === 'justify') {
		for (const node of nodes) if (node.sourceLinks.length === 0) node.depth = maxDepth;
	}
	const childWidth = maxDepth > 0 ? (width - nodeWidth) / maxDepth : 0;
	for (const node of nodes) node.x = node.depth * childWidth;

	const columns: SankeyNode[][] = Array.from({ length: maxDepth + 1 }, () => []);
	for (const node of nodes) columns[node.depth].push(node);

	const ky = Math.min(
		...columns
			.filter((column) => column.length)
			.map(
				(column) =>
					(height - (column.length - 1) * nodePadding) /
					Math.max(1e-9, sum(column.map((node) => node.value)))
			)
	);

	for (const column of columns) {
		let y = 0;
		column.forEach((node, i) => {
			node.dy = node.value * ky;
			if (verticalAlign === 'top') {
				node.y = y;
				y += node.dy + nodePadding;
			} else {
				node.y = i;
			}
		});
	}
	for (const link of links) link.dy = link.value * ky;

	const center = (node: SankeyNode) => node.y + node.dy / 2;

	const resolveCollisions = () => {
		for (const column of columns) {
			if (sort) column.sort((a, b) => a.y - b.y);
			let y0 = 0;
			for (const node of column) {
				const dy = y0 - node.y;
				if (dy > 0) node.y += dy;
				y0 = node.y + node.dy + nodePadding;
			}
			const overflow = y0 - nodePadding - height;
			if (overflow > 0 && column.length) {
				const last = column[column.length - 1];
				last.y -= overflow;
				y0 = last.y;
				for (let i = column.length - 2; i >= 0; i--) {
					const node = column[i];
					const dy = node.y + node.dy + nodePadding - y0;
					if (dy > 0) node.y -= dy;
					y0 = node.y;
				}
			}
		}
	};

	const relaxLeftToRight = (alpha: number) => {
		for (const column of columns.slice(1)) {
			for (const node of column) {
				if (!node.targetLinks.length) continue;
				const incoming = node.targetLinks.map((i) => links[i]);
				const weight = sum(incoming.map((link) => link.value));
				if (!weight) continue;
				const y = sum(incoming.map((link) => center(nodes[link.source]) * link.value)) / weight;
				node.y += (y - center(node)) * alpha;
			}
		}
	};

	const relaxRightToLeft = (alpha: number) => {
		for (const column of [...columns].reverse().slice(1)) {
			for (const node of column) {
				if (!node.sourceLinks.length) continue;
				const outgoing = node.sourceLinks.map((i) => links[i]);
				const weight = sum(outgoing.map((link) => link.value));
				if (!weight) continue;
				const y = sum(outgoing.map((link) => center(nodes[link.target]) * link.value)) / weight;
				node.y += (y - center(node)) * alpha;
			}
		}
	};

	resolveCollisions();
	let alpha = 1;
	for (let i = 1; i <= iterations; i++) {
		alpha *= 0.99;
		relaxRightToLeft(alpha);
		resolveCollisions();
		relaxLeftToRight(alpha);
		resolveCollisions();
	}

	// Link offsets inside their nodes, ordered by the opposite node's position
	for (const node of nodes) {
		const outgoing = node.sourceLinks
			.map((i) => links[i])
			.sort((a, b) => nodes[a.target].y - nodes[b.target].y);
		const incoming = node.targetLinks
			.map((i) => links[i])
			.sort((a, b) => nodes[a.source].y - nodes[b.source].y);
		let sy = 0;
		for (const link of outgoing) {
			link.sy = sy;
			sy += link.dy;
		}
		let ty = 0;
		for (const link of incoming) {
			link.ty = ty;
			ty += link.dy;
		}
	}

	return { nodes, links };
}

/** Total flow through a node (outgoing, or incoming for sinks). */
export function getNodeValue(data: SankeyData, nodeName: string) {
	const index = data.nodes.findIndex((node) => node.name === nodeName);
	if (index === -1) return 0;
	const outgoing = sum(data.links.filter((l) => l.source === index).map((l) => l.value));
	const incoming = sum(data.links.filter((l) => l.target === index).map((l) => l.value));
	return outgoing > 0 ? outgoing : incoming;
}

/** Whether `nodeName` is the selected node or directly linked to it. */
export function isNodeConnected(data: SankeyData, selected: string | null, nodeName: string) {
	if (selected === null || selected === nodeName) return true;
	const selectedIdx = data.nodes.findIndex((node) => node.name === selected);
	const nodeIdx = data.nodes.findIndex((node) => node.name === nodeName);
	return data.links.some(
		(link) =>
			(link.source === selectedIdx && link.target === nodeIdx) ||
			(link.source === nodeIdx && link.target === selectedIdx)
	);
}
