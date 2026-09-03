<script lang="ts">
	import type { PageData } from './$types';
	import TemplatesRegistryPage from '$lib/components/templates/TemplatesRegistryPage.svelte';

	const { data }: { data: PageData } = $props();
</script>

<TemplatesRegistryPage
	templates={data.templates}
	title="Docker Compose шаблоны — opensophy"
	description="Готовые Docker Compose шаблоны Opensophy для DevSecOps, безопасности веб-приложений и автоматизации инфраструктуры."
/>
