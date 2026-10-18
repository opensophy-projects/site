<script lang="ts">
	type Props = {
		/** Позиция при вложении в другой <svg> (в координатах родителя). */
		x?: number;
		y?: number;
		/** Размер; пропорции 150×180. */
		width?: number;
		height?: number;
		/** Светодиоды горят (сервер получил запрос). */
		lit?: boolean;
		/** Подпись для скринридеров. Без неё иллюстрация считается декоративной. */
		title?: string;
		class?: string;
	};

	let {
		x = 0,
		y = 0,
		width = 150,
		height = 180,
		lit = false,
		title,
		class: className = ''
	}: Props = $props();

	const UNITS = [0, 1, 2];
	const BAYS = [0, 1, 2, 3];
</script>

<svg
	{x}
	{y}
	{width}
	{height}
	viewBox="0 0 150 180"
	class={['server', className]}
	role={title ? 'img' : undefined}
	aria-label={title}
	aria-hidden={title ? undefined : 'true'}
>
	<!-- корпус -->
	<rect class="body" x="1" y="1" width="148" height="170" rx="10" />

	<!-- ножки -->
	<rect class="foot" x="18" y="171" width="26" height="7" rx="2" />
	<rect class="foot" x="106" y="171" width="26" height="7" rx="2" />

	<!-- юниты -->
	{#each UNITS as k (k)}
		{@const u = 10 + k * 54}
		<rect class="unit" x="10" y={u} width="130" height="46" rx="6" />

		<!-- отсеки для дисков -->
		{#each BAYS as j (j)}
			<rect class="bay" x={20 + j * 19} y={u + 9} width="14" height="28" rx="2.5" />
			<path class="grip" d="M{23 + j * 19} {u + 15}H{31 + j * 19}" />
		{/each}

		<!-- светодиод, кнопка питания и вентиляция -->
		<circle class="led" class:on={lit} cx="120" cy={u + 15} r="5" />
		<circle class="btn" cx="106" cy={u + 15} r="3" />
		<path class="vent" d="M100 {u + 28}H130M100 {u + 34}H130" />
	{/each}
</svg>

<style>
	.server {
		--s-line: var(--mt-line, color-mix(in srgb, var(--color-foreground-muted, #888) 75%, transparent));
		--s-soft: var(--mt-soft, var(--color-border, #ddd));
		--s-accent: var(--mt-accent, var(--color-accent, #f43f5e));
		overflow: visible;
	}

	.body {
		fill: var(--color-background-inset, #f4f4f5);
		stroke: var(--s-line);
		stroke-width: 1.4;
	}
	.foot {
		fill: var(--s-line);
	}
	.unit {
		fill: var(--color-background, #fff);
		stroke: var(--s-soft);
		stroke-width: 1.2;
	}
	.bay {
		fill: var(--color-background-inset, #f4f4f5);
		stroke: var(--s-soft);
		stroke-width: 1.2;
	}
	.grip,
	.vent {
		fill: none;
		stroke: var(--s-soft);
		stroke-width: 2;
		stroke-linecap: round;
	}
	.btn {
		fill: none;
		stroke: var(--s-line);
		stroke-width: 1.2;
	}
	.led {
		fill: var(--s-soft);
		stroke: var(--s-line);
		stroke-width: 1.2;
		transition: fill 150ms ease-out;
	}
	.led.on {
		fill: var(--s-accent);
		stroke: var(--s-accent);
	}

	@media (prefers-reduced-motion: reduce) {
		.led {
			transition: none;
		}
	}
</style>