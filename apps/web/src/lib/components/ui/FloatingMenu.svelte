<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { type ClassValue } from "clsx";
	import type { Snippet } from "svelte";
	import { cn } from "../../utils/cn";
	import AreaRangeSolid from "carbon-icons-svelte/lib/AreaRangeSolid.svelte";
	import Close from "carbon-icons-svelte/lib/Close.svelte";
	import ChevronRight from "carbon-icons-svelte/lib/ChevronRight.svelte";

	type IconComponent = typeof Close;

	type MenuVariant = "default" | "muted";

	type MenuLink = {
		label: string;
		href: string;
		description?: string;
		icon?: IconComponent;
		onclick?: (e: MouseEvent) => void;
	}

	type MenuButton = {
		label: string;
		href: string;
	}

	type MenuGroup = {
		title: string;
		variant?: MenuVariant;
		links: MenuLink[];
	}

	type FloatingMenuClasses = {
		root?: ClassValue;
		overlay?: ClassValue;
		header?: ClassValue;
		toggleButton?: ClassValue;
		actions?: ClassValue;
		primaryButton?: ClassValue;
		secondaryButton?: ClassValue;
		menuWrapper?: ClassValue;
		grid?: ClassValue;
		group?: ClassValue;
		groupMuted?: ClassValue;
		groupTitle?: ClassValue;
		link?: ClassValue;
		linkText?: ClassValue;
		linkUnderline?: ClassValue;
		divider?: ClassValue;
	}

	type Props = {
		menuGroups: MenuGroup[];
		centerContent?: Snippet;
		actionsStart?: Snippet;
		actionsEnd?: Snippet;
		primaryButton?: MenuButton;
		secondaryButton?: MenuButton;
		class?: string;
		classes?: FloatingMenuClasses;
	}

	let {
		menuGroups,
		centerContent,
		actionsStart,
		actionsEnd,
		primaryButton,
		secondaryButton,
		class: className,
		classes,
	}: Props = $props();

	let isOpen = $state(false);

	function toggle() {
		isOpen = !isOpen;
	}
</script>

<svelte:body style:overflow={isOpen ? "hidden" : undefined} />

<!-- Backdrop overlay -->
{#if isOpen}
	<div
		data-slot="overlay"
		class={cn(
			"fixed inset-0 z-40 bg-background-inset/90",
			classes?.overlay,
		)}
		onclick={toggle}
		onkeydown={(e) => {
			if (e.key === "Escape") {
				e.preventDefault();
				toggle();
			}
		}}
		role="button"
		tabindex="-1"
		aria-label="Close menu"
	></div>
{/if}

<!-- Floating nav container -->
<div
	data-slot="root"
	class={cn(
		"floating-menu fixed top-2 left-1/2 z-50 w-full max-w-[95vw] -translate-x-1/2 overflow-hidden rounded-lg border border-border bg-background text-foreground shadow-2xl md:top-4 md:max-w-[70vw] lg:max-w-[64rem]",
		isOpen && "floating-menu-open",
		className,
		classes?.root,
	)}
>
	<div
		data-slot="header"
		class={cn(
			"relative z-20 flex w-full items-center justify-between px-1 py-1",
			classes?.header,
		)}
	>
		<!-- Left: custom actions (theme toggle on the site navigation) -->
		<div data-slot="actions-start" class="flex items-center gap-1">
			{#if actionsStart}
				{@render actionsStart()}
			{/if}
		</div>

		<!-- Center: custom content -->
		<div
			class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform-gpu"
			style="backface-visibility: hidden;"
		>
			{#if centerContent}
				<div data-slot="center-content">
					{@render centerContent()}
				</div>
			{/if}
		</div>

		<!-- Right: actions, search and menu toggle -->
		<div
			data-slot="actions"
			class={cn("flex items-center gap-1", classes?.actions)}
		>
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
			<button
				type="button"
				onclick={toggle}
				data-slot="toggle-button"
				data-open={isOpen}
				class={cn(
					"group inset-shadow transition-scale relative inline-flex size-9 items-center justify-center rounded-sm bg-background-inset text-foreground duration-150 ease-out active:scale-[0.95]",
					classes?.toggleButton,
				)}
				aria-expanded={isOpen}
				aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
			>
				<span class="sr-only">{isOpen ? "Закрыть меню" : "Открыть меню"}</span>
				<span class="menu-toggle-icon menu-toggle-open">
					<AreaRangeSolid size={16} />
				</span>
				<span class="menu-toggle-icon menu-toggle-close">
					<Close size={16} />
				</span>
			</button>
		</div>
	</div>

	<!-- Dropdown menu -->
	<div
		data-slot="menu-wrapper"
		class={cn(
			"menu-wrapper w-full overflow-hidden border-t border-border bg-background-inset/40",
			classes?.menuWrapper,
		)}
	>
		<div
			data-slot="grid"
			class={cn(
				"grid max-h-[70vh] grid-cols-1 overflow-y-auto overscroll-contain md:max-h-none md:grid-cols-4 md:overflow-visible",
				classes?.grid,
			)}
		>
			{#each menuGroups as group (group.title)}
				<div
					data-slot="group"
					class={cn(
						"menu-column flex flex-col gap-5 p-5 transition-colors md:min-h-[24rem] md:border-l md:border-border/70 first:md:border-l-0",
						group.variant === "muted" ? "bg-background-muted" : "bg-transparent",
						classes?.group,
						group.variant === "muted" && classes?.groupMuted,
					)}
				>
					<h3
						data-slot="group-title"
						class={cn(
							"text-xs font-medium tracking-wider text-foreground-muted/50 uppercase",
							classes?.groupTitle,
						)}
					>
						{group.title}
					</h3>
					<div class="mt-1 flex flex-col gap-3">
						{#each group.links as link, i (link.href + link.label)}
							{@const Icon = link.icon}
							<a
								href={link.href}
								onclick={link.onclick}
								data-slot="link"
								class={cn(
									"menu-link group/link relative flex items-center gap-3 rounded-xl p-2.5 pr-3 text-left text-foreground transition-colors duration-200",
									classes?.link,
								)}
								style="--delay: {i * 40}ms"
							>
								<span class="menu-link-icon group inset-shadow transition-scale relative inline-flex size-9 shrink-0 items-center justify-center rounded-sm bg-background-inset text-foreground duration-150 ease-out group-hover/link:text-accent group-active/link:scale-[0.95]">
									{#if Icon}
										<Icon size={20} />
									{/if}
								</span>
								<span class="min-w-0 flex-1 leading-tight">
									<span
										data-slot="link-text"
										class={cn("block text-sm font-medium text-foreground", classes?.linkText)}
									>
										{link.label}
									</span>
									{#if link.description}
										<span class="mt-1 block text-sm leading-snug text-foreground-muted">
											{link.description}
										</span>
									{/if}
								</span>
								<ChevronRight class="shrink-0 text-foreground-muted/60 transition-colors duration-200 group-hover/link:text-accent" size={16} />
							</a>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
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

	/* Menu wrapper */
	.menu-wrapper {
		max-height: 0;
		opacity: 0;
		transition:
			max-height 400ms cubic-bezier(0.4, 0, 0.2, 1),
			opacity 200ms ease-out;
	}

	.floating-menu-open .menu-wrapper {
		max-height: 70vh;
		opacity: 1;
	}

	/* Menu links stagger */
	.menu-link {
		opacity: 0;
		transform: translateY(16px);
		transition:
			opacity 200ms ease-out,
			transform 300ms cubic-bezier(0.4, 0, 0.2, 1),
			color 300ms ease-out;
		transition-delay: var(--delay, 0ms);
	}

	.floating-menu-open .menu-link {
		opacity: 1;
		transform: translateY(0);
	}

	/* Mobile adjustments */
	@media (max-width: 767px) {
		.floating-menu {
			transition:
				max-width 400ms cubic-bezier(0.4, 0, 0.2, 1),
				top 400ms cubic-bezier(0.4, 0, 0.2, 1),
				padding-top 400ms cubic-bezier(0.4, 0, 0.2, 1),
				border-radius 400ms cubic-bezier(0.4, 0, 0.2, 1);
		}

		.floating-menu-open {
			top: 0 !important;
			max-width: 100% !important;
			padding-top: 0.5rem;
			border-top-left-radius: 0;
			border-top-right-radius: 0;
		}
	}
</style>