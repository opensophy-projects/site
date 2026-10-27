<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import ChevronDown from 'carbon-icons-svelte/lib/ChevronDown.svelte';
	import TableOfContents from '$lib/components/docs/TableOfContents.svelte';
	import type { ContentTocHeading } from '$lib/content/sections';
	import { cn } from '$lib/utils/cn';

	const {
		headings,
		groupTitle,
		title = 'На этой странице',
		selector,
		scrollContainerId
	}: {
		headings: ContentTocHeading[];
		groupTitle: string;
		title?: string;
		selector?: string;
		scrollContainerId?: string;
	} = $props();

	const ACTIVE_OFFSET = 140;
	const panelId = 'mobile-toc-panel';

	let open = $state(false);
	let activeId = $state('');
	let triggerEl = $state<HTMLButtonElement | null>(null);
	let panelEl = $state<HTMLDivElement | null>(null);

	const activeIndex = $derived(headings.findIndex((heading) => heading.id === activeId));
	const activeHeading = $derived(activeIndex >= 0 ? headings[activeIndex] : undefined);
	const progress = $derived(
		headings.length > 0 ? ((activeIndex + 1) / headings.length) * 100 : 0
	);
	const label = $derived(open ? groupTitle : (activeHeading?.text ?? groupTitle));

	function getScrollContainer(): HTMLElement | null {
		return scrollContainerId ? document.getElementById(scrollContainerId) : null;
	}

	function updateActive() {
		const container = getScrollContainer();
		if (!container || headings.length === 0) {
			activeId = '';
			return;
		}

		const top = container.getBoundingClientRect().top;
		let current = '';
		for (const heading of headings) {
			const element = document.getElementById(heading.id);
			if (!element) continue;
			if (element.getBoundingClientRect().top - ACTIVE_OFFSET <= top) current = heading.id;
		}

		if (container.scrollTop + container.clientHeight >= container.scrollHeight - 20) {
			current = headings[headings.length - 1].id;
		}

		activeId = current;
	}

	function close() {
		open = false;
	}

	function handlePanelClick(event: MouseEvent) {
		if (event.target instanceof Element && event.target.closest('a[href^="#"]')) close();
	}

	function handleDocumentPointer(event: PointerEvent) {
		if (!open || !(event.target instanceof Node)) return;
		if (panelEl?.contains(event.target) || triggerEl?.contains(event.target)) return;
		close();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (open && event.key === 'Escape') {
			event.preventDefault();
			close();
			triggerEl?.focus();
		}
	}

	// updateActive reads `headings`, so this re-runs when the page's headings change.
	$effect(updateActive);

	onMount(() => {
		const container = getScrollContainer();
		container?.addEventListener('scroll', updateActive, { passive: true });
		window.addEventListener('resize', updateActive);
		updateActive();

		return () => {
			container?.removeEventListener('scroll', updateActive);
			window.removeEventListener('resize', updateActive);
		};
	});

	afterNavigate(() => {
		close();
		requestAnimationFrame(updateActive);
	});
</script>

<svelte:document onpointerdown={handleDocumentPointer} onkeydown={handleKeydown} />

<div class="relative border-b border-border bg-background/90 backdrop-blur-md">
	<button
		bind:this={triggerEl}
		type="button"
		class="flex min-h-11 w-full cursor-pointer items-center gap-2.5 px-5 py-2.5 text-start text-sm text-foreground-muted outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-inset"
		aria-expanded={open}
		aria-controls={panelId}
		aria-label={`${title}: ${label}`}
		onclick={() => (open = !open)}
	>
		<!-- Ring shows how far through the page's headings the reader is. -->
		<span
			role="progressbar"
			aria-label={title}
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={Math.round(progress)}
			class="toc-progress size-[18px] shrink-0 rounded-full text-accent"
			style={`--toc-progress: ${progress.toString()}%`}
		></span>
		<span class={cn('min-w-0 flex-1 truncate', open && 'text-foreground')}>{label}</span>
		<ChevronDown
			size={16}
			class={cn(
				'shrink-0 transition-transform duration-150 motion-reduce:transition-none',
				open && 'rotate-180'
			)}
		/>
	</button>

	{#if open}
		<!-- Clicks only close the panel after a link activates; keyboard users get the same via the link itself. -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			bind:this={panelEl}
			id={panelId}
			role="dialog"
			tabindex="-1"
			aria-label={title}
			class="toc-panel absolute inset-x-0 top-full flex max-h-[60dvh] flex-col overflow-hidden border-y border-border bg-background px-6 py-3 shadow-lg"
			style="--toc-fade-color: var(--color-background);"
			onclick={handlePanelClick}
		>
			<TableOfContents
				{headings}
				{selector}
				{title}
				{scrollContainerId}
				minViewportWidth={0}
				maxHeight="calc(60dvh - 1.5rem - 1px)"
			/>
		</div>
	{/if}
</div>

<style>
	.toc-progress {
		background: conic-gradient(
			currentColor var(--toc-progress),
			color-mix(in oklch, currentColor 25%, transparent) 0
		);
		mask-image: radial-gradient(farthest-side, transparent calc(100% - 1.5px), black 0);
		-webkit-mask-image: radial-gradient(farthest-side, transparent calc(100% - 1.5px), black 0);
	}

	/* The trigger already names the panel; hide TableOfContents' own heading row. */
	.toc-panel :global(nav > div:first-child) {
		display: none;
	}
</style>
