<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import AsciiSweep, { createAsciiSweep, type AsciiSweepInstance } from '$lib/components/ui-registry/AsciiSweep.svelte';
	import FeatureCards from '$lib/components/ui-registry/FeatureCards.svelte';

	let containerRef: HTMLDivElement;
	let asciiInstance: AsciiSweepInstance | null = null;
	let currentPanel = 0;
	let autoScanInterval: ReturnType<typeof setInterval>;

	const cards1 = [
		{
			title: 'Строгие контракты',
			description: 'Описывайте компоненты с жёсткой валидацией параметров, типов и зависимостей ещё до запуска в продакшен.',
			icon: 'contracts' as const
		},
		{
			title: 'Планировщик кадров',
			description: 'Управляйте потоком обработки с явным порядком стадий и поведением инвалидации под конкретный сценарий.',
			icon: 'scheduling' as const
		}
	];

	const cards2 = [
		{
			title: 'Диагностика ошибок',
			description: 'Нормализуйте ошибки в структурированные отчёты с фрагментами исходника, подсказками и обработкой для продакшена.',
			icon: 'diagnostics' as const
		},
		{
			title: 'Безопасность',
			description: 'Защита данных и компонентов с помощью современных протоколов безопасности и шифрования.',
			icon: 'security' as const
		}
	];

	onMount(() => {
		if (!containerRef) return;

		const output = containerRef.querySelector('canvas.output') as HTMLCanvasElement;
		const slot0Content = containerRef.querySelector('.slot-0 > div') as HTMLElement;
		const slot1Content = containerRef.querySelector('.slot-1 > div') as HTMLElement;

		if (!output || !slot0Content || !slot1Content) {
			console.error('Не удалось найти элементы для AsciiSweep');
			return;
		}

		const source0Canvas = document.createElement('canvas') as any;
		const source1Canvas = document.createElement('canvas') as any;
		
		source0Canvas.setAttribute('layoutsubtree', 'true');
		source1Canvas.setAttribute('layoutsubtree', 'true');
		
		source0Canvas.style.position = 'absolute';
		source0Canvas.style.visibility = 'hidden';
		source1Canvas.style.position = 'absolute';
		source1Canvas.style.visibility = 'hidden';
		
		slot0Content.appendChild(source0Canvas);
		slot1Content.appendChild(source1Canvas);

		setTimeout(() => {
			if (source0Canvas.requestPaint) source0Canvas.requestPaint();
			if (source1Canvas.requestPaint) source1Canvas.requestPaint();
		}, 100);

		const instance = createAsciiSweep(
			{
				slots: [
					{ source: source0Canvas, content: slot0Content },
					{ source: source1Canvas, content: slot1Content }
				],
				output,
			},
			{
				angle: 0,
				duration: 2.5,
				band: 0.35,
				softness: 0.5,
				turbulence: 0.6,
				trail: 0.8,
				scale: 2,
				spacing: 1,
				charset: 'ascii' as const,
				color: '#4ade80',
				tint: 0.8,
				glow: 2,
				aberration: 4,
				flicker: 0.4,
				density: 0.95,
				displace: 12,
				contrast: 1.3,
				brightness: 0,
				invert: 0,
				threshold: 0.08,
				fade: 0.7,
				blend: 'auto' as const,
				background: 'auto',
				onSweepStart: () => console.log('Sweep started'),
				onSweepEnd: () => console.log('Sweep ended'),
			}
		);

		if (instance) {
			asciiInstance = instance;
			
			autoScanInterval = setInterval(() => {
				currentPanel = currentPanel === 0 ? 1 : 0;
				asciiInstance?.sweep(currentPanel as 0 | 1);
			}, 4000);
		}
	});

	onDestroy(() => {
		if (autoScanInterval) clearInterval(autoScanInterval);
		if (asciiInstance) asciiInstance.destroy();
	});

	function handleManualScan() {
		if (!asciiInstance) return;
		currentPanel = currentPanel === 0 ? 1 : 0;
		asciiInstance.sweep(currentPanel as 0 | 1);
	}
</script>

<div class="w-full max-w-5xl mx-auto px-4 py-8">
	<div class="mb-6 text-center">
		<h2 class="text-2xl font-semibold mb-2">ASCII-сканирование</h2>
		<p class="text-muted-foreground mb-4">Эффект сканирования с ASCII-символами между двумя панелями</p>
		<button 
			onclick={handleManualScan}
			class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
		>
			Запустить сканирование
		</button>
	</div>

	<div bind:this={containerRef} class="relative w-full h-[500px] bg-background rounded-lg overflow-hidden">
		<canvas class="output absolute inset-0 w-full h-full" style="z-index: 10;"></canvas>
		
		<div class="slot-0 absolute inset-0" style="z-index: 1;">
			<div class="w-full h-full p-6">
				<FeatureCards cards={cards1} />
			</div>
		</div>
		
		<div class="slot-1 absolute inset-0" style="z-index: 1;">
			<div class="w-full h-full p-6">
				<FeatureCards cards={cards2} />
			</div>
		</div>
	</div>

	<div class="mt-6 grid gap-4 text-sm text-muted-foreground">
		<div class="bg-muted p-4 rounded-md">
			<h3 class="font-medium mb-2">Параметры эффекта:</h3>
			<ul class="list-disc list-inside space-y-1">
				<li><strong>band:</strong> 0.35 — ширина полосы сканирования</li>
				<li><strong>duration:</strong> 2.5s — длительность сканирования</li>
				<li><strong>turbulence:</strong> 0.6 — неровность края</li>
				<li><strong>trail:</strong> 0.8 — длина шлейфа</li>
				<li><strong>density:</strong> 0.95 — плотность символов</li>
			</ul>
		</div>
	</div>
</div>

<style>
	.output {
		pointer-events: none;
	}
	
	.slot-0, .slot-1 {
		pointer-events: auto;
	}
</style>
