<script lang="ts">
	import { gsap } from "gsap";
	import { SplitText } from "gsap/SplitText";
	import { onMount } from "svelte";
	import type { Snippet } from "svelte";
	import { registerPluginOnce } from "$lib/helpers/gsap";
	import { cn } from "$lib/utils/cn";

	type ComponentProps = {
		children?: Snippet;
		class?: string;
		hoverTarget?: HTMLElement | null;
		scrambleDuration?: number;
		stagger?: number;
		cycles?: number;
		characters?: string;
		[prop: string]: unknown;
	};

	let {
		children,
		class: className = "",
		hoverTarget = null,
		scrambleDuration = 0.6,
		stagger = 0.03,
		cycles = 12,
		characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*",
		...restProps
	}: ComponentProps = $props();

	onMount(() => {
		registerPluginOnce(SplitText);
	});

	let wrapperRef: HTMLSpanElement | undefined;
	let splitInstance: SplitText | null = null;
	let hoverTimeline: gsap.core.Timeline | null = null;

	const attachWrapperRef = (node: HTMLSpanElement) => {
		wrapperRef = node;
		return () => {
			if (wrapperRef === node) {
				wrapperRef = undefined;
			}
		};
	};

	const getRandomChar = (pool: string) => {
		if (!pool.length) return "";
		const index = Math.floor(Math.random() * pool.length);
		return pool[index] ?? "";
	};

	const createScrambleTimeline = (nodes: HTMLElement[]) => {
		if (!nodes.length) return null;
		const pool = characters.length
			? characters
			: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		const timeline = gsap.timeline({ paused: true });
		const totalDuration = Math.max(0.1, scrambleDuration);
		const stepCount = Math.max(1, Math.floor(cycles));
		const stepDuration = totalDuration / stepCount;
		nodes.forEach((node, index) => {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- dataset values are typed as string by this project's DOM lib config, but are genuinely undefined until set below, so the fallback chain is required at runtime.
			const finalChar = node.dataset.originalChar ?? node.textContent ?? "";
			const charTimeline = gsap.timeline();
			if (finalChar.trim().length === 0) {
				charTimeline.call(() => {
					node.textContent = finalChar;
				});
			} else {
				for (let i = 0; i < stepCount; i += 1) {
					charTimeline.call(() => {
						node.textContent = getRandomChar(pool);
					});
					charTimeline.to({}, { duration: stepDuration });
				}
				charTimeline.call(() => {
					node.textContent = finalChar;
				});
			}
			timeline.add(charTimeline, index * stagger);
		});
		return timeline;
	};

	$effect(() => {
		if (typeof window === "undefined") return;
		if (!wrapperRef) return;
		const node = wrapperRef;
		const target = hoverTarget ?? node;
		hoverTimeline?.kill();
		hoverTimeline = null;
		splitInstance?.revert();

		const ctx = gsap.context(() => {
			const split = SplitText.create(node, {
				type: "chars",
				reduceWhiteSpace: false,
				charsClass: "inline-block",
			});
			splitInstance = split;
			const charNodes = split.chars as HTMLElement[];
			charNodes.forEach((charNode) => {
				charNode.style.display = "inline-block";
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- fallback keeps the assigned type as string; dataset values must not be null.
				charNode.dataset.originalChar = charNode.textContent ?? "";
				if (!charNode.textContent.trim()) {
					charNode.style.whiteSpace = "pre";
					charNode.style.pointerEvents = "none";
				}
			});
			hoverTimeline ??= createScrambleTimeline(charNodes);
			const handleEnter = () => {
				hoverTimeline ??= createScrambleTimeline(charNodes);
				hoverTimeline?.restart();
			};
			const handleLeave = () => {
				hoverTimeline?.progress(1);
			};
			target.addEventListener("mouseenter", handleEnter);
			target.addEventListener("mouseleave", handleLeave);
			return () => {
				target.removeEventListener("mouseenter", handleEnter);
				target.removeEventListener("mouseleave", handleLeave);
			};
		}, node);

		return () => {
			ctx.revert();
			hoverTimeline = null;
			splitInstance?.revert();
			splitInstance = null;
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