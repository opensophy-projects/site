<script lang="ts">
	import type { PageData } from './$types';
	import Card from '$lib/components/docs/markdown/Card.svelte';
	import { Close } from 'carbon-icons-svelte';

	const { data }: { data: PageData } = $props();
	let query = $state('');
	let selectedSlug = $state<string | null>(null);

	const templates = $derived(data.templates);
	const filteredTemplates = $derived.by(() => {
		const normalizedQuery = query.trim().toLowerCase();
		if (!normalizedQuery) return templates;

		return templates.filter((template) => {
			const haystack = `${template.title} ${template.description}`.toLowerCase();
			return haystack.includes(normalizedQuery);
		});
	});
	const selectedTemplate = $derived(
		templates.find((template) => template.slug === selectedSlug) ?? null
	);
	const SelectedComponent = $derived(selectedTemplate?.component ?? null);

	function openTemplate(slug: string) {
		selectedSlug = slug;
	}

	function closeTemplate() {
		selectedSlug = null;
	}
</script>

<svelte:head>
	<title>Docker templates</title>
	<meta
		name="description"
		content="Реестр Docker-шаблонов: карточки автоматически создаются из SVX-файлов в apps/templates."
	/>
</svelte:head>

<section class="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
	<div class="space-y-4">
		<p class="text-sm font-semibold tracking-[0.35em] text-accent uppercase">registry</p>
		<h1 class="text-4xl font-medium tracking-tight text-foreground sm:text-5xl">Docker templates</h1>
		<p class="max-w-3xl text-base text-foreground-muted">
			Каждый <code>.svx</code> файл из <code>apps/templates</code> автоматически становится
			карточкой в этом реестре. Нажмите на карточку, чтобы открыть контент шаблона в
			модальном окне.
		</p>
	</div>

	<label class="block max-w-2xl">
		<span class="sr-only">Поиск шаблонов</span>
		<input
			bind:value={query}
			type="search"
			placeholder="Поиск шаблонов..."
			class="w-full rounded-2xl border border-border bg-background px-5 py-4 text-base text-foreground outline-none transition placeholder:text-foreground-muted/60 focus:border-accent focus:ring-2 focus:ring-accent/20"
		/>
	</label>

	<hr class="h-px border-0 bg-border shadow-2xs shadow-white dark:bg-black dark:shadow-border" />

	{#if filteredTemplates.length > 0}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each filteredTemplates as template (template.slug)}
				<button
					type="button"
					class="h-full text-left"
					onclick={() => openTemplate(template.slug)}
					aria-label={`Открыть шаблон ${template.title}`}
				>
					<Card eyebrow="docker template" title={template.title} class="h-full">
						{template.description || 'Docker compose шаблон'}
					</Card>
				</button>
			{/each}
		</div>
	{:else}
		<div class="rounded-2xl border border-dashed border-border p-8 text-center text-foreground-muted">
			Шаблоны по запросу «{query}» не найдены.
		</div>
	{/if}
</section>

{#if selectedTemplate && SelectedComponent}
	<div
		class="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/55 px-4 py-8 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		aria-labelledby="template-modal-title"
		onclick={closeTemplate}
		onkeydown={(event) => event.key === 'Escape' && closeTemplate()}
		tabindex="-1"
	>
		<div
			class="relative w-full max-w-5xl rounded-2xl border border-border bg-background p-6 shadow-2xl sm:p-8"
			onclick={(event) => event.stopPropagation()}
			onkeydown={(event) => event.stopPropagation()}
			role="presentation"
		>
			<div class="mb-6 flex items-start justify-between gap-4">
				<div>
					<p class="text-xs font-semibold tracking-[0.3em] text-accent uppercase">docker template</p>
					<h2 id="template-modal-title" class="mt-2 text-2xl font-medium text-foreground">
						{selectedTemplate.title}
					</h2>
				</div>
				<button
					type="button"
					class="rounded-full border border-border p-2 text-foreground-muted transition hover:border-accent hover:text-foreground"
					onclick={closeTemplate}
					aria-label="Закрыть шаблон"
				>
					<Close size={20} />
				</button>
			</div>

			<div class="max-h-[75vh] overflow-y-auto pr-1">
				<SelectedComponent />
			</div>
		</div>
	</div>
{/if}
