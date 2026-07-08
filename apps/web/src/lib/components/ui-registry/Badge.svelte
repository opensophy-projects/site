<script lang="ts">
	import { cn } from '$lib/utils/cn';

	type Variant = 'default' | 'accent' | 'success' | 'warning' | 'error' | 'outline';

	type Props = {
		variant?: Variant;
		class?: string;
		children?: import('svelte').Snippet;
	};

	let {
		variant = 'default',
		class: className = '',
		children
	}: Props = $props();

	const variantClasses: Record<Variant, string> = {
		default: 'bg-background-inset text-foreground',
		accent: 'bg-accent/10 text-accent',
		success: 'bg-green-500/10 text-green-500',
		warning: 'text-orange-500',
		error: 'bg-red-500/10 text-red-500',
		outline: 'border border-border bg-transparent text-foreground'
	};

	const variantStyles: Partial<Record<Variant, string>> = {
		warning: 'background-color: rgba(249, 115, 22, 0.1);'
	};
</script>

<span
	class={cn(
		'inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium',
		variantClasses[variant],
		className
	)}
	style={variantStyles[variant] ?? ''}
>
	{@render children?.()}
</span>
