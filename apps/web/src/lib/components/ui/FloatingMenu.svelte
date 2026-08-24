<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { type ClassValue } from "clsx";
	import type { Snippet } from "svelte";
	import { cn } from "../../utils/cn";
	import Close from "carbon-icons-svelte/lib/Close.svelte";
	import ChevronDown from "carbon-icons-svelte/lib/ChevronDown.svelte";
	import ChevronRight from "carbon-icons-svelte/lib/ChevronRight.svelte";

	type IconComponent = typeof Close;

	type MenuLink = {
		label: string;
		href: string;
		description?: string;
		icon?: IconComponent;
		onclick?: (e: MouseEvent) => void;
	};

	type MenuColumn = {
		title: string;
		links: MenuLink[];
	};

	type FooterLink = {
		label: string;
		href: string;
		onclick?: (e: MouseEvent) => void;
	};

	/**
	 * A single top-level category (e.g. "Продукты", "Решения", "Услуги").
	 * - `columns`: grouped links, rendered side by side (2-3 columns).
	 * - `flatLinks`: ungrouped links, rendered as a single stacked list (used by "Услуги").
	 * - `footer`: optional link centered under the panel (e.g. "Политика оказания услуг").
	 */
	type MenuCategory = {
		label: string;
		columns?: MenuColumn[];
		flatLinks?: MenuLink[];
		footer?: FooterLink;
	};

	type FloatingMenuClasses = {
		root?: ClassValue;
		overlay?: ClassValue;
		header?: ClassValue;
		actions?: ClassValue;
		categoryButton?: ClassValue;
		panel?: ClassValue;
		column?: ClassValue;
		columnTitle?: ClassValue;
		link?: ClassValue;
		linkText?: ClassValue;
		footer?: ClassValue;
	};

	type Props = {
		categories: MenuCategory[];
		logo?: Snippet;
		actionsEnd?: Snippet;
		class?: string;
		classes?: FloatingMenuClasses;
	};

	let {
		categories,
		logo,
		actionsEnd,
		class: className,
		classes,
	}: Props = $props();

	/** Desktop: which category panel is open on hover. */
	let hoveredIndex = $state<number | null>(null);
	/** Mobile: fullscreen menu open/closed. */
	let mobileOpen = $state(false);
	/** Mobile: which category is expanded inside the fullscreen menu. */
	let mobileActiveIndex = $state<number | null>(null);

	let closeTimeout: ReturnType<typeof setTimeout> | undefined;

	function openOnHover(i: number) {
		clearTimeout(closeTimeout);
		hoveredIndex = i;
	}

	function scheduleClose() {
		clearTimeout(closeTimeout);
		closeTimeout = setTimeout(() => {
			hoveredIndex = null;
		}, 120);
	}

	function toggleMobile() {
		mobileOpen = !mobileOpen;
		if (!mobileOpen) mobileActiveIndex = null;
	}

	function toggleMobileCategory(i: number) {
		mobileActiveIndex = mobileActiveIndex === i ? null : i;
	}

	function closeAll() {
		hoveredIndex = null;
		mobileOpen = false;
		mobileActiveIndex = null;
	}
</script>

<svelte:body style:overflow={mobileOpen ? "hidden" : undefined} />

<!-- Desktop hover-close overlay dims the page while a panel is open -->
{#if hoveredIndex !== null}
	<div
		data-slot="overlay"
		class={cn(
			"fixed inset-0 z-40 hidden bg-background-inset/70 backdrop-blur-[2px] transition-opacity duration-200 md:block",
			classes?.overlay,
		)}
		aria-hidden="true"
	></div>
{/if}

<div
	data-slot="root"
	class={cn(
		"floating-menu fixed top-2 left-1/2 z-50 w-full max-w-[95vw] -translate-x-1/2 overflow-visible rounded-lg border border-border bg-background text-foreground shadow-2xl md:top-4 md:max-w-[70vw] lg:max-w-[64rem]",
		mobileOpen && "floating-menu-mobile-open",
		className,
		classes?.root,
	)}
	role="navigation"
	onmouseleave={scheduleClose}
>
	<div
		data-slot="header"
		class={cn(
			"relative z-20 flex w-full items-center justify-between gap-2 px-2 py-1",
			classes?.header,
		)}
	>
		<!-- Left: logo -->
		<div data-slot="logo" class="flex items-center">
			{#if logo}
				{@render logo()}
			{/if}
		</div>

		<!-- Center: category triggers (desktop) -->
		<nav
			data-slot="categories"
			class="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 md:flex"
		>
			{#each categories as category, i (category.label)}
				<button
					type="button"
					data-slot="category-button"
					class={cn(
						"transition-scale relative flex h-9 items-center gap-1 rounded-sm px-3 text-sm font-medium text-foreground-muted duration-150 ease-out hover:bg-background-inset hover:text-foreground active:scale-[0.97]",
						hoveredIndex === i && "bg-background-inset text-foreground",
						classes?.categoryButton,
					)}
					onmouseenter={() => openOnHover(i)}
					onfocus={() => openOnHover(i)}
					aria-expanded={hoveredIndex === i}
				>
					{category.label}
					<ChevronDown
						size={14}
						class={cn(
							"transition-transform duration-200 ease-out",
							hoveredIndex === i && "rotate-180",
						)}
					/>
				</button>
			{/each}
		</nav>

		<!-- Right: search / theme toggle / mobile toggle -->
		<div
			data-slot="actions"
			class={cn("flex items-center gap-1", classes?.actions)}
		>
			{#if actionsEnd}
				{@render actionsEnd()}
			{/if}
			<button
				type="button"
				onclick={toggleMobile}
				data-slot="mobile-toggle-button"
				data-open={mobileOpen}
				class="group inset-shadow transition-scale relative inline-flex size-9 items-center justify-center rounded-sm bg-background-inset text-foreground duration-150 ease-out active:scale-[0.95] md:hidden"
				aria-expanded={mobileOpen}
				aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
			>
				<span class="sr-only">{mobileOpen ? "Закрыть меню" : "Открыть меню"}</span>
				<span class="menu-toggle-icon menu-toggle-open">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M2 4H14M2 8H14M2 12H14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
					</svg>
				</span>
				<span class="menu-toggle-icon menu-toggle-close">
					<Close size={16} />
				</span>
			</button>
		</div>
	</div>

	<!-- Desktop hover panels -->
	{#each categories as category, i (category.label)}
		{#if hoveredIndex === i}
			<div
				data-slot="panel"
				class={cn(
					"desktop-panel absolute top-full left-1/2 z-30 hidden w-[min(90vw,48rem)] -translate-x-1/2 overflow-hidden rounded-lg border border-border bg-background shadow-2xl md:block",
					classes?.panel,
				)}
				onmouseenter={() => openOnHover(i)}
				onmouseleave={scheduleClose}
			>
				<div class="flex flex-col items-center px-6 py-6">
					{#if category.columns}
						<div
							class="grid w-full gap-x-8 gap-y-6"
							style="grid-template-columns: repeat({category.columns.length}, minmax(0, 1fr));"
						>
							{#each category.columns as column (column.title)}
								<div data-slot="column" class={cn("flex flex-col gap-4", classes?.column)}>
									<h3
										data-slot="column-title"
										class={cn(
											"text-xs font-medium tracking-wider text-foreground-muted/50 uppercase",
											classes?.columnTitle,
										)}
									>
										{column.title}
									</h3>
									<div class="flex flex-col gap-3">
										{#each column.links as link, li (link.href + link.label)}
											<a
												href={link.href}
												onclick={(e) => {
													link.onclick?.(e);
													closeAll();
												}}
												data-slot="link"
												class={cn(
													"panel-link group/link relative flex items-start gap-2 rounded-sm text-left text-foreground transition-colors duration-200",
													classes?.link,
												)}
												style="--delay: {li * 30}ms"
											>
												<span class="min-w-0 flex-1 leading-tight">
													<span
														data-slot="link-text"
														class={cn(
															"block text-sm font-medium text-foreground group-hover/link:text-accent",
															classes?.linkText,
														)}
													>
														{link.label}
													</span>
													{#if link.description}
														<span class="mt-1 block text-xs leading-snug text-foreground-muted">
															{link.description}
														</span>
													{/if}
												</span>
											</a>
										{/each}
									</div>
								</div>
							{/each}
						</div>
					{:else if category.flatLinks}
						<div class="flex w-full flex-col gap-3">
							{#each category.flatLinks as link, li (link.href + link.label)}
								<a
									href={link.href}
									onclick={(e) => {
										link.onclick?.(e);
										closeAll();
									}}
									data-slot="link"
									class={cn(
										"panel-link group/link relative flex items-start gap-2 rounded-sm p-2 text-left text-foreground transition-colors duration-200 hover:bg-background-inset",
										classes?.link,
									)}
									style="--delay: {li * 30}ms"
								>
									<span class="min-w-0 flex-1 leading-tight">
										<span
											data-slot="link-text"
											class={cn(
												"block text-sm font-medium text-foreground group-hover/link:text-accent",
												classes?.linkText,
											)}
										>
											{link.label}
										</span>
										{#if link.description}
											<span class="mt-1 block text-xs leading-snug text-foreground-muted">
												{link.description}
											</span>
										{/if}
									</span>
								</a>
							{/each}
						</div>
					{/if}

					{#if category.footer}
						<div class="mt-6 w-full border-t border-border pt-4 text-center">
							<a
								href={category.footer.href}
								onclick={(e) => {
									category.footer?.onclick?.(e);
									closeAll();
								}}
								data-slot="footer"
								class={cn(
									"inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors duration-150 hover:text-accent/80",
									classes?.footer,
								)}
							>
								{category.footer.label}
								<ChevronRight size={14} />
							</a>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	{/each}

	<!-- Mobile fullscreen menu -->
	<div
		data-slot="mobile-menu"
		class="mobile-menu fixed inset-0 z-20 flex flex-col overflow-y-auto bg-background pt-16 md:hidden"
	>
		<div class="flex flex-col gap-1 px-4 py-4">
			{#each categories as category, i (category.label)}
				<div data-slot="mobile-category" class="border-b border-border last:border-b-0">
					<button
						type="button"
						class="flex w-full items-center justify-between py-4 text-left text-base font-medium text-foreground"
						onclick={() => toggleMobileCategory(i)}
						aria-expanded={mobileActiveIndex === i}
					>
						{category.label}
						<ChevronDown
							size={18}
							class={cn(
								"transition-transform duration-200 ease-out",
								mobileActiveIndex === i && "rotate-180",
							)}
						/>
					</button>
					<div class={cn("mobile-panel", mobileActiveIndex === i && "mobile-panel-open")}>
						<div class="flex flex-col gap-5 pb-5">
							{#if category.columns}
								{#each category.columns as column (column.title)}
									<div class="flex flex-col gap-2">
										<h3 class="text-xs font-medium tracking-wider text-foreground-muted/50 uppercase">
											{column.title}
										</h3>
										{#each column.links as link (link.href + link.label)}
											<a
												href={link.href}
												onclick={(e) => {
													link.onclick?.(e);
													closeAll();
												}}
												class="rounded-sm py-2 text-sm font-medium text-foreground transition-colors hover:text-accent"
											>
												{link.label}
												{#if link.description}
													<span class="mt-0.5 block text-xs font-normal leading-snug text-foreground-muted">
														{link.description}
													</span>
												{/if}
											</a>
										{/each}
									</div>
								{/each}
							{:else if category.flatLinks}
								{#each category.flatLinks as link (link.href + link.label)}
									<a
										href={link.href}
										onclick={(e) => {
											link.onclick?.(e);
											closeAll();
										}}
										class="rounded-sm py-2 text-sm font-medium text-foreground transition-colors hover:text-accent"
									>
										{link.label}
										{#if link.description}
											<span class="mt-0.5 block text-xs font-normal leading-snug text-foreground-muted">
												{link.description}
											</span>
										{/if}
									</a>
								{/each}
							{/if}

							{#if category.footer}
								<a
									href={category.footer.href}
									onclick={(e) => {
										category.footer?.onclick?.(e);
										closeAll();
									}}
									class="inline-flex items-center gap-1 text-sm font-medium text-accent"
								>
									{category.footer.label}
									<ChevronRight size={14} />
								</a>
							{/if}
						</div>
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

	/* Desktop dropdown panel animation */
	.desktop-panel {
		margin-top: 0.5rem;
		animation: panel-in 220ms cubic-bezier(0.16, 1, 0.3, 1);
		transform-origin: top center;
	}

	/* Invisible bridge closes the mouseleave gap between the header and the
	   panel (created by margin-top above) so hovering from the trigger button
	   down into the panel doesn't register as leaving the menu. */
	.desktop-panel::before {
		content: "";
		position: absolute;
		top: -0.5rem;
		left: 0;
		right: 0;
		height: 0.5rem;
	}

	@keyframes panel-in {
		from {
			opacity: 0;
			transform: translate(-50%, -8px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translate(-50%, 0) scale(1);
		}
	}

	.panel-link {
		opacity: 0;
		transform: translateY(8px);
		animation: link-in 260ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
		animation-delay: var(--delay, 0ms);
	}

	@keyframes link-in {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Mobile fullscreen menu */
	.mobile-menu {
		opacity: 0;
		visibility: hidden;
		transform: translateY(-12px);
		transition:
			opacity 250ms cubic-bezier(0.4, 0, 0.2, 1),
			transform 300ms cubic-bezier(0.4, 0, 0.2, 1),
			visibility 0ms linear 300ms;
	}

	.floating-menu-mobile-open .mobile-menu {
		opacity: 1;
		visibility: visible;
		transform: translateY(0);
		transition:
			opacity 250ms cubic-bezier(0.4, 0, 0.2, 1),
			transform 300ms cubic-bezier(0.4, 0, 0.2, 1),
			visibility 0ms linear 0ms;
	}

	/* Mobile accordion panel */
	.mobile-panel {
		max-height: 0;
		opacity: 0;
		overflow: hidden;
		transition:
			max-height 350ms cubic-bezier(0.4, 0, 0.2, 1),
			opacity 200ms ease-out;
	}

	.mobile-panel-open {
		max-height: 60rem;
		opacity: 1;
	}
</style>