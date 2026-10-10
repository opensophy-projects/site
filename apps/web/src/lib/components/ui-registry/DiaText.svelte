<script lang="ts">
	type Props = {
		/** Text or texts to sweep through. */
		text: string | string[];
		/** Colors used by the moving highlight. */
		sweepColors?: string[];
		/** Base text color. */
		baseColor?: string;
		/** Sweep duration in milliseconds. */
		duration?: number;
		/** Delay before the sweep starts, in milliseconds. */
		delay?: number;
		/** Repeat the sweep (and advance through text[]). */
		loop?: boolean;
		/** Delay between completed sweeps, in milliseconds. */
		loopDelay?: number;
		/** Highlight width as a fraction of the text width. */
		bandRatio?: number;
		/** Start the animation automatically. */
		autoPlay?: boolean;
		/** CSS class applied to the root element. */
		class?: string;
		/** CSS class applied to the text. */
		textClass?: string;
		/** Inline styles for the root element. */
		style?: string;
		/** Inline styles for the text. */
		textStyle?: string;
		onSweepEnd?: (index: number) => void;
	};

	let {
		text,
		sweepColors = ["#ffffff", "#ffffff", "#ffffff"],
		baseColor = "currentColor",
		duration = 1200,
		delay = 0,
		loop = false,
		loopDelay = 0,
		bandRatio = 0.22,
		autoPlay = true,
		class: className = "",
		textClass = "",
		style = "",
		textStyle = "",
		onSweepEnd,
	}: Props = $props();

	let index = $state(0);
	let playing = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;
	let animationId = $state(0);

	const texts = $derived(Array.isArray(text) ? text : [text]);
	const currentText = $derived(texts[index] ?? "");
	const isMulti = $derived(texts.length > 1);

	const gradient = $derived.by(() => {
		const colors = sweepColors.length > 0 ? sweepColors : [baseColor];
		const stops = colors.length === 1
			? `${baseColor} 0%, ${colors[0]} 50%, ${baseColor} 100%`
			: [baseColor, ...colors, baseColor]
					.map((color, i, all) => `${color} ${(i / (all.length - 1)) * 100}%`)
					.join(", ");
		return `linear-gradient(90deg, ${stops})`;
	});

	function clearTimer() {
		if (timer !== undefined) {
			clearTimeout(timer);
			timer = undefined;
		}
	}

	function finishSweep(finishedIndex: number) {
		playing = false;
		onSweepEnd?.(finishedIndex);

		if (!loop) return;

		timer = setTimeout(() => {
			if (isMulti) index = (index + 1) % texts.length;
			animationId += 1;
			playing = true;
		}, loopDelay);
	}

	function play() {
		clearTimer();
		if (!autoPlay || !texts.length) return;

		playing = true;
		animationId += 1;
	}

	$effect(() => {
		if (texts.length === 0) {
			index = 0;
			playing = false;
			clearTimer();
			return;
		}

		index = 0;
		if (autoPlay) play();
		return clearTimer;
	});

	$effect(() => {
		if (!playing) return;
		const id = animationId;
		const timeout = setTimeout(() => {
			if (id === animationId) finishSweep(index);
		}, Math.max(0, delay) + Math.max(0, duration));
		return () => clearTimeout(timeout);
	});
</script>

<span
	class={`dia-text ${className}`}
	style={`${style} --dia-base:${baseColor}; --dia-gradient:${gradient}; --dia-duration:${Math.max(0, duration)}ms; --dia-delay:${Math.max(0, delay)}ms; --dia-band:${Math.max(0.05, bandRatio) * 100}%;`}
>
	<span class="dia-text__sizer" aria-hidden="true">{currentText || "\u00a0"}</span>
	{#key `${index}:${animationId}`}
		<span
			class={`dia-text__label ${textClass} ${playing ? "dia-text__label--playing" : ""}`}
			style={textStyle}
			aria-label={currentText}
		>
			{currentText}
		</span>
	{/key}
</span>

<style>
	.dia-text {
		position: relative;
		display: inline-grid;
		vertical-align: middle;
		line-height: inherit;
		color: var(--dia-base);
	}

	.dia-text__sizer,
	.dia-text__label {
		grid-area: 1 / 1;
		white-space: nowrap;
		font: inherit;
		letter-spacing: inherit;
		line-height: inherit;
	}

	.dia-text__sizer {
		visibility: hidden;
		pointer-events: none;
		user-select: none;
	}

	.dia-text__label {
		background: var(--dia-base);
		background-image: none;
		background-repeat: no-repeat;
		background-size: 200% 100%;
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: currentColor;
		color: var(--dia-base);
	}

	.dia-text__label--playing {
		background-image: var(--dia-gradient);
		-webkit-text-fill-color: transparent;
		animation: dia-text-sweep var(--dia-duration) ease-in-out var(--dia-delay) both;
	}

	@keyframes dia-text-sweep {
		0% {
			background-position: 100% 0;
		}
		100% {
			background-position: -100% 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.dia-text__label--playing {
			animation: none;
			background-image: none;
			-webkit-text-fill-color: currentColor;
		}
	}
</style>
