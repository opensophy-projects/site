<script lang="ts">
	import { cn } from '$lib/utils/cn';

	type Props = {
		dotColor?: string;
		class?: string;
		children?: import('svelte').Snippet;
	};

	let {
		dotColor = '#f43f5e',
		class: className = '',
		children
	}: Props = $props();
</script>

<div class={cn('inset-shadow inline-flex rounded-full bg-background-inset p-[1.5px]', className)}>
	<div class="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1 card">
		<span class="relative flex size-2">
			<span
				class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
				style:background={dotColor}
			></span>
			<span
				class="relative inline-flex size-2 rounded-full"
				style:background={dotColor}
			></span>
		</span>
		<span class="text-xs font-medium text-foreground">
			{@render children?.()}
		</span>
	</div>
</div>
