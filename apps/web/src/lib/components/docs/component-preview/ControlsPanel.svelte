<script lang="ts">
	import type {
		ComponentPreviewControl,
		ComponentPreviewValue,
		ComponentPreviewValues
	} from './types';
	import ControlField from './ControlField.svelte';
	import Reset from 'carbon-icons-svelte/lib/Reset.svelte';

	type Props = {
		controls: ComponentPreviewControl[];
		values: ComponentPreviewValues;
		onChange: (name: string, value: ComponentPreviewValue) => void;
		onReset: () => void;
	};

	let { controls, values, onChange, onReset }: Props = $props();
</script>

{#if controls.length}
	<div
		class="mt-2 flex flex-col overflow-visible rounded-md bg-background card"
		aria-label="Пропсы компонента"
	>
		<div
			class="relative flex items-center justify-between bg-background px-4 py-2.5 text-sm after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border after:content-['']"
		>
			<h2 class="font-medium tracking-normal text-foreground">Пропсы</h2>
			<button
				onclick={onReset}
				class="flex size-6 items-center justify-center rounded-sm text-foreground-muted transition-colors duration-150 hover:bg-background-muted hover:text-foreground active:scale-[0.95]"
				aria-label="Сбросить настройки"
			>
				<Reset size={14} />
			</button>
		</div>
		<div class="grid gap-2 p-3 md:grid-cols-2 xl:grid-cols-3">
			{#each controls as control (control.name)}
				<ControlField {control} value={values[control.name]} {onChange} />
			{/each}
		</div>
	</div>
{/if}
