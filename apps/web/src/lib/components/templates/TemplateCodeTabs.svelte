<script lang="ts">
	import CodePanel from '$lib/components/docs/component-preview/CodePanel.svelte';
	import type { SourceTab } from '$lib/components/docs/component-preview/types';

	let { tabs }: { tabs: SourceTab[] } = $props();
</script>

<div class="my-8 overflow-hidden rounded-xl border border-border bg-background p-1.5 card">
	<CodePanel {tabs} />
</div>
