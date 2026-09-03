<script lang="ts">
	import type { PageData } from './$types';
	import TemplatesRegistryPage from '$lib/components/templates/TemplatesRegistryPage.svelte';

	const { data }: { data: PageData } = $props();
</script>

<TemplatesRegistryPage templates={data.templates} />
