<script lang="ts">
	import type {
		ComponentPreviewChildren,
		ComponentPreviewValues
	} from './types';
	import { cn } from '$lib/utils/cn';
	import ScrollArea from '$lib/components/ui-registry/ScrollArea.svelte';
	import Maximize from 'carbon-icons-svelte/lib/Maximize.svelte';
	import Minimize from 'carbon-icons-svelte/lib/Minimize.svelte';
	import Reset from 'carbon-icons-svelte/lib/Reset.svelte';
	import Terminal from 'carbon-icons-svelte/lib/Terminal.svelte';

	type Props = {
		children?: ComponentPreviewChildren;
		values: ComponentPreviewValues;
		previewKey: number;
		isFullScreen: boolean;
		isPlaygroundOpen?: boolean;
		class?: string;
		onReload: () => void;
		onToggleFullScreen: () => void;
		onOpenPlayground?: () => void;
		previewRef?: HTMLElement;
		placeholderRef?: HTMLElement;
	};

	let {
		children,
		values,
		previewKey,
		isFullScreen,
		isPlaygroundOpen = false,
		class: className = '',
		onReload,
		onToggleFullScreen,
		onOpenPlayground,
		previewRef = $bindable(),
		placeholderRef = $bindable()
	}: Props = $props();
</script>

<div
	bind:this={placeholderRef}
	class="relative flex min-h-96 flex-1 flex-col items-center justify-center rounded-md bg-background card"
>
	<div
		bind:this={previewRef}
		data-fullscreen={isFullScreen}
		class={cn(
			'group/preview relative flex flex-col overflow-hidden bg-background',
			isFullScreen ? 'z-50' : 'h-full w-full flex-1 rounded-md'
		)}
	>
		{#if onOpenPlayground && !isFullScreen}
			<button
				type="button"
				onclick={onOpenPlayground}
				class="inset-shadow absolute top-2 right-[4.5rem] z-30 flex h-7 items-center gap-1.5 rounded-sm bg-background-inset px-2 text-xs font-medium text-foreground transition-[color,scale] duration-150 ease-out hover:text-accent active:scale-[0.95]"
				aria-label="Открыть в Playground"
			>
				<Terminal size={14} />
				<span>Playground</span>
			</button>
		{/if}
		<button
			onclick={onReload}
			class="inset-shadow absolute top-2 right-10 z-30 flex size-7 items-center justify-center rounded-sm bg-background-inset text-foreground transition-transform duration-150 ease-out active:scale-[0.95]"
			aria-label="Перезагрузить превью"
		>
			<Reset size={16} />
		</button>
		<button
			onclick={onToggleFullScreen}
			class="inset-shadow absolute top-2 right-2 z-30 flex size-7 items-center justify-center rounded-sm bg-background-inset text-foreground transition-transform duration-150 ease-out active:scale-[0.95]"
			aria-label={isFullScreen ? 'Выйти из полноэкранного режима' : 'На весь экран'}
		>
			{#if isFullScreen}
				<Minimize size={16} />
			{:else}
				<Maximize size={16} />
			{/if}
		</button>
		<ScrollArea
			mode="both"
			id="component-preview-live"
			class={cn('w-full flex-1', !isFullScreen && className)}
			viewportClass="min-h-full w-full flex flex-col"
		>
			<div class="flex w-full flex-1 flex-col items-center justify-center">
				{#if isPlaygroundOpen}
					<button
						type="button"
						onclick={onOpenPlayground}
						class="flex flex-col items-center gap-2 p-6 text-sm text-foreground-muted transition-colors duration-150 ease-out hover:text-foreground"
					>
						<Terminal size={20} />
						Превью открыто в Playground
					</button>
				{:else}
					{#key previewKey}
						{@render children?.(values)}
					{/key}
				{/if}
			</div>
		</ScrollArea>
	</div>
</div>
