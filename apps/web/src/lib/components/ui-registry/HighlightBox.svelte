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
		'rounded-xl border p-5 transition-colors duration-150',
		active
			? 'border-accent/40 bg-accent/5'
			: 'inset-shadow border-border bg-background-inset',
		className
	)}
>
	{@render children?.()}
</div>
