<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { onDestroy, onMount } from 'svelte';
	import Close from 'carbon-icons-svelte/lib/Close.svelte';
	import TableOfContentsIcon from 'carbon-icons-svelte/lib/TableOfContents.svelte';
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
	let visible = $state(false);
	let progress = $state(0);
	let triggerEl = $state<HTMLButtonElement | null>(null);
	let closeButton = $state<HTMLButtonElement | null>(null);

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

	function show() {
		document.body.style.overflow = 'hidden';
		visible = true;
		// Mount first, then flip `open` so the slide-in transition runs.
		requestAnimationFrame(() => {
			open = true;
			closeButton?.focus();
		});
	}

	function close(options: { restoreFocus?: boolean } = {}) {
		if (!open && !visible) return;
		open = false;
		if (typeof document !== 'undefined') document.body.style.overflow = '';
		if (options.restoreFocus ?? true) triggerEl?.focus();
	}

	function handleTransitionEnd(event: TransitionEvent) {
		if (event.target !== event.currentTarget || event.propertyName !== 'transform') return;
		if (!open) visible = false;
	}

	function handlePanelClick(event: MouseEvent) {
		if (event.target instanceof Element && event.target.closest('a[href^="#"]')) {
			close({ restoreFocus: false });
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (open && event.key === 'Escape') {
			event.preventDefault();
			close();
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

	onDestroy(() => {
		if (typeof document !== 'undefined') document.body.style.overflow = '';
	});

	afterNavigate(() => {
		close({ restoreFocus: false });
		requestAnimationFrame(updateProgress);
	});
</script>

<svelte:document onkeydown={handleKeydown} />

<button
	bind:this={triggerEl}
	type="button"
	class={buttonClass}
	aria-expanded={open}
	aria-controls={panelId}
	aria-label={title}
	onclick={() => (open ? close() : show())}
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

{#if visible}
	<div
		class="toc-overlay fixed inset-0 z-50 bg-background-inset/80 backdrop-blur-sm lg:hidden"
		class:active={open}
		onclick={() => close()}
		role="button"
		tabindex="-1"
		onkeydown={(event) => {
			if (event.key === 'Escape') close();
		}}
		aria-label="Закрыть оглавление"
		aria-hidden={!open}
	></div>

	<!-- Clicks only close the panel after a link activates; keyboard users get the same via the link itself. -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		id={panelId}
		role="dialog"
		tabindex="-1"
		aria-modal="true"
		aria-label={title}
		class="toc-panel fixed inset-y-0 left-0 z-50 flex w-3/4 max-w-sm flex-col overflow-hidden border-r border-border bg-background-inset text-foreground-muted lg:hidden"
		class:active={open}
		style="--toc-fade-color: var(--color-background-inset);"
		onclick={handlePanelClick}
		ontransitionend={handleTransitionEnd}
	>
		<div class="flex items-center justify-between p-4">
			<div class="flex items-center gap-2 text-foreground">
				<span class="inline-flex shrink-0 items-center text-accent" aria-hidden="true">
					<TableOfContentsIcon size={18} />
				</span>
				<span class="text-sm font-medium tracking-tight">{title}</span>
			</div>
			<button bind:this={closeButton} type="button" onclick={() => close()} aria-label="Закрыть оглавление">
				<Close class="size-6" />
			</button>
		</div>

		<div class="toc-panel-body min-h-0 flex-1 px-4 pb-4">
			<TableOfContents
				{headings}
				{selector}
				{title}
				{scrollContainerId}
				minViewportWidth={0}
				maxHeight="100%"
			/>
		</div>
	</div>
{/if}

<style>
	.toc-overlay {
		opacity: 0;
		pointer-events: none;
		transition: opacity 200ms ease-out;
	}

	.toc-overlay.active {
		opacity: 1;
		pointer-events: auto;
	}

	.toc-panel {
		transform: translateX(-100%);
		transition: transform 200ms ease-out;
		will-change: transform;
	}

	.toc-panel.active {
		transform: translateX(0);
	}

	/* The panel header already names the list; hide TableOfContents' own heading row. */
	.toc-panel-body :global(nav > div:first-child) {
		display: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.toc-overlay,
		.toc-panel {
			transition: none;
		}
	}

	.toc-progress {
		background: conic-gradient(
			currentColor var(--toc-progress),
			color-mix(in oklch, currentColor 20%, transparent) 0
		);
		mask-image: radial-gradient(farthest-side, transparent calc(100% - 2px), black 0);
		-webkit-mask-image: radial-gradient(farthest-side, transparent calc(100% - 2px), black 0);
	}
</style>
