<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils/cn';
	import Overlay from '$lib/components/ui/Overlay.svelte';
	import CopyCodeButton from './CopyCodeButton.svelte';
	import OverflowMenuVertical from 'carbon-icons-svelte/lib/OverflowMenuVertical.svelte';
	import Search from 'carbon-icons-svelte/lib/Search.svelte';
	import Close from 'carbon-icons-svelte/lib/Close.svelte';
	import ChevronDown from 'carbon-icons-svelte/lib/ChevronDown.svelte';
	import ChevronUp from 'carbon-icons-svelte/lib/ChevronUp.svelte';
	import Filter from 'carbon-icons-svelte/lib/Filter.svelte';
	import View from 'carbon-icons-svelte/lib/View.svelte';
	import ViewOff from 'carbon-icons-svelte/lib/ViewOff.svelte';
	import ArrowsVertical from 'carbon-icons-svelte/lib/ArrowsVertical.svelte';
	import Copy from 'carbon-icons-svelte/lib/Copy.svelte';
	import Checkmark from 'carbon-icons-svelte/lib/Checkmark.svelte';
	import { onMount } from 'svelte';
	import { SvelteSet, SvelteMap } from 'svelte/reactivity';
	import { copyToClipboard } from '$lib/utils/copy';

	let {
		children,
		class: className = '',
		...restProps
	}: { class?: string; children?: Snippet; [prop: string]: unknown } = $props();

	let tableElement = $state<HTMLTableElement | null>(null);
	let scrollViewport = $state<HTMLDivElement | null>(null);
	let menuOpen = $state(false);
	let query = $state('');
	let fullscreen = $state(false);
	let sortState = $state<{ index: number; dir: 'asc' | 'desc' | 'none' } | null>(null);
	let visibleColumns = new SvelteSet<number>();
	let filters = new SvelteMap<number, SvelteSet<string>>();
	let filterPanelOpen = $state(false);
	let columnPanelOpen = $state(false);
	let originalRowsOrder = $state<HTMLTableRowElement[]>([]);
	let copiedFormat = $state<'md' | 'tsv' | null>(null);

	async function copyWithFeedback(format: 'md' | 'tsv') {
		const content = format === 'md' ? md() : tsv();
		if (!content) return;
		try {
			await copyToClipboard(content);
			copiedFormat = format;
		} catch {
			console.error('Failed to copy table');
		}
	}

	$effect(() => {
		if (!copiedFormat) return;
		const t = setTimeout(() => {
			copiedFormat = null;
		}, 2000);
		return () => {
			clearTimeout(t);
		};
	});

	// Drag scroll state
	let isDragging = $state(false);
	let hasDragged = $state(false);
	let dragStartPos = $state({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
	const DRAG_THRESHOLD = 5;

	let headers = $derived(() => {
		if (!tableElement) return [];
		return Array.from(tableElement.querySelectorAll('thead th')).map((th) => {
			const clone = th.cloneNode(true) as HTMLElement;
			clone.querySelector('.sort-indicator')?.remove();
			return clone.textContent.trim();
		});
	});

	let allRows = $state<HTMLTableRowElement[]>([]);

	type FilteredRow = { row: HTMLTableRowElement; cells: HTMLTableCellElement[] };

	let filteredRows = $derived.by<FilteredRow[]>(() => {
		const rows = allRows.map((row) => {
			const cells = Array.from(row.querySelectorAll('td'));
			return { row, cells };
		});

		const normalizedQuery = query.trim().toLowerCase();
		if (!normalizedQuery && filters.size === 0) return rows;

		return rows.filter(({ row, cells }) => {
			// Text search filter
			if (normalizedQuery && !row.textContent.toLowerCase().includes(normalizedQuery)) {
				return false;
			}

			// Per-column filters
			for (const [colIndex, activeValues] of filters) {
				const cellText = cells[colIndex]?.textContent.trim() ?? '';
				if (activeValues.size > 0 && !activeValues.has(cellText)) {
					return false;
				}
			}

			return true;
		});
	});

	function getUniqueValuesForColumn(colIndex: number): string[] {
		const values = new SvelteSet<string>();
		allRows.forEach((row) => {
			const cell = row.querySelectorAll('td')[colIndex];
			const text = cell.textContent.trim();
			if (text) values.add(text);
		});
		return Array.from(values).sort((a, b) => a.localeCompare(b));
	}

	function toggleFilter(colIndex: number, value: string) {
		const set = filters.get(colIndex) ?? new SvelteSet<string>();
		if (set.has(value)) {
			set.delete(value);
		} else {
			set.add(value);
		}
		if (set.size === 0) {
			filters.delete(colIndex);
		} else {
			filters.set(colIndex, set);
		}
	}

	function toggleColumn(colIndex: number) {
		if (visibleColumns.has(colIndex)) {
			visibleColumns.delete(colIndex);
		} else {
			visibleColumns.add(colIndex);
		}
		applyColumnVisibility();
	}

	function applyColumnVisibility() {
		if (!tableElement) return;
		const headerCells = tableElement.querySelectorAll('thead th');
		headerCells.forEach((th, i) => {
			(th as HTMLElement).style.display = visibleColumns.has(i) ? '' : 'none';
		});
		allRows.forEach((row) => {
			const cells = row.querySelectorAll('td');
			cells.forEach((td, i) => {
				(td as HTMLElement).style.display = visibleColumns.has(i) ? '' : 'none';
			});
		});
	}

	function tableText() {
		if (!tableElement) return { headers: [] as string[], rows: [] as string[][] };
		return {
			headers: Array.from(tableElement.querySelectorAll('thead th')).map((th) => {
				const clone = th.cloneNode(true) as HTMLElement;
				clone.querySelector('.sort-indicator')?.remove();
				return clone.textContent.trim();
			}),
			rows: Array.from(tableElement.querySelectorAll('tbody tr')).map((tr) =>
				Array.from(tr.querySelectorAll('td')).map((td) => td.textContent.trim())
			)
		};
	}

	function md() {
		const { headers, rows } = tableText();
		if (!headers.length) return '';
		const e = (s: string) => s.replaceAll('|', '\\|');
		return [
			`| ${headers.filter((_, i) => visibleColumns.has(i)).map(e).join(' | ')} |`,
			`| ${headers.filter((_, i) => visibleColumns.has(i)).map(() => '---').join(' | ')} |`,
			...rows
				.filter((_, rowIdx) => filteredRows.some((fr) => fr.row === allRows[rowIdx]))
				.map((r) => `| ${r.filter((_, i) => visibleColumns.has(i)).map(e).join(' | ')} |`)
		].join('\n');
	}

	function tsv() {
		const { headers, rows } = tableText();
		return [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
	}

	function sortBy(index: number) {
		if (!tableElement) return;
		const tbody = tableElement.querySelector('tbody');
		if (!tbody) return;

		const currentDir = sortState?.index === index ? sortState.dir : 'none';
		const nextDir: 'asc' | 'desc' | 'none' =
			currentDir === 'none' ? 'asc' : currentDir === 'asc' ? 'desc' : 'none';

		if (nextDir === 'none') {
			sortState = null;
			// Reset to original order in both DOM and state
			originalRowsOrder.forEach((row) => {
				tbody.append(row);
			});
			allRows = [...originalRowsOrder];
		} else {
			sortState = { index, dir: nextDir };
			const sortedRows = [...allRows].sort((a, b) => {
				const aText = a.children[index].textContent.trim();
				const bText = b.children[index].textContent.trim();
				return aText.localeCompare(bText) * (nextDir === 'asc' ? 1 : -1);
			});
			sortedRows.forEach((row) => {
				tbody.append(row);
			});
			allRows = sortedRows;
		}
	}

	// Drag scroll handlers
	function handleMouseDown(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (target.closest('th') || target.closest('input') || target.closest('button')) return;
		if (!scrollViewport) return;

		isDragging = true;
		hasDragged = false;
		dragStartPos = {
			x: e.clientX,
			y: e.clientY,
			scrollLeft: scrollViewport.scrollLeft,
			scrollTop: scrollViewport.scrollTop
		};
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isDragging || !scrollViewport) return;

		const dx = e.clientX - dragStartPos.x;
		const dy = e.clientY - dragStartPos.y;

		if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
			hasDragged = true;
		}

		if (hasDragged) {
			scrollViewport.scrollLeft = dragStartPos.scrollLeft - dx;
			scrollViewport.scrollTop = dragStartPos.scrollTop - dy;
		}
	}

	function handleMouseUp() {
		isDragging = false;
	}

	function handleClick(e: MouseEvent) {
		if (hasDragged) {
			e.preventDefault();
			e.stopPropagation();
			hasDragged = false;
		}
	}

	onMount(() => {
		if (!tableElement) return;

		// Collect all rows and store original order
		allRows = Array.from(tableElement.querySelectorAll('tbody tr'));
		originalRowsOrder = [...allRows];

		// Initialize all columns as visible
		const headerCount = tableElement.querySelectorAll('thead th').length;
		Array.from({ length: headerCount }, (_, i) => i).forEach((i) => visibleColumns.add(i));

		// Add click handlers to headers
		tableElement.querySelectorAll('thead th').forEach((th, index) => {
			(th as HTMLElement).onclick = () => {
				sortBy(index);
			};
		});
	});

	// Same glyph as the carbon-icons-svelte ArrowsVertical icon used in the
	// fullscreen table header, so the compact header indicator and the
	// fullscreen sort icon look identical instead of using a different
	// hand-drawn triangle.
	const ARROWS_VERTICAL_PATH =
		'M24 22.6l-5-5-1.4 1.42 6.7 6.7 6.7-6.7-1.4-1.42-5 5V2h-2v20.6zM8 9.4l5 5 1.4-1.42-6.7-6.7-6.7 6.7 1.4 1.42 5-5V30h2V9.4z';
	const ARROWS_VERTICAL_SVG = (extraClass: string) =>
		`<svg width="12" height="12" viewBox="0 0 32 32" fill="currentColor" class="${extraClass}"><path d="${ARROWS_VERTICAL_PATH}"/></svg>`;

	$effect(() => {
		if (!tableElement) return;

		// Update sort indicators in headers
		tableElement.querySelectorAll('thead th').forEach((th, index) => {
			// Remove existing indicator
			const existing = th.querySelector('.sort-indicator');
			if (existing) existing.remove();

			// Add new indicator
			const indicator = document.createElement('span');
			indicator.className = 'sort-indicator ml-1 inline-flex items-center';

			if (sortState?.index === index) {
				indicator.classList.remove('opacity-30');
				if (sortState.dir === 'asc') {
					indicator.innerHTML = `<span class="flex items-center text-accent">${ARROWS_VERTICAL_SVG('')}<span class="text-[10px] font-bold ml-0.5">A</span><span class="text-[10px] opacity-40 ml-0.5">Z</span></span>`;
				} else {
					indicator.innerHTML = `<span class="flex items-center text-accent">${ARROWS_VERTICAL_SVG('')}<span class="text-[10px] opacity-40 ml-0.5">A</span><span class="text-[10px] font-bold ml-0.5">Z</span></span>`;
				}
			} else {
				indicator.classList.add('opacity-30');
				indicator.innerHTML = `${ARROWS_VERTICAL_SVG('')}<span class="text-[10px] ml-0.5">AZ</span>`;
			}

			th.appendChild(indicator);
		});
	});

	$effect(() => {
		if (!tableElement) return;
		applyColumnVisibility();
	});
</script>

<div class="inset-shadow my-8 rounded-lg bg-background-inset p-1.5">
	<div class="relative rounded-md bg-background card">
		<!-- Search bar - always visible -->
		<div class="flex items-center gap-2 border-b border-border p-2">
			<div class="relative flex-1">
				<Search class="absolute top-1/2 left-2 -translate-y-1/2 text-foreground-muted" size={14} />
				<input
					bind:value={query}
					class="h-8 w-full rounded-sm bg-background-inset pr-3 pl-8 text-sm text-foreground outline-none"
					placeholder="Поиск по таблице..."
				/>
			</div>
			<button
				type="button"
				class="inset-shadow flex size-7 items-center justify-center rounded-sm bg-background-inset text-foreground hover:bg-background-muted"
				onclick={() => {
					menuOpen = !menuOpen;
				}}
				aria-label="Меню таблицы"
			>
				<OverflowMenuVertical size={16} />
			</button>
		</div>

		<!-- Menu dropdown -->
		{#if menuOpen}
			<div
				class="absolute top-11 right-2 z-20 grid min-w-48 gap-1 rounded-md border border-border bg-background p-1 text-sm card"
			>
				<CopyCodeButton code={md()} class="hidden" />
				<button
					class="flex items-center gap-2 rounded-sm px-3 py-2 text-left hover:bg-background-muted transition-colors"
					onclick={() => {
						void copyWithFeedback('md');
					}}
				>
					<span class="relative flex size-3.5 items-center justify-center">
						<span
							class="absolute transition-[opacity,transform] duration-150 ease-out {copiedFormat ===
							'md'
								? 'scale-0 opacity-0'
								: 'scale-100 opacity-100'}"
						>
							<Copy size={14} />
						</span>
						<span
							class="absolute text-success transition-[opacity,transform] duration-150 ease-out {copiedFormat ===
							'md'
								? 'scale-100 opacity-100'
								: 'scale-0 opacity-0'}"
						>
							<Checkmark size={14} />
						</span>
					</span>
					<span
						class="transition-[color] duration-150 {copiedFormat === 'md' ? 'text-success' : ''}"
					>
						{copiedFormat === 'md' ? 'Скопировано!' : 'Копировать как Markdown'}
					</span>
				</button>
				<button
					class="flex items-center gap-2 rounded-sm px-3 py-2 text-left hover:bg-background-muted transition-colors"
					onclick={() => {
						void copyWithFeedback('tsv');
					}}
				>
					<span class="relative flex size-3.5 items-center justify-center">
						<span
							class="absolute transition-[opacity,transform] duration-150 ease-out {copiedFormat ===
							'tsv'
								? 'scale-0 opacity-0'
								: 'scale-100 opacity-100'}"
						>
							<Copy size={14} />
						</span>
						<span
							class="absolute text-success transition-[opacity,transform] duration-150 ease-out {copiedFormat ===
							'tsv'
								? 'scale-100 opacity-100'
								: 'scale-0 opacity-0'}"
						>
							<Checkmark size={14} />
						</span>
					</span>
					<span
						class="transition-[color] duration-150 {copiedFormat === 'tsv' ? 'text-success' : ''}"
					>
						{copiedFormat === 'tsv' ? 'Скопировано!' : 'Копировать как Excel/TSV'}
					</span>
				</button>
				<button
					class="flex items-center gap-2 rounded-sm px-3 py-2 text-left hover:bg-background-muted"
					onclick={() => {
						filterPanelOpen = !filterPanelOpen;
						columnPanelOpen = false;
						fullscreen = true;
						menuOpen = false;
					}}
				>
					<Filter size={14} />
					Фильтры и колонки
				</button>
			</div>
		{/if}

		<!-- Table container with drag scroll -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			bind:this={scrollViewport}
			class="w-full overflow-auto rounded-md"
			style="cursor: {isDragging && hasDragged ? 'grabbing' : 'grab'};"
			onmousedown={handleMouseDown}
			onmousemove={handleMouseMove}
			onmouseup={handleMouseUp}
			onmouseleave={handleMouseUp}
			onclick={handleClick}
		>
			<table
				bind:this={tableElement}
				{...restProps}
				class={cn('w-full min-w-max text-lg [&_code]:text-base', className)}
			>
				{@render children?.()}
			</table>
		</div>
	</div>
</div>

<!-- Fullscreen overlay with filters -->
{#if fullscreen}
	<Overlay
		onClose={() => {
			fullscreen = false;
		}}
		backdropCursor="default"
	>
		<div
			class="flex h-[90vh] w-[90vw] flex-col rounded-lg bg-background shadow-2xl card overflow-hidden"
		>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-border p-4">
				<div class="flex items-center gap-2">
					<Search class="text-foreground-muted" size={18} />
					<input
						bind:value={query}
						class="h-9 w-64 rounded-sm bg-background-inset px-3 text-sm text-foreground outline-none"
						placeholder="Поиск по таблице..."
					/>
				</div>
				<button
					type="button"
					class="flex size-8 items-center justify-center rounded-full hover:bg-background-muted"
					onclick={() => {
						fullscreen = false;
					}}
					aria-label="Закрыть"
				>
					<Close size={18} />
				</button>
			</div>

			<!-- Filter and Column panels - collapsible, scrollable -->
			<div class="flex-shrink-0 max-h-[40vh] overflow-y-auto">
				<!-- Filters Panel -->
				<div class="border-b border-border">
					<button
						class="flex w-full items-center justify-between p-3 text-left hover:bg-background-muted"
						onclick={() => {
							filterPanelOpen = !filterPanelOpen;
						}}
					>
						<span class="flex items-center gap-2 text-sm font-medium">
							<Filter size={14} />
							Фильтры по колонкам
							{#if filters.size > 0}
								<span class="rounded-full bg-accent/20 px-2 py-0.5 text-xs">{filters.size}</span>
							{/if}
						</span>
						{#if filterPanelOpen}
							<ChevronUp size={16} />
						{:else}
							<ChevronDown size={16} />
						{/if}
					</button>

					{#if filterPanelOpen}
						<div class="grid gap-2 p-3 pt-0">
							{#each headers() as header, colIndex (colIndex)}
								{@const uniqueValues = getUniqueValuesForColumn(colIndex)}
								{@const activeFilters = filters.get(colIndex) ?? new SvelteSet<string>()}
								{#if uniqueValues.length > 0}
									<div class="rounded-md border border-border overflow-hidden">
										<button
											class="flex w-full items-center justify-between p-2 text-left bg-background-inset hover:bg-background-muted"
											onclick={() => {
												if (activeFilters.size > 0) {
													filters.delete(colIndex);
												} else {
													filters.set(colIndex, new SvelteSet(uniqueValues));
												}
											}}
										>
											<span class="text-sm font-medium">{header}</span>
											{#if activeFilters.size > 0}
												<span class="text-xs text-foreground-muted"
													>{activeFilters.size} выбрано</span
												>
											{/if}
										</button>
										<div class="flex flex-wrap gap-1 p-2 bg-background">
											{#each uniqueValues as value (value)}
												<button
													class="rounded px-2 py-1 text-xs transition-colors {activeFilters.has(
														value
													)
														? 'bg-accent/20 text-accent font-medium'
														: 'bg-background-inset text-foreground hover:bg-background-muted'}"
													onclick={() => {
														toggleFilter(colIndex, value);
													}}
													title={value}
												>
													{value}
												</button>
											{/each}
										</div>
									</div>
								{/if}
							{/each}
						</div>
					{/if}
				</div>

				<!-- Columns Panel -->
				<div class="border-b border-border">
					<button
						class="flex w-full items-center justify-between p-3 text-left hover:bg-background-muted"
						onclick={() => {
							columnPanelOpen = !columnPanelOpen;
						}}
					>
						<span class="flex items-center gap-2 text-sm font-medium">
							{#if columnPanelOpen}
								<View size={14} />
							{:else}
								<ViewOff size={14} />
							{/if}
							Видимость колонок
						</span>
						{#if columnPanelOpen}
							<ChevronUp size={16} />
						{:else}
							<ChevronDown size={16} />
						{/if}
					</button>

					{#if columnPanelOpen}
						<div class="flex flex-wrap gap-2 p-3 pt-0">
							{#each headers() as header, colIndex (colIndex)}
								<button
									class="rounded px-3 py-1.5 text-sm transition-colors {visibleColumns.has(
										colIndex
									)
										? 'bg-accent/20 text-accent font-medium'
										: 'bg-background-inset text-foreground-muted hover:bg-background-muted'}"
									onclick={() => {
										toggleColumn(colIndex);
									}}
								>
									{header}
								</button>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<!-- Fullscreen table -->
			<div class="flex-1 overflow-auto p-4 min-h-0">
				<table class={cn('w-full text-lg [&_code]:text-base', className)}>
					<thead>
						<tr>
							{#each headers() as header, colIndex (colIndex)}
								{#if visibleColumns.has(colIndex)}
									<th class="border-b border-border px-4 py-3 text-left font-medium">
										<button
											class="flex items-center gap-1 hover:text-accent"
											onclick={() => {
												sortBy(colIndex);
											}}
										>
											{header}
											<!-- Sort icon -->
											<span class="ml-1 flex items-center">
												{#if sortState?.index === colIndex}
													{#if sortState.dir === 'asc'}
														<span class="flex items-center text-accent">
															<ArrowsVertical size={12} />
															<span class="text-[10px] font-bold ml-0.5">A</span>
															<span class="text-[10px] opacity-40 ml-0.5">Z</span>
														</span>
													{:else}
														<span class="flex items-center text-accent">
															<ArrowsVertical size={12} />
															<span class="text-[10px] opacity-40 ml-0.5">A</span>
															<span class="text-[10px] font-bold ml-0.5">Z</span>
														</span>
													{/if}
												{:else}
													<span class="flex items-center opacity-30">
														<ArrowsVertical size={12} />
														<span class="text-[10px] ml-0.5">AZ</span>
													</span>
												{/if}
											</span>
										</button>
									</th>
								{/if}
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each filteredRows as { row, cells } (row)}
							<tr class="border-b border-border hover:bg-background-muted/50">
								{#each cells as cell, colIndex (colIndex)}
									{#if visibleColumns.has(colIndex)}
										<td class="px-4 py-2">
											<!-- eslint-disable-next-line svelte/no-at-html-tags -- cell content comes from the already-rendered (and sanitized upstream) source table's own DOM, not from unsanitized user input -->
											{@html cell.innerHTML}
										</td>
									{/if}
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>

				{#if filteredRows.length === 0}
					<div class="py-8 text-center text-foreground-muted">Нет результатов</div>
				{/if}
			</div>
		</div>
	</Overlay>
{/if}

<style>
	:global(thead th) {
		cursor: pointer;
		user-select: none;
	}
</style>
