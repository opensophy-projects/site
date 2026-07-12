<script lang="ts">
	import { resolve } from '$app/paths';
	import { cn } from '$lib/utils/cn';

	type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
	type Size = 'sm' | 'md' | 'lg';

	type Props = {
		variant?: Variant;
		size?: Size;
		class?: string;
		href?: string;
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		children?: import('svelte').Snippet;
		onclick?: (e: MouseEvent) => void;
	};

	let {
		variant = 'primary',
		size = 'md',
		class: className = '',
		href,
		type = 'button',
		disabled = false,
		children,
		onclick
	}: Props = $props();

	const outerVariantClasses: Record<Variant, string> = {
		primary: 'bg-accent/30',
		secondary: 'bg-background-inset',
		outline: 'bg-background-inset',
		ghost: 'bg-transparent',
		danger: 'bg-red-500/20'
	};

	const innerVariantClasses: Record<Variant, string> = {
		primary: 'bg-accent text-background hover:bg-accent/85',
		secondary: 'bg-background text-foreground hover:bg-background-muted',
		outline: 'border border-border bg-background text-foreground hover:bg-background-muted',
		ghost: 'bg-transparent text-foreground-muted hover:bg-background-muted hover:text-foreground',
		danger: 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
	};

	const sizeClasses: Record<Size, string> = {
		sm: 'h-7 px-2.5 text-xs',
		md: 'h-9 px-4 text-sm',
		lg: 'h-11 px-6 text-base'
	};

	const outerClass = $derived(cn(
		'inset-shadow inline-flex rounded-sm p-[1.5px]',
		outerVariantClasses[variant],
		disabled && 'opacity-50 cursor-not-allowed',
		className
	));

	const innerClass = $derived(cn(
		'inline-flex items-center justify-center gap-2 rounded-[calc(var(--radius-sm)-1.5px)] font-medium transition-colors duration-150 ease-out active:scale-[0.98] card',
		innerVariantClasses[variant],
		sizeClasses[size],
		disabled && 'pointer-events-none'
	));
</script>

{#if href}
	<span class={outerClass}>
		<a href={resolve(href)} class={innerClass} aria-disabled={disabled}>
			{@render children?.()}
		</a>
	</span>
{:else}
	<span class={outerClass}>
		<button {type} {disabled} {onclick} class={innerClass}>
			{@render children?.()}
		</button>
	</span>
{/if}
