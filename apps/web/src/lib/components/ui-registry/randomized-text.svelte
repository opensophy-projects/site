<script lang="ts">
	import { cn } from '$lib/utils';
	import { readNormalizedTextContent, segmentText, splitGraphemes } from '$lib/utils/text-utils';
	import type { Snippet } from 'svelte';

	type ElementName = 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
	type Props = { children: Snippet; class?: string; style?: string; as?: ElementName; split?: 'words' | 'chars'; delay?: number; duration?: number; trigger?: boolean; triggerOnView?: boolean; once?: boolean };
	let { children, class: className, style = '', as = 'span', split = 'words', delay = 0.2, duration = 1.2, trigger = true, triggerOnView = false, once = true }: Props = $props();
	let sourceElement = $state<HTMLSpanElement | null>(null);
	let sourceText = $state('');
	let hasBeenViewed = $state(false);
	let observer: IntersectionObserver | undefined;

	function sync() { sourceText = readNormalizedTextContent(sourceElement); }
	function onMount(node: HTMLElement) {
		const frame = requestAnimationFrame(sync);
		const mutationObserver = new MutationObserver(sync);
		mutationObserver.observe(node, { childList: true, subtree: true, characterData: true });
		if (triggerOnView) {
			observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { hasBeenViewed = true; if (once) observer?.disconnect(); } }, { threshold: 0.2 });
			observer.observe(node);
		}
		return { destroy() { cancelAnimationFrame(frame); mutationObserver.disconnect(); observer?.disconnect(); } };
	}
	const isVisible = $derived(trigger && (!triggerOnView || hasBeenViewed));
	const tokens = $derived(split === 'chars' ? splitGraphemes(sourceText).map((value, index) => ({ value, whitespace: /^\s+$/.test(value), index })) : segmentText(sourceText).map((token, index) => ({ value: token.value, whitespace: token.kind === 'whitespace', index })));
	const Tag = $derived(as);
</script>

<svelte:element this={Tag} use:onMount class={cn('break-words whitespace-pre-line randomized-text', className)} style={`--randomized-duration: ${Math.max(duration, 0.01)}s; --randomized-delay: ${Math.max(delay, 0)}s; ${style}`}>
	<span bind:this={sourceElement} class="sr-only">{@render children()}</span>
	{#each tokens as token (token.index + '-' + token.value)}
		{#if token.whitespace}<span aria-hidden="true" class="whitespace-pre">{token.value}</span>
		{:else}<span aria-hidden="true" class:inline-block={split === 'words'} class:randomized-hidden={!isVisible} class:randomized-visible={isVisible} style={`--randomized-index: ${token.index}`}>{token.value}</span>{/if}
	{/each}
</svelte:element>

<style>
	.randomized-text { display: inline-block; word-break: break-word; }
	.randomized-text > span:not(.sr-only) { opacity: 0; filter: blur(4px); transform: translateY(0.8em); }
	.randomized-visible { animation: randomized-enter var(--randomized-duration) cubic-bezier(.16,1,.3,1) calc(var(--randomized-delay) * var(--randomized-index) * .35) both; }
	.randomized-hidden { opacity: 0; }
	@keyframes randomized-enter { to { opacity: 1; filter: blur(0); transform: translateY(0); } }
	@media (prefers-reduced-motion: reduce) { .randomized-text > span:not(.sr-only) { animation: none; opacity: 1; filter: none; transform: none; } }
</style>
