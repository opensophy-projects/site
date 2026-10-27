<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { themeStore } from '$lib/stores/theme.svelte';
	import Sun from 'carbon-icons-svelte/lib/Sun.svelte';
	import Moon from 'carbon-icons-svelte/lib/Moon.svelte';

	const { class: className = '' }: { class?: string } = $props();
</script>

<button
	type="button"
	class={cn(
		'relative inline-flex size-8 cursor-pointer items-center justify-center rounded-sm text-foreground-muted transition-[color,scale] duration-150 ease-out hover:text-foreground active:scale-[0.95]',
		className
	)}
	onclick={themeStore.toggle}
	aria-label={themeStore.isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
	title="Сменить тему"
>
	<span class="theme-icon theme-icon-sun" aria-hidden="true"><Sun size={16} /></span>
	<span class="theme-icon theme-icon-moon" aria-hidden="true"><Moon size={16} /></span>
</button>

<style>
	.theme-icon {
		position: absolute;
		display: inline-flex;
		opacity: 0;
		filter: blur(4px);
		scale: 0.25;
		transition:
			opacity 150ms ease-out,
			filter 150ms ease-out,
			scale 150ms ease-out;
	}

	.theme-icon-sun,
	:global(.dark) .theme-icon-moon {
		opacity: 1;
		filter: blur(0);
		scale: 1;
	}

	:global(.dark) .theme-icon-sun {
		opacity: 0;
		filter: blur(4px);
		scale: 0.25;
	}

	@media (prefers-reduced-motion: reduce) {
		.theme-icon {
			transition: none;
		}
	}
</style>
