<script lang="ts">
	import {
		ContentNavigation,
		DocShareActions,
		MobileDocShareActions,
		TableOfContents,
		resolveTocSelector,
		siteConfig
	} from '$lib';
	import ContentSectionLayout from '$lib/components/content/ContentSectionLayout.svelte';
	import {
		getContentSectionConfig,
		getContentSectionHref,
		getContentSectionLinks,
		getContentSectionManifest,
		getContentSectionRawHref,
		getContentSectionUiConfig
	} from '$lib/content/sections';
	import type { SectionUiConfig } from '$lib/config/content-ui';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	const { data, children }: { data: LayoutData; children: Snippet } = $props();

	const sectionId = $derived(data.sectionId);
	const sectionUi = $derived<SectionUiConfig>(getContentSectionUiConfig(sectionId));
	const sectionConfig = $derived(getContentSectionConfig(sectionId));
	const sectionManifest = $derived(getContentSectionManifest(sectionId));
	const sectionBasePath = $derived(`/${sectionId}`);

	const metadata = $derived(data.metadata);
	const docSlug = $derived(metadata?.slug);
	const currentDoc = $derived(sectionManifest.find((d) => d.slug === docSlug));

	const previousLink = $derived(
		data.previousDoc
			? {
					title: data.previousDoc.name,
					href: getContentSectionHref(sectionId, data.previousDoc.slug)
				}
			: null
	);
	const nextLink = $derived(
		data.nextDoc
			? {
					title: data.nextDoc.name,
					href: getContentSectionHref(sectionId, data.nextDoc.slug)
				}
			: null
	);

	const siteOrigin = new URL(siteConfig.url).origin;
	const canonicalUrl = $derived(metadata ? new URL(metadata.href, siteOrigin).href : null);

	const docOgImage = $derived(
		metadata
			? new URL(`/og${data.metadata.href}.png`, siteOrigin).href
			: new URL(siteConfig.ogImage, siteOrigin).href
	);

	const docTitle = $derived(metadata?.title ?? currentDoc?.name ?? siteConfig.name);
	const docDescription = $derived(metadata?.description ?? siteConfig.description);

	const docStructuredData = $derived.by(() => {
		if (!canonicalUrl) return null;
		return JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'TechArticle',
			headline: docTitle,
			description: docDescription,
			url: canonicalUrl,
			author: {
				'@type': 'Person',
				name: siteConfig.author
			},
			publisher: {
				'@type': 'Organization',
				name: siteConfig.name
			},
			mainEntityOfPage: canonicalUrl
		});
	});

	const breadcrumbStructuredData = $derived.by(() => {
		if (!canonicalUrl) return null;
		return JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: [
				{
					'@type': 'ListItem',
					position: 1,
					name: 'Home',
					item: siteOrigin
				},
				{
					'@type': 'ListItem',
					position: 2,
					name: sectionConfig.label,
					item: new URL(sectionBasePath, siteOrigin).href
				},
				{
					'@type': 'ListItem',
					position: 3,
					name: docTitle,
					item: canonicalUrl
				}
			]
		});
	});

	const rawDocSlug = $derived(
		metadata
			? metadata.href.replace(new RegExp(`^\\/${sectionId}(?:\\/|$)`), '').replace(/\/+$/, '') ||
					'index'
			: null
	);
	const rawPath = $derived(rawDocSlug ? getContentSectionRawHref(sectionId, rawDocSlug) : null);
	const docOrigin = $derived(data.docOrigin);
	const rawUrl = $derived(rawPath && docOrigin ? new URL(rawPath, docOrigin).href : null);

	const showDocActions = $derived(sectionUi.pageActions.enabled && Boolean(metadata));
	const showToc = $derived(sectionUi.toc.enabled);
	const showRightAside = $derived(sectionUi.toc.enabled || sectionUi.pageActions.enabled);
	const isSvxContent = $derived(metadata?.sourceType === 'svx');
	const innerViewportStyle = $derived(isSvxContent);
	const showPagination = $derived(
		sectionUi.pagination.enabled && (isSvxContent || Boolean(currentDoc?.showPagination))
	);

	const sectionLinks = getContentSectionLinks();
	const sidebarConfig = $derived({
		navigation: sectionConfig.navigation,
		navigationLabel: sectionUi.sidebar.navigationLabel,
		basePath: sectionBasePath,
		showSearch: sectionUi.search.enabled,
		showThemeToggle: sectionUi.sidebar.showThemeToggle,
		showRepositoryLink: sectionUi.sidebar.showRepositoryLink,
		repositoryUrl: siteConfig.links.github,
		repositoryAriaLabel: sectionUi.sidebar.repositoryAriaLabel,
		searchConfig: sectionUi.search,
		sectionLinks
	});

	const tocSelector = $derived(resolveTocSelector(sectionUi.toc, docSlug));
	const mainId = $derived(`${sectionId}-main-content`);
	const scrollContainerId = $derived(`${sectionId}-content-container`);
</script>

<svelte:head>
	{#if metadata}
		<title>{docTitle} - {siteConfig.name}</title>
		<meta name="description" content={docDescription} />
		<link rel="canonical" href={canonicalUrl} />

		<meta property="og:type" content="article" />
		<meta property="og:title" content={docTitle} />
		<meta property="og:description" content={docDescription} />
		<meta property="og:url" content={canonicalUrl} />
		<meta property="og:image" content={docOgImage} />
		<meta property="og:image:alt" content={`${siteConfig.name} documentation`} />
		<meta property="og:image:type" content="image/png" />
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />
		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:title" content={docTitle} />
		<meta
