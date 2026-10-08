<script lang="ts">
 import type { Snippet } from 'svelte';
 export let children: Snippet;
 export let className = '';
</script>
<div class={`flex flex-col gap-4 ${className}`}>{@render children?.()}</div>
