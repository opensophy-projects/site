<script lang="ts" module>
	export type SankeyLinkVariant = 'gradient' | 'solid' | 'source' | 'target';

	export type SankeyNodeOptions = {
		/** Corner radius of node rectangles in px. */
		radius?: number;
		/** Clicking a node highlights it and its direct connections. */
		isClickable?: boolean;
	};

	export type SankeyNodeLabelOptions = {
		/** Label inside the node or beside it. */
		position?: 'inside' | 'outside';
		/** Appends each node's total flow. */
		showValues?: boolean;
		valueFormatter?: (value: number) => string;
	};

	export type SankeyLinkOptions = {
		variant?: SankeyLinkVariant;
		/** Shrinks the link band where it meets a node. */
		verticalPadding?: number;
	};
</script>

<script lang="ts">
	import type { BackgroundVariant, TooltipOptions } from './types';
	import ChartContainer from './ChartContainer.svelte';
	import ChartTooltip from './ChartTooltip.svelte';
	import ChartBackground from './ChartBackground.svelte';
	import SeriesColorGradient from './SeriesColorGradient.svelte';
	import { resolveOptions } from './cartesian';
	import { DEFAULT_MARGIN, estimateTextWidth, type ChartConfig } from './chart-utils';
	import {
		computeSankeyLayout,
		getNodeValue,
		isNodeConnected,
		type SankeyData
	} from './sankey';

	type Props = {
		/** Nodes + links (link `source`/`target` are node indices). */
		data: SankeyData;
		/** Node colors + labels, keyed by node name. */
		config: ChartConfig;
		class?: string;
		nodeWidth?: number;
		nodePadding?: number;
		/** Link curve amount, 0 (straight) to 1. */
		linkCurvature?: number;
		/** Layout relaxation passes — higher is more accurate. */
		iterations?: number;
		sort?: boolean;
		align?: 'left' | 'justify';
		verticalAlign?: 'justify' | 'top';
		node?: SankeyNodeOptions;
		/** Node labels, `false` hides them. */
		nodeLabel?: boolean | SankeyNodeLabelOptions;
		link?: SankeyLinkOptions;
		tooltip?: boolean | TooltipOptions;
		backgroundVariant?: BackgroundVariant;
		defaultSelectedNode?: string | null;
		onSelectionChange?: (selection: { dataKey: string; value: number } | null) => void;
		isLoading?: boolean;
		ariaLabel?: string;
	};

	let {
		data,
		config,
		class: className = '',
		nodeWidth = 10,
		nodePadding = 10,
		linkCurvature = 0.5,
		iterations = 32,
		sort = true,
		align = 'justify',
		verticalAlign = 'justify',
		node = {},
		nodeLabel = false,
		link = {},
		tooltip = true,
		backgroundVariant,
		defaultSelectedNode = null,
		onSelectionChange,
		isLoading = false,
		ariaLabel = 'Sankey chart'
	}: Props = $props();

	const chartId = $props.id();

	// svelte-ignore state_referenced_locally
	let selectedNode = $state<string | null>(defaultSelectedNode);
	let hovered = $state<
		{ kind: 'node' | 'link'; index: number; x: number; y: number } | null
	>(null);

	const tooltipOpts = $derived(resolveOptions<TooltipOptions>(tooltip, true));
	const labelOpts = $derived(resolveOptions<SankeyNodeLabelOptions>(nodeLabel, false));
	const radius = $derived(node.radius ?? 0);
	const isClickable = $derived(node.isClickable ?? false);
	const linkVariant = $derived(link.variant ?? 'gradient');
	const formatNodeValue = $derived(
		labelOpts?.valueFormatter ?? ((value: number) => value.toLocaleString())
	);

	function labelOf(name: string) {
		return config[name]?.label ?? name;
	}

	function selectNode(name: string | null) {
		selectedNode = name;
		if (!onSelectionChange) return;
		onSelectionChange(name === null ? null : { dataKey: name, value: getNodeValue(data, name) });
	}

	function pointerOf(event: PointerEvent) {
		const svg = (event.currentTarget as SVGElement).ownerSVGElement;
		const rect = (svg ?? (event.currentTarget as Element)).getBoundingClientRect();
		return { x: event.clientX - rect.left, y: event.clientY - rect.top };
	}

	function linkFill(index: number, source: string, target: string) {
		switch (linkVariant) {
			case 'gradient':
				return `url(#${chartId}-link-gradient-${String(index)})`;
			case 'source':
				return source in config ? `url(#${chartId}-sankey-colors-${source})` : 'currentColor';
			case 'target':
				return target in config ? `url(#${chartId}-sankey-colors-${target})` : 'currentColor';
			default:
				return 'currentColor';
		}
	}

	const LOADING_NODES = [
		{ x: 30, y: 25, width: 12, height: 65, delay: 0 },
		{ x: 30, y: 110, width: 12, height: 50, delay: 0.3 },
		{ x: 30, y: 180, width: 12, height: 45, delay: 0.15 },
		{ x: 244, y: 20, width: 12, height: 55, delay: 0.45 },
		{ x: 244, y: 95, width: 12, height: 75, delay: 0.6 },
		{ x: 244, y: 190, width: 12, height: 40, delay: 0.25 },
		{ x: 458, y: 35, width: 12, height: 80, delay: 0.5 },
		{ x: 458, y: 135, width: 12, height: 90, delay: 0.1 }
	];
	const LOADING_LINKS = [
		{ from: 0, to: 3, width: 26, delay: 0.2 },
		{ from: 0, to: 4, width: 18, delay: 0.7 },
		{ from: 1, to: 4, width: 24, delay: 0.4 },
		{ from: 1, to: 5, width: 12, delay: 0.9 },
		{ from: 2, to: 4, width: 16, delay: 0.1 },
		{ from: 2, to: 5, width: 14, delay: 0.55 },
		{ from: 3, to: 6, width: 22, delay: 0.35 },
		{ from: 3, to: 7, width: 18, delay: 0.8 },
		{ from: 4, to: 6, width: 28, delay: 0.05 },
		{ from: 4, to: 7, width: 32, delay: 0.65 },
		{ from: 5, to: 7, width: 16, delay: 0.45 }
	];

	function loadingLinkPath(fromIdx: number, toIdx: number) {
		const from = LOADING_NODES[fromIdx];
		const to = LOADING_NODES[toIdx];
		const startX = from.x + from.width;
		const startY = from.y + from.height / 2;
		const endX = to.x;
		const endY = to.y + to.height / 2;
		const c1 = startX + (endX - startX) * 0.4;
		const c2 = startX + (endX - startX) * 0.6;
		return `M${String(startX)},${String(startY)} C${String(c1)},${String(startY)} ${String(c2)},${String(endY)} ${String(endX)},${String(endY)}`;
	}
</script>

<ChartContainer id={chartId} {config} class={className} {isLoading}>
	{#snippet children({ width, height }: { width: number; height: number })}
		{#if isLoading}
			<svg
				viewBox="0 0 500 250"
				preserveAspectRatio="xMidYMid meet"
				width="100%"
				height="100%"
				class="absolute inset-0 text-foreground"
				aria-hidden="true"
			>
				{#each LOADING_LINKS as l, i (i)}
					<path
						class="chart-pulse-soft"
						style="animation-delay: {l.delay}s; --chart-pulse-duration: {2 * (0.8 + (i % 3) * 0.2)}s"
						d={loadingLinkPath(l.from, l.to)}
						fill="none"
						stroke="currentColor"
						stroke-width={l.width}
					/>
				{/each}
				{#each LOADING_NODES as n, i (i)}
					<rect
						class="chart-pulse"
						style="animation-delay: {n.delay}s; --chart-pulse-duration: {2 * (0.9 + (i % 4) * 0.1)}s"
						x={n.x}
						y={n.y}
						width={n.width}
						height={n.height}
						rx="2"
						fill="currentColor"
					/>
				{/each}
			</svg>
		{:else}
			{@const labelSpace =
				labelOpts?.position === 'outside'
					? Math.max(
							0,
							...data.nodes.map((n) => estimateTextWidth(labelOf(n.name)))
						) + 12
					: 0}
			{@const plotWidth = Math.max(
				nodeWidth + 1,
				width - DEFAULT_MARGIN.left - DEFAULT_MARGIN.right - labelSpace
			)}
			{@const plotHeight = Math.max(1, height - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom)}
			{@const sankey = computeSankeyLayout(data, {
				width: plotWidth,
				height: plotHeight,
				nodeWidth,
				nodePadding,
				iterations,
				sort,
				align,
				verticalAlign
			})}
			<svg
				{width}
				{height}
				viewBox="0 0 {width} {height}"
				class="absolute inset-0 block"
				role="img"
				aria-label={ariaLabel}
				onpointerleave={() => (hovered = null)}
			>
				<defs>
					{#each Object.entries(config) as [key, item] (key)}
						<SeriesColorGradient
							id={chartId}
							dataKey={key}
							{item}
							direction="vertical"
							gradientId="{chartId}-sankey-colors-{key}"
						/>
					{/each}
					{#each sankey.links as l (l.index)}
						{@const source = sankey.nodes[l.source].name}
						{@const target = sankey.nodes[l.target].name}
						{#if linkVariant === 'gradient'}
							<linearGradient id="{chartId}-link-gradient-{l.index}" x1="0%" y1="0%" x2="100%" y2="0%">
								<stop
									offset="0%"
									stop-color={source in config ? `var(--color-${source}-0)` : 'currentColor'}
									stop-opacity="0.2"
								/>
								<stop
									offset="50%"
									stop-color={source in config ? `var(--color-${source}-0)` : 'currentColor'}
									stop-opacity="0.5"
								/>
								<stop
									offset="100%"
									stop-color={target in config ? `var(--color-${target}-0)` : 'currentColor'}
									stop-opacity="0.2"
								/>
							</linearGradient>
						{/if}
						<linearGradient id="{chartId}-link-stroke-{l.index}" x1="0%" y1="0%" x2="100%" y2="0%">
							<stop offset="0%" stop-color="var(--color-foreground)" stop-opacity="0" />
							<stop offset="15%" stop-color="var(--color-foreground)" stop-opacity="0.8" />
							<stop offset="50%" stop-color="var(--color-foreground)" stop-opacity="1" />
							<stop offset="85%" stop-color="var(--color-foreground)" stop-opacity="0.8" />
							<stop offset="100%" stop-color="var(--color-foreground)" stop-opacity="0" />
						</linearGradient>
					{/each}
				</defs>

				{#if backgroundVariant}
					<ChartBackground variant={backgroundVariant} />
				{/if}

				<g transform="translate({DEFAULT_MARGIN.left}, {DEFAULT_MARGIN.top})">
					<g class="text-foreground">
						{#each sankey.links as l (l.index)}
							{@const sourceNode = sankey.nodes[l.source]}
							{@const targetNode = sankey.nodes[l.target]}
							{@const sourceX = sourceNode.x + sourceNode.dx}
							{@const targetX = targetNode.x}
							{@const sourceY = sourceNode.y + l.sy + l.dy / 2}
							{@const targetY = targetNode.y + l.ty + l.dy / 2}
							{@const c1 = sourceX + (targetX - sourceX) * linkCurvature}
							{@const c2 = sourceX + (targetX - sourceX) * (1 - linkCurvature)}
							{@const half = Math.max(1, l.dy - (link.verticalPadding ?? 0)) / 2}
							{@const isConnected =
								selectedNode === null ||
								selectedNode === sourceNode.name ||
								selectedNode === targetNode.name}
							<path
								role="presentation"
								d="M{sourceX},{sourceY - half} C{c1},{sourceY - half} {c2},{targetY - half} {targetX},{targetY - half} L{targetX},{targetY + half} C{c2},{targetY + half} {c1},{sourceY + half} {sourceX},{sourceY + half} Z"
								fill={linkFill(l.index, sourceNode.name, targetNode.name)}
								fill-opacity={isConnected ? 0.4 : 0.1}
								stroke={selectedNode !== null && isConnected
									? `url(#${chartId}-link-stroke-${String(l.index)})`
									: 'none'}
								stroke-width="1"
								class="transition-opacity duration-200"
								onpointermove={(event) => (hovered = { kind: 'link', index: l.index, ...pointerOf(event) })}
							/>
						{/each}
					</g>

					{#each sankey.nodes as n (n.index)}
						{@const dimmed = isClickable && !isNodeConnected(data, selectedNode, n.name)}
						{@const showValues = labelOpts?.showValues ?? false}
						{@const labelX = n.x + n.dx / 2}
						{@const labelY = showValues ? n.y + n.dy / 2 - 8 : n.y + n.dy / 2}
						<g>
							<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
							<rect
								x={n.x}
								y={n.y}
								width={n.dx}
								height={Math.max(0, n.dy)}
								rx={radius}
								ry={radius}
								fill={n.name in config ? `url(#${chartId}-sankey-colors-${n.name})` : 'currentColor'}
								fill-opacity={dimmed ? 0.15 : 0.9}
								class="text-foreground transition-opacity duration-200"
								style:cursor={isClickable ? 'pointer' : undefined}
								onpointermove={(event) => (hovered = { kind: 'node', index: n.index, ...pointerOf(event) })}
								onclick={() => {
									if (isClickable) selectNode(selectedNode === n.name ? null : n.name);
								}}
							/>
							{#if labelOpts?.position === 'inside'}
								<rect
									x={n.x + 1}
									y={n.y + 1}
									width={Math.max(0, n.dx - 2)}
									height={Math.max(0, n.dy - 2)}
									rx={Math.max(0, radius - 1)}
									ry={Math.max(0, radius - 1)}
									opacity={dimmed ? 0.3 : 1}
									class="pointer-events-none fill-white/50 transition-opacity duration-200 dark:fill-black/60"
								/>
								<text
									x={labelX}
									y={labelY}
									text-anchor="middle"
									dominant-baseline="middle"
									font-size="10"
									font-weight="500"
									class="pointer-events-none fill-foreground transition-opacity duration-200 dark:fill-white"
									opacity={dimmed ? 0.3 : 1}
								>
									{labelOf(n.name)}
								</text>
								{#if showValues}
									<text
										x={labelX}
										y={n.y + n.dy / 2 + 8}
										text-anchor="middle"
										dominant-baseline="middle"
										font-size="12"
										font-weight="500"
										class="pointer-events-none fill-foreground font-mono tabular-nums transition-opacity duration-200 dark:fill-white"
										opacity={dimmed ? 0.3 : 0.6}
									>
										{formatNodeValue(n.value)}
									</text>
								{/if}
							{:else if labelOpts?.position === 'outside'}
								<text
									x={n.x + n.dx + 8}
									y={n.y + n.dy / 2 - (showValues ? 8 : 0)}
									text-anchor="start"
									dominant-baseline="middle"
									font-size="12"
									class="pointer-events-none fill-foreground"
								>
									{labelOf(n.name)}
								</text>
								{#if showValues}
									<text
										x={n.x + n.dx + 8}
										y={n.y + n.dy / 2 + 8}
										text-anchor="start"
										dominant-baseline="middle"
										font-size="12"
										opacity="0.5"
										class="pointer-events-none fill-foreground font-mono tabular-nums"
									>
										{formatNodeValue(n.value)}
									</text>
								{/if}
							{/if}
						</g>
					{/each}
				</g>
			</svg>

			{#if tooltipOpts && hovered}
				{@const shown = hovered}
				{#if shown.kind === 'node'}
					{@const n = sankey.nodes[shown.index]}
					<ChartTooltip
						x={shown.x}
						y={shown.y}
						boundsWidth={width}
						boundsHeight={height}
						hideLabel
						options={tooltipOpts}
						items={[{ key: n.name, name: labelOf(n.name), value: n.value, item: config[n.name] }]}
					/>
				{:else}
					{@const l = sankey.links[shown.index]}
					{@const source = sankey.nodes[l.source].name}
					{@const target = sankey.nodes[l.target].name}
					<ChartTooltip
						x={shown.x}
						y={shown.y}
						boundsWidth={width}
						boundsHeight={height}
						hideLabel
						options={tooltipOpts}
						items={[
							{
								key: source,
								name: `${labelOf(source)} → ${labelOf(target)}`,
								value: l.value,
								item: config[source]
							}
						]}
					/>
				{/if}
			{/if}
		{/if}
	{/snippet}
</ChartContainer>
