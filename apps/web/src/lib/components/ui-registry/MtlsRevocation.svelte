<script module lang="ts">
	import { SERVER } from './ServerIllustration.svelte';

	type PathItem = { k: 'p'; d: string; c: string; o?: number };

	export type Mode = 'naive' | 'script';
	type TextItem = { k: 't'; x: number; y: number; c: string; s: string };
	type Item = PathItem | TextItem;
	type Lane = { x: number; y: number; op: number; xo: number; arm: number; lit: boolean };
	export type Frame = { lanes: Lane[]; hiC: number[]; badC: number[]; msg: string; lit: boolean };
	type Scene = { back: Item[]; front: Item[] };
	type Pt = [number, number];

	// ───────── Геометрия схемы ─────────
	// Всё нарисовано в одной изометрии, как сервер: объекты — «коробки» с тремя гранями,
	// поток идёт по экрану слева направо. viewBox 880×440, масштаб 1: шрифты не растягиваются.
	const K = Math.sqrt(3) / 2;
	const NAMES = ['обычный запрос', 'клиент 1', 'клиент 2'];
	const LY = [190, 270, 350]; // линии клиентов
	const MY = 270; // общая линия к серверу
	const LABEL_X = 24; // подписи слева
	const CLX = 188; // центр коробки клиента
	const CH = 12; // её полуразмер
	const CZ = 14; // её высота
	const GCX = 488; // центр шлюза (ряд столбиков) и bundle
	const GH = 9; // полуразмер столбика
	const POST_Z = 26; // высота столбика
	const DOOR_Z = 24; // высота «двери» — выдвижного столбика
	const POST_Y = [150, 230, 310, 390]; // столбики между линиями
	const X0 = 236; // где сертификат появляется
	const DOC = GCX - 66; // где он останавливается перед дверью
	const SX = 730; // центр сервера
	const SERVER_LEFT = SX - 2 * K * SERVER.H; // левый угол сервера: сюда впадают все линии
	const END = SERVER_LEFT - 16; // где сертификат гаснет у сервера
	const MX = GCX + 2 * K * GH + 30; // где линии начинают сходиться
	const MS = 100; // длина схождения
	const ROOT = { x: CLX, y: 88, h: 12, z: 16 };
	const SLAB = { x0: GCX - 220, x1: GCX + 220, b1: 104, depth: 38, z: 14 };
	const SLAB_MID = SLAB.b1 - SLAB.depth / 2 - SLAB.z; // середина верхней грани полки bundle
	const CHIP = { h: 8, z: 9 };

	const f = (v: number) => Math.round(v * 10) / 10;
	const num = (v: number) => String(f(v));
	const poly = (a: Pt[], close = true) =>
		`M${a.map((q) => `${num(q[0])} ${num(q[1])}`).join('L')}${close ? 'Z' : ''}`;
	const proj = (ox: number, oy: number) => (x: number, y: number, z: number): Pt => [
		ox + (x - y) * K,
		oy + (x + y) / 2 - z
	];
	const p = (d: string, c: string, o?: number): PathItem => ({ k: 'p', d, c, o });
	const tx = (x: number, y: number, c: string, s: string): TextItem => ({ k: 't', x, y, c, s });
	const crossD = (x: number, y: number, a: number) =>
		`M${num(x - a)} ${num(y - a)}L${num(x + a)} ${num(y + a)}M${num(x + a)} ${num(y - a)}L${num(x - a)} ${num(y + a)}`;
	const sm = (v: number) => {
		const c = Math.min(1, Math.max(0, v));
		return c * c * (3 - 2 * c);
	};
	const pr = (t: number, a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));

	/** Коробка с центром основания (ox, oy): левая, правая и верхняя грани, как у сервера. */
	function box(ox: number, oy: number, hx: number, hy: number, z0: number, z1: number, c = ''): PathItem[] {
		const P = proj(ox, oy);
		return [
			p(poly([P(-hx, hy, z0), P(hx, hy, z0), P(hx, hy, z1), P(-hx, hy, z1)]), `ln fl ${c}`),
			p(poly([P(hx, -hy, z0), P(hx, hy, z0), P(hx, hy, z1), P(hx, -hy, z1)]), `ln fr ${c}`),
			p(poly([P(-hx, -hy, z1), P(hx, -hy, z1), P(hx, hy, z1), P(-hx, hy, z1)]), `ln ft ${c}`)
		];
	}
	/** Контур на верхней грани (вставка, ромб на полу). */
	function diamond(ox: number, oy: number, h: number, z: number, c: string, inset = 0): PathItem {
		const P = proj(ox, oy);
		const a = h - inset;
		return p(poly([P(-a, -a, z), P(a, -a, z), P(a, a, z), P(-a, a, z)]), c);
	}
	/** Круг на горизонтальной плоскости: в изометрии это эллипс. */
	function ring(ox: number, oy: number, cx: number, cy: number, z: number, r: number): Pt[] {
		const P = proj(ox, oy);
		return Array.from({ length: 14 }, (_, i) =>
			P(cx + r * Math.cos((2 * Math.PI * i) / 14), cy + r * Math.sin((2 * Math.PI * i) / 14), z)
		);
	}
	/** Светодиод на левой грани. */
	function led(ox: number, oy: number, x: number, hy: number, z: number, c: string): PathItem {
		const q = proj(ox, oy)(x, hy, z);
		return p(`M${num(q[0])} ${num(q[1])}h.01`, c);
	}

	/** Сертификат: плоская пластинка над линией; печать на верхней грани. */
	function card(cx: number, cy: number, revoked: boolean, seal: boolean, op: number): PathItem[] {
		const hx = 14;
		const hy = 10;
		const z0 = 6;
		const z1 = 9;
		const P = proj(cx, cy);
		const items: PathItem[] = [
			...box(cx, cy, hx, hy, z0, z1, 'dc'),
			p(poly([P(-hx + 3, -5, z1), P(hx - 3, -5, z1)], false), 'ln dl'),
			p(poly([P(-hx + 3, -1, z1), P(hx - 3, -1, z1)], false), 'ln dl'),
			p(poly([P(-hx + 3, 3, z1), P(hx - 10, 3, z1)], false), 'ln dl')
		];
		if (seal) items.push(p(poly(ring(cx, cy, 8, 3.5, z1, 3.2)), revoked ? 'sealr' : 'seal'));
		return items.map((it) => ({ ...it, o: op }));
	}

	/** Центры чипов в bundle: без скрипта один Root CA, со скриптом по CA на клиента. */
	const chipCenter = (m: Mode, id: number) => (m === 'naive' ? GCX : id === 1 ? GCX - 80 : GCX + 80);
	const chipIds = (m: Mode) => (m === 'naive' ? [0] : [1, 2]);

	/** Кадр анимации: где сейчас сертификаты, какие двери открыты, что подсвечено в bundle. */
	export function computeFrame(t: number, mode: Mode, revoked: boolean[]): Frame {
		const naive = mode === 'naive';
		const pass = [false, naive || !revoked[0], naive || !revoked[1]];
		const hiC: number[] = [];
		const badC: number[] = [];
		let msg = '';

		const lanes = LY.map((ly, i): Lane => {
			const ph = (t / 4.4 + i * 0.3) % 1;
			const allowed = pass[i];
			let x: number;
			let op = 1;
			let xo = 0;
			let lit = false;

			if (ph < 0.5) x = X0 + (DOC - X0) * sm(ph / 0.5);
			else if (ph < 0.62) x = DOC;
			else if (allowed) {
				x = DOC + (END - DOC) * sm(pr(ph, 0.62, 0.92));
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
				if (naive) hiC.push(0);
				else if (!revoked[i - 1]) hiC.push(i);
				else badC.push(i);
			}
			if (ph > 0.55 && ph < 0.9 && !msg) {
				if (i === 0) msg = 'без сертификата: отклонён';
				else if (revoked[i - 1])
					msg = naive ? 'отозванный сертификат прошёл ✕' : 'отозванный сертификат отклонён ✓';
			}

			const arm = allowed ? sm(pr(ph, 0.4, 0.56)) * (1 - sm(pr(ph, 0.88, 0.97))) : 0;
			// после шлюза сертификат сходится на общую линию к серверу
			const y = ly + (MY - ly) * sm(pr(x, MX, MX + MS));
			return { x, y, op, xo, arm, lit };
		});

		return { lanes, hiC: [...new Set(hiC)], badC, msg, lit: lanes.some((l) => l.lit) };
	}

	/** Вся схема, кроме сервера, двумя слоями: ‘back’ рисуется до сервера, ‘front’ — после (подписи, крестики). */
	export function build(s: { mode: Mode; revoked: boolean[]; hovered: number; frame: Frame }): Scene {
		const { mode, revoked, hovered, frame } = s;
		const naive = mode === 'naive';
		const back: Item[] = [];
		const front: Item[] = [];

		// Дорожки по полу: сначала все контуры, потом все заливки, чтобы сходящиеся линии слились в одну.
		const rail = (y: number) =>
			`M${num(CLX + 2 * K * CH)} ${num(y)}H${num(MX)}C${num(MX + MS / 3)} ${num(y)} ${num(MX + (2 * MS) / 3)} ${num(MY)} ${num(MX + MS)} ${num(MY)}H${num(SERVER_LEFT)}`;
		for (const y of LY) back.push(p(rail(y), 'rail-o'));
		LY.forEach((y, i) => back.push(p(rail(y), hovered === i ? 'rail-i on' : 'rail-i')));
		back.push(p(`M${num(ROOT.x + 2 * K * ROOT.h)} ${num(ROOT.y)}H${num(SLAB.x0)}`, 'link'));
		back.push(p(`M${num(GCX)} ${num(SLAB.b1)}V${num((POST_Y[0] ?? 150) - GH)}`, 'link'));

		// Объекты сортируются по глубине: что ниже на экране, то ближе к зрителю.
		type Obj = { key: number; sub: number; items: PathItem[] };
		const objs: Obj[] = [];

		// Root CA
		objs.push({
			key: ROOT.y,
			sub: ROOT.x,
			items: [
				...box(ROOT.x, ROOT.y, ROOT.h, ROOT.h, 0, ROOT.z),
				diamond(ROOT.x, ROOT.y, ROOT.h, ROOT.z, 'ln lo', 3),
				p(poly(ring(ROOT.x, ROOT.y, 0, 0, ROOT.z, 4.5)), 'seal')
			]
		});

		// bundle: полка и чипы на ней
		const slabP = (x: number, y: number): Pt => [x, y];
		const slab: PathItem[] = [
			p(
				poly([
					slabP(SLAB.x0, SLAB.b1 - SLAB.z),
					slabP(SLAB.x1, SLAB.b1 - SLAB.z),
					slabP(SLAB.x1, SLAB.b1),
					slabP(SLAB.x0, SLAB.b1)
				]),
				'ln fl'
			),
			p(
				poly([
					slabP(SLAB.x0, SLAB.b1 - SLAB.depth - SLAB.z),
					slabP(SLAB.x1, SLAB.b1 - SLAB.depth - SLAB.z),
					slabP(SLAB.x1, SLAB.b1 - SLAB.z),
					slabP(SLAB.x0, SLAB.b1 - SLAB.z)
				]),
				'ln ft'
			),
			p(
				poly([
					slabP(SLAB.x0 + 8, SLAB.b1 - SLAB.depth - SLAB.z + 5),
					slabP(SLAB.x1 - 8, SLAB.b1 - SLAB.depth - SLAB.z + 5),
					slabP(SLAB.x1 - 8, SLAB.b1 - SLAB.z - 5),
					slabP(SLAB.x0 + 8, SLAB.b1 - SLAB.z - 5)
				]),
				'ln lo'
			),
			p(
				Array.from({ length: 17 }, (_, i) => SLAB.x0 + 30 + i * 22.5)
					.map((x) => `M${num(x)} ${num(SLAB.b1 - SLAB.z + 4)}V${num(SLAB.b1 - 4)}`)
					.join(''),
				'ln lo'
			)
		];
		for (const id of chipIds(mode)) {
			const c = chipCenter(mode, id) - 46;
			const floorY = SLAB_MID + SLAB.z;
			const gone = id > 0 && revoked[id - 1];
			if (gone) {
				const P = proj(c, floorY);
				slab.push(
					p(poly([P(-CHIP.h, -CHIP.h, SLAB.z), P(CHIP.h, -CHIP.h, SLAB.z), P(CHIP.h, CHIP.h, SLAB.z), P(-CHIP.h, CHIP.h, SLAB.z)]), 'ghost')
				);
			} else {
				const on = frame.hiC.includes(id);
				slab.push(
					...box(c, floorY, CHIP.h, CHIP.h, SLAB.z, SLAB.z + CHIP.z, on ? 'sm on' : 'sm'),
					p(poly(ring(c, floorY, 0, 0, SLAB.z + CHIP.z, 2.6)), 'seal')
				);
			}
		}
		objs.push({ key: SLAB.b1, sub: GCX, items: slab });

		// Клиенты
		LY.forEach((y, i) => {
			const items = [
				...box(CLX, y, CH, CH, 0, CZ, hovered === i ? 'hi' : ''),
				p(poly([proj(CLX, y)(-6, CH, 4), proj(CLX, y)(6, CH, 4)], false), 'ln lo'),
				led(CLX, y, 8, CH, 9, i > 0 && !revoked[i - 1] ? 'led lit' : 'led')
			];
			if (i > 0) items.push(p(poly(ring(CLX, y, 0, 0, CZ, 4.2)), revoked[i - 1] ? 'sealr' : 'seal'));
			objs.push({ key: y, sub: CLX, items });
		});

		// Шлюз: столбики и выдвижные двери в линиях
		POST_Y.forEach((y) => {
			objs.push({
				key: y,
				sub: GCX,
				items: [...box(GCX, y, GH, GH, 0, POST_Z), diamond(GCX, y, GH, POST_Z, 'ln lo', 3)]
			});
		});
		LY.forEach((y, i) => {
			const arm = frame.lanes[i]?.arm ?? 0;
			const h = DOOR_Z * (1 - arm);
			objs.push({
				key: y,
				sub: GCX,
				items: [diamond(GCX, y, GH, 0, 'slot'), ...(h > 0.6 ? box(GCX, y, GH - 1, GH - 1, 0, h, 'dr') : [])]
			});
		});

		// Сертификаты
		frame.lanes.forEach((L, i) => {
			if (L.op < 0.02) return;
			objs.push({ key: L.y, sub: L.x, items: card(L.x, L.y, i > 0 && revoked[i - 1], i > 0, L.op) });
		});

		objs.sort((a, b) => a.key - b.key || a.sub - b.sub);
		for (const o of objs) back.push(...o.items);

		// Подписи и отметки поверх всего
		front.push(tx(LABEL_X, ROOT.y - 6, 't', 'Root CA'));
		front.push(tx(LABEL_X, ROOT.y + 12, 's', naive ? 'подписывает всех' : 'подписывает CA'));
		front.push(tx(GCX, 38, 's c', 'bundle у Traefik: каким CA он доверяет'));
		for (const id of chipIds(mode)) {
			const c = chipCenter(mode, id);
			const gone = id > 0 && revoked[id - 1];
			front.push(tx(c - 22, SLAB_MID + 5, gone ? 't gone' : 't', naive ? 'Root CA' : `CA клиента ${String(id)}`));
			if (frame.badC.includes(id)) front.push(p(crossD(c - 46, SLAB_MID - SLAB.z - 4, 11), 'xm'));
		}
		front.push(tx(GCX, 424, 't c', 'шлюз Traefik'));
		front.push(tx(SX, MY + SERVER.H + 28, 't c', 'бэкенд'));

		LY.forEach((y, i) => {
			front.push(tx(LABEL_X, y - 3, 't', NAMES[i] ?? ''));
			front.push(
				tx(LABEL_X, y + 15, 's', i === 0 ? 'без сертификата' : revoked[i - 1] ? 'отозван' : 'mTLS')
			);
			if (i > 0 && revoked[i - 1]) front.push(p(crossD(CLX, y - CZ - 26, 7), 'xm'));
			const L = frame.lanes[i];
			if (L?.xo) front.push(p(crossD(GCX - 40, y - 34, 9), 'xm', L.xo));
		});

		return { back, front };
	}

	export const LAYOUT = { LY, LABEL_X, GCX, GH, SX, MY, CH, NAMES } as const;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { cn } from '$lib/utils/cn';
	import ServerIllustration from './ServerIllustration.svelte';

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

	const { LY: LANES, LABEL_X: HIT_X, GCX: HIT_END, SX, MY, NAMES } = LAYOUT;

	let revoked = $state([false, true]); // клиент 1, клиент 2
	let hovered = $state(-1);
	let frame = $state<Frame>(computeFrame(0, 'naive', [false, true]));

	const naive = $derived(mode === 'naive');
	const pass = $derived([false, naive || !revoked[0], naive || !revoked[1]]);
	const status = $derived(
		hovered < 1
			? 'наведите на клиента, клик — отозвать'
			: `${NAMES[hovered] ?? ''} · ${revoked[hovered - 1] ? 'отозван' : 'действует'} · ${pass[hovered] ? 'пропущен' : 'отклонён'}`
	);
	const scene = $derived(build({ mode, revoked, hovered, frame }));


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
			frame = computeFrame(reduce ? 2.4 : now / 1000, mode, revoked);
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
				viewBox="0 0 880 436"
				role="img"
				aria-label="Клиенты, шлюз Traefik с bundle сертификатов и бэкенд-сервер"
				class="block h-auto w-full"
			>
				{#snippet draw(items: typeof scene.back)}
					{#each items as it, i (i)}
						{#if it.k === 'p'}
							<path class={it.c} d={it.d} opacity={it.o} />
						{:else}
							<text class={it.c} x={it.x} y={it.y}>{it.s}</text>
						{/if}
					{/each}
				{/snippet}

				{@render draw(scene.back)}

				<!-- бэкенд: один сервер, к нему сходятся все линии -->
				<ServerIllustration x={SX} y={MY} lit={frame.lit} />

				{@render draw(scene.front)}

				<!-- зоны клика: клиент 1 и клиент 2 -->
				{#each [1, 2] as i (i)}
					<rect
						class="hit"
						x={HIT_X}
						y={(LANES[i] ?? 0) - 38}
						width={HIT_END - HIT_X - 40}
						height="76"
						role="button"
						tabindex="0"
						aria-pressed={revoked[i - 1]}
						aria-label={`${NAMES[i] ?? ''}: ${revoked[i - 1] ? 'вернуть сертификат' : 'отозвать сертификат'}`}
						onpointerenter={() => (hovered = i)}
						onpointerleave={() => (hovered = -1)}
						onfocus={() => (hovered = i)}
						onblur={() => (hovered = -1)}
						onclick={() => {
							toggleRevoked(i);
						}}
						onkeydown={(e) => {
							onLaneKey(e, i);
						}}
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
							Как работает отзыв сертификатов
						</div>
						<p class="mt-2 min-h-28 text-base leading-relaxed text-pretty text-foreground-muted sm:min-h-24">
							{#if naive}
								<strong class="font-medium text-accent-fixed">Проблема.</strong>
								Шлюз пропускает только тех, чей сертификат подписан CA из bundle. Здесь это один
								Root CA, а проверки отзыва (CRL, OCSP) у Traefik нет. Поэтому отозванный клиент
								(пунктирная печать) всё равно проходит.
							{:else}
								<strong class="font-medium text-accent-fixed">Решение.</strong>
								У каждого клиента свой промежуточный CA, им подписан его сертификат, и в bundle
								лежат только CA живых клиентов. Отозвали клиента: скрипт убрал его CA из bundle и
								обновил конфиг, шлюз не находит, чем проверить сертификат, и дверь остаётся
								закрытой. CRL не нужен.
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
									onclick={() => {
										toggleRevoked(i);
									}}
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

	.mtls {
		--mt-accent: var(--color-accent);
		--mt-ink: var(--color-foreground);
		--mt-line: color-mix(in srgb, var(--color-foreground-muted) 75%, transparent);
		--mt-hi-fill: color-mix(in srgb, var(--mt-accent) 14%, var(--color-background));
		--mt-sw: 2;
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

	/* ───── Единый стиль всей схемы: тот же, что у сервера ───── */
	/* контур + три грани: слева чуть темнее фона, справа темнее, сверху цвет фона */
	.mtls :global(.ln) {
		fill: var(--color-background);
		stroke: var(--mt-ink);
		stroke-width: var(--mt-sw);
		stroke-linejoin: round;
		stroke-linecap: round;
		transition:
			stroke 150ms ease-out,
			fill 150ms ease-out;
	}
	.mtls :global(.fl) {
		fill: color-mix(in srgb, var(--mt-ink) 4%, var(--color-background));
	}
	.mtls :global(.fr) {
		fill: color-mix(in srgb, var(--mt-ink) 9%, var(--color-background));
	}
	.mtls :global(.ft) {
		fill: var(--color-background);
	}
	/* тонкие детали на гранях */
	.mtls :global(.lo) {
		fill: none;
		stroke-width: calc(var(--mt-sw) * 0.6);
		opacity: 0.65;
	}
	.mtls :global(.sm) {
		stroke-width: 1.6;
	}
	/* наведение на клиента */
	.mtls :global(.ln.hi) {
		stroke: var(--mt-accent);
	}
	/* проверка в bundle: чип подсвечен */
	.mtls :global(.ln.on) {
		stroke: var(--mt-accent);
	}
	.mtls :global(.ft.on),
	.mtls :global(.fl.on),
	.mtls :global(.fr.on) {
		fill: var(--mt-hi-fill);
	}
	/* дверь: выдвижной столбик акцентного цвета */
	.mtls :global(.dr.fl) {
		fill: color-mix(in srgb, var(--mt-accent) 78%, var(--color-background));
	}
	.mtls :global(.dr.fr) {
		fill: var(--mt-accent);
	}
	.mtls :global(.dr.ft) {
		fill: color-mix(in srgb, var(--mt-accent) 62%, var(--color-background));
	}
	/* сертификат */
	.mtls :global(.dl) {
		fill: none;
		stroke: var(--color-foreground-muted);
		stroke-width: 1.4;
		opacity: 0.7;
	}
	.mtls :global(.seal) {
		fill: var(--mt-accent);
		stroke: none;
	}
	.mtls :global(.sealr) {
		fill: none;
		stroke: var(--mt-accent);
		stroke-width: 1.6;
		stroke-dasharray: 2.4 2.2;
	}
	/* светодиод на панели клиента */
	.mtls :global(.led) {
		fill: none;
		stroke: var(--color-foreground-muted);
		stroke-width: 3.6;
		stroke-linecap: round;
	}
	.mtls :global(.led.lit) {
		stroke: var(--mt-accent);
	}
	/* дорожки по полу: контур и заливка */
	.mtls :global(.rail-o) {
		fill: none;
		stroke: color-mix(in srgb, var(--color-foreground) 38%, transparent);
		stroke-width: 12.5;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.mtls :global(.rail-i) {
		fill: none;
		stroke: var(--color-background-inset);
		stroke-width: 10;
		stroke-linecap: round;
		stroke-linejoin: round;
		transition: stroke 150ms ease-out;
	}
	.mtls :global(.rail-i.on) {
		stroke: var(--mt-hi-fill);
	}
	/* пунктир: связи и пустые места (отозванный CA, паз двери) */
	.mtls :global(.link) {
		fill: none;
		stroke: var(--color-foreground-muted);
		stroke-width: 1.2;
		stroke-dasharray: 4 4;
		opacity: 0.6;
	}
	.mtls :global(.ghost),
	.mtls :global(.slot) {
		fill: none;
		stroke: var(--color-foreground-muted);
		stroke-width: 1.2;
		stroke-dasharray: 3 3;
		stroke-linejoin: round;
	}
	.mtls :global(.xm) {
		fill: none;
		stroke: var(--mt-accent);
		stroke-width: 3;
		stroke-linecap: round;
	}

	.mtls :global(.t) {
		font:
			600 14px system-ui,
			sans-serif;
		fill: var(--color-foreground);
	}
	.mtls :global(.s) {
		font:
			12px system-ui,
			sans-serif;
		fill: var(--color-foreground-muted);
	}
	.mtls :global(.c) {
		text-anchor: middle;
	}
	.mtls :global(.gone) {
		text-decoration: line-through;
		fill: var(--color-foreground-muted);
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
		.mtls :global(.ln),
		.mtls :global(.rail-i) {
			transition: none;
		}
	}
</style>