<script lang="ts">
	import { cn } from '$lib/utils/cn';

	type Props = {
		active?: boolean;
		class?: string;
		children?: import('svelte').Snippet;
	};

	let { active = false, class: className = '', children }: Props = $props();
</script>

<div class={cn('inset-shadow rounded-md bg-background-inset p-[1.5px]', className)}>
	<div
		class={cn(
			'rounded-[calc(var(--radius-md)-1.5px)] p-4 transition-colors duration-150',
			active ? 'bg-accent/5 ring-1 ring-accent/20' : 'bg-background card'
		)}
	>
		{@render children?.()}
	</div>
</div>
