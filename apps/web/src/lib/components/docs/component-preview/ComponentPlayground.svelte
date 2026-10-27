<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { cn } from '$lib/utils/cn';
	import { getHighlighter } from '$lib/utils/highlighter';
	import { portal } from '$lib/utils/use-portal';
	import ScrollArea from '$lib/components/ui-registry/ScrollArea.svelte';
	import ShikiCodeBlock from '../ShikiCodeBlock.svelte';
	import CopyCodeButton from '../markdown/CopyCodeButton.svelte';
	import ControlField from './ControlField.svelte';
	import Close from 'carbon-icons-svelte/lib/Close.svelte';
	import Reset from 'carbon-icons-svelte/lib/Reset.svelte';
	import Renew from 'carbon-icons-svelte/lib/Renew.svelte';
	import Terminal from 'carbon-icons-svelte/lib/Terminal.svelte';
	import {
		getDefaultControlValue,
		type ComponentPreviewChildren,
		type ComponentPreviewControl,
		type ComponentPreviewValue,
		type ComponentPreviewValues,
		type SourceTab
	} from './types';

	type Props = {
		children?: ComponentPreviewChildren;
		controls: ComponentPreviewControl[];
		values: ComponentPreviewValues;
		sources: SourceTab[];
		componentName?: string;
		previewKey: number;
		onChange: (name: string, value: ComponentPreviewValue) => void;
		onReset: () => void;
		onReload: () => void;
		onClose: () => void;
	};

	let {
		children,
		controls,
		values,
		sources,
		componentName: providedComponentName,
		previewKey,
		onChange,
		onReset,
		onReload,
		onClose
	}: Props = $props();

	const RESIZER_SIZE = 1;
	const MIN_EDITOR_WIDTH = 320;
	const MIN_PREVIEW_WIDTH = 260;
	const MIN_EDITOR_HEIGHT = 200;
	const MIN_PREVIEW_HEIGHT = 200;
	const DESKTOP_MIN_WIDTH = 768;

	let workspaceHost = $state<HTMLDivElement | null>(null);
	let closeButton = $state<HTMLButtonElement | null>(null);
	let previewWidth = $state<number | null>(null);
	let previewHeight = $state<number | null>(null);
	let resizing = $state<{
		pointerId: number;
		startX: number;
		startY: number;
		startWidth: number | null;
		startHeight: number | null;
	} | null>(null);
	let activeTab = $state(0);

	const componentFile = $derived(sources.at(0)?.name ?? 'Component.svelte');
	const componentName = $derived(
		providedComponentName ??
			(componentFile
				.replace(/\.[^.]+$/, '')
				.split(/[^a-zA-Z0-9]+/)
				.filter(Boolean)
				.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
				.join('') ||
				'Component')
	);

	function formatProp(name: string, value: ComponentPreviewValue) {
		if (typeof value === 'string') return `${name}="${value.replaceAll('"', '&quot;')}"`;
		return `${name}={${String(value)}}`;
	}

	// Usage snippet mirrors the current prop values, so it updates as the controls change.
	const usageCode = $derived.by(() => {
		const props = controls
			.filter((control) => control.type !== 'file')
			.map((control) => formatProp(control.name, values[control.name] ?? getDefaultControlValue(control)));
		const tag =
			props.length > 0
				? `<${componentName}\n${props.map((prop) => `\t${prop}`).join('\n')}\n/>`
				: `<${componentName} />`;
		// Split the closing tag so the Svelte parser doesn't end this script block early.
		const scriptClose = '</' + 'script>';
		return `<script lang="ts">\n\timport ${componentName} from '$lib/components/ui-registry/${componentFile}';\n${scriptClose}\n\n${tag}\n`;
	});

	const tabs = $derived<SourceTab[]>([
		{ name: 'Использование', code: usageCode, language: 'svelte' },
		...sources
	]);
	const activeSource = $derived(tabs.at(activeTab) ?? tabs[0]);
	const highlighted = $derived.by(() => {
		const highlighter = getHighlighter();
		const lang = activeSource.language ?? 'svelte';
		return {
			light: highlighter.codeToHtml(activeSource.code, { lang, theme: 'github-light' }),
			dark: highlighter.codeToHtml(activeSource.code, { lang, theme: 'github-dark' })
		};
	});

	const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
	const isDesktop = () => (workspaceHost?.clientWidth ?? 0) >= DESKTOP_MIN_WIDTH;
	const maxPreviewWidth = (width: number) =>
		Math.max(MIN_PREVIEW_WIDTH, width - RESIZER_SIZE - MIN_EDITOR_WIDTH);
	const maxPreviewHeight = (height: number) =>
		Math.max(MIN_PREVIEW_HEIGHT, height - RESIZER_SIZE - MIN_EDITOR_HEIGHT);

	const workspaceColumns = $derived(
		previewWidth === null
			? `minmax(0,1fr) ${RESIZER_SIZE}px minmax(0,1.4fr)`
			: `minmax(0,1fr) ${RESIZER_SIZE}px ${Math.round(previewWidth)}px`
	);
	const workspaceRows = $derived(
		previewHeight === null
			? `minmax(0,1fr) ${RESIZER_SIZE}px minmax(0,1fr)`
			: `minmax(0,1fr) ${RESIZER_SIZE}px ${Math.round(previewHeight)}px`
	);

	function clampPanelSize() {
		if (!workspaceHost) return;
		if (isDesktop()) {
			if (previewWidth !== null) {
				previewWidth = clamp(previewWidth, MIN_PREVIEW_WIDTH, maxPreviewWidth(workspaceHost.clientWidth));
			}
		} else if (previewHeight !== null) {
			previewHeight = clamp(previewHeight, MIN_PREVIEW_HEIGHT, maxPreviewHeight(workspaceHost.clientHeight));
		}
	}

	function previewSize() {
		const preview = workspaceHost?.querySelector<HTMLElement>('[data-playground-preview]');
		return {
			width: preview?.offsetWidth ?? 0,
			height: preview?.offsetHeight ?? 0
		};
	}

	function beginResize(event: PointerEvent) {
		if (event.button !== 0 || !(event.currentTarget instanceof HTMLButtonElement)) return;
		event.preventDefault();
		event.currentTarget.setPointerCapture(event.pointerId);
		const size = previewSize();
		resizing = {
			pointerId: event.pointerId,
			startX: event.clientX,
			startY: event.clientY,
			startWidth: previewWidth ?? size.width,
			startHeight: previewHeight ?? size.height
		};
	}

	function updateResize(event: PointerEvent) {
		if (!resizing || !workspaceHost || event.pointerId !== resizing.pointerId) return;
		if (isDesktop()) {
			previewWidth = clamp(
				(resizing.startWidth ?? 0) - (event.clientX - resizing.startX),
				MIN_PREVIEW_WIDTH,
				maxPreviewWidth(workspaceHost.clientWidth)
			);
		} else {
			previewHeight = clamp(
				(resizing.startHeight ?? 0) - (event.clientY - resizing.startY),
				MIN_PREVIEW_HEIGHT,
				maxPreviewHeight(workspaceHost.clientHeight)
			);
		}
	}

	function endResize(event: PointerEvent) {
		if (!resizing || event.pointerId !== resizing.pointerId) return;
		if (event.currentTarget instanceof HTMLButtonElement) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}
		resizing = null;
	}

	function resizeByKeyboard(event: KeyboardEvent) {
		if (!workspaceHost) return;
		if (event.key === 'Home') {
			event.preventDefault();
			previewWidth = null;
			previewHeight = null;
			return;
		}

		const desktop = isDesktop();
		const keys = desktop ? ['ArrowLeft', 'ArrowRight'] : ['ArrowUp', 'ArrowDown'];
		if (!keys.includes(event.key)) return;
		event.preventDefault();

		const step = event.shiftKey ? 48 : 16;
		const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
		const size = previewSize();
		if (desktop) {
			previewWidth = clamp(
				(previewWidth ?? size.width) - direction * step,
				MIN_PREVIEW_WIDTH,
				maxPreviewWidth(workspaceHost.clientWidth)
			);
		} else {
			previewHeight = clamp(
				(previewHeight ?? size.height) - direction * step,
				MIN_PREVIEW_HEIGHT,
				maxPreviewHeight(workspaceHost.clientHeight)
			);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			onClose();
		}
	}

	$effect(() => {
		if (activeTab > tabs.length - 1) activeTab = 0;
	});

	$effect(() => {
		const host = workspaceHost;
		if (!host) return;
		const observer = new ResizeObserver(clampPanelSize);
		observer.observe(host);
		return () => observer.disconnect();
	});

	onMount(() => {
		const previousOverflow = document.body.style.overflow;
		const restoreFocusEl =
			document.activeElement instanceof HTMLElement ? document.activeElement : null;
		document.body.style.overflow = 'hidden';
		void tick().then(() => closeButton?.focus());

		return () => {
			document.body.style.overflow = previousOverflow;
			restoreFocusEl?.focus();
		};
	});
</script>

<svelte:document onkeydown={handleKeydown} />

<div
	use:portal={'body'}
	class="playground-shell fixed inset-1 z-60 flex flex-col overflow-hidden rounded-xl border border-border bg-background text-foreground shadow-2xl"
	role="dialog"
	aria-modal="true"
	aria-label={`Playground: ${componentName}`}
>
	<header class="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
		<span
			class="inline-flex size-7 items-center justify-center rounded-sm bg-accent/10 text-accent"
			aria-hidden="true"
		>
			<Terminal size={16} />
		</span>
		<span class="text-sm font-medium tracking-tight">Playground</span>
		<span aria-hidden="true" class="mx-1 h-4 w-px bg-border"></span>
		<span class="min-w-0 truncate font-mono text-xs text-foreground-muted">{componentName}</span>

		<div class="ms-auto flex items-center gap-1">
			<button
				type="button"
				onclick={onReset}
				class="toolbar-button"
				aria-label="Сбросить пропсы"
				title="Сбросить пропсы"
			>
				<Reset size={16} />
			</button>
			<button
				type="button"
				onclick={onReload}
				class="toolbar-button"
				aria-label="Перезагрузить превью"
				title="Перезагрузить превью"
			>
				<Renew size={16} />
			</button>
			<span aria-hidden="true" class="mx-1 h-4 w-px bg-border"></span>
			<button
				bind:this={closeButton}
				type="button"
				onclick={onClose}
				class="toolbar-button"
				aria-label="Закрыть playground"
				title="Закрыть (Esc)"
			>
				<Close size={18} />
			</button>
		</div>
	</header>

	<div
		bind:this={workspaceHost}
		class={cn('playground-workspace relative min-h-0 flex-1', resizing && 'is-resizing')}
		style={`--playground-columns: ${workspaceColumns}; --playground-rows: ${workspaceRows};`}
	>
		<section class="flex min-h-0 min-w-0 flex-col bg-background-inset" aria-label="Код и пропсы">
			{#if controls.length}
				<div class="max-h-[45%] shrink-0 overflow-y-auto border-b border-border p-3">
					<h2 class="mb-2 px-1 text-xs font-medium tracking-wide text-foreground-muted uppercase">
						Пропсы
					</h2>
					<div class="grid gap-2 sm:grid-cols-2">
						{#each controls as control (control.name)}
							<ControlField {control} value={values[control.name]} {onChange} />
						{/each}
					</div>
				</div>
			{/if}

			<div class="flex shrink-0 items-center border-b border-border bg-background text-sm">
				<div class="flex min-w-0 flex-1 overflow-x-auto" role="tablist">
					{#each tabs as tab, index (tab.name)}
						<button
							type="button"
							role="tab"
							aria-selected={index === activeTab}
							class={cn(
								'relative px-4 py-2.5 font-medium whitespace-nowrap transition-colors duration-150 ease-out',
								index === activeTab
									? 'text-accent after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-accent'
									: 'text-foreground-muted hover:text-foreground'
							)}
							onclick={() => (activeTab = index)}
						>
							{tab.name}
						</button>
					{/each}
				</div>
				<div class="mr-2 flex-none">
					<CopyCodeButton class="size-6" code={activeSource.code} />
				</div>
			</div>

			<ScrollArea
				mode="both"
				id="playground-code"
				class="min-h-0 flex-1"
				viewportClass="min-h-full"
			>
				<div
					class="p-4 text-sm *:mt-0 *:rounded-none *:border-0 *:bg-transparent *:p-0 *:inset-shadow-none"
				>
					<ShikiCodeBlock
						code=""
						htmlLight={highlighted.light}
						htmlDark={highlighted.dark}
						unstyled={true}
					/>
				</div>
			</ScrollArea>
		</section>

		<button
			type="button"
			aria-label="Изменить размер панелей"
			title="Потяните, чтобы изменить размер. Двойной клик — сброс."
			class={cn('panel-resizer', resizing && 'is-active')}
			ondblclick={() => {
				previewWidth = null;
				previewHeight = null;
			}}
			onpointerdown={beginResize}
			onpointermove={updateResize}
			onpointerup={endResize}
			onpointercancel={endResize}
			onkeydown={resizeByKeyboard}
		></button>

		<section
			data-playground-preview
			class="relative flex min-h-0 min-w-0 flex-col overflow-hidden bg-background"
			aria-label="Превью"
		>
			<ScrollArea
				mode="both"
				id="playground-preview-live"
				class="min-h-0 w-full flex-1"
				viewportClass="min-h-full w-full flex flex-col"
			>
				<div class="flex w-full flex-1 flex-col items-center justify-center p-4">
					{#key previewKey}
						{@render children?.(values)}
					{/key}
				</div>
			</ScrollArea>
		</section>
	</div>
</div>

<style>
	.toolbar-button {
		display: inline-flex;
		width: 2rem;
		height: 2rem;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-sm, 0.25rem);
		color: var(--color-foreground-muted);
		cursor: pointer;
		transition:
			color 150ms ease-out,
			scale 150ms ease-out;
	}

	.toolbar-button:hover {
		color: var(--color-foreground);
	}

	.toolbar-button:active {
		scale: 0.95;
	}

	.playground-shell {
		container-type: inline-size;
	}

	.playground-workspace {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: var(--playground-rows);
	}

	.panel-resizer {
		position: relative;
		z-index: 10;
		width: 100%;
		height: 100%;
		padding: 0;
		border: 0;
		background: var(--color-border);
		cursor: row-resize;
		touch-action: none;
		outline: none;
	}

	/* Wider invisible hit area around the 1px divider. */
	.panel-resizer::after {
		position: absolute;
		inset: -8px 0;
		content: '';
	}

	.panel-resizer::before {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 32px;
		height: 5px;
		border-radius: 999px;
		background: var(--color-foreground-muted);
		box-shadow: 0 0 0 3px var(--color-background);
		transform: translate(-50%, -50%);
		content: '';
	}

	.panel-resizer:hover,
	.panel-resizer.is-active,
	.panel-resizer:focus-visible {
		background: var(--color-accent);
	}

	.panel-resizer:hover::before,
	.panel-resizer.is-active::before,
	.panel-resizer:focus-visible::before {
		background: var(--color-accent);
	}

	.is-resizing {
		user-select: none;
	}

	.is-resizing :global(iframe),
	.is-resizing :global(canvas) {
		pointer-events: none;
	}

	@container (min-width: 768px) {
		.playground-workspace {
			grid-template-columns: var(--playground-columns);
			grid-template-rows: minmax(0, 1fr);
		}

		.panel-resizer {
			cursor: col-resize;
		}

		.panel-resizer::after {
			inset: 0 -8px;
		}

		.panel-resizer::before {
			width: 5px;
			height: 32px;
		}
	}
</style>
