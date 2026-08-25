<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { type ClassValue } from "clsx";
	import type { Snippet } from "svelte";
	import { onMount } from "svelte";
	import { cn } from "../../utils/cn";
	import ChevronRight from "carbon-icons-svelte/lib/ChevronRight.svelte";

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
		/** Mesh-glow colors, same idea as CardProject's `colors` prop. */
		glowColors?: string[];
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
		glowColors = ["var(--accent)", "var(--accent-secondary)", "var(--accent)"],
	}: Props = $props();

	let openId = $state<string | null>(null);
	let isOpen = $derived(openId !== null);

	function toggle(id: string) {
		openId = openId === id ? null : id;
	}

	function close() {
		openId = null;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Escape") {
			e.preventDefault();
			close();
		}
	}

	// ---------------------------------------------------------------------
	// Mesh-glow border, ported from CardProject.svelte. Desktop only
	// (pointer-tracking doesn't make sense on touch): gated by a
	// `matchMedia("(hover: hover) and (pointer: fine)")` check.
	// ---------------------------------------------------------------------
	const edgeSensitivity = 30;
	const glowRadius = 40;
	const glowIntensity = 1.0;
	const coneSpread = 25;
	const fillOpacity = 0.5;
	const borderRadius = 12; // matches rounded-lg on the root

	let rootEl: HTMLDivElement;
	let isHovered = $state(false);
	let cursorAngle = $state(45);
	let edgeProximity = $state(0);
	let ready = $state(false);
	let canHover = $state(false);

	onMount(() => {
		canHover = window.matchMedia(
			"(hover: hover) and (pointer: fine) and (min-width: 768px)",
		).matches;
		if (!canHover) return;
		const start = () => {
			ready = true;
		};
		if ("requestIdleCallback" in window) {
			requestIdleCallback(start, { timeout: 300 });
		} else {
			setTimeout(start, 50);
		}
	});

	function getCenterOfElement(el: HTMLElement): [number, number] {
		const { width, height } = el.getBoundingClientRect();
		return [width / 2, height / 2];
	}

	function getEdgeProximity(el: HTMLElement, x: number, y: number): number {
		const [cx, cy] = getCenterOfElement(el);
		const dx = x - cx;
		const dy = y - cy;
		let kx = Infinity;
		let ky = Infinity;
		if (dx !== 0) kx = cx / Math.abs(dx);
		if (dy !== 0) ky = cy / Math.abs(dy);
		return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
	}

	function getCursorAngle(el: HTMLElement, x: number, y: number): number {
		const [cx, cy] = getCenterOfElement(el);
		const dx = x - cx;
		const dy = y - cy;
		if (dx === 0 && dy === 0) return 0;
		const radians = Math.atan2(dy, dx);
		let degrees = radians * (180 / Math.PI) + 90;
		if (degrees < 0) degrees += 360;
		return degrees;
	}

	function handlePointerMove(e: PointerEvent) {
		if (!canHover || !rootEl) return;
		const rect = rootEl.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		edgeProximity = getEdgeProximity(rootEl, x, y);
		cursorAngle = getCursorAngle(rootEl, x, y);
	}

	function handlePointerEnter() {
		if (!canHover) return;
		isHovered = true;
	}

	function handlePointerLeave() {
		if (!canHover) return;
		isHovered = false;
	}

	const GRADIENT_POSITIONS = [
		"80% 55%",
		"69% 34%",
		"8% 6%",
		"41% 38%",
		"86% 85%",
		"82% 18%",
		"51% 4%",
	];
	const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

	function buildMeshGradients(colorsArr: string[]): string[] {
		const gradients: string[] = [];
		for (let i = 0; i < 7; i++) {
			const c = colorsArr[Math.min(COLOR_MAP[i], colorsArr.length - 1)];
			gradients.push(
				`radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`,
			);
		}
		return gradients;
	}

	let borderOpacity = $derived(
		isHovered
			? Math.max(
					0,
					(edgeProximity * 100 - (edgeSensitivity + 20)) / (100 - (edgeSensitivity + 20)),
				)
			: 0,
	);
	let glowOpacity = $derived(
		isHovered
			? Math.max(0, (edgeProximity * 100 - edgeSensitivity) / (100 - edgeSensitivity))
			: 0,
	);

	let meshGradients = $derived(ready ? buildMeshGradients(glowColors) : []);
	let angleDeg = $derived(`${cursorAngle.toFixed(3)}deg`);
	let borderMaskImage = $derived(
		`conic-gradient(from ${angleDeg} at center, black ${coneSpread}%, transparent ${coneSpread + 15}%, transparent ${100 - coneSpread - 15}%, black ${100 - coneSpread}%)`,
	);
	let glowMaskImage = $derived(
		`conic-gradient(from ${angleDeg} at center, black 2.5%, transparent 10%, transparent 90%, black 97.5%)`,
	);
	let transitionStyle = $derived(
		isHovered ? "opacity 0.25s ease-out" : "opacity 0.75s ease-in-out",
	);
</script>

<svelte:body style:overflow={isOpen ? "hidden" : undefined} />
<svelte:window onkeydown={isOpen ? handleKeydown : undefined} />

<!-- Backdrop overlay -->
{#if isOpen}
	<div
		data-slot="overlay"
		class={cn("fixed inset-0 z-40 bg-background-inset/90", classes?.overlay)}
		onclick={close}
		onkeydown={handleKeydown}
		role="button"
		tabindex="-1"
		aria-label="Закрыть меню"
	></div>
{/if}

<!-- Floating nav container: inset-shadow wrapper + bordered inner, same treatment as Card.svelte -->
<div
	class="fixed top-2 left-1/2 z-50 w-full max-w-[95vw] -translate-x-1/2 md:top-4 md:max-w-[70vw] lg:max-w-[64rem]"
>
	<div class="inset-shadow rounded-xl bg-background-inset p-1.5">
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			bind:this={rootEl}
			data-slot="root"
			onpointermove={handlePointerMove}
			onpointerenter={handlePointerEnter}
			onpointerleave={handlePointerLeave}
			class={cn(
				"floating-menu relative isolate w-full overflow-hidden rounded-lg border border-border bg-background text-foreground transition-[border-color,transform] duration-150",
				isOpen && "floating-menu-open",
				className,
				classes?.root,
			)}
			style="transform: translate3d(0, 0, 0.01px);"
		>
			<!-- mesh-glow border (desktop only) -->
			{#if canHover && ready}
				<div
					class="pointer-events-none absolute inset-0 -z-[1]"
					style="
						border-radius: {borderRadius}px;
						border: 1px solid transparent;
						background: {[
						'linear-gradient(var(--background) 0 100%) padding-box',
						'linear-gradient(rgb(255 255 255 / 0%) 0% 100%) border-box',
						...meshGradients.map((g) => `${g} border-box`),
					].join(', ')};
						opacity: {borderOpacity};
						mask-image: {borderMaskImage};
						-webkit-mask-image: {borderMaskImage};
						transition: {transitionStyle};
					"
				></div>
				<div
					class="pointer-events-none absolute inset-0 -z-[1] mix-blend-soft-light"
					style="
						border-radius: {borderRadius}px;
						background: {meshGradients.map((g) => `${g} padding-box`).join(', ')};
						opacity: {borderOpacity * fillOpacity};
						transition: {transitionStyle};
					"
				></div>
				<span
					class="pointer-events-none absolute z-[1] mix-blend-screen"
					style="
						inset: {-glowRadius}px;
						border-radius: {borderRadius + glowRadius}px;
						mask-image: {glowMaskImage};
						-webkit-mask-image: {glowMaskImage};
						opacity: {glowOpacity};
						transition: {transitionStyle};
					"
				>
					<span
						class="absolute"
						style="
							inset: {glowRadius}px;
							border-radius: {borderRadius}px;
							box-shadow: 0 0 40px 4px color-mix(in srgb, {glowColors[0]} {glowIntensity * 60}%, transparent);
						"
					></span>
				</span>
			{/if}

			<div
				data-slot="header"
				class={cn(
					"relative z-20 flex w-full items-center justify-between gap-4 px-3 py-1.5",
					classes?.header,
				)}
			>
				<!-- Left: logo + wordmark -->
				<a
					href="/"
					data-slot="logo"
					class="flex shrink-0 items-center gap-2"
					onclick={close}
				>
					{#if logo}
						{@render logo()}
					{/if}
				</a>

				<!-- Center: nav triggers -->
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
							onclick={() => toggle(trigger.id)}
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
				<div
					data-slot="actions"
					class={cn("flex shrink-0 items-center gap-1", classes?.actions)}
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

					<!-- Mobile toggle: opens the first trigger's panel as a fallback menu -->
					<button
						type="button"
						onclick={() => toggle(openId ? "" : (triggers[0]?.id ?? ""))}
						data-slot="toggle-button"
						data-open={isOpen}
						class={cn(
							"group inset-shadow transition-scale relative inline-flex size-9 items-center justify-center rounded-sm bg-background-inset text-foreground duration-150 ease-out active:scale-[0.95] md:hidden",
							classes?.toggleButton,
						)}
						aria-expanded={isOpen}
						aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
					>
						<span class="sr-only">{isOpen ? "Закрыть меню" : "Открыть меню"}</span>
						<ChevronRight
							size={16}
							class={cn("rotate-90 transition-transform duration-200", isOpen && "-rotate-90")}
						/>
					</button>
				</div>
			</div>

			<!-- Dropdown panel(s) -->
			<div
				data-slot="menu-wrapper"
				class={cn(
					"menu-wrapper relative z-20 w-full overflow-hidden border-t border-border bg-background-inset/40",
					classes?.menuWrapper,
				)}
			>
				{#each triggers as trigger (trigger.id)}
					<div
						data-slot="panel"
						class={cn(
							"panel-content",
							openId === trigger.id ? "block" : "hidden",
							classes?.panel,
						)}
					>
						{@render trigger.panel()}
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
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