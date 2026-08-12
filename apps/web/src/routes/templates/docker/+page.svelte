<script lang="ts">
	import type { PageData } from './$types';
	import TemplatesPage from '../+page.svelte';

	const { data }: { data: PageData } = $props();
</script>

<TemplatesPage {data} />
