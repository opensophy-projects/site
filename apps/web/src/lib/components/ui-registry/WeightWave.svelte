<script lang="ts">
	import { tick } from "svelte";
	import { gsap } from "gsap";
	import { SplitText } from "gsap/SplitText";
	import { onMount } from "svelte";
	import type { Snippet } from "svelte";
	import { registerPluginOnce } from "$lib/helpers/gsap";
	import { cn } from "$lib/utils/cn";

	type ComponentProps = {
		children?: Snippet;
		baseWeight?: number;
		hoverWeight?: number;
		influenceRadius?: number;
		falloffPower?: number;
		duration?: number;
		ease?: string;
		class?: string;
		[prop: string]: unknown;
	};

	let {
		children,
		baseWeight = 350,
		hoverWeight = 750,
		influenceRadius = 3,
		falloffPower = 1.5,
		duration = 1.0,
		ease = "power3.out",
		class: className = "",
		...restProps
	}: ComponentProps = $props();

	onMount(() => {
		registerPluginOnce(SplitText);
	});

	let wrapperRef: HTMLSpanElement | undefined;
	let splitInstance: SplitText | null = null;
	let charNodes: HTMLElement[] = [];
	let charPositions: { x: number; width: number }[] = [];

	const attachWrapperRef = (node: HTMLSpanElement) => {
		wrapperRef = node;
		return () => {
			if (wrapperRef === node) {
				wrapperRef = undefined;
			}
		};
	};

	$effect(() => {
		if (typeof window === "undefined") return;
		if (!wrapperRef) return;
		const node = wrapperRef;

		if (splitInstance) {
			splitInstance.revert();
		}

		const ctx = gsap.context(() => {
			const split = SplitText.create(node, {
				type: "chars",
				reduceWhiteSpace: false,
			});
			splitInstance = split;
			charNodes = split.chars as HTMLElement[];
			charNodes.forEach((charNode) => {
				charNode.style.fontWeight = String(baseWeight);
				charNode.style.fontVariationSettings = `"wght" ${baseWeight.toString()}`;
				charNode.style.display = "inline-block";
				if (!charNode.textContent.trim()) {
					charNode.style.whiteSpace = "pre";
					charNode.style.pointerEvents = "none";
					charNode.style.minWidth = "0.25em";
				}
			});
		}, node);

		void tick().then(() => {
			charPositions = charNodes.map((charNode) => {
				const rect = charNode.getBoundingClientRect();
				return {
					x: rect.left + rect.width / 2,
					width: rect.width,
				};
			});
		});

		const calculateWeight = (distance: number) => {
			if (influenceRadius <= 0) return baseWeight;
			if (distance > influenceRadius + 1) return baseWeight;
			const normalized = Math.max(0, 1 - distance / (influenceRadius + 1));
			const shaped = Math.pow(normalized, falloffPower);
			return baseWeight + (hoverWeight - baseWeight) * shaped;
		};

		const applyGsap = (node: HTMLElement, weight: number) => {
			gsap.to(node, {
				fontWeight: weight,
				fontVariationSettings: `"wght" ${weight.toString()}`,
				duration,
				ease,
				overwrite: "auto",
			});
		};

		const animateWeights = (targetIndex: number | null) => {
			if (!charNodes.length) return;
			charNodes.forEach((charNode, i) => {
				const weight =
					targetIndex === null
						? baseWeight
						: calculateWeight(Math.abs(i - targetIndex));
				applyGsap(charNode, weight);
			});
		};

		const handleMove = (e: PointerEvent) => {
			if (!charNodes.length || !charPositions.length) return;
			const mouseX = e.clientX;
			charNodes.forEach((charNode, i) => {
				const { x, width } = charPositions[i];
				const distance = Math.abs(mouseX - x) / width;
				const weight = calculateWeight(distance);
				applyGsap(charNode, weight);
			});
		};

		const handleLeave = () => {
			animateWeights(null);
		};

		node.addEventListener("pointermove", handleMove);
		node.addEventListener("pointerleave", handleLeave);

		return () => {
			node.removeEventListener("pointermove", handleMove);
			node.removeEventListener("pointerleave", handleLeave);
			ctx.revert();
			splitInstance?.revert();
			splitInstance = null;
			charNodes = [];
			charPositions = [];
		};
	});
</script>

<span
	{...restProps}
	class={cn("font-inherit inline-block align-baseline text-inherit", className)}
	{@attach attachWrapperRef}
>
	{@render children?.()}
</span>