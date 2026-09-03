<script lang="ts">
	import type { PageData } from './$types';
	import TemplatesPage from '../+page.svelte';

	const { data }: { data: PageData } = $props();
</script>

<TemplatesPage
	{data}
	title="Docker Compose шаблоны — opensophy"
	description="Готовые Docker Compose шаблоны Opensophy для DevSecOps, безопасности веб-приложений и автоматизации инфраструктуры."
/>
