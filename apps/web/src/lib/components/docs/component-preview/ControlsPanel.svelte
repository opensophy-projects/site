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
		class="mt-2 overflow-visible rounded-xl bg-background-inset p-1.5 [box-shadow:inset_0_0_0_0.5px_oklch(from_var(--highlight)_l_c_h_/_8%),inset_0px_1px_2px_rgba(0,0,0,0.04)]"
		aria-label="Пропсы компонента"
	>
		<div
			class="relative flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 card"
		>
			<h2 class="text-sm font-medium tracking-normal text-foreground">Пропсы</h2>
			<button
				onclick={onReset}
				class="absolute top-1/2 right-1.5 z-30 flex size-6 -translate-y-1/2 items-center justify-center rounded-sm bg-background-inset text-foreground transition-transform duration-150 ease-out active:scale-[0.95]"
				aria-label="Сбросить настройки"
			>
				<Reset size={14} />
			</button>
		</div>
		<div class="grid gap-1.5 p-2 md:grid-cols-2 xl:grid-cols-3">
			{#each controls as control (control.name)}
				<ControlField {control} value={values[control.name]} {onChange} />
			{/each}
		</div>
	</div>
{/if}
