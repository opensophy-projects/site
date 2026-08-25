<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { type ClassValue } from "clsx";
	import type { Snippet } from "svelte";
	import { onMount } from "svelte";
	import { cn } from "../../utils/cn";
	import ChevronRight from "carbon-icons-svelte/lib/ChevronRight.svelte";
	import Close from "carbon-icons-svelte/lib/Close.svelte";

	type MenuButton = {
		label: string;
		href: string;
	};

	/**
	 * A single top-level nav item that opens a dropdown panel.
	 * `panel` is a snippet so each item can render its own layout
	 * (multi-column product grid, flat link row, etc).
	 */
	type MenuTrigger = {
		id: string;
		label: string;
		panel: Snippet;
	};

	type FloatingMenuClasses = {
		root?: ClassValue;
		overlay?: ClassValue;
		header?: ClassValue;
		toggleButton?: ClassValue;
		actions?: ClassValue;
		primaryButton?: ClassValue;
		secondaryButton?: ClassValue;
		menuWrapper?: ClassValue;
		trigger?: ClassValue;
		panel?: ClassValue;
	};

	type Props = {
		triggers: MenuTrigger[];
		logo?: Snippet;
		actionsStart?: Snippet;
		actionsEnd?: Snippet;
		primaryButton?: MenuButton;
		secondaryButton?: MenuButton;
		/** Rendered as a sticky footer inside the mobile full-screen sheet only. */
		mobileFooter?: Snippet;
		class?: string;
		classes?: FloatingMenuClasses;
		/** px width below which the mobile layout kicks in. Matches Tailwind's default `md` breakpoint. */
		mobileBreakpoint?: number;
	};

	let {
		triggers,
		logo,
		actionsStart,
		actionsEnd,
		primaryButton,
		secondaryButton,
		mobileFooter,
		class: className,
		classes,
		mobileBreakpoint = 768,
	}: Props = $props();

	// Driven entirely in JS so it never depends on the host app's Tailwind
	// breakpoint config — avoids drift between a `md:` utility class and
	// a hand-written `@media` query.
	let isMobile = $state(false);

	onMount(() => {
		const mq = window.matchMedia(`(max-width: ${mobileBreakpoint - 1}px)`);
		isMobile = mq.matches;
		const onChange = (e: MediaQueryListEvent) => {
			isMobile = e.matches;
			// Collapse any open state when crossing the breakpoint so we never
			// end up with e.g. a desktop dropdown open while in mobile layout.
			openId = null;
			isMobileOpen = false;
			mobileOpenId = null;
		};
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	});

	// Desktop: which trigger is open via hover (or click, for keyboard fallback).
	let openId = $state<string | null>(null);
	let isDesktopOpen = $derived(!isMobile && openId !== null);

	// Mobile: the hamburger sheet, independent of the desktop hover state.
	let isMobileOpen = $state(false);
	// Mobile: which trigger's panel is expanded in the accordion.
	let mobileOpenId = $state<string | null>(null);

	function openDesktop(id: string) {
		if (isMobile) return;
		openId = id;
	}

	function closeDesktop() {
		openId = null;
	}

	function toggleDesktopClick(id: string) {
		if (isMobile) return;
		openId = openId === id ? null : id;
	}

	function toggleMobile() {
		isMobileOpen = !isMobileOpen;
		if (!isMobileOpen) mobileOpenId = null;
	}

	function closeMobile() {
		isMobileOpen = false;
		mobileOpenId = null;
	}

	function toggleMobileAccordion(id: string) {
		mobileOpenId = mobileOpenId === id ? null : id;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key !== "Escape") return;
		e.preventDefault();
		if (isMobileOpen) closeMobile();
		else closeDesktop();
	}

	let anyOpen = $derived(isDesktopOpen || isMobileOpen);
</script>

<svelte:body style:overflow={isMobileOpen ? "hidden" : undefined} />
<svelte:window onkeydown={anyOpen ? handleKeydown : undefined} />

<!-- Backdrop overlay: desktop dropdown only (click-away to close). Mobile sheet is full-screen, no overlay needed. -->
{#if isDesktopOpen}
	<div
		data-slot="overlay"
		class={cn("fixed inset-0 z-40 bg-background-inset/80", classes?.overlay)}
		onclick={closeDesktop}
		onkeydown={handleKeydown}
		role="button"
		tabindex="-1"
		aria-label="Закрыть меню"
	></div>
{/if}

<!-- Floating nav container -->
<div
	data-slot="root-positioner"
	class={cn(
		"fixed z-50",
		isMobileOpen
			? "inset-0"
			: "top-2 left-1/2 w-full max-w-[95vw] -translate-x-1/2 md:top-4 md:max-w-[70vw] lg:max-w-[64rem]",
	)}
>
	<div
		data-slot="root"
		class={cn(
			"floating-menu relative flex w-full flex-col overflow-hidden border-border bg-background text-foreground",
			isMobileOpen ? "h-full max-h-full border-0" : "max-h-[calc(100dvh-2rem)] rounded-lg border",
			className,
			classes?.root,
		)}
		onmouseleave={() => {
			if (!isMobile) closeDesktop();
		}}
	>
		<div
			data-slot="header"
			class={cn(
				"relative z-20 flex w-full shrink-0 items-center justify-between gap-4 bg-background px-3 py-1.5",
				classes?.header,
			)}
		>
			<!-- Left: logo + wordmark -->
			<a href="/" data-slot="logo" class="flex shrink-0 items-center gap-2" onclick={closeMobile}>
				{#if logo}
					{@render logo()}
				{/if}
			</a>

			<!-- Center: nav triggers (desktop only, opens on hover) -->
			{#if !isMobile}
				<nav data-slot="triggers" class="flex flex-1 items-center justify-center gap-1">
					{#if actionsStart}
						<div class="mr-1 flex items-center">
							{@render actionsStart()}
						</div>
					{/if}
					{#each triggers as trigger (trigger.id)}
						<button
							type="button"
							onmouseenter={() => openDesktop(trigger.id)}
							onclick={() => toggleDesktopClick(trigger.id)}
							data-slot="trigger"
							data-open={openId === trigger.id}
							class={cn(
								"group flex items-center gap-1.5 rounded-sm px-3 py-2 text-sm font-medium text-foreground-muted transition-colors duration-150 hover:bg-background-inset hover:text-foreground",
								openId === trigger.id && "bg-background-inset text-foreground",
								classes?.trigger,
							)}
							aria-expanded={openId === trigger.id}
						>
							{trigger.label}
							<ChevronRight
								size={14}
								class={cn(
									"chevron-icon rotate-90 text-foreground-muted/70 transition-transform duration-200",
									openId === trigger.id && "-rotate-90 text-foreground",
								)}
							/>
						</button>
					{/each}
				</nav>
			{:else}
				<div class="flex-1"></div>
			{/if}

			<!-- Right: actions, search, theme toggle -->
			<div data-slot="actions" class={cn("flex shrink-0 items-center gap-1", classes?.actions)}>
				{#if !isMobile && secondaryButton}
					<a
						href={secondaryButton.href}
						data-slot="secondary-button"
						class={cn(
							"inset-shadow transition-scale flex h-9 items-center justify-center rounded-sm bg-background-inset px-3 text-xs font-medium text-foreground duration-150 ease-out active:scale-[0.95]",
							classes?.secondaryButton,
						)}
					>
						{secondaryButton.label}
					</a>
				{/if}
				{#if primaryButton}
					<a
						href={primaryButton.href}
						data-slot="primary-button"
						class={cn(
							"inset-shadow transition-scale flex h-9 items-center justify-center rounded-sm bg-background-inset px-3 text-xs font-medium text-foreground duration-150 ease-out active:scale-[0.95]",
							classes?.primaryButton,
						)}
					>
						{primaryButton.label}
					</a>
				{/if}

				{#if actionsEnd}
					{@render actionsEnd()}
				{/if}

				<!-- Hamburger toggle: mobile only, rendered only when isMobile is true -->
				{#if isMobile}
					<button
						type="button"
						onclick={toggleMobile}
						data-slot="toggle-button"
						data-open={isMobileOpen}
						class={cn(
							"group inset-shadow transition-scale relative inline-flex size-9 items-center justify-center rounded-sm bg-background-inset text-foreground duration-150 ease-out active:scale-[0.95]",
							classes?.toggleButton,
						)}
						aria-expanded={isMobileOpen}
						aria-label={isMobileOpen ? "Закрыть меню" : "Открыть меню"}
					>
						<span class="sr-only">{isMobileOpen ? "Закрыть меню" : "Открыть меню"}</span>
						<span class="menu-toggle-icon menu-toggle-open">
							<ChevronRight size={16} class="rotate-90" />
						</span>
						<span class="menu-toggle-icon menu-toggle-close">
							<Close size={16} />
						</span>
					</button>
				{/if}
			</div>
		</div>

		<!-- Dropdown panel(s) -->
		{#if isMobile}
			{#if isMobileOpen}
				<div
					data-slot="menu-wrapper"
					class={cn(
						"menu-wrapper relative z-10 min-h-0 flex-1 overflow-y-auto border-t border-border bg-background-inset/40",
						classes?.menuWrapper,
					)}
				>
					{#each triggers as trigger (trigger.id)}
						<div data-slot="accordion-item" class="accordion-item">
							<button
								type="button"
								onclick={() => toggleMobileAccordion(trigger.id)}
								data-slot="mobile-trigger"
								data-open={mobileOpenId === trigger.id}
								class="flex w-full items-center justify-between px-4 py-5 text-left text-base font-medium text-foreground"
								aria-expanded={mobileOpenId === trigger.id}
							>
								{trigger.label}
								<ChevronRight
									size={18}
									class={cn(
										"text-foreground-muted/70 transition-transform duration-200",
										mobileOpenId === trigger.id && "rotate-90",
									)}
								/>
							</button>

							{#if mobileOpenId === trigger.id}
								<div data-slot="panel" class={cn("panel-content-mobile", classes?.panel)}>
									{@render trigger.panel()}
								</div>
							{/if}
						</div>
					{/each}
				</div>

				<!-- Sticky footer with action buttons, mobile sheet only -->
				{#if mobileFooter}
					<div
						data-slot="mobile-footer"
						class="relative z-10 flex shrink-0 flex-col gap-2 border-t border-border bg-background p-4"
						style="padding-bottom: calc(1rem + env(safe-area-inset-bottom));"
					>
						{@render mobileFooter()}
					</div>
				{/if}
			{/if}
		{:else if openId !== null}
			<div
				data-slot="menu-wrapper"
				class={cn(
					"menu-wrapper relative z-10 w-full max-h-[70vh] overflow-y-auto border-t border-border bg-background-inset/40",
					classes?.menuWrapper,
				)}
			>
				{#each triggers as trigger (trigger.id)}
					{#if openId === trigger.id}
						<div data-slot="panel" class={cn("panel-content-desktop", classes?.panel)}>
							{@render trigger.panel()}
						</div>
					{/if}
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.menu-wrapper {
		animation: menu-wrapper-in 200ms ease-out;
	}

	.panel-content-desktop,
	.panel-content-mobile {
		animation: panel-fade-in 150ms ease-out;
	}

	@keyframes menu-wrapper-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes panel-fade-in {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.accordion-item {
		border-bottom: 1px solid var(--border);
	}
	.accordion-item:last-child {
		border-bottom: none;
	}

	/* Hamburger <-> close icon cross-fade */
	.menu-toggle-icon {
		position: absolute;
		opacity: 0;
		filter: blur(4px);
		scale: 0.25;
		transition:
			opacity 150ms ease-out,
			filter 150ms ease-out,
			scale 150ms ease-out;
		will-change: opacity, filter, scale;
	}
	.menu-toggle-open {
		opacity: 1;
		filter: blur(0);
		scale: 1;
	}
	[data-open="true"] .menu-toggle-open {
		opacity: 0;
		filter: blur(4px);
		scale: 0.25;
	}
	[data-open="true"] .menu-toggle-close {
		opacity: 1;
		filter: blur(0);
		scale: 1;
	}
</style>