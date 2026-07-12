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
		default: 'bg-background text-foreground',
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

<span class={cn('inset-shadow inline-flex rounded-sm bg-background-inset p-[1.5px]', className)}>
	<span
		class={cn(
			'inline-flex items-center rounded-[calc(var(--radius-sm)-1.5px)] px-2 py-0.5 text-xs font-medium card',
			variantClasses[variant]
		)}
		style={variantStyles[variant] ?? ''}
	>
		{@render children?.()}
	</span>
</span>
