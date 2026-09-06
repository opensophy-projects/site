<script lang="ts">
	type Props = {
		class?: string;
		style?: string;
		trailLength?: number;
		inertia?: number;
		grainIntensity?: number;
		bloomStrength?: number;
		bloomRadius?: number;
		bloomThreshold?: number;
		brightness?: number;
		color?: string;
		mixBlendMode?: string;
		edgeIntensity?: number;
		maxDevicePixelRatio?: number;
		targetPixels?: number;
		fadeDelayMs?: number;
		fadeDurationMs?: number;
		zIndex?: number;
	};

	let {
		class: className = '',
		style = '',
		trailLength = 50,
		inertia = 0.5,
		grainIntensity = 0.05,
		bloomStrength = 0.1,
		bloomRadius = 1,
		bloomThreshold = 0.025,
		brightness = 1,
		color = '#B497CF',
		mixBlendMode = 'screen',
		edgeIntensity = 0,
		maxDevicePixelRatio = 0.5,
		targetPixels,
		fadeDelayMs,
		fadeDurationMs,
		zIndex = 10
	}: Props = $props();

	let host: HTMLDivElement;
	let canvas: HTMLCanvasElement;

	const rgb = (hex: string) => {
		const value = Number.parseInt(hex.replace('#', ''), 16);
		return Number.isNaN(value)
			? [180, 151, 207]
			: [(value >> 16) & 255, (value >> 8) & 255, value & 255];
	};

	$effect(() => {
		if (!host || !canvas || !host.parentElement) return;
		const parent = host.parentElement;
		const context = canvas.getContext('2d');
		if (!context) return;
		const previousPosition = parent.style.position;
		if (!previousPosition || previousPosition === 'static') parent.style.position = 'relative';
		const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
		const pixelBudget = targetPixels ?? (touch ? 900_000 : 1_300_000);
		const fadeDelay = fadeDelayMs ?? (touch ? 500 : 1000);
		const fadeDuration = fadeDurationMs ?? (touch ? 1000 : 1500);
		const points = Array.from({ length: Math.max(1, Math.floor(trailLength)) }, () => ({ x: 0.5, y: 0.5 }));
		let pointer = { x: 0.5, y: 0.5 };
		let current = { ...pointer };
		let lastMove = performance.now();
		let active = true;
		let frame = 0;
		let width = 1;
		let height = 1;

		const resize = () => {
			const rect = host.getBoundingClientRect();
			const baseDpr = Math.min(window.devicePixelRatio || 1, maxDevicePixelRatio);
			const scale = Math.min(1, Math.sqrt(pixelBudget / Math.max(1, rect.width * rect.height * baseDpr ** 2)));
			const dpr = Math.max(0.25, baseDpr * scale);
			width = Math.max(1, Math.floor(rect.width * dpr));
			height = Math.max(1, Math.floor(rect.height * dpr));
			canvas.width = width;
			canvas.height = height;
		};
		const observer = new ResizeObserver(resize);
		observer.observe(parent);
		observer.observe(host);
		resize();

		const move = (event: PointerEvent) => {
			const rect = parent.getBoundingClientRect();
			pointer = {
				x: Math.max(0, Math.min(1, (event.clientX - rect.left) / Math.max(1, rect.width))),
				y: Math.max(0, Math.min(1, (event.clientY - rect.top) / Math.max(1, rect.height)))
			};
			lastMove = performance.now();
		};
		parent.addEventListener('pointermove', move, { passive: true });

		const draw = (now: number) => {
			if (!active) return;
			const elapsed = now - lastMove;
			const opacity = elapsed <= fadeDelay ? 1 : Math.max(0, 1 - (elapsed - fadeDelay) / fadeDuration);
			const easing = Math.max(0.02, Math.min(1, 1 - inertia));
			current.x += (pointer.x - current.x) * easing;
			current.y += (pointer.y - current.y) * easing;
			points.unshift({ ...current });
			points.length = Math.max(1, Math.floor(trailLength));
			context.clearRect(0, 0, width, height);
			const [red, green, blue] = rgb(color);
			const radius = Math.max(24, Math.min(width, height) * (0.09 + bloomRadius * 0.025));
			for (let index = points.length - 1; index >= 0; index--) {
				const point = points[index];
				const progress = 1 - index / points.length;
				const x = point.x * width;
				const y = point.y * height;
				const gradient = context.createRadialGradient(x, y, 0, x, y, radius * progress);
				const alpha = opacity * progress * progress * brightness * (0.3 + bloomStrength);
				gradient.addColorStop(0, `rgba(${red}, ${green}, ${blue}, ${alpha})`);
				gradient.addColorStop(Math.max(0.05, bloomThreshold), `rgba(${red}, ${green}, ${blue}, ${alpha * 0.35})`);
				gradient.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);
				context.fillStyle = gradient;
				context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
			}
			if (grainIntensity > 0 && opacity > 0) {
				context.fillStyle = `rgba(255, 255, 255, ${Math.min(0.15, grainIntensity * 0.08 * opacity)})`;
				for (let index = 0; index < 120; index++) context.fillRect(Math.random() * width, Math.random() * height, 1, 1);
			}
			if (edgeIntensity > 0) {
				const edge = context.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.2, width / 2, height / 2, Math.max(width, height) * 0.75);
				edge.addColorStop(0, 'rgba(0,0,0,0)'); edge.addColorStop(1, `rgba(0,0,0,${Math.min(1, edgeIntensity)})`);
				context.fillStyle = edge; context.fillRect(0, 0, width, height);
			}
			frame = requestAnimationFrame(draw);
		};
		frame = requestAnimationFrame(draw);
		return () => {
			active = false;
			cancelAnimationFrame(frame);
			observer.disconnect();
			parent.removeEventListener('pointermove', move);
			if (!previousPosition || previousPosition === 'static') parent.style.position = previousPosition;
		};
	});
</script>

<div bind:this={host} class="ghost-cursor {className}" style={`z-index: ${zIndex}; ${style}`} aria-hidden="true">
	<canvas bind:this={canvas} style={`mix-blend-mode: ${mixBlendMode};`}></canvas>
</div>

<style>
	.ghost-cursor { pointer-events: none; position: absolute; inset: 0; overflow: hidden; }
	.ghost-cursor canvas { display: block; width: 100%; height: 100%; }
</style>
