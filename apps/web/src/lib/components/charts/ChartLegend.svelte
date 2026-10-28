<script lang="ts" module>
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
</script>

<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { getIndicatorBackground, type ChartConfig } from './chart-utils';

	type Props = {
		config: ChartConfig;
		/** Config keys shown in the legend, in order. */
		keys: string[];
		selected: string | null;
		onSelectChange?: (key: string | null) => void;
		options?: LegendOptions;
	};

	let { config, keys, selected, onSelectChange, options = {} }: Props = $props();

	const variant = $derived(options.variant ?? 'rounded-square');
	const align = $derived(options.align ?? 'right');
	const verticalAlign = $derived(options.verticalAlign ?? 'top');

	const OUTLINE_MASK =
		'-webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask-composite: exclude;';

	const indicatorClass: Record<ChartLegendVariant, string> = {
		square: 'h-2 w-2',
		circle: 'h-2 w-2 rounded-full',
		'circle-outline': 'h-2.5 w-2.5 rounded-full p-[1.5px]',
		'vertical-bar': 'h-3 w-1 rounded-[2px]',
		'horizontal-bar': 'h-1 w-3 rounded-[2px]',
		'rounded-square-outline': 'h-2.5 w-2.5 rounded-[3px] p-[1.5px]',
		'rounded-square': 'h-2 w-2 rounded-[2px]'
	};

	function toggle(key: string) {
		if (!options.isClickable) return;
		onSelectChange?.(selected === key ? null : key);
	}
</script>

<div
	class={cn(
		'flex flex-wrap items-center gap-4 select-none',
		align === 'left' && 'justify-start',
		align === 'center' && 'justify-center',
		align === 'right' && 'justify-end',
		verticalAlign === 'top' ? 'pb-4' : 'pt-4'
	)}
>
	{#each keys as key (key)}
		{@const item = config[key]}
		{@const isSelected = selected === null || selected === key}
		{@const outline = variant === 'circle-outline' || variant === 'rounded-square-outline'}
		{#snippet content()}
			{#if item?.icon}
				{@const Icon = item.icon}
				<span class="size-3 text-foreground-muted"><Icon /></span>
			{:else}
				<div
					class={cn('shrink-0', indicatorClass[variant])}
					style="background: {getIndicatorBackground(key, item)};{outline ? OUTLINE_MASK : ''}"
				></div>
			{/if}
			{item?.label ?? key}
		{/snippet}
		{#if options.isClickable}
			<button
				type="button"
				class={cn(
					'flex cursor-pointer items-center gap-1.5 text-foreground transition-opacity',
					!isSelected && 'opacity-30'
				)}
				aria-pressed={selected === key}
				onclick={() => toggle(key)}
			>
				{@render content()}
			</button>
		{:else}
			<div class={cn('flex items-center gap-1.5 text-foreground', !isSelected && 'opacity-30')}>
				{@render content()}
			</div>
		{/if}
	{/each}
</div>
