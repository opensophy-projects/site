<script lang="ts">
	import { gsap } from "gsap";
	import { SplitText } from "gsap/SplitText";
	import { ScrollTrigger } from "gsap/ScrollTrigger";
	import type { Snippet } from "svelte";
	import { onMount } from "svelte";
	import { ensureMotionCoreEase, registerPluginOnce } from "$lib/helpers/gsap";
	import { cn } from "$lib/utils/cn";

	type SplitMode = "lines" | "words" | "chars";

	type ModeSettings = {
		duration?: number;
		stagger?: number;
	};

	type SplitRevealConfig = Partial<Record<SplitMode, ModeSettings>>;

	type ComponentProps = {
		children?: Snippet;
		class?: string;
		mode?: SplitMode;
		config?: SplitRevealConfig;
		delay?: number;
		triggerOnScroll?: boolean;
		scrollElement?: string | HTMLElement | null;
		as?: keyof HTMLElementTagNameMap;
		[prop: string]: unknown;
	};

	type RequiredConfig = Record<
		SplitMode,
		{ duration: number; stagger: number }
	>;

	const DEFAULT_CONFIG: RequiredConfig = {
		lines: { duration: 0.8, stagger: 0.08 },
		words: { duration: 0.6, stagger: 0.06 },
		chars: { duration: 0.4, stagger: 0.008 },
	};

	onMount(() => {
		registerPluginOnce(SplitText, ScrollTrigger);
		ensureMotionCoreEase();
	});

	let {
		children,
		class: className = "",
		mode = "lines",
		config,
		as = "div",
		delay = 0,
		triggerOnScroll = false,
		scrollElement,
		...restProps
	}: ComponentProps = $props();

	const resolvedConfig = $derived.by(() => {
		const overrides = config?.[mode];
		const defaults = DEFAULT_CONFIG[mode];
		return {
			duration: overrides?.duration ?? defaults.duration,
			stagger: overrides?.stagger ?? defaults.stagger,
		};
	});

	let wrapperRef: HTMLSpanElement | null = null;
	const attachWrapperRef = (node: HTMLSpanElement) => {
		wrapperRef = node;
		return () => {
			if (wrapperRef === node) {
				wrapperRef = null;
			}
		};
	};

	$effect(() => {
		if (typeof window === "undefined") return;
		const node = wrapperRef;
		if (!node) return;

		const resolvedScroller =
			typeof scrollElement === "string"
				? document.querySelector<HTMLElement>(scrollElement)
				: scrollElement instanceof HTMLElement
					? scrollElement
					: null;
		const scroller =
			resolvedScroller instanceof HTMLElement ? resolvedScroller : window;

		let split: SplitText | null = null;
		let targets: Element[] = [];

		const ctx = gsap.context(() => {
			split = SplitText.create(node, {
				type: "lines, words, chars",
				tag: as,
				mask: "lines",
			});
			targets =
				mode === "lines"
					? split.lines
					: mode === "words"
						? split.words
						: split.chars;
			if (!targets.length) return;
			gsap.set(targets, { yPercent: 110 });
			gsap.to(targets, {
				yPercent: 0,
				duration: resolvedConfig.duration,
				stagger: resolvedConfig.stagger,
				ease: "motion-core-ease",
				lazy: false,
				delay: delay,
				scrollTrigger: triggerOnScroll
					? {
							trigger: node,
							scroller,
							start: "top 85%",
						}
					: undefined,
			});
		}, node);

		return () => {
			ctx.revert();
			split?.revert();
		};
	});
</script>

<span
	{...restProps}
	class={cn("font-inherit relative align-baseline text-inherit", className)}
	{@attach attachWrapperRef}
>
	{@render children?.()}
</span>