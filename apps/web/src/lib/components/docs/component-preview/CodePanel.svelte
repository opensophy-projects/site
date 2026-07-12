<script lang="ts">
	import type { Snippet } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { getHighlighter } from '$lib/utils/highlighter';
	import ScrollArea from '$lib/components/ui/ScrollArea.svelte';
	import ShikiCodeBlock from '../ShikiCodeBlock.svelte';
	import CopyCodeButton from '../markdown/CopyCodeButton.svelte';
	import Search from 'carbon-icons-svelte/lib/Search.svelte';
	import type { SourceTab } from './types';
	import { cn } from '$lib/utils/cn';

	type Props = {
		tabs: SourceTab[];
		codeSlot?: Snippet;
	};

	let { tabs, codeSlot }: Props = $props();
	let activeTab = $state(0);
	let tabList = $state<HTMLDivElement | null>(null);
	let activeIndicatorLeft = $state(0);
	let activeIndicatorWidth = $state(0);
	let pendingIndicatorFrame: number | null = null;
	let searchOpen = $state(false);
	let searchQuery = $state('');
	let contentEl = $state<HTMLElement | null>(null);

	const tabRefs = new SvelteMap<number, HTMLButtonElement>();

	const highlightedSources = $derived.by(() => {
		const highlighter = getHighlighter();
		const highlighted: Record<string, { light: string; dark: string }> = {};

		tabs.forEach((tab) => {
			const lang = tab.language ?? 'typescript';
			const light = highlighter.codeToHtml(tab.code, {
				lang,
				theme: 'github-light'
			});
			const dark = highlighter.codeToHtml(tab.code, {
				lang,
				theme: 'github-dark'
			});
			highlighted[tab.name] = { light, dark };
		});

		return highlighted;
	});

	$effect(() => {
		void tabs;
		if (activeTab > tabs.length - 1) {
			activeTab = 0;
		}
	});

	function registerTab(node: HTMLElement, index: number) {
		tabRefs.set(index, node as HTMLButtonElement);

		return {
			update(nextIndex: number) {
				if (nextIndex === index) return;
				tabRefs.delete(index);
				index = nextIndex;
				tabRefs.set(index, node as HTMLButtonElement);
			},
			destroy() {
				tabRefs.delete(index);
			}
		};
	}

	function updateActiveIndicator() {
		const activeTabElement = tabRefs.get(activeTab);

		if (!tabList || !activeTabElement) {
			activeIndicatorLeft = 0;
			activeIndicatorWidth = 0;
			return;
		}

		activeIndicatorLeft = activeTabElement.offsetLeft;
		activeIndicatorWidth = activeTabElement.offsetWidth;
	}

	function scheduleActiveIndicatorUpdate() {
		if (typeof window === 'undefined') {
			updateActiveIndicator();
			return;
		}

		if (pendingIndicatorFrame !== null) {
			window.cancelAnimationFrame(pendingIndicatorFrame);
		}

		pendingIndicatorFrame = window.requestAnimationFrame(() => {
			pendingIndicatorFrame = null;
			updateActiveIndicator();
		});
	}

	$effect(() => {
		const currentActiveTab = activeTab;
		const currentTabList = tabList;
		const currentTabsLength = tabs.length;
		void currentActiveTab;
		void currentTabList;
		void currentTabsLength;

		scheduleActiveIndicatorUpdate();

		if (typeof window === 'undefined') return;

		window.addEventListener('resize', scheduleActiveIndicatorUpdate);

		return () => {
			window.removeEventListener('resize', scheduleActiveIndicatorUpdate);
			if (pendingIndicatorFrame !== null) {
				window.cancelAnimationFrame(pendingIndicatorFrame);
				pendingIndicatorFrame = null;
			}
		};
	});

	const activeSource = $derived(tabs.at(activeTab) ?? null);

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
		void activeTab;

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

<div
	class="mt-2 flex flex-1 flex-col overflow-hidden rounded-md rounded-b-md bg-background card"
>
	{#if tabs.length}
		<div
			class="relative flex items-center bg-background text-sm after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border after:shadow-2xs after:shadow-white after:content-[''] dark:after:bg-background-inset dark:after:shadow-border"
		>
			<div
				class="relative flex flex-1 items-center overflow-x-auto"
				bind:this={tabList}
			>
				{#if activeIndicatorWidth > 0}
					<div
						class="tab-active-line pointer-events-none absolute bottom-0 left-0 z-10 h-0.5 transition-[transform,width] duration-150 ease-out"
						style={`
								width: ${String(activeIndicatorWidth)}px;
								transform: translateX(${String(activeIndicatorLeft)}px);
							`}
						></div>
				{/if}

				{#each tabs as tab, index (tab.name)}
					<button
						type="button"
						class={cn(
							'relative z-20 px-4 py-2.5 text-sm font-medium tracking-normal whitespace-nowrap transition-colors duration-150 ease-out',
							index === activeTab
								? 'text-accent'
								: 'text-foreground-muted hover:text-foreground'
						)}
						onclick={() => (activeTab = index)}
						use:registerTab={index}
					>
						{tab.name}
					</button>
				{/each}
			</div>
			<div class="mr-2 flex w-fit flex-none items-center gap-2">
				{#if searchOpen}
					<input
						bind:value={searchQuery}
						class="inset-shadow h-7 w-36 rounded-sm bg-background px-2 text-sm text-foreground placeholder:text-foreground-muted/60 focus-visible:outline-transparent"
						placeholder="Поиск…"
					/>
				{/if}
				<button
					type="button"
					class="inset-shadow flex size-6 items-center justify-center rounded-sm bg-background-inset text-foreground transition-colors duration-150"
					class:text-accent={searchOpen}
					onclick={() => (searchOpen = !searchOpen)}
					aria-label="Поиск по коду"><Search size={14} /></button
				>
				{#if activeSource}
					<CopyCodeButton class="size-6" code={activeSource.code} />
				{/if}
			</div>
		</div>
	{/if}
	<ScrollArea
		mode="vertical"
		id="component-preview"
		class="relative max-h-96 flex-1"
		thumbTabbable={false}
		viewportTabbable={false}
	>
		<div
			bind:this={contentEl}
			class="p-4 text-sm *:mt-0 *:rounded-none *:border-0 *:bg-transparent *:p-0 *:inset-shadow-none"
		>
			{#if activeSource}
				<ShikiCodeBlock
					code=""
					htmlLight={highlightedSources[activeSource.name].light}
					htmlDark={highlightedSources[activeSource.name].dark}
					unstyled={true}
				/>
			{:else}
				{@render codeSlot?.()}
			{/if}
		</div>
	</ScrollArea>
</div>

<style>
	.tab-active-line {
		background-image: linear-gradient(
			to right,
			transparent,
			oklch(from var(--color-accent) l c h / 0.68) 18%,
			var(--color-accent) 50%,
			oklch(from var(--color-accent) l c h / 0.68) 82%,
			transparent
		);
		filter: drop-shadow(0 0 6px oklch(from var(--color-accent) l c h / 0.38));
	}
</style>
