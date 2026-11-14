<script lang="ts">
	import './layout.css';
	import './illustration-theme.css';
	import { page } from '$app/state';
	import CommandPalette from '$lib/components/content/search/CommandPalette.svelte';
	import { contentUiDefaults } from '$lib/config/content-ui';
	import { siteConfig } from '$lib/config/site';
	import { flagshipProducts } from '$lib/config/products';
	import { getContentSectionByPathname, getContentSectionUiConfig } from '$lib/content/sections';
	import type { SectionUiConfig } from '$lib/config/content-ui';
	import { type Snippet } from 'svelte';

	const { children }: { children: Snippet } = $props();

	const currentPage = page;

	const isHomePath = (path?: string) => path === '/';

	const currentUrl = $derived(currentPage.url);
	const currentPath = $derived(currentUrl.pathname);
	const isHomeRoute = $derived(isHomePath(currentPath));
	const currentSection = $derived(getContentSectionByPathname(currentPath));
	const currentSectionUi = $derived(
		currentSection ? getContentSectionUiConfig(currentSection.id) : null
	);
	const searchConfig = $derived<SectionUiConfig['search']>(
		currentSectionUi?.search ?? contentUiDefaults.search
	);
	const siteOrigin = new URL(siteConfig.url).origin;
	const canonicalUrl = $derived(new URL(currentPath, siteOrigin).href);

	const siteName = siteConfig.name;
	const authorName = siteConfig.author;
	const homeTitle = `${siteConfig.name} — Мастерская DevSecOps`;
	const homeDescription = siteConfig.description;
	const homeKeywords = siteConfig.keywords.slice(0, 24).join(', ');
	const sharedOgImage = new URL(siteConfig.ogImage, siteOrigin).href;
	const homeStructuredData = $derived.by(() =>
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			name: siteName,
			alternateName: siteConfig.shortName,
			url: canonicalUrl,
			inLanguage: 'ru',
			description: homeDescription,
			image: sharedOgImage,
			author: {
				'@type': 'Organization',
				name: authorName,
				url: siteOrigin
			}
		})
	);

	const organizationStructuredData = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'Opensophy',
		url: siteOrigin,
		logo: `${siteOrigin}/logo-1024.png`,
		description: siteConfig.description,
		sameAs: [siteConfig.links.github, siteConfig.links.telegram],
		contactPoint: {
			'@type': 'ContactPoint',
			email: siteConfig.links.email,
			contactType: 'customer service'
		}
	});

	const navigationLinks = [
		['NginxionS', '/nginxions'],
		['Услуги', '/solutions'],
		['Библиотека компонентов os.ui', '/components/overview'],
		['База знаний', '/article/general'],
		['Новости', '/news'],
		['Статус', '/status']
	];

	const siteNavigationStructuredData = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		itemListElement: navigationLinks.map(([name, path], index) => ({
			'@type': 'SiteNavigationElement',
			position: index + 1,
			name,
			url: `${siteOrigin}${path}`
		}))
	});

	// Флагманские продукты: поисковики и ИИ-ассистенты получают их как сущности
	const productsStructuredData = JSON.stringify({
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'SoftwareApplication',
				name: flagshipProducts.nginxions.name,
				description: flagshipProducts.nginxions.description,
				applicationCategory: 'SecurityApplication',
				operatingSystem: 'Linux, Docker',
				url: `${siteOrigin}${flagshipProducts.nginxions.href}`,
				offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
				author: { '@type': 'Organization', name: 'Opensophy', url: siteOrigin }
			},
			{
				'@type': 'SoftwareSourceCode',
				name: flagshipProducts.ui.name,
				description: flagshipProducts.ui.description,
				programmingLanguage: 'Svelte',
				url: `${siteOrigin}${flagshipProducts.ui.href}`,
				codeRepository: siteConfig.links.repository,
				author: { '@type': 'Organization', name: 'Opensophy', url: siteOrigin }
			}
		]
	});
</script>

<svelte:head>
	<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
	<meta name="theme-color" content="#090909" media="(prefers-color-scheme: dark)" />
	<meta name="docs-package-manager-storage-key" content={contentUiDefaults.packageManager.storageKey} />
	<meta name="docs-package-manager-default" content={contentUiDefaults.packageManager.default} />
	<meta
		name="docs-package-manager-enabled"
		content={contentUiDefaults.packageManager.enabled.join(',')}
	/>
	{#if siteConfig.verification.google}
		<meta name="google-site-verification" content={siteConfig.verification.google} />
	{/if}
	{#if siteConfig.verification.yandex}
		<meta name="yandex-verification" content={siteConfig.verification.yandex} />
	{/if}
	{#if siteConfig.verification.bing}
		<meta name="msvalidate.01" content={siteConfig.verification.bing} />
	{/if}
	<meta property="og:site_name" content={siteName} />
	<meta property="og:locale" content="ru_RU" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@opensophy" />
	<link rel="manifest" href="/site.webmanifest" />
	<link rel="alternate" type="text/plain" href="/llms.txt" title="llms.txt" />
	<meta name="mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
	<meta name="apple-mobile-web-app-title" content={siteName} />
	<meta name="application-name" content={siteName} />
	{#if isHomeRoute}
		<title>{homeTitle}</title>
		<meta name="description" content={homeDescription} />
		<meta name="keywords" content={homeKeywords} />
		<meta name="author" content={authorName} />
		<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
		<link rel="canonical" href={canonicalUrl} />
		<meta property="og:title" content={homeTitle} />
		<meta property="og:description" content={homeDescription} />
		<meta property="og:type" content="website" />
		<meta property="og:url" content={canonicalUrl} />
		<meta property="og:image" content={sharedOgImage} />
		<meta property="og:image:alt" content="Opensophy — Мастерская DevSecOps" />
		<meta property="og:image:type" content="image/jpeg" />
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />
		<meta name="twitter:title" content={homeTitle} />
		<meta name="twitter:description" content={homeDescription} />
		<meta name="twitter:image" content={sharedOgImage} />
		<svelte:element this={'script'} type="application/ld+json">
			{homeStructuredData}
		</svelte:element>
		<svelte:element this={'script'} type="application/ld+json">
			{organizationStructuredData}
		</svelte:element>
		<svelte:element this={'script'} type="application/ld+json">
			{siteNavigationStructuredData}
		</svelte:element>
		<svelte:element this={'script'} type="application/ld+json">
			{productsStructuredData}
		</svelte:element>
	{/if}
</svelte:head>

<CommandPalette {searchConfig} />
{@render children()}
