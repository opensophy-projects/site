<script lang="ts">
	import { cn } from '$lib/utils/cn';

	type Props = {
		checked?: boolean;
		label?: string;
		class?: string;
		onchange?: (checked: boolean) => void;
	};

	let {
		checked = false,
		label = '',
		class: className = '',
		onchange
	}: Props = $props();

	const toggle = () => {
		checked = !checked;
		onchange?.(checked);
	};
</script>

<button
	type="button"
	role="switch"
	aria-checked={checked}
	aria-label={label}
	onclick={toggle}
	class={cn(
		'inset-shadow relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-150 ease-out',
		checked ? 'bg-accent' : 'bg-background-inset',
		className
	)}
>
	<span
		class={cn(
			'inline-block size-4 transform rounded-full bg-background shadow-sm transition-transform duration-150 ease-out',
			checked ? 'translate-x-6' : 'translate-x-1'
		)}
	></span>
</button>
