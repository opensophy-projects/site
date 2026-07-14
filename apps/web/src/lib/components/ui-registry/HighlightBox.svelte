<script lang="ts">
	import { cn } from '$lib/utils/cn';

	type Props = {
		active?: boolean;
		class?: string;
		children?: import('svelte').Snippet;
	};

	let { active = false, class: className = '', children }: Props = $props();
</script>

<div
	class={cn(
		'rounded-xl p-1.5 transition-colors duration-150',
		active
			? 'bg-accent/8 ring-1 ring-accent/15'
			: 'border border-border bg-background-inset',
		className
	)}
>
	<div
		class={cn(
			'rounded-lg border p-5',
			active ? 'border-accent/15 bg-background/60' : 'border-border bg-background card'
		)}
	>
		{@render children?.()}
	</div>
</div>
