<script lang="ts">
	import './layout.css';
	import './illustration-theme.css';
	import 'katex/dist/katex.min.css';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { CommandPalette, contentUiDefaults, siteConfig } from '$lib';
	import Latticeloader from '$lib/components/ui-registry/Latticeloader.svelte';
	import { getContentSectionByPathname, getContentSectionUiConfig } from '$lib/content/sections';
	import type { SectionUiConfig } from '$lib/config/content-ui';
	import { type Snippet } from 'svelte';

	const { children }: { children: Snippet } = $props();

	const currentPage = page;
	let isIntroVisible = $state(true);

	onMount(() => {
		const hideIntro = () => {
			requestAnimationFrame(() => {
				isIntroVisible = false;
			});
		};

		if (document.readyState === 'complete') {
			hideIntro();
			return;
		}

		window.addEventListener('load', hideIntro, { once: true });
		return () => window.removeEventListener('load', hideIntro);
	});

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
	const homeKeywords = siteConfig.keywords.join(', ');
	const sharedOgImage = new URL(siteConfig.ogImage, siteOrigin).href;
	const homeStructuredData = $derived.by(() =>
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			name: siteName,
			alternateName: siteConfig.shortName,
			url: canonicalUrl,
			description: homeDescription,
			image: sharedOgImage,
			author: {
				'@type': 'Organization',
				name: authorName,
				url: siteOrigin
			},
			potentialAction: {
				'@type': 'SearchAction',
				target: `${siteOrigin}/docs?q={search_term_string}`,
				'query-input': 'required name=search_term_string'
			}
		})
	);

	const organizationStructuredData = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'Opensophy',
		url: siteOrigin,
		logo: `${siteOrigin}/light_logo.png`,
		sameAs: [siteConfig.links.github],
		contactPoint: {
			'@type': 'ContactPoint',
			email: siteConfig.links.email,
			contactType: 'customer service'
		}
	});

	const siteNavigationStructuredData = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		itemListElement: [
			{ '@type': 'SiteNavigationElement', position: 1, name: 'Новости', url: `${siteOrigin}/news` },
			{ '@type': 'SiteNavigationElement', position: 2, name: 'База Знаний', url: `${siteOrigin}/article/general` },
			{ '@type': 'SiteNavigationElement', position: 3, name: 'os.ui', url: `${siteOrigin}/components/overview` },
			{ '@type': 'SiteNavigationElement', position: 4, name: 'Политика оказания услуг', url: `${siteOrigin}/service-policy` },
			{ '@type': 'SiteNavigationElement', position: 5, name: 'NPMOS', url: `${siteOrigin}/#products` },
				{ '@type': 'SiteNavigationElement', position: 6, name: 'Статус', url: `${siteOrigin}/status` }
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
	<meta property="og:site_name" content={siteName} />
	<meta property="og:locale" content="ru_RU" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@opensophy" />
	<link rel="manifest" href="/site.webmanifest" />
	<link rel="preload" href="/logo.png" as="image" type="image/png" fetchpriority="high" />
	<meta name="mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
	<meta name="apple-mobile-web-app-title" content={siteName} />
	<meta name="application-name" content={siteName} />
	{#if isHomeRoute}
		<title>{homeTitle}</title>
		<meta name="description" content={homeDescription} />
		<meta name="keywords" content={homeKeywords} />
		<meta name="author" content={authorName} />
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
	{/if}
</svelte:head>

{#if isIntroVisible}
	<div class="site-intro" role="status" aria-label="Загрузка Opensophy">
		<div class="site-intro__brand" aria-hidden="true">opensophy</div>
		<Latticeloader
			label="Загрузка"
			status="working"
			pattern="orbit"
			grid={4}
			color="var(--accent, #f43f5e)"
			glow
			showTimer={false}
			fontSize={13}
			cellSize={7}
			gap={2}
		/>
	</div>
{/if}

<CommandPalette {searchConfig} />
{@render children()}

<style>
	.site-intro {
		position: fixed;
		inset: 0;
		z-index: 1000;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1.25rem;
		background: var(--background, #090909);
		color: var(--foreground, #fff);
	}

	.site-intro__brand {
		font-size: clamp(1.35rem, 4vw, 2rem);
		font-weight: 650;
		letter-spacing: -0.04em;
	}

	@media (prefers-reduced-motion: reduce) {
		.site-intro :global(.ll-run) {
			animation: none !important;
		}
	}
</style>
