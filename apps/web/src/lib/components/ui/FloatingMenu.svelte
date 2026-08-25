<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { type ClassValue } from "clsx";
	import type { Snippet } from "svelte";
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
		class?: string;
		classes?: FloatingMenuClasses;
	};

	let {
		triggers,
		logo,
		actionsStart,
		actionsEnd,
		primaryButton,
		secondaryButton,
		class: className,
		classes,
	}: Props = $props();

	// Desktop: which trigger is open via hover (or click, for keyboard/touch fallback).
	let openId = $state<string | null>(null);
	let isDesktopOpen = $derived(openId !== null);

	// Mobile: the hamburger sheet, independent of the desktop hover state.
	let isMobileOpen = $state(false);
	// Mobile: which trigger's panel is expanded in the accordion (independent of desktop).
	let mobileOpenId = $state<string | null>(null);

	function openDesktop(id: string) {
		openId = id;
	}

	function closeDesktop() {
		openId = null;
	}

	function toggleDesktopClick(id: string) {
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
{#if isDesktopOpen && !isMobileOpen}
	<div
		data-slot="overlay"
		class={cn("fixed inset-0 z-40 hidden bg-background-inset/80 md:block", classes?.overlay)}
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
		"fixed top-2 left-1/2 z-50 w-full max-w-[95vw] -translate-x-1/2 md:top-4 md:max-w-[70vw] lg:max-w-[64rem]",
		isMobileOpen && "mobile-open",
	)}
>
	<div
		data-slot="root"
		class={cn(
			"floating-menu relative flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-lg border border-border bg-background text-foreground",
			className,
			classes?.root,
		)}
		onmouseleave={() => {
			if (!isMobileOpen) closeDesktop();
		}}
	>
		<div
			data-slot="header"
			class={cn(
				"relative z-20 flex w-full shrink-0 items-center justify-between gap-4 border-b border-transparent bg-background px-3 py-1.5",
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
			<nav
				data-slot="triggers"
				class="hidden flex-1 items-center justify-center gap-1 md:flex"
			>
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

			<!-- Right: actions, search, theme toggle -->
			<div data-slot="actions" class={cn("flex shrink-0 items-center gap-1", classes?.actions)}>
				{#if secondaryButton}
					<a
						href={secondaryButton.href}
						data-slot="secondary-button"
						class={cn(
							"inset-shadow transition-scale hidden h-9 items-center justify-center rounded-sm bg-background-inset px-3 text-xs font-medium text-foreground duration-150 ease-out active:scale-[0.95] md:flex",
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

				<!-- Hamburger toggle: mobile only -->
				<button
					type="button"
					onclick={toggleMobile}
					data-slot="toggle-button"
					data-open={isMobileOpen}
					class={cn(
						"group inset-shadow transition-scale relative inline-flex size-9 items-center justify-center rounded-sm bg-background-inset text-foreground duration-150 ease-out active:scale-[0.95] md:hidden",
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
			</div>
		</div>

		<!-- Dropdown panel(s) -->
		<div
			data-slot="menu-wrapper"
			class={cn(
				"menu-wrapper relative z-10 w-full min-h-0 border-t border-border bg-background-inset/40",
				classes?.menuWrapper,
			)}
		>
			{#each triggers as trigger (trigger.id)}
				<div data-slot="accordion-item" class="accordion-item">
					<!-- Mobile-only accordion header -->
					<button
						type="button"
						onclick={() => toggleMobileAccordion(trigger.id)}
						data-slot="mobile-trigger"
						data-open={mobileOpenId === trigger.id}
						class="mobile-trigger flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground md:hidden"
						aria-expanded={mobileOpenId === trigger.id}
					>
						{trigger.label}
						<ChevronRight
							size={16}
							class={cn(
								"text-foreground-muted/70 transition-transform duration-200",
								mobileOpenId === trigger.id && "rotate-90",
							)}
						/>
					</button>

					<div
						data-slot="panel"
						class={cn(
							"panel-content",
							openId === trigger.id && "panel-content-desktop-open",
							mobileOpenId === trigger.id && "panel-content-mobile-open",
							classes?.panel,
						)}
					>
						{@render trigger.panel()}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	/* Panels are hidden by default; each context (desktop/mobile) opts in explicitly. */
	.panel-content {
		display: none;
	}

	/* ---- Desktop dropdown behaviour ---- */
	@media (min-width: 768px) {
		.menu-wrapper {
			max-height: 0;
			opacity: 0;
			overflow: hidden;
			transition:
				max-height 350ms cubic-bezier(0.4, 0, 0.2, 1),
				opacity 180ms ease-out;
		}

		[data-slot="root"]:has(.panel-content-desktop-open) .menu-wrapper {
			max-height: 70vh;
			opacity: 1;
			overflow-y: auto;
		}

		.panel-content-desktop-open {
			display: block;
		}

		.mobile-trigger {
			display: none;
		}
	}

	/* ---- Mobile: accordion list inside a full-screen sheet ---- */
	@media (max-width: 767px) {
		[data-slot="root-positioner"] {
			transition:
				top 350ms cubic-bezier(0.4, 0, 0.2, 1),
				max-width 350ms cubic-bezier(0.4, 0, 0.2, 1);
		}

		[data-slot="root-positioner"].mobile-open {
			top: 0 !important;
			left: 0 !important;
			transform: none !important;
			max-width: 100% !important;
			width: 100%;
			height: 100dvh;
		}

		[data-slot="root-positioner"].mobile-open [data-slot="root"] {
			height: 100dvh;
			max-height: 100dvh;
			border-radius: 0;
			border-left: none;
			border-right: none;
			border-top: none;
		}

		[data-slot="root-positioner"]:not(.mobile-open) .menu-wrapper {
			display: none;
		}

		[data-slot="root-positioner"].mobile-open .menu-wrapper {
			flex: 1 1 auto;
			overflow-y: auto;
			-webkit-overflow-scrolling: touch;
			overscroll-behavior: contain;
		}

		.accordion-item {
			border-bottom: 1px solid var(--border);
		}
		.accordion-item:last-child {
			border-bottom: none;
		}

		.panel-content-mobile-open {
			display: block;
			animation: accordion-open 200ms ease-out;
		}

		@keyframes accordion-open {
			from {
				opacity: 0;
				transform: translateY(-4px);
			}
			to {
				opacity: 1;
				transform: translateY(0);
			}
		}
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