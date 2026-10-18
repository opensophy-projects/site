<script lang="ts">
	import { onMount } from 'svelte';
	import { cn } from '$lib/utils/cn';
	import ServerIllustration from './ServerIllustration.svelte';

	type Mode = 'naive' | 'script';
	type Lane = { x: number; y: number; op: number; xo: number; arm: number; lit: boolean };
	type Frame = { lanes: Lane[]; hiC: number[]; badC: number[]; msg: string; lit: boolean };

	type Props = {
		/** 'naive' — без скрипта (в bundle только Root CA); 'script' — с mtls.sh (по CA на клиента). */
		mode?: Mode;
		/** Переопределяет акцентный цвет (по умолчанию — токен темы). */
		accent?: string;
		showControls?: boolean;
		showCaption?: boolean;
		class?: string;
	};

	let {
		mode = $bindable('naive'),
		accent,
		showControls = true,
		showCaption = true,
		class: className = ''
	}: Props = $props();

	// Геометрия схемы (viewBox 880×400, без масштабирования — шрифты не растягиваются)
	const LY = [168, 248, 328];
	const NAMES = ['обычный запрос', 'клиент 1', 'клиент 2'];
	const CARD_X = 24;
	const CARD_W = 160;
	const GX = 470;
	const GW = 36;
	const CX = GX + GW / 2; // центр шлюза и bundle
	const DOC = GX - 26; // где документ останавливается перед дверью
	const X0 = 224; // где документ появляется
	const BX = 700; // левый край сервера
	const SW = 150; // ширина сервера
	const MY = 248; // общая линия к серверу
	const MX = GX + GW + 40; // где дорожки начинают сходиться
	const MS = 90; // длина схождения
	const WALL = [
		[122, 143],
		[193, 223],
		[273, 303],
		[353, 372]
	];

	let revoked = $state([false, true]); // клиент 1, клиент 2
	let hovered = $state(-1);
	let frame = $state<Frame>({
		lanes: LY.map((y) => ({ x: X0, y, op: 0, xo: 0, arm: 0, lit: false })),
		hiC: [],
		badC: [],
		msg: '',
		lit: false
	});

	const naive = $derived(mode === 'naive');
	const pass = $derived([false, naive || !revoked[0], naive || !revoked[1]]);
	const status = $derived(
		hovered < 1
			? 'наведите на клиента, клик — отозвать'
			: `${NAMES[hovered]} · ${revoked[hovered - 1] ? 'отозван' : 'действует'} · ${pass[hovered] ? 'пропущен' : 'отклонён'}`
	);

	const chipC = (m: Mode, i: number) => (m === 'naive' ? CX : i === 1 ? CX - 80 : CX + 80);
	const chipW = (m: Mode) => (m === 'naive' ? 170 : 140);
	const crossD = (x: number, y: number, a: number) =>
		`M${String(x - a)} ${String(y - a)}L${String(x + a)} ${String(y + a)}M${String(x + a)} ${String(y - a)}L${String(x - a)} ${String(y + a)}`;
	const sm = (p: number) => {
		const c = Math.min(1, Math.max(0, p));
		return c * c * (3 - 2 * c);
	};
	const pr = (t: number, a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));

	function toggleRevoked(i: number) {
		revoked[i - 1] = !revoked[i - 1];
	}

	function onLaneKey(e: KeyboardEvent, i: number) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			toggleRevoked(i);
		}
	}

	let root = $state<HTMLElement | null>(null);

	onMount(() => {
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		let raf = 0;
		let visible = true;

		const tick = (now: number) => {
			raf = 0;
			const t = reduce ? 2.4 : now / 1000;
			const hiC: number[] = [];
			const badC: number[] = [];
			let msg = '';

			const lanes = LY.map((_, i): Lane => {
				const ph = (t / 4.4 + i * 0.3) % 1;
				const allowed = pass[i];
				let x: number;
				let op = 1;
				let xo = 0;
				let lit = false;

				if (ph < 0.5) x = X0 + (DOC - X0) * sm(ph / 0.5);
				else if (ph < 0.62) x = DOC;
				else if (allowed) {
					x = DOC + (BX - 30 - DOC) * sm(pr(ph, 0.62, 0.92));
					if (ph > 0.8) {
						op = Math.max(0, 1 - (ph - 0.8) / 0.12);
						if (ph < 0.9) lit = true;
					}
				} else {
					x = DOC - (DOC - (X0 + 10)) * sm(pr(ph, 0.62, 0.92));
					op = Math.max(0, 1 - pr(ph, 0.64, 0.92));
					xo = ph > 0.5 && ph < 0.82 ? 1 : 0;
				}
				if (ph > 0.94) op = 0;

				if (ph > 0.48 && ph < 0.64 && i > 0) {
					if (naive) hiC.push(CX);
					else if (!revoked[i - 1]) hiC.push(chipC(mode, i));
					else badC.push(chipC(mode, i));
				}
				if (ph > 0.55 && ph < 0.9 && !msg) {
					if (i === 0) msg = 'без сертификата: отклонён';
					else if (revoked[i - 1])
						msg = naive ? 'отозванный сертификат прошёл ✕' : 'отозванный сертификат отклонён ✓';
				}

				const arm = allowed ? sm(pr(ph, 0.4, 0.56)) * (1 - sm(pr(ph, 0.88, 0.97))) : 0;
				// после шлюза документ сходится на общую линию к серверу
				const y = LY[i] + (MY - LY[i]) * sm(pr(x, MX, MX + MS));
				return { x, y, op, xo, arm, lit };
			});

			frame = { lanes, hiC: [...new Set(hiC)], badC, msg, lit: lanes.some((l) => l.lit) };
			if (visible) raf = requestAnimationFrame(tick);
		};

		const start = () => {
			if (!raf) raf = requestAnimationFrame(tick);
		};

		start();

		const io = new IntersectionObserver((entries) => {
			visible = entries[entries.length - 1]?.isIntersecting ?? true;
			if (visible) start();
		});
		if (root) io.observe(root);

		return () => {
			visible = false;
			cancelAnimationFrame(raf);
			io.disconnect();
		};
	});
</script>

<div
	bind:this={root}
	class={cn('mtls mx-auto w-full rounded-xl bg-background-inset p-1.5', className)}
	style:--mt-accent={accent}
>
	<div class="overflow-hidden rounded-lg border border-border bg-background card">
		<!-- Шапка -->
		<div
			class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-border px-5 py-3"
		>
			<h3 class="text-base font-medium tracking-tight text-foreground">mTLS в Traefik</h3>
			<span class="status-line font-mono text-xs text-foreground-muted">{status}</span>
		</div>

		<!-- Схема -->
		<div class="px-2 pt-2">
			<svg
				viewBox="0 0 880 400"
				role="img"
				aria-label="Вид сверху: клиенты, шлюз Traefik с bundle сертификатов и бэкенд-сервер"
				class="block h-auto w-full"
			>
				<!-- Root CA -->
				<rect class="client-shell" x={CARD_X} y="26" width={CARD_W} height="52" rx="12" />
				<rect class="client-card" x={CARD_X + 3} y="29" width={CARD_W - 6} height="46" rx="9" />
				<text class="t c" x={CARD_X + CARD_W / 2} y="49">Root CA</text>
				<text class="s c" x={CARD_X + CARD_W / 2} y="66">{naive ? 'подписывает всех' : 'подписывает CA'}</text>

				<!-- bundle -->
				<rect class="client-shell" x={CX - 220} y="14" width="440" height="80" rx="14" />
				<rect class="client-card" x={CX - 217} y="17" width="434" height="74" rx="11" />
				<text class="s c" x={CX} y="35">bundle у Traefik: каким CA он доверяет</text>
				{#if naive}
					<rect class="client-shell" x={CX - 85} y="46" width="170" height="34" rx="17" />
					<rect class="client-card" x={CX - 82} y="49" width="164" height="28" rx="14" />
					<text class="t c" x={CX} y="68">Root CA</text>
				{:else}
					{#each [1, 2] as i (i)}
						{#if revoked[i - 1]}
							<rect
								class="bx dash"
								x={chipC(mode, i) - chipW(mode) / 2}
								y="46"
								width={chipW(mode)}
								height="34"
								rx="17"
							/>
							<text class="t c gone" x={chipC(mode, i)} y="68">CA клиента {i}</text>
						{:else}
							<rect class="client-shell" x={chipC(mode, i) - chipW(mode) / 2} y="46" width={chipW(mode)} height="34" rx="17" />
							<rect class="client-card" x={chipC(mode, i) - chipW(mode) / 2 + 3} y="49" width={chipW(mode) - 6} height="28" rx="14" />
							<text class="t c" x={chipC(mode, i)} y="68">CA клиента {i}</text>
						{/if}
					{/each}
				{/if}
				<path class="ln" d="M{CARD_X + CARD_W} 52H{CX - 220}" />
				<path class="ln" d="M{CX} 94V122" />

				<!-- стена шлюза -->
				{#each WALL as r (r[0])}
					<rect class="wall" x={GX} y={r[0]} width={GW} height={r[1] - r[0]} rx="5" />
				{/each}
				<text class="t c" x={CX} y="392">шлюз Traefik</text>

				<!-- дорожки и клиенты -->
				{#each LY as y, i (y)}
					<path class="rail" class:hi={hovered === i} d="M{CARD_X + CARD_W} {y}H{GX}" />
					<path
						class="rail"
						d="M{GX + GW} {y}H{MX}C{MX + MS / 3} {y} {MX + (2 * MS) / 3} {MY} {MX + MS} {MY}H{BX}"
					/>
					<rect class="client-shell" class:hi={hovered === i} x={CARD_X} y={y - 26} width={CARD_W} height="52" rx="12" />
					<rect class="client-card" class:hi={hovered === i} x={CARD_X + 3} y={y - 23} width={CARD_W - 6} height="46" rx="9" />
					<text class="t" x={CARD_X + 16} y={y - 3}>{NAMES[i]}</text>
					<text class="s" x={CARD_X + 16} y={y + 15}>
						{i === 0 ? 'без сертификата' : revoked[i - 1] ? 'отозван' : 'mTLS'}
					</text>
					{#if i > 0 && revoked[i - 1]}<path class="xm" d={crossD(CARD_X + CARD_W - 20, y - 8, 7)} />{/if}
				{/each}

				<!-- бэкенд: один сервер -->
				<ServerIllustration x={BX} y={MY - 86} width={SW} height={(SW * 180) / 150} lit={frame.lit} />
				<text class="t c" x={BX + SW / 2} y="392">бэкенд</text>

				<!-- анимация: двери, документы -->
				{#each LY as y, i (y)}
					{@const L = frame.lanes[i]}
					<rect class="door" x={GX + 5} y={y - 22} width={GW - 10} height={44 * (1 - L.arm)} rx="3" />
					<g opacity={L.op}>
						<rect class="dc" x={L.x - 24} y={L.y - 17} width="48" height="34" rx="6" />
						{#each [0, 1, 2] as j (j)}
							<path class="dl" d="M{L.x - 17} {L.y - 8 + j * 8}H{L.x + (j === 2 ? -2 : 4)}" />
						{/each}
						{#if i > 0}
							<circle class={revoked[i - 1] ? 'sealr' : 'seal'} cx={L.x + 14} cy={L.y + 4} r="7" />
						{/if}
					</g>
					{#if L.xo}<path class="xm" opacity={L.xo} d={crossD(GX - 26, y, 9)} />{/if}
				{/each}

				<!-- подсветка проверки в bundle -->
				{#each frame.hiC as c (c)}
					<rect class="client-shell on" x={c - chipW(mode) / 2} y="46" width={chipW(mode)} height="34" rx="17" />
					<rect class="client-card on" x={c - chipW(mode) / 2 + 3} y="49" width={chipW(mode) - 6} height="28" rx="14" />
					<text class="t c" x={c}  y="68">{naive ? 'Root CA' : `CA клиента ${c === CX - 80 ? 1 : 2}`}</text>
				{/each}
				{#each frame.badC as c (c)}
					<path class="xm" d={crossD(c, 63, 12)} />
				{/each}

				<!-- зоны клика: клиент 1 и клиент 2 -->
				{#each [1, 2] as i (i)}
					<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
					<rect
						class="hit"
						x={CARD_X}
						y={LY[i] - 38}
						width={GX - CARD_X}
						height="76"
						role="button"
						tabindex="0"
						aria-pressed={revoked[i - 1]}
						aria-label={`${NAMES[i]}: ${revoked[i - 1] ? 'вернуть сертификат' : 'отозвать сертификат'}`}
						onpointerenter={() => (hovered = i)}
						onpointerleave={() => (hovered = -1)}
						onfocus={() => (hovered = i)}
						onblur={() => (hovered = -1)}
						onclick={() => { toggleRevoked(i); }}
						onkeydown={(e) => { onLaneKey(e, i); }}
					/>
				{/each}
			</svg>
		</div>

		<div class="message-line px-5 text-sm font-medium text-accent-fixed" aria-live="polite">{frame.msg}</div>

		{#if showCaption || showControls}
			<div class="relative flex flex-col gap-4 px-5 pt-5 pb-5 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-border">
				{#if showCaption}
					<div>
						<div class="text-lg font-medium tracking-tight text-foreground">
							Как Traefik отзывает сертификаты
						</div>
						<p class="mt-2 min-h-24 text-base leading-relaxed text-pretty text-foreground-muted sm:min-h-20">
							{#if naive}
								<strong class="font-medium text-accent-fixed">Проблема.</strong>
								Шлюз пропускает только тех, чей сертификат подписан CA из bundle. Здесь это один
								Root CA, а проверки отзыва (<code class="font-mono text-sm">crlFile</code>) у
								Traefik нет. Поэтому отозванный клиент (пунктирная печать) всё равно проходит.
							{:else}
								<strong class="font-medium text-accent-fixed">Решение.</strong>
								У каждого клиента свой промежуточный CA, и в bundle лежат только живые. Отозвали
								клиента, скрипт убрал его CA из bundle: шлюз не находит, чем проверить
								сертификат, и дверь остаётся закрытой. CRL не нужен.
							{/if}
						</p>
					</div>
				{/if}

				{#if showControls}
					<div class="flex flex-wrap items-center gap-3">
						<div class="inset-shadow inline-flex rounded-sm bg-background-inset p-1" role="group" aria-label="Режим">
							{#each [{ id: 'naive', label: 'без скрипта' }, { id: 'script', label: 'с mtls.sh' }] as opt (opt.id)}
								<button
									type="button"
									aria-pressed={mode === opt.id}
									class={cn(
										'rounded-xs px-3 py-1.5 text-sm font-medium transition-[color,background-color,scale] duration-150 ease-out active:scale-[0.97]',
										mode === opt.id
											? 'bg-background text-accent card'
											: 'text-foreground-muted hover:text-foreground'
									)}
									onclick={() => (mode = opt.id as Mode)}
								>
									{opt.label}
								</button>
							{/each}
						</div>

						<div class="inset-shadow inline-flex rounded-sm bg-background-inset p-1" role="group" aria-label="Отзыв сертификатов">
							{#each [1, 2] as i (i)}
								<button
									type="button"
									aria-pressed={revoked[i - 1]}
									class={cn(
										'inline-flex items-center gap-2 rounded-xs px-3 py-1.5 text-sm font-medium transition-[color,background-color,scale] duration-150 ease-out active:scale-[0.97]',
										revoked[i - 1]
											? 'bg-background text-foreground card'
											: 'text-foreground-muted hover:text-foreground'
									)}
									onclick={() => { toggleRevoked(i); }}
								>
									<span
										class={cn(
											'size-1.5 rounded-full transition-colors duration-150',
											revoked[i - 1] ? 'bg-accent-fixed' : 'bg-foreground-muted/50'
										)}
									></span>
									Клиент {i}: {revoked[i - 1] ? 'отозван' : 'действует'}
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.status-line {
		flex: 0 0 auto;
		min-width: 19rem;
		max-width: 100%;
		min-height: 1.25rem;
		text-align: right;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.message-line {
		display: flex;
		align-items: center;
		min-height: 2.75rem;
		max-height: 2.75rem;
		line-height: 1.25rem;
		overflow: hidden;
	}

	/* Единый стиль карточек: внешняя «оболочка» + внутренняя карточка */
	.client-shell {
		fill: var(--color-background-inset);
		stroke: color-mix(in srgb, var(--color-foreground-muted) 22%, transparent);
		stroke-width: 1;
		transition: stroke 150ms ease-out;
	}
	.client-card {
		fill: var(--color-background);
		stroke: var(--color-border);
		stroke-width: 1.2;
		transition:
			stroke 150ms ease-out,
			fill 150ms ease-out;
	}
	.client-card.hi {
		stroke: var(--mt-accent);
		stroke-width: 2;
	}
	.client-shell.hi {
		stroke: color-mix(in srgb, var(--mt-accent) 35%, transparent);
	}
	.client-card.on {
		fill: var(--mt-hi-fill);
		stroke: var(--mt-accent);
		stroke-width: 2;
	}
	.client-shell.on {
		stroke: color-mix(in srgb, var(--mt-accent) 35%, transparent);
	}

	.mtls {
		--mt-accent: var(--color-accent);
		--mt-line: color-mix(in srgb, var(--color-foreground-muted) 75%, transparent);
		--mt-soft: var(--color-border);
		--mt-hi-fill: color-mix(in srgb, var(--mt-accent) 14%, var(--color-background));
	}

	/* accent-fixed: цвет акцента, который можно переопределить пропсом accent */
	.mtls :global(.text-accent-fixed) {
		color: var(--mt-accent);
	}
	.mtls :global(.bg-accent-fixed) {
		background-color: var(--mt-accent);
	}

	svg {
		touch-action: manipulation;
	}

	.bx {
		fill: var(--color-background-inset);
		stroke: var(--mt-line);
		stroke-width: 1.4;
	}
	.bx.dash {
		fill: none;
		stroke-dasharray: 5 4;
		stroke-width: 1.2;
	}
	.rail {
		fill: none;
		stroke: var(--mt-soft);
		stroke-width: 10;
		stroke-linecap: round;
		transition: stroke 150ms ease-out;
	}
	.rail.hi {
		stroke: var(--mt-hi-fill);
	}
	.wall {
		fill: var(--mt-line);
	}
	.door {
		fill: var(--mt-accent);
	}

	.t {
		font:
			600 14px system-ui,
			sans-serif;
		fill: var(--color-foreground);
	}
	.s {
		font:
			12px system-ui,
			sans-serif;
		fill: var(--color-foreground-muted);
	}
	.c {
		text-anchor: middle;
	}
	.gone {
		text-decoration: line-through;
		fill: var(--color-foreground-muted);
	}

	.ln {
		fill: none;
		stroke: var(--color-foreground-muted);
		stroke-width: 1.2;
		stroke-dasharray: 4 4;
		opacity: 0.6;
	}
	.dc {
		fill: var(--color-background);
		stroke: var(--color-foreground);
		stroke-width: 1.5;
	}
	.dl {
		fill: none;
		stroke: var(--mt-soft);
		stroke-width: 2;
		stroke-linecap: round;
	}
	.seal {
		fill: var(--mt-accent);
	}
	.sealr {
		fill: none;
		stroke: var(--mt-accent);
		stroke-width: 2;
		stroke-dasharray: 3 3;
	}
	.xm {
		fill: none;
		stroke: var(--mt-accent);
		stroke-width: 3;
		stroke-linecap: round;
	}
	.hit {
		fill: transparent;
		cursor: pointer;
		outline: none;
	}
	.hit:focus-visible {
		stroke: var(--mt-accent);
		stroke-width: 2;
		rx: 12;
	}

	@media (max-width: 640px) {
		.status-line {
			min-width: 0;
			width: 100%;
			text-align: left;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.client-shell,
		.client-card,
		.rail {
			transition: none;
		}
	}
</style>