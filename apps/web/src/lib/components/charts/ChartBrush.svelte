<script lang="ts">
	import type { BrushOptions, BrushRange } from './types';
	import { cn } from '$lib/utils/cn';
	import { getColorStops, toNumber, type ChartConfig, type ChartRow, toLabel } from './chart-utils';
	import { areaPath, linePath, type CurveType } from './curves';
	import { stackSeries } from './cartesian';

	type Props = {
		data: ChartRow[];
		config: ChartConfig;
		keys: string[];
		xDataKey?: string;
		variant?: 'line' | 'area' | 'bar';
		curveType?: CurveType;
		stacked?: boolean;
		barRadius?: number;
		dashed?: boolean;
		minSpan?: number;
		showLabels?: boolean;
		options?: BrushOptions;
		/** Selected index range, defaults to the full data set. */
		range?: BrushRange;
		class?: string;
	};

	let {
		data,
		config,
		keys,
		xDataKey,
		variant = 'area',
		curveType = 'monotone',
		stacked = false,
		barRadius = 3,
		dashed = false,
		minSpan = 2,
		showLabels = true,
		options = {},
		range = $bindable({ startIndex: 0, endIndex: Math.max(0, data.length - 1) }),
		class: className
	}: Props = $props();

	const id = $props.id();
	const height = $derived(options.height ?? 56);
	const total = $derived(data.length);

	let container = $state<HTMLDivElement>();
	let width = $state(0);
	let drag: { type: 'left' | 'right' | 'middle'; originX: number; origin: BrushRange } | null =
		null;
	let dragging = $state(false);

	const leftPct = $derived(total > 1 ? (range.startIndex / (total - 1)) * 100 : 0);
	const rightPct = $derived(total > 1 ? (range.endIndex / (total - 1)) * 100 : 100);

	function clamp(next: BrushRange, mode?: 'left' | 'right' | 'middle'): BrushRange {
		const maxIndex = Math.max(0, total - 1);
		let startIndex = Math.max(0, Math.min(next.startIndex, maxIndex));
		let endIndex = Math.max(0, Math.min(next.endIndex, maxIndex));
		if (mode === 'left') return { startIndex: Math.min(startIndex, Math.max(0, endIndex - minSpan)), endIndex };
		if (mode === 'right') return { startIndex, endIndex: Math.max(endIndex, Math.min(maxIndex, startIndex + minSpan)) };
		if (endIndex - startIndex < minSpan) {
			endIndex = Math.min(startIndex + minSpan, maxIndex);
			if (endIndex - startIndex < minSpan) startIndex = Math.max(0, endIndex - minSpan);
		}
		return { startIndex, endIndex };
	}

	function commit(next: BrushRange, mode?: 'left' | 'right' | 'middle') {
		const clamped = clamp(next, mode);
		if (clamped.startIndex === range.startIndex && clamped.endIndex === range.endIndex) return;
		range = clamped;
		options.onChange?.(clamped);
	}

	function start(event: PointerEvent, type: 'left' | 'right' | 'middle') {
		event.preventDefault();
		event.stopPropagation();
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		drag = { type, originX: event.clientX, origin: { ...range } };
		dragging = true;
	}

	function move(event: PointerEvent) {
		if (!drag || !container || total <= 1) return;
		const delta = Math.round(
			((event.clientX - drag.originX) / container.getBoundingClientRect().width) * (total - 1)
		);
		const o = drag.origin;
		if (drag.type === 'left') commit({ startIndex: o.startIndex + delta, endIndex: o.endIndex }, 'left');
		else if (drag.type === 'right') commit({ startIndex: o.startIndex, endIndex: o.endIndex + delta }, 'right');
		else {
			const span = o.endIndex - o.startIndex;
			let s = o.startIndex + delta;
			let e = s + span;
			if (s < 0) {
				s = 0;
				e = span;
			}
			if (e > total - 1) {
				e = total - 1;
				s = Math.max(0, e - span);
			}
			commit({ startIndex: s, endIndex: e }, 'middle');
		}
	}

	function end(event: PointerEvent) {
		const target = event.currentTarget as HTMLElement;
		if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
		drag = null;
		dragging = false;
	}

	function label(index: number) {
		if (!xDataKey) return String(index);
		const value = data[index]?.[xDataKey];
		return options.formatLabel ? options.formatLabel(value, index) : toLabel(value, String(index));
	}

	// Mini chart geometry — always shows the full data set
	const TOP = $derived(variant === 'bar' ? 2 : 4);
	const mini = $derived.by(() => {
		const h = height;
		const w = Math.max(1, width);
		const stacks = stackSeries(data, keys, stacked ? 'stacked' : 'default');
		let max = 0;
		for (const s of stacks) for (const p of s) if (p) max = Math.max(max, p[1]);
		max = max || 1;
		const yOf = (v: number) => h - (v / max) * (h - TOP);
		if (variant === 'bar') {
			const band = w / Math.max(1, data.length);
			const slots = stacked ? 1 : keys.length;
			const size = Math.min(14, Math.max(1, (band * 0.8 - (slots - 1) * 2) / slots));
			const groupWidth = slots * size + (slots - 1) * 2;
			return {
				bars: keys.map((key, k) =>
					data.map((_, i) => {
						const pair = stacks[k][i];
						if (!pair) return null;
						const x = band * (i + 0.5) - groupWidth / 2 + (stacked ? 0 : k * (size + 2));
						const y1 = yOf(pair[1]);
						const y0 = yOf(pair[0]);
						return { key, x, y: y1, width: size, height: Math.max(0, y0 - y1) };
					})
				),
				paths: []
			};
		}
		const xOf = (i: number) => (data.length > 1 ? (i / (data.length - 1)) * w : w / 2);
		return {
			bars: [],
			paths: keys.map((key, k) => {
				const pts = data.map((row, i) => {
					const pair = stacks[k][i];
					if (!pair || toNumber(row[key]) === null) return null;
					return { x: xOf(i), y: yOf(pair[1]), y0: yOf(pair[0]) };
				});
				return {
					key,
					line: linePath(pts, curveType),
					area: variant === 'area' ? areaPath(pts, curveType) : ''
				};
			})
		};
	});
</script>

{#if total > 0}
	<div
		bind:this={container}
		bind:clientWidth={width}
		class={cn('group relative select-none', className)}
		style="height: {height}px"
	>
		<div class="absolute inset-0 overflow-hidden rounded-md">
			<svg class="block h-full w-full" width={width} {height} aria-hidden="true">
				<defs>
					{#if variant === 'area'}
						<linearGradient id="{id}-zm-vertical-fade" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stop-color="white" stop-opacity="0.15" />
							<stop offset="100%" stop-color="white" stop-opacity="0" />
						</linearGradient>
					{/if}
					{#each keys as key (key)}
						<linearGradient id="{id}-zm-{key}" x1="0" y1="0" x2="0" y2="1">
							{#each getColorStops(key, config[key]) as stop (stop.offset)}
								<stop offset={stop.offset} stop-color={stop.color} />
							{/each}
						</linearGradient>
						{#if variant === 'area'}
							<mask id="{id}-zm-fill-mask-{key}">
								<rect width="100%" height="100%" fill="url(#{id}-zm-vertical-fade)" />
							</mask>
							<pattern id="{id}-zm-fill-{key}" patternUnits="userSpaceOnUse" width="100%" height="100%">
								<rect
									width="100%"
									height="100%"
									fill="url(#{id}-zm-{key})"
									mask="url(#{id}-zm-fill-mask-{key})"
								/>
							</pattern>
						{/if}
					{/each}
				</defs>
				{#if variant === 'bar'}
					{#each mini.bars as series, k (k)}
						{#each series as bar, i (i)}
							{#if bar && bar.height > 0}
								<rect
									x={bar.x}
									y={bar.y}
									width={bar.width}
									height={bar.height}
									rx={Math.min(barRadius, bar.width / 2)}
									fill="url(#{id}-zm-{bar.key})"
									fill-opacity="0.35"
								/>
							{/if}
						{/each}
					{/each}
				{:else}
					{#each mini.paths as series (series.key)}
						{#if series.area}
							<path d={series.area} fill="url(#{id}-zm-fill-{series.key})" />
						{/if}
						<path
							d={series.line}
							fill="none"
							stroke="url(#{id}-zm-{series.key})"
							stroke-width="1"
							stroke-opacity="0.5"
							stroke-dasharray={dashed ? '4 4' : undefined}
						/>
					{/each}
				{/if}
			</svg>
		</div>

		<div
			class="pointer-events-none absolute inset-y-0 left-0 rounded-l-md bg-background/70 backdrop-blur-[2px]"
			class:brush-smooth={!dragging}
			style="width: {leftPct}%"
		></div>
		<div
			class="pointer-events-none absolute inset-y-0 right-0 rounded-r-md bg-background/70 backdrop-blur-[2px]"
			class:brush-smooth={!dragging}
			style="width: {Math.max(0, 100 - rightPct)}%"
		></div>

		<div
			class="absolute inset-y-0 cursor-grab touch-none rounded-sm border border-foreground/15 active:cursor-grabbing"
			class:brush-smooth={!dragging}
			style="left: {leftPct}%; width: {Math.max(0, rightPct - leftPct)}%"
			role="slider"
			tabindex="-1"
			aria-label="Выбранный диапазон"
			aria-valuemin={0}
			aria-valuemax={Math.max(0, total - 1)}
			aria-valuenow={range.startIndex}
			onpointerdown={(e) => start(e, 'middle')}
			onpointermove={move}
			onpointerup={end}
			onpointercancel={end}
		></div>

		{#each ['left', 'right'] as const as side (side)}
			{@const isLeft = side === 'left'}
			<div
				class="absolute inset-y-0 z-10"
				class:brush-smooth={!dragging}
				style="left: {isLeft ? leftPct : rightPct}%"
			>
				<div
					class={cn(
						'group/handle absolute inset-y-0 flex w-3 cursor-ew-resize touch-none items-center justify-center after:absolute after:inset-y-0 after:-left-4 after:w-11 after:content-[\'\']',
						!isLeft && '-translate-x-full'
					)}
					role="slider"
					tabindex="0"
					aria-label={isLeft ? 'Начало диапазона' : 'Конец диапазона'}
					aria-valuemin={0}
					aria-valuemax={Math.max(0, total - 1)}
					aria-valuenow={isLeft ? range.startIndex : range.endIndex}
					onpointerdown={(e) => start(e, side)}
					onpointermove={move}
					onpointerup={end}
					onpointercancel={end}
					onkeydown={(e) => {
						const step = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
						if (!step) return;
						e.preventDefault();
						if (isLeft) commit({ ...range, startIndex: range.startIndex + step }, 'left');
						else commit({ ...range, endIndex: range.endIndex + step }, 'right');
					}}
				>
					<div
						class={cn(
							'relative flex h-4 w-1.5 items-center justify-center rounded-md bg-foreground-muted transition-colors group-hover/handle:bg-foreground',
							isLeft ? '-left-[5.5px]' : '-right-[5.5px]'
						)}
					>
						<div class="flex flex-col gap-[2px]">
							<div class="h-[2px] w-[2px] rounded-full bg-background/70"></div>
							<div class="h-[2px] w-[2px] rounded-full bg-background/70"></div>
							<div class="h-[2px] w-[2px] rounded-full bg-background/70"></div>
						</div>
					</div>
				</div>
				{#if showLabels}
					<div
						class={cn(
							'pointer-events-none absolute -bottom-3 -translate-y-1/2 rounded-[3px] bg-foreground px-1 py-px text-[8px] leading-tight font-medium whitespace-nowrap text-background opacity-0 group-hover:opacity-100',
							isLeft ? 'left-1.5' : 'right-1.5'
						)}
					>
						{label(isLeft ? range.startIndex : range.endIndex)}
					</div>
				{/if}
			</div>
		{/each}
	</div>
{/if}

<style>
	.brush-smooth {
		transition:
			left 0.25s cubic-bezier(0.2, 0.8, 0.2, 1),
			width 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
	}
</style>
