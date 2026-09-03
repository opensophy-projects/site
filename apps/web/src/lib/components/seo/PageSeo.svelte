<script lang="ts">
	import { page } from '$app/state';
	import { siteConfig } from '$lib/config/site';

	let {
		title,
		description,
		keywords = siteConfig.keywords,
		type = 'website'
	}: {
		title: string;
		description: string;
		keywords?: string[];
		type?: 'website' | 'article';
	} = $props();

	const siteOrigin = new URL(siteConfig.url).origin;
	const canonicalUrl = $derived(new URL(page.url.pathname, siteOrigin).href);
	const ogImage = new URL(siteConfig.ogImage, siteOrigin).href;
	const keywordsContent = $derived(keywords.join(', '));
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="keywords" content={keywordsContent} />
	<link rel="canonical" href={canonicalUrl} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content={type} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:alt" content={title} />
	<meta property="og:image:type" content="image/jpeg" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />
</svelte:head>
