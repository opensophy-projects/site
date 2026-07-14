<script lang="ts">
	import { cn } from '$lib/utils/cn';

	type Props = {
		progress: number;
		class?: string;
	};

	let { progress, class: className = '' }: Props = $props();

	const clamped = $derived(Math.min(100, Math.max(0, progress)));
</script>

<div class={cn('h-2 w-full overflow-hidden rounded-full bg-background-inset', className)}>
	<div
		class="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
		style:width={`${String(clamped)}%`}
	></div>
</div>
