<script lang="ts">
	import { onMount } from 'svelte';
	import LogoGithub from 'carbon-icons-svelte/lib/LogoGithub.svelte';
	import { cn } from '$lib/utils/cn';

	const { repositoryUrl, class: className = '' }: { repositoryUrl: string; class?: string } =
		$props();

	const CACHE_TTL = 60 * 60 * 1000;

	let stars = $state<number | null>(null);

	const repoPath = $derived(new URL(repositoryUrl).pathname.replace(/^\/|\/$/g, ''));
	const formatted = $derived(
		stars === null
			? null
			: stars >= 10_000
				? `${(stars / 1000).toFixed(1).replace(/\.0$/, '')}k`
				: String(stars)
	);

	function readCache(key: string) {
		try {
			const raw = sessionStorage.getItem(key);
			if (!raw) return null;
			const parsed = JSON.parse(raw) as { value: number; at: number };
			return Date.now() - parsed.at < CACHE_TTL ? parsed.value : null;
		} catch {
			return null;
		}
	}

	function writeCache(key: string, value: number) {
		try {
			sessionStorage.setItem(key, JSON.stringify({ value, at: Date.now() }));
		} catch {
			// Storage may be unavailable (private mode) — the count simply refetches.
		}
	}

	onMount(() => {
		const cacheKey = `gh-stars:${repoPath}`;
		const cached = readCache(cacheKey);
		if (cached !== null) {
			stars = cached;
			return;
		}

		const controller = new AbortController();
		fetch(`https://api.github.com/repos/${repoPath}`, { signal: controller.signal })
			.then((response) => (response.ok ? (response.json() as Promise<{ stargazers_count?: number }>) : null))
			.then((data) => {
				if (typeof data?.stargazers_count !== 'number') return;
				stars = data.stargazers_count;
				writeCache(cacheKey, data.stargazers_count);
			})
			.catch(() => {
				// Offline or rate-limited — keep showing only the icon.
			});

		return () => controller.abort();
	});
</script>

<a
	href={repositoryUrl}
	target="_blank"
	rel="external noopener"
	class={cn(
		'inline-flex h-8 items-center gap-1.5 rounded-sm px-1.5 text-xs font-medium text-foreground-muted tabular-nums transition-colors duration-150 ease-out hover:text-foreground',
		className
	)}
	aria-label={formatted
		? `Репозиторий на GitHub, ${formatted} звёзд (откроется в новой вкладке)`
		: 'Репозиторий на GitHub (откроется в новой вкладке)'}
>
	<LogoGithub size={16} class="flex-none" />
	{#if formatted}<span>{formatted}</span>{/if}
</a>
