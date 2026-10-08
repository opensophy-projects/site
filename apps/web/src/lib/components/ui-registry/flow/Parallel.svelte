<script lang="ts">
	import type { Snippet } from 'svelte';
	let { children, className = '', label = 'Параллельные ветки' }: { children: Snippet; className?: string; label?: string } = $props();
</script>

<section class={`flow-parallel ${className}`} data-flow-node>
	<span class="flow-parallel-label">{label}</span>
	<div class="flow-parallel-grid">{@render children?.()}</div>
</section>

<style>
	.flow-parallel { position: relative; width: min(100%, 42rem); padding: 1.25rem; border: 1px dashed color-mix(in srgb, var(--accent, #a3e635) 48%, transparent); border-radius: 1.25rem; background: color-mix(in srgb, var(--accent, #a3e635) 4%, transparent); }
	.flow-parallel-label { display: block; margin-bottom: .8rem; color: var(--accent, #a3e635); font-size: .68rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
	.flow-parallel-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; align-items: stretch; }
	:global(.flow-parallel-grid [data-flow-node]) { min-width: 0; width: 100%; }
	@media (max-width: 640px) { .flow-parallel-grid { grid-template-columns: 1fr; } }
</style>
