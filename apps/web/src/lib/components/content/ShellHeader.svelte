<script lang="ts">
	import RightPanelClose from 'carbon-icons-svelte/lib/RightPanelClose.svelte';
	import RightPanelOpen from 'carbon-icons-svelte/lib/RightPanelOpen.svelte';
	import ShellThemeToggle from '$lib/components/content/ShellThemeToggle.svelte';

	const {
		showThemeToggle = true,
		showAsideToggle = false,
		asideVisible = true,
		onToggleAside
	}: {
		showThemeToggle?: boolean;
		showAsideToggle?: boolean;
		asideVisible?: boolean;
		onToggleAside?: () => void;
	} = $props();

	// Notch geometry: the slanted edge and the rounded step where it meets the card border.
	const NOTCH_HEIGHT = 40;
	const SLANT_WIDTH = 24;
	const CORNER = 12;
	const edgeY = NOTCH_HEIGHT - 0.5;
</script>

{#if showThemeToggle || showAsideToggle}
	<!-- Cut-out in the card's top-right corner, painted with the page background. -->
	<div
		class="notch absolute -top-px -right-px z-20 hidden lg:flex"
		style={`height: ${NOTCH_HEIGHT}px`}
	>
		<svg
			class="block shrink-0"
			width={SLANT_WIDTH}
			height={NOTCH_HEIGHT}
			viewBox={`0 0 ${SLANT_WIDTH} ${NOTCH_HEIGHT}`}
			aria-hidden="true"
		>
			<path
				class="notch-fill"
				d={`M0 0 H${SLANT_WIDTH} V${edgeY} C${SLANT_WIDTH / 2} ${edgeY} ${SLANT_WIDTH / 2} 0.5 0 0.5 Z`}
			/>
			<path
				class="notch-stroke"
				d={`M0 0.5 C${SLANT_WIDTH / 2} 0.5 ${SLANT_WIDTH / 2} ${edgeY} ${SLANT_WIDTH} ${edgeY}`}
			/>
		</svg>

		<div class="relative flex items-center gap-1 bg-background pr-2 pl-1">
			<span class="absolute bottom-0 left-0 h-px bg-border" style={`right: ${CORNER}px`}></span>

			{#if showThemeToggle}
				<ShellThemeToggle />
			{/if}

			{#if showThemeToggle && showAsideToggle}
				<span aria-hidden="true" class="mx-1 h-4 w-px bg-border"></span>
			{/if}

			{#if showAsideToggle}
				<button
					type="button"
					onclick={onToggleAside}
					class="relative inline-flex size-8 cursor-pointer items-center justify-center rounded-sm text-foreground-muted transition-[color,scale] duration-150 ease-out hover:text-foreground active:scale-[0.95]"
					aria-label={asideVisible ? 'Скрыть правую панель' : 'Показать правую панель'}
					aria-pressed={!asideVisible}
					title={asideVisible ? 'Скрыть правую панель' : 'Показать правую панель'}
				>
					{#if asideVisible}
						<RightPanelClose size={16} />
					{:else}
						<RightPanelOpen size={16} />
					{/if}
				</button>
			{/if}

			<svg
				class="absolute right-0 block"
				style={`top: ${NOTCH_HEIGHT - 1}px`}
				width={CORNER}
				height={CORNER}
				viewBox={`0 0 ${CORNER} ${CORNER}`}
				aria-hidden="true"
			>
				<path
					class="notch-fill"
					d={`M0 0 H${CORNER} V${CORNER} H${CORNER - 0.5} A${CORNER - 0.5} ${CORNER - 0.5} 0 0 0 0 0.5 Z`}
				/>
				<path
					class="notch-stroke"
					d={`M0 0.5 A${CORNER - 0.5} ${CORNER - 0.5} 0 0 1 ${CORNER - 0.5} ${CORNER}`}
				/>
			</svg>
		</div>
	</div>
{/if}

<style>
	.notch-fill {
		fill: var(--color-background);
	}

	.notch-stroke {
		fill: none;
		stroke: var(--color-border);
		stroke-width: 1;
	}
</style>
