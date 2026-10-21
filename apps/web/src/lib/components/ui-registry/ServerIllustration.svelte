<!--
  ServerIllustration: стойка серверов, нарисованная изометрической линией.

  Props
    x, y        где на схеме стоит центр основания (в единицах viewBox родительского <svg>)
    units       сколько блоков в стойке (1–6)                                 по умолчанию 3
    lit         подсветить индикаторы акцентом (пришёл запрос)
    standalone  нарисовать собственный <svg> (для использования отдельно от схемы)
    width       CSS-ширина standalone SVG                                      по умолчанию min(88vw, 420px)
    label       подпись для скринридера (только при standalone)

  Цвета берутся из токенов проекта:
    --color-foreground        линии
    --color-background        верхняя грань
    --color-foreground-muted  выключенные индикаторы
    --color-accent            включённые индикаторы (можно переопределить через --mt-accent)

  Размер задан в единицах схемы (масштаб 1), поэтому сервер не растягивается вместе с контейнером.
  Геометрия лежит в module-скрипте ниже: этот файл самодостаточный.
-->
<script module lang="ts">
	export type PathItem = { k: 'p'; d: string; c: string; o?: number };

	const K = Math.sqrt(3) / 2;
	/** Половина стороны основания, высота блока и шаг между блоками. */
	const H = 30;
	const UH = 14;
	const UP = 16;
	export const SERVER = { H, UH, UP, MAX_UNITS: 6 } as const;

	type V3 = [number, number, number];
	const f = (v: number) => Math.round(v * 10) / 10;
	const P = (x: number, y: number, z: number): [number, number] => [(x - y) * K, (x + y) / 2 - z];
	const pts = (list: V3[]) =>
		list
			.map((q) => P(q[0], q[1], q[2]))
			.map((p) => `${String(f(p[0]))} ${String(f(p[1]))}`)
			.join('L');
	const quad = (...q: V3[]) => `M${pts(q)}Z`;
	const seg = (a: V3, b: V3) => `M${pts([a, b])}`;
	const dot = (q: V3) => {
		const p = P(q[0], q[1], q[2]);
		return `M${String(f(p[0]))} ${String(f(p[1]))}h.01`;
	};

	const clampUnits = (n: number) => Math.max(1, Math.min(SERVER.MAX_UNITS, Math.round(n) || 1));

	/** Все контуры стойки: тень, затем блоки снизу вверх. Начало координат — центр основания. */
	export function serverItems(units = 3): PathItem[] {
		const n = clampUnits(units);
		const out: PathItem[] = [
			{ k: 'p', c: 'sv-shadow', d: quad([-H - 5, -H - 5, 0], [H + 5, -H - 5, 0], [H + 5, H + 5, 0], [-H - 5, H + 5, 0]) }
		];
		for (let k = 0; k < n; k++) {
			const z0 = k * UP;
			const z1 = z0 + UH;
			const y = H;
			const c = 2.5;
			const bays = [-24, -14, -4, 6];
			const b = `b${String(k % 3)}`;
			out.push(
				{ k: 'p', c: 'sv-ln sv-fl', d: quad([-H, y, z0], [H, y, z0], [H, y, z1], [-H, y, z1]) },
				{ k: 'p', c: 'sv-ln sv-fr', d: quad([H, -H, z0], [H, H, z0], [H, H, z1], [H, -H, z1]) },
				{ k: 'p', c: 'sv-ln sv-ft', d: quad([-H, -H, z1], [H, -H, z1], [H, H, z1], [-H, H, z1]) },
				{ k: 'p', c: 'sv-ln sv-lo', d: quad([-H + c, -H + c, z1], [H - c, -H + c, z1], [H - c, H - c, z1], [-H + c, H - c, z1]) },
				{ k: 'p', c: 'sv-ln sv-lo', d: quad([bays[0], y, z0 + 3], [bays[3], y, z0 + 3], [bays[3], y, z0 + 11], [bays[0], y, z0 + 11]) },
				{ k: 'p', c: 'sv-ln sv-lo', d: [bays[1], bays[2]].map((x) => seg([x, y, z0 + 3], [x, y, z0 + 11])).join('') },
				{ k: 'p', c: 'sv-ln sv-lo', d: [0, 1, 2].map((i) => seg([bays[i] + 2, y, z0 + 7], [bays[i + 1] - 2, y, z0 + 7])).join('') },
				{ k: 'p', c: 'sv-ln sv-lo', d: [-19, -12.5, -6, 0.5, 7, 13.5, 20].map((v) => seg([H, v, z0 + 4], [H, v, z1 - 4])).join('') },
				{ k: 'p', c: 'sv-led', d: dot([17, y, z0 + 7]) },
				{ k: 'p', c: `sv-led sv-blink ${b}`, d: dot([23, y, z0 + 7]) }
			);
		}
		return out;
	}

	/** [x, y, width, height] для viewBox, когда сервер нарисован отдельно (центр основания в 0,0). */
	export function serverBounds(units = 3): [number, number, number, number] {
		const n = clampUnits(units);
		const top = (n - 1) * UP + UH;
		const xs: number[] = [];
		const ys: number[] = [];
		for (const x of [-H - 5, H + 5])
			for (const y of [-H - 5, H + 5])
				for (const z of [0, top]) {
					const p = P(x, y, z);
					xs.push(p[0]);
					ys.push(p[1]);
				}
		const pad = 6;
		const x0 = Math.min(...xs) - pad;
		const y0 = Math.min(...ys) - pad;
		return [f(x0), f(y0), f(Math.max(...xs) + pad - x0), f(Math.max(...ys) + pad - y0)];
	}
</script>

<script lang="ts">
	type Props = {
		x?: number;
		y?: number;
		units?: number;
		lit?: boolean;
		standalone?: boolean;
		width?: string;
		label?: string;
		class?: string;
	};

	let {
		x = 0,
		y = 0,
		units = 3,
		lit = false,
		standalone = false,
		width = 'min(88vw, 420px)',
		label = 'Сервер',
		class: className = ''
	}: Props = $props();

	const items = $derived(serverItems(units));
	const bounds = $derived(serverBounds(units));
</script>

{#snippet body()}
	<g class="srv" class:lit transform="translate({x} {y})">
		{#each items as it, i (i)}
			<path class={it.c} d={it.d} opacity={it.o} />
		{/each}
	</g>
{/snippet}

{#if standalone}
	<svg
		class="srv-root {className}"
		style:width={width}
		viewBox={bounds.join(' ')}
		role="img"
		aria-label={label}
	>
		{@render body()}
	</svg>
{:else}
	{@render body()}
{/if}

<style>
	.srv-root {
		display: block;
		height: auto;
		overflow: visible;
	}

	.srv {
		--sv-ink: var(--color-foreground);
		--sv-surface: var(--color-background);
		--sv-off: var(--color-foreground-muted);
		--sv-on: var(--mt-accent, var(--color-accent));
		--sv-sw: 2;
	}

	.srv :global(.sv-shadow) {
		fill: var(--sv-ink);
		opacity: 0.07;
	}
	.srv :global(.sv-ln) {
		fill: var(--sv-surface);
		stroke: var(--sv-ink);
		stroke-width: var(--sv-sw);
		stroke-linejoin: round;
		stroke-linecap: round;
	}
	.srv :global(.sv-fl) {
		fill: color-mix(in srgb, var(--sv-ink) 4%, var(--sv-surface));
	}
	.srv :global(.sv-fr) {
		fill: color-mix(in srgb, var(--sv-ink) 9%, var(--sv-surface));
	}
	.srv :global(.sv-ft) {
		fill: var(--sv-surface);
	}
	.srv :global(.sv-lo) {
		fill: none;
		stroke-width: calc(var(--sv-sw) * 0.6);
		opacity: 0.65;
	}

	.srv :global(.sv-led) {
		fill: none;
		stroke: var(--sv-off);
		stroke-width: 4.5;
		stroke-linecap: round;
		transition: stroke 150ms ease-out;
	}
	.srv.lit :global(.sv-led) {
		stroke: var(--sv-on);
	}
	.srv :global(.sv-blink) {
		animation: sv-blink 1.4s ease-in-out infinite;
	}
	.srv :global(.b1) {
		animation-delay: 0.33s;
	}
	.srv :global(.b2) {
		animation-delay: 0.66s;
	}
	@keyframes sv-blink {
		50% {
			opacity: 0.3;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.srv :global(.sv-blink) {
			animation: none;
		}
		.srv :global(.sv-led) {
			transition: none;
		}
	}
</style>
