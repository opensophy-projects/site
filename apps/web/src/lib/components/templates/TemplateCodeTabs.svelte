<script lang="ts">
	import Pre from '$lib/components/docs/markdown/Pre.svelte';

	type Tab = {
		name: string;
		language?: string;
		code: string;
	};

	let { tabs }: { tabs: Tab[] } = $props();
	let activeIndex = $state(0);
	const activeTab = $derived(tabs[activeIndex] ?? tabs[0]);
</script>

<div class="my-8 overflow-hidden rounded-xl border border-border bg-background card">
	<div class="flex border-b border-border bg-background-inset/70">
		{#each tabs as tab, index (tab.name)}
			<button
				type="button"
				class={`px-4 py-3 text-sm font-medium transition ${index === activeIndex ? 'text-accent' : 'text-foreground-muted hover:text-foreground'}`}
				onclick={() => (activeIndex = index)}
			>
				{tab.name}
			</button>
		{/each}
	</div>

	{#if activeTab}
		<div class="p-1">
			<Pre code={activeTab.code}>
				<pre class="shiki github-light"><code>{activeTab.code}</code></pre>
			</Pre>
		</div>
	{/if}
</div>
