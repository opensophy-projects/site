<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils/cn';
	import ScrollArea from '$lib/components/ui/ScrollArea.svelte';
	import CopyCodeButton from './CopyCodeButton.svelte';
	import Search from 'carbon-icons-svelte/lib/Search.svelte';

	type ComponentProps = {
		class?: string;
		children?: Snippet;
		code?: string;
		unstyled?: boolean;
		[prop: string]: unknown;
	};

	const props = $props();
	const className = $derived((props as ComponentProps).class ?? '');
	const code = $derived((props as ComponentProps).code ?? '');
	const unstyled = $derived((props as ComponentProps).unstyled ?? false);
	const children = $derived((props as ComponentProps).children);
	let searchOpen = $state(false);
	let searchQuery = $state('');
	const hasSearchMatch = $derived(
		searchQuery.length > 0 && code.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const restProps = $derived.by(() => {
		const {
			class: _class,
			children: _children,
			code: _code,
			unstyled: _unstyled,
			...rest
		} = props as ComponentProps;
		return rest;
	});
</script>

<div class="inset-shadow mt-8 rounded-lg bg-background-inset p-1.5">
	<div
		{...restProps}
		class={cn(
			unstyled
				? 'group/pre relative font-mono text-base font-normal'
				: 'group/pre relative rounded-md bg-background p-4 font-mono text-base font-normal text-foreground card',
			className
		)}
	>
		<ScrollArea mode="horizontal" class="w-full" thumbTabbable={false}>
			{@render children?.()}
		</ScrollArea>
		{#if code}
			<div class="pointer-events-none absolute top-2 right-2 z-10 flex items-center gap-2">
				{#if searchOpen}
					<input
						bind:value={searchQuery}
						class="inset-shadow pointer-events-auto h-7 w-44 rounded-sm bg-background px-2 text-sm text-foreground placeholder:text-foreground-muted/60 focus-visible:outline-transparent"
						placeholder="Поиск по коду…"
					/>
				{/if}
				<button
					type="button"
					class="pointer-events-auto inset-shadow flex size-7 items-center justify-center rounded-sm bg-background-inset text-foreground"
					class:text-accent={hasSearchMatch}
					onclick={() => (searchOpen = !searchOpen)}
					aria-label="Search code"><Search size={16} /></button
				>
				<CopyCodeButton {code} class="pointer-events-auto" />
			</div>
		{/if}
	</div>
</div>

<style>
	:global(.shiki) {
		background-color: transparent !important;
		font-size: 14px;
		font-weight: 400;
	}
</style>
