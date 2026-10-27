<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import TableOfContents from '$lib/components/docs/TableOfContents.svelte';
	import type { ContentTocHeading } from '$lib/content/sections';
	import { cn } from '$lib/utils/cn';

	const {
		headings,
		title = 'На этой странице',
		selector,
		scrollContainerId,
		buttonClass = ''
	}: {
		headings: ContentTocHeading[];
		title?: string;
		selector?: string;
		scrollContainerId?: string;
		buttonClass?: string;
	} = $props();

	const panelId = 'mobile-toc-panel';

	let open = $state(false);
	let progress = $state(0);
	let triggerEl = $state<HTMLButtonElement | null>(null);
	let panelEl = $state<HTMLDivElement | null>(null);

	function getScrollContainer(): HTMLElement | null {
		return scrollContainerId ? document.getElementById(scrollContainerId) : null;
	}

	// Ring fills with how far the reader has scrolled through the page.
	function updateProgress() {
		const container = getScrollContainer();
		if (!container) {
			progress = 0;
			return;
		}

		const scrollable = container.scrollHeight - container.clientHeight;
		progress =
			scrollable > 0 ? Math.min(100, Math.max(0, (container.scrollTop / scrollable) * 100)) : 0;
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

	onMount(() => {
		const container = getScrollContainer();
		container?.addEventListener('scroll', updateProgress, { passive: true });
		window.addEventListener('resize', updateProgress);
		updateProgress();

		return () => {
			container?.removeEventListener('scroll', updateProgress);
			window.removeEventListener('resize', updateProgress);
		};
	});

	afterNavigate(() => {
		close();
		requestAnimationFrame(updateProgress);
	});
</script>

<svelte:document onpointerdown={handleDocumentPointer} onkeydown={handleKeydown} />

<button
	bind:this={triggerEl}
	type="button"
	class={buttonClass}
	aria-expanded={open}
	aria-controls={panelId}
	aria-label={title}
	onclick={() => (open = !open)}
>
	<span
		role="progressbar"
		aria-label="Прогресс чтения"
		aria-valuemin={0}
		aria-valuemax={100}
		aria-valuenow={Math.round(progress)}
		class={cn('toc-progress size-[18px] rounded-full', open ? 'text-accent' : 'text-foreground')}
		style={`--toc-progress: ${progress.toString()}%`}
	></span>
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
		class="absolute inset-x-0 top-full flex max-h-[60dvh] flex-col overflow-hidden border-b border-border bg-background px-6 py-3 shadow-lg"
		style="--toc-fade-color: var(--color-background);"
		onclick={handlePanelClick}
	>
		<TableOfContents
			{headings}
			{selector}
			{title}
			{scrollContainerId}
			minViewportWidth={0}
			maxHeight="calc(60dvh - 3.5rem)"
		/>
	</div>
{/if}

<style>
	.toc-progress {
		background: conic-gradient(
			currentColor var(--toc-progress),
			color-mix(in oklch, currentColor 20%, transparent) 0
		);
		mask-image: radial-gradient(farthest-side, transparent calc(100% - 2px), black 0);
		-webkit-mask-image: radial-gradient(farthest-side, transparent calc(100% - 2px), black 0);
	}
</style>
