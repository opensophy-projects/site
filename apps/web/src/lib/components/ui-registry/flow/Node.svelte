<script lang="ts">
	import type { Snippet } from 'svelte';
	let { children, disabled = false, className = '', variant = 'default', title = '', meta = '' }: { children: Snippet; disabled?: boolean; className?: string; variant?: 'default' | 'decision' | 'start' | 'result' | 'warning'; title?: string; meta?: string } = $props();
</script>

<div data-flow-node class={`flow-node flow-${variant} ${disabled ? 'flow-disabled' : ''} ${className}`}>
	{#if variant === 'decision'}<span class="flow-diamond" aria-hidden="true"></span>{/if}
	<div class="flow-node-copy">
		{#if title}<span class="flow-node-title">{title}</span>{/if}
		<span class="flow-node-label">{@render children?.()}</span>
		{#if meta}<span class="flow-node-meta">{meta}</span>{/if}
	</div>
</div>

<style>
	.flow-node { min-width: 12rem; max-width: 18rem; padding: 1rem 1.25rem; border: 1px solid color-mix(in srgb, var(--foreground, #fff) 18%, transparent); border-radius: 1rem; background: color-mix(in srgb, var(--background, #0b0b0b) 88%, #fff 12%); box-shadow: 0 12px 30px rgb(0 0 0 / .2); text-align: left; }
	.flow-node-copy { display: grid; gap: .35rem; position: relative; z-index: 1; }
	.flow-node-label { color: var(--foreground, #fff); font-size: .95rem; font-weight: 550; }
	.flow-node-title { color: var(--accent, #a3e635); font-size: .68rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
	.flow-node-meta { color: var(--foreground-muted, #999); font-size: .75rem; }
	.flow-start { border-color: color-mix(in srgb, #52d273 65%, transparent); background: color-mix(in srgb, #52d273 13%, var(--background, #0b0b0b)); }
	.flow-result { border-color: color-mix(in srgb, var(--accent, #a3e635) 70%, transparent); }
	.flow-warning { border-color: color-mix(in srgb, #f3a642 70%, transparent); }
	.flow-node.flow-disabled { opacity: .4; filter: grayscale(1); }
	.flow-decision { border-radius: .35rem; transform: rotate(45deg); }
	.flow-decision .flow-node-copy { transform: rotate(-45deg); }
	.flow-diamond { display: none; }
</style>
