<script lang="ts">
	import type { TooltipItem, TooltipOptions, TooltipRoundness, TooltipVariant } from './types';
	import { cn } from '$lib/utils/cn';
	import { formatValue, getColorsCount, getIndicatorBackground } from './chart-utils';

	type Props = {
		/** Pointer position relative to the measured plot area. */
		x: number;
		y: number;
		/** Plot area size — the tooltip flips/clamps to stay inside. */
		boundsWidth: number;
		boundsHeight: number;
		label?: string | null;
		items: TooltipItem[];
		hideLabel?: boolean;
		options?: TooltipOptions;
	};

	let {
		x,
		y,
		boundsWidth,
		boundsHeight,
		label = null,
		items,
		hideLabel = false,
		options = {}
	}: Props = $props();

	const OFFSET = 10;

	const roundnessMap: Record<TooltipRoundness, string> = {
		sm: 'rounded-sm',
		md: 'rounded-md',
		lg: 'rounded-lg',
		xl: 'rounded-xl'
	};

	const variantMap: Record<TooltipVariant, string> = {
		default: 'bg-background',
		'frosted-glass': 'bg-background/70 backdrop-blur-sm'
	};

	let tooltipWidth = $state(0);
	let tooltipHeight = $state(0);

	const indicator = $derived(options.indicator ?? 'dot');
	const nestLabel = $derived(items.length === 1 && indicator !== 'dot');
	const shownLabel = $derived(
		hideLabel || label === null || label === ''
			? null
			: options.labelFormatter
				? options.labelFormatter(label)
				: label
	);

	const left = $derived(
		x + OFFSET + tooltipWidth > boundsWidth ? Math.max(0, x - OFFSET - tooltipWidth) : x + OFFSET
	);
	const top = $derived(
		y + OFFSET + tooltipHeight > boundsHeight
			? Math.max(0, Math.min(y - OFFSET - tooltipHeight, boundsHeight - tooltipHeight))
			: y + OFFSET
	);

	function display(value: unknown, key: string) {
		return options.valueFormatter ? options.valueFormatter(value, key) : formatValue(value);
	}
</script>

{#snippet labelBlock()}
	{#if shownLabel}
		<div class="font-medium text-foreground">{shownLabel}</div>
	{/if}
{/snippet}

<div
	class="pointer-events-none absolute top-0 left-0 z-10 transition-transform duration-200 ease-out"
	style="transform: translate({left}px, {top}px)"
	bind:clientWidth={tooltipWidth}
	bind:clientHeight={tooltipHeight}
	role="tooltip"
>
	<div
		class={cn(
			'grid min-w-32 items-start gap-1.5 border border-border px-2.5 py-1.5 text-xs whitespace-nowrap shadow-xl',
			roundnessMap[options.roundness ?? 'lg'],
			variantMap[options.variant ?? 'default']
		)}
	>
		{#if !nestLabel}
			{@render labelBlock()}
		{/if}
		<div class="grid gap-1.5">
			{#each items as entry (entry.key)}
				<div
					class={cn(
						'flex w-full flex-wrap items-stretch gap-2 transition-opacity',
						indicator === 'dot' && 'items-center',
						entry.dimmed && 'opacity-30'
					)}
				>
					{#if entry.item?.icon}
						{@const Icon = entry.item.icon}
						<span class="size-2.5 text-foreground-muted"><Icon /></span>
					{:else}
						<div
							class={cn('shrink-0 rounded-[2px]', {
								'h-2.5 w-2.5': indicator === 'dot',
								'w-1': indicator === 'line',
								'w-0 border-[1.5px] border-dashed bg-transparent!': indicator === 'dashed',
								'my-0.5': nestLabel && indicator === 'dashed'
							})}
							style={indicator === 'dashed'
								? `border-color: var(--color-${entry.key}-0)`
								: `background: ${getIndicatorBackground(entry.key, entry.item)}`}
							data-colors={getColorsCount(entry.item)}
						></div>
					{/if}
					<div
						class={cn(
							'flex flex-1 justify-between gap-4 leading-none',
							nestLabel ? 'items-end' : 'items-center'
						)}
					>
						<div class="grid gap-1.5">
							{#if nestLabel}
								{@render labelBlock()}
							{/if}
							<span class="text-foreground-muted">{entry.name}</span>
						</div>
						{#if entry.value != null}
							<span class="font-mono font-medium text-foreground tabular-nums">
								{display(entry.value, entry.key)}
							</span>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
