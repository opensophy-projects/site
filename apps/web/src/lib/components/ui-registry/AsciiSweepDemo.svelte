<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import FeatureCards from '$lib/components/ui-registry/FeatureCards.svelte';

	let containerRef: HTMLDivElement;
	let canvasRef: HTMLCanvasElement;
	let currentPanel = 0;
	let autoScanInterval: ReturnType<typeof setInterval>;
	let isScanning = false;
	let scanProgress = 0;
	let animationFrameId: number;

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

	const asciiChars = '█▓▒░@#B8&WM%*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`\'. ';

	function drawAsciiEffect(ctx: CanvasRenderingContext2D, width: number, height: number, progress: number) {
		ctx.clearRect(0, 0, width, height);
		
		const fontSize = 14;
		const columns = Math.floor(width / fontSize);
		const rows = Math.floor(height / fontSize);
		
		const bandWidth = 0.35;
		const bandPosition = progress;
		
		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < columns; col++) {
				const x = col * fontSize;
				const y = row * fontSize;
				
				const normalizedY = y / height;
				const distanceFromBand = Math.abs(normalizedY - bandPosition);
				
				if (distanceFromBand < bandWidth / 2) {
					const intensity = 1 - (distanceFromBand / (bandWidth / 2));
					const charIndex = Math.floor(Math.random() * asciiChars.length);
					const char = asciiChars[charIndex];
					
					const alpha = intensity * 0.9;
					ctx.fillStyle = `rgba(74, 222, 128, ${alpha})`;
					ctx.font = `${fontSize}px monospace`;
					ctx.fillText(char, x, y + fontSize);
				}
			}
		}
	}

	function animate() {
		if (!isScanning || !canvasRef) return;
		
		const ctx = canvasRef.getContext('2d');
		if (!ctx) return;
		
		const rect = canvasRef.getBoundingClientRect();
		canvasRef.width = rect.width;
		canvasRef.height = rect.height;
		
		scanProgress += 0.015;
		
		if (scanProgress >= 1) {
			scanProgress = 0;
			isScanning = false;
			currentPanel = currentPanel === 0 ? 1 : 0;
			return;
		}
		
		drawAsciiEffect(ctx, canvasRef.width, canvasRef.height, scanProgress);
		animationFrameId = requestAnimationFrame(animate);
	}

	function startScan() {
		if (isScanning || !canvasRef) return;
		isScanning = true;
		scanProgress = 0;
		animate();
	}

	onMount(() => {
		if (!canvasRef) return;
		
		const resizeObserver = new ResizeObserver(() => {
			const rect = canvasRef.getBoundingClientRect();
			canvasRef.width = rect.width;
			canvasRef.height = rect.height;
		});
		
		resizeObserver.observe(containerRef);
		
		autoScanInterval = setInterval(() => {
			startScan();
		}, 4000);
		
		setTimeout(() => {
			startScan();
		}, 500);
		
		return () => {
			resizeObserver.disconnect();
			if (animationFrameId) cancelAnimationFrame(animationFrameId);
		};
	});

	onDestroy(() => {
		if (autoScanInterval) clearInterval(autoScanInterval);
		if (animationFrameId) cancelAnimationFrame(animationFrameId);
	});

	function handleManualScan() {
		startScan();
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

	<div bind:this={containerRef} class="relative w-full h-[500px] bg-background rounded-lg overflow-hidden border border-border">
		<canvas 
			bind:this={canvasRef} 
			class="absolute inset-0 w-full h-full pointer-events-none" 
			style="z-index: 10;"
		></canvas>
		
		{#if currentPanel === 0}
			<div class="absolute inset-0 w-full h-full p-6 transition-opacity duration-500" style="z-index: 1;">
				<FeatureCards cards={cards1} />
			</div>
			<div class="absolute inset-0 w-full h-full p-6 opacity-0 transition-opacity duration-500" style="z-index: 2;">
				<FeatureCards cards={cards2} />
			</div>
		{:else}
			<div class="absolute inset-0 w-full h-full p-6 opacity-0 transition-opacity duration-500" style="z-index: 1;">
				<FeatureCards cards={cards1} />
			</div>
			<div class="absolute inset-0 w-full h-full p-6 transition-opacity duration-500" style="z-index: 2;">
				<FeatureCards cards={cards2} />
			</div>
		{/if}
	</div>

	<div class="mt-6 grid gap-4 text-sm text-muted-foreground">
		<div class="bg-muted p-4 rounded-md">
			<h3 class="font-medium mb-2">Параметры эффекта:</h3>
			<ul class="list-disc list-inside space-y-1">
				<li><strong>band:</strong> 0.35 — ширина полосы сканирования</li>
				<li><strong>duration:</strong> ~2s — длительность сканирования</li>
				<li><strong>charset:</strong> ASCII градиенты (█▓▒░)</li>
				<li><strong>color:</strong> #4ade80 — зеленый терминал</li>
				<li><strong>density:</strong> высокая плотность символов</li>
			</ul>
		</div>
	</div>
</div>
