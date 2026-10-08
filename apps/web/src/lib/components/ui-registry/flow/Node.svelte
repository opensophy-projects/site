<script lang="ts">
 import type { Snippet } from 'svelte';
 export let children: Snippet;
 export let disabled = false;
 export let className = '';
</script>
<div data-flow-node class={`kumo-flow-node rounded-md bg-kumo-base px-3 py-2 text-sm ring-1 ring-kumo-line shadow-sm ${disabled ? 'opacity-40' : ''} ${className}`}>
 {@render children?.()}
</div>
