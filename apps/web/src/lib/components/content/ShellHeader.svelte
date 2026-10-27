<script lang="ts" module>
	export type ShellBreadcrumb = {
		label: string;
		href?: string;
	};
</script>

<script lang="ts">
	import ChevronRight from 'carbon-icons-svelte/lib/ChevronRight.svelte';
	import GithubStars from '$lib/components/content/GithubStars.svelte';
	import ShellThemeToggle from '$lib/components/content/ShellThemeToggle.svelte';
	import { siteConfig } from '$lib/config/site';

	const {
		breadcrumbs = [],
		showThemeToggle = true,
		repositoryUrl = siteConfig.links.repository,
		author = siteConfig.author,
		authorUrl = siteConfig.links.github
	}: {
		breadcrumbs?: ShellBreadcrumb[];
		showThemeToggle?: boolean;
		repositoryUrl?: string;
		author?: string;
		authorUrl?: string;
	} = $props();

	// Notch geometry: the slanted edge and the rounded step where it meets the card border.
	const NOTCH_HEIGHT = 40;
	const SLANT_WIDTH = 24;
	const CORNER = 12;
	const edgeY = NOTCH_HEIGHT - 0.5;
</script>

<header class="relative hidden h-11 shrink-0 items-center lg:flex">
	<nav aria-label="Хлебные крошки" class="min-w-0 flex-1 pr-72 pl-8">
		<ol class="flex min-w-0 items-center gap-1 text-sm text-foreground-muted">
			{#each breadcrumbs as crumb, index (`${index}:${crumb.label}`)}
				{@const isLast = index === breadcrumbs.length - 1}
				<li class={isLast ? 'min-w-0' : 'flex shrink-0 items-center gap-1'}>
					{#if isLast}
						<span aria-current="page" class="block truncate text-foreground">{crumb.label}</span>
					{:else if crumb.href}
						<a
							href={crumb.href}
							class="transition-colors duration-150 ease-out hover:text-foreground">{crumb.label}</a
						>
					{:else}
						<span>{crumb.label}</span>
					{/if}
				</li>
				{#if !isLast}
					<li aria-hidden="true" class="flex shrink-0 items-center text-foreground-muted/50">
						<ChevronRight size={14} />
					</li>
				{/if}
			{/each}
		</ol>
	</nav>

	<!-- Cut-out in the card's top-right corner, painted with the page background. -->
	<div class="notch absolute -top-px -right-px z-20 flex" style={`height: ${NOTCH_HEIGHT}px`}>
		<svg
			class="block shrink-0"
			width={SLANT_WIDTH}
			height={NOTCH_HEIGHT}
			viewBox={`0 0 ${SLANT_WIDTH} ${NOTCH_HEIGHT}`}
			aria-hidden="true"
		>
			<path
				class="notch-fill"
				d={`M0 0 H${SLANT_WIDTH} V${edgeY} C${SLANT_WIDTH / 2} ${edgeY} ${SLANT_WIDTH / 2} 0.5 0 0.5 Z`}
			/>
			<path
				class="notch-stroke"
				d={`M0 0.5 C${SLANT_WIDTH / 2} 0.5 ${SLANT_WIDTH / 2} ${edgeY} ${SLANT_WIDTH} ${edgeY}`}
			/>
		</svg>

		<div class="relative flex items-center gap-1 bg-background pr-3 pl-1">
			<span class="absolute bottom-0 left-0 h-px bg-border" style={`right: ${CORNER}px`}></span>

			{#if repositoryUrl}
				<GithubStars {repositoryUrl} />
			{/if}

			{#if showThemeToggle}
				<span aria-hidden="true" class="mx-1 h-4 w-px bg-border"></span>
				<ShellThemeToggle />
			{/if}

			<span aria-hidden="true" class="mx-1 h-4 w-px bg-border"></span>
			<a
				href={authorUrl}
				target="_blank"
				rel="external noopener"
				class="px-1.5 text-xs whitespace-nowrap text-foreground-muted transition-colors duration-150 ease-out hover:text-foreground"
			>
				Built by {author}
			</a>

			<svg
				class="absolute right-0 block"
				style={`top: ${NOTCH_HEIGHT - 1}px`}
				width={CORNER}
				height={CORNER}
				viewBox={`0 0 ${CORNER} ${CORNER}`}
				aria-hidden="true"
			>
				<path
					class="notch-fill"
					d={`M0 0 H${CORNER} V${CORNER} H${CORNER - 0.5} A${CORNER - 0.5} ${CORNER - 0.5} 0 0 0 0 0.5 Z`}
				/>
				<path
					class="notch-stroke"
					d={`M0 0.5 A${CORNER - 0.5} ${CORNER - 0.5} 0 0 1 ${CORNER - 0.5} ${CORNER}`}
				/>
			</svg>
		</div>
	</div>
</header>

<style>
	.notch-fill {
		fill: var(--color-background);
	}

	.notch-stroke {
		fill: none;
		stroke: var(--color-border);
		stroke-width: 1;
	}
</style>
