<script lang="ts">
	import { cn } from '$lib/utils/cn';

	type Props = {
		active?: boolean;
		class?: string;
		children?: import('svelte').Snippet;
	};

	let { active = false, class: className = '', children }: Props = $props();
</script>

<div class={cn('rounded-xl bg-background-inset p-1.5', className)}>
	<div
		class={cn(
			'rounded-lg border p-5 transition-colors duration-150',
			active ? 'border-accent/40 bg-accent/5' : 'border-border bg-background card'
		)}
	>
		{@render children?.()}
	</div>
</div>
