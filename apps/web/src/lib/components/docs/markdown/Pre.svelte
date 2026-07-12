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
	let contentEl = $state<HTMLElement | null>(null);

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

	const MARK_ATTR = 'data-search-mark';

	function clearMarks(root: HTMLElement) {
		root.querySelectorAll(`mark[${MARK_ATTR}]`).forEach((mark) => {
			const parent = mark.parentNode;
			if (!parent) return;
			while (mark.firstChild) {
				parent.insertBefore(mark.firstChild, mark);
			}
			parent.removeChild(mark);
			parent.normalize();
		});
	}

	function highlightSearch(root: HTMLElement, query: string) {
		clearMarks(root);
		if (!query) return;

		const lowerQuery = query.toLowerCase();
		const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
			acceptNode(node) {
				const parent = node.parentElement;
				if (!parent) return NodeFilter.FILTER_REJECT;
				if (parent.tagName === 'MARK' && parent.hasAttribute(MARK_ATTR))
					return NodeFilter.FILTER_REJECT;
				if (!node.nodeValue || !node.nodeValue.toLowerCase().includes(lowerQuery))
					return NodeFilter.FILTER_REJECT;
				return NodeFilter.FILTER_ACCEPT;
			}
		});

		const targets: Text[] = [];
		let current = walker.nextNode();
		while (current) {
			targets.push(current as Text);
			current = walker.nextNode();
		}

		for (const textNode of targets) {
			const text = textNode.nodeValue!;
			const lower = text.toLowerCase();
			const parent = textNode.parentElement;
			if (!parent) continue;

			const frag = document.createDocumentFragment();
			let i = 0;
			let idx: number;
			while ((idx = lower.indexOf(lowerQuery, i)) !== -1) {
				if (idx > i) frag.appendChild(document.createTextNode(text.slice(i, idx)));
				const mark = document.createElement('mark');
				mark.setAttribute(MARK_ATTR, '');
				mark.style.cssText =
					'background: oklch(0.85 0.17 80 / 0.5); border-radius: 2px; color: inherit;';
				mark.textContent = text.slice(idx, idx + query.length);
				frag.appendChild(mark);
				i = idx + query.length;
			}
			if (i < text.length) frag.appendChild(document.createTextNode(text.slice(i)));
			parent.replaceChild(frag, textNode);
		}
	}

	let observer: MutationObserver | null = null;

	$effect(() => {
		if (!contentEl) return;
		const query = searchQuery;

		highlightSearch(contentEl, query);

		observer = new MutationObserver(() => {
			highlightSearch(contentEl!, query);
		});
		observer.observe(contentEl, { childList: true, subtree: true });

		return () => {
			observer?.disconnect();
			observer = null;
		};
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
			<div bind:this={contentEl}>
				{@render children?.()}
			</div>
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
					class="pointer-events-auto inset-shadow flex size-7 items-center justify-center rounded-sm bg-background-inset text-foreground transition-colors duration-150"
					class:text-accent={searchOpen}
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
