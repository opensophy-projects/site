<script lang="ts">
	import { DRAGON_BOX, DRAGON_PATH, DRAGON_TRANSFORM } from './dragon-path';
	/**
	 * Hairline-иллюстрация «защита в три слоя»: впереди — стеклянный щит,
	 * в середине — логотип-дракон NginxionS, сзади — щит с кирпичной стеной.
	 * Слева летят запросы: обычные проходят сквозь стекло к дракону,
	 * заблокированные останавливаются на стекле знаком «×» с причиной.
	 * Вся анимация на CSS; статичный кадр виден и без JS.
	 */
	type Props = {
		accent?: string;
		label?: string;
		class?: string;
	};

	const {
		accent = '#f43f5e',
		label = 'Три слоя защиты: стеклянный щит, дракон NginxionS и щит с кирпичной стеной. Обычные запросы проходят, атаки и боты блокируются',
		class: className = ''
	}: Props = $props();

	// Контур щита в локальных координатах (как в ShieldInfinity)
	const SHIELD =
		'M0,-120 C40,-100 80,-95 100,-95 L100,-10 C100,60 55,100 0,125 C-55,100 -100,60 -100,-10 L-100,-95 C-80,-95 -40,-100 0,-120Z';
	// Поворот щита к зрителю: сжатие по X и наклон верхнего края
	const TURN = 'matrix(0.8 -0.27 0 1 0 0)';

	// Углы стеклянного щита — из них идут рёбра толщины
	const corners: [number, number][] = [
		[0, -120],
		[100, -95],
		[100, -10],
		[0, 125]
	];

	// Слои: передний стеклянный щит и задний щит со стеной
	const FRONT = { x: 300, y: 322, s: 1.45, dx: 26, dy: -8 };
	const BACK = { x: 640, y: 222, s: 1.12 };
	const DRAGON = { x: 474, y: 272, w: 330 };
	// Дракону — поворот мягче, чтобы логотип не терял пропорции
	const DRAGON_TURN = 'matrix(0.92 -0.16 0 1 0 0)';

	// Локальная точка щита → экран
	const toScreen = (L: typeof FRONT, x: number, y: number): [number, number] => [
		L.x + 0.8 * L.s * x,
		L.y + L.s * (-0.27 * x + y)
	];

	// Кирпичная кладка внутри заднего щита (локальные координаты)
	const BRICK_H = 17;
	const BRICK_W = 34;
	const brickRows = Array.from({ length: 15 }, (_, r) => -122 + r * BRICK_H);
	const bricks = brickRows.flatMap((y, r) =>
		Array.from({ length: 8 }, (_, c) => ({
			x: -136 + c * BRICK_W + (r % 2) * (BRICK_W / 2),
			y
		}))
	);

	// Запросы: старт за левым краем, удар — точка на стекле.
	// Обычный запрос проходит сквозь стекло дальше к дракону (`to`),
	// заблокированный останавливается со знаком «×» и причиной (`reason`).
	type Req = { from: [number, number]; at: [number, number]; to?: [number, number]; reason?: string; delay: number };
	const requests: Req[] = [
		{ from: [24, 352], at: toScreen(FRONT, -84, -58), reason: 'бот', delay: 0 },
		{ from: [34, 430], at: toScreen(FRONT, -72, -6), to: [452, 262], delay: 0.9 },
		{ from: [44, 520], at: toScreen(FRONT, -48, 44), reason: 'SQL-инъекция', delay: 1.8 },
		{ from: [118, 574], at: toScreen(FRONT, -22, 86), to: [500, 330], delay: 2.7 }
	];

	const f1 = (n: number) => n.toFixed(1);
	const LABEL_CHAR = 6.8; // ширина символа моноширинной подписи

	const impacts = requests.map((r) => {
		const [x1, y1] = r.from;
		const [x2, y2] = r.at;
		const ang = Math.atan2(y2 - y1, x2 - x1);
		// Наконечник стрелки чуть не доходит до стекла
		const hx = x2 - Math.cos(ang) * 10;
		const hy = y2 - Math.sin(ang) * 10;
		return {
			...r,
			blocked: Boolean(r.reason),
			x2,
			y2,
			deg: f1((ang * 180) / Math.PI),
			head: `translate(${f1(hx)} ${f1(hy)})`,
			front: `M${String(x1)},${String(y1)} L${f1(x2)},${f1(y2)}`,
			behind: r.to ? `M${f1(x2)},${f1(y2)} L${String(r.to[0])},${String(r.to[1])}` : '',
			labelW: (r.reason?.length ?? 0) * LABEL_CHAR + 16
		};
	});

	// Дракон: логотип вписан в ширину DRAGON.w и повёрнут в плоскость слоёв
	const DRAGON_SCALE = DRAGON.w / DRAGON_BOX.width;
	const dragonFit = `scale(${String(DRAGON_SCALE)}) translate(${String(-(DRAGON_BOX.x + DRAGON_BOX.width / 2))} ${String(-(DRAGON_BOX.y + DRAGON_BOX.height / 2))}) ${DRAGON_TRANSFORM}`;
</script>

<svg
	class="hl-wrap firewall {className}"
	viewBox="0 10 900 580"
	role="img"
	aria-label={label}
	style="--hl-accent: {accent}"
>
	<defs>
		<clipPath id="fw-bricks">
			<path d={SHIELD} transform="scale(0.8) translate(0 4)" />
		</clipPath>
	</defs>

	<!-- ─── Слой 3: щит с кирпичной кладкой ─── -->
	<g transform="translate({BACK.x} {BACK.y}) {TURN} scale({BACK.s})">
		<path class="rim-face" d={SHIELD} />
		<path class="rim" d={SHIELD} />
		<g clip-path="url(#fw-bricks)">
			{#each bricks as b (`${String(b.x)}:${String(b.y)}`)}
				<rect class="l brick" x={b.x} y={b.y} width={BRICK_W} height={BRICK_H} />
			{/each}
		</g>
		<path class="l accent-line" d={SHIELD} transform="scale(0.8) translate(0 4)" />
	</g>

	<!-- ─── Слой 2: дракон NginxionS ─── -->
	<g transform="translate({DRAGON.x} {DRAGON.y}) {DRAGON_TURN}">
		<path class="dragon" transform={dragonFit} d={DRAGON_PATH} />
	</g>

	<!-- Пропущенный трафик за стеклом: виден сквозь него -->
	{#each impacts as r, k (k)}
		{#if r.to}
			<g class="req pass" style="--delay: {r.delay}s">
				<path class="trail" d={r.behind} />
				<path class="packet packet-behind" d={r.behind} pathLength="100" />
				<circle class="arrive" cx={r.to[0]} cy={r.to[1]} r="4" />
			</g>
		{/if}
	{/each}

	<!-- ─── Слой 1: стеклянный щит ─── -->
	<g transform="translate({FRONT.x} {FRONT.y})">
		<!-- Толщина стекла: задняя грань и рёбра -->
		<g transform="translate({FRONT.dx} {FRONT.dy}) {TURN} scale({FRONT.s})">
			<path class="l glass-back" d={SHIELD} />
		</g>
		<g transform="{TURN} scale({FRONT.s})">
			{#each corners as [cx, cy] (`${String(cx)}:${String(cy)}`)}
				<line
					class="l"
					x1={cx}
					y1={cy}
					x2={cx + FRONT.dx / FRONT.s / 0.8}
					y2={cy + (FRONT.dy + 0.27 * FRONT.dx) / FRONT.s}
				/>
			{/each}
			<path class="l glass" d={SHIELD} />
			<path class="l faint" d={SHIELD} transform="scale(0.88) translate(0 3)" />
		</g>
	</g>

	<!-- ─── Запросы перед стеклом ─── -->
	{#each impacts as r, k (k)}
		<g class="req" class:blocked={r.blocked} class:pass={!r.blocked} style="--delay: {r.delay}s">
			<path class="trail" d={r.front} />
			<path class="packet packet-front" d={r.front} pathLength="100" />
			<path class="head" d="M-9,-5 L0,0 L-9,5" transform="{r.head} rotate({r.deg})" />
			{#if r.blocked}
				<g class="verdict" transform="translate({f1(r.x2)} {f1(r.y2)})">
					<circle class="verdict-ring" r="9" />
					<path class="verdict-x" d="M-4,-4 L4,4 M4,-4 L-4,4" />
					<g transform="translate({f1(-r.labelW / 2)} 16)">
						<rect class="tag" width={r.labelW} height="20" rx="10" />
						<text class="tag-text" x={r.labelW / 2} y="14">{r.reason}</text>
					</g>
				</g>
			{:else}
				<circle class="pass-dot" cx={r.x2} cy={r.y2} r="3" />
			{/if}
		</g>
	{/each}
</svg>

<style>
	.firewall {
		/* Цвета --hl-* задаёт тема сайта: routes/illustration-theme.css (.hl-wrap) */
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
	}

	.l {
		fill: none;
		stroke: var(--hl-line);
		stroke-width: 1.2;
		stroke-linecap: round;
		stroke-linejoin: round;
		vector-effect: non-scaling-stroke;
	}

	.faint {
		stroke: var(--hl-faint);
	}

	.fill {
		fill: var(--hl-bg);
	}


	/* ─── Задний двойной щит ─── */
	.accent-line {
		stroke: var(--hl-accent);
	}


	.rim-face {
		fill: var(--hl-bg);
	}

	.rim {
		fill: none;
		stroke: var(--hl-accent);
		stroke-width: 9;
		stroke-linejoin: round;
	}

	.brick {
		stroke: color-mix(in srgb, var(--hl-accent) 45%, var(--hl-faint));
		stroke-width: 1;
	}

	/* ─── Дракон ─── */
	.dragon {
		fill: var(--hl-bg);
		stroke: var(--hl-line);
		stroke-width: 1.4;
		stroke-linejoin: round;
		vector-effect: non-scaling-stroke;
	}


	/* ─── Стеклянный щит ─── */
	.glass {
		fill: color-mix(in srgb, var(--hl-bg) 62%, transparent);
		stroke-width: 1.4;
	}

	.glass-back {
		fill: color-mix(in srgb, var(--hl-bg) 40%, transparent);
		stroke-opacity: 0.55;
	}

	/* ─── Запросы ─── */
	/* Цикл 3.6 с: пакет летит до стекла (0–40%), дальше — вердикт */
	.req {
		--cycle: 3.6s;
	}

	.trail {
		fill: none;
		stroke: var(--hl-faint);
		stroke-width: 1.4;
		stroke-dasharray: 7 7;
		vector-effect: non-scaling-stroke;
		animation: trail-flow 1.2s linear infinite;
	}

	.blocked .trail {
		stroke: color-mix(in srgb, var(--hl-accent) 55%, transparent);
	}

	.head {
		fill: none;
		stroke: var(--hl-txt);
		stroke-width: 1.6;
		stroke-linecap: round;
		stroke-linejoin: round;
		vector-effect: non-scaling-stroke;
	}

	.blocked .head {
		stroke: var(--hl-accent);
	}

	.packet {
		fill: none;
		stroke: var(--hl-line);
		stroke-width: 2.6;
		stroke-linecap: round;
		stroke-dasharray: 16 200;
		stroke-dashoffset: 16;
		vector-effect: non-scaling-stroke;
		animation: var(--cycle) linear infinite;
		animation-delay: var(--delay);
	}

	.packet-front {
		animation-name: packet-front;
	}

	.packet-behind {
		animation-name: packet-behind;
	}

	.blocked .packet {
		stroke: var(--hl-accent);
	}

	.pass-dot {
		fill: var(--hl-txt);
	}

	.arrive {
		fill: var(--hl-bg);
		stroke: var(--hl-line);
		stroke-width: 1.4;
		vector-effect: non-scaling-stroke;
		animation: arrive var(--cycle) ease-out infinite;
		animation-delay: var(--delay);
	}

	/* Вердикт блокировки: «×» и причина под ним */
	.verdict {
		opacity: 0;
		animation: verdict var(--cycle) ease-out infinite;
		animation-delay: var(--delay);
	}

	.verdict-ring {
		fill: var(--hl-bg);
		stroke: var(--hl-accent);
		stroke-width: 1.4;
		vector-effect: non-scaling-stroke;
	}

	.verdict-x {
		fill: none;
		stroke: var(--hl-accent);
		stroke-width: 1.8;
		stroke-linecap: round;
		vector-effect: non-scaling-stroke;
	}

	.tag {
		fill: var(--hl-bg);
		stroke: color-mix(in srgb, var(--hl-accent) 60%, transparent);
		stroke-width: 1;
		vector-effect: non-scaling-stroke;
	}

	.tag-text {
		fill: var(--hl-accent);
		font-family: var(--font-mono);
		font-size: 11px;
		text-anchor: middle;
	}

	@keyframes trail-flow {
		to {
			stroke-dashoffset: -14;
		}
	}

	@keyframes packet-front {
		0% {
			stroke-dashoffset: 16;
		}
		40%,
		100% {
			stroke-dashoffset: -100;
		}
	}

	@keyframes packet-behind {
		0%,
		38% {
			stroke-dashoffset: 16;
		}
		65%,
		100% {
			stroke-dashoffset: -100;
		}
	}

	@keyframes arrive {
		0%,
		62% {
			fill: var(--hl-bg);
		}
		68%,
		85% {
			fill: var(--hl-line);
		}
		100% {
			fill: var(--hl-bg);
		}
	}

	@keyframes verdict {
		0%,
		36% {
			opacity: 0;
		}
		40%,
		88% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.trail,
		.packet,
		.arrive {
			animation: none;
		}

		.verdict {
			animation: none;
			opacity: 1;
		}
	}
</style>
