<script context="module" lang="ts">
  export type GlowHorizonVariant = "top" | "bottom" | "left" | "right";

  interface VariantConfig {
    axis: "x" | "y";
    enterPct: number; // in %
    restPct: number;  // in %
  }

  const VARIANTS: Record<GlowHorizonVariant, VariantConfig> = {
    top:    { axis: "y", enterPct: -100, restPct: -50 },
    bottom: { axis: "y", enterPct:  100, restPct:  50 },
    left:   { axis: "x", enterPct:  100, restPct:  50 },
    right:  { axis: "x", enterPct: -100, restPct: -50 },
  };
</script>

<script lang="ts">
  import { onMount } from "svelte";

  export let className: string = "";
  export let variant: GlowHorizonVariant = "top";

  const DURATION = 2000; // ms
  const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

  $: config = VARIANTS[variant];
  $: sign = config.enterPct < 0 ? -1 : 1;

  let mounted = false;
  onMount(() => {
    // trigger enter -> rest transition on next frame
    requestAnimationFrame(() => {
      mounted = true;
    });
  });

  // Root container transform/position depends on axis
  $: axisProp = config.axis; // "x" | "y"
  $: enterVal = config.enterPct;
  $: restVal = config.restPct;

  interface ArcSpec {
    color: string;
    size: string; // e.g. "132%"
    initialOffset?: string; // e.g. "10%"
    blur?: number;
    boxShadow?: string;
    delay: number; // seconds
  }

  $: arcs = [
    { color: "#FFFFFF", size: "132%", boxShadow: "0px -4px 23px 0px #ffffffb5", delay: 1.2 },
    { color: "#A558FB", size: "120%", initialOffset: "10%", blur: 31, delay: 0.6 },
    { color: "#4922E5", size: "124%", initialOffset: "10%", blur: 21, delay: 0 },
    { color: "transparent", size: "120%", initialOffset: "10%", blur: 51, delay: 0 },
  ] as ArcSpec[];

  function arcStartOffset(initialOffset: string | undefined): number | undefined {
    if (!initialOffset) return undefined;
    const off = parseFloat(initialOffset);
    return sign * Math.abs(off - 50);
  }
</script>

<div
  class={"glow-horizon-root " + className}
  class:axis-x={axisProp === "x"}
  class:axis-y={axisProp === "y"}
  class:side-top={variant === "top"}
  class:side-bottom={variant === "bottom"}
  class:side-left={variant === "left"}
  class:side-right={variant === "right"}
  style="
    --duration: {DURATION}ms;
    --ease: {EASE};
    --enter-pct: {enterVal}%;
    --rest-pct: {restVal}%;
    --scale: 1;
    --opacity: 1;
    --blur: 0px;
  "
>
  {#each arcs as arc}
    {@const startOffset = arcStartOffset(arc.initialOffset)}
    <div
      aria-hidden="true"
      class="glow-arc"
      class:axis-x={axisProp === "x"}
      class:axis-y={axisProp === "y"}
      style="
        --arc-scale: {parseFloat(arc.size) / 100};
        --arc-color: {arc.color};
        --arc-blur: {arc.blur !== undefined ? `${arc.blur}px` : '0px'};
        --arc-box-shadow: {arc.boxShadow ?? 'none'};
        --arc-delay: {arc.delay}s;
        --arc-duration: {DURATION}ms;
        --arc-ease: {EASE};
        --arc-start: {startOffset !== undefined ? `${startOffset}%` : '0%'};
        --arc-end: 0%;
      "
      class:has-offset={startOffset !== undefined}
      class:settled={mounted}
    ></div>
  {/each}
</div>

<style>
  .glow-horizon-root {
    position: absolute;
    z-index: 1;
    inset: 0;
    display: block;
    isolation: isolate;
    opacity: 1;
    background: radial-gradient(ellipse 85% 65% at 50% 0%, #ffffff 0%, #a558fb 22%, #4922e5 42%, transparent 72%);
    filter: none;
    transform-origin: center;
    transition:
      transform var(--duration) var(--ease),
      opacity var(--duration) var(--ease),
      filter var(--duration) var(--ease);
  }

  .glow-horizon-root.axis-y,
  .glow-horizon-root.axis-x {
    transform: none;
  }

  .glow-horizon-root.side-bottom {
    background: radial-gradient(ellipse 85% 65% at 50% 100%, #ffffff 0%, #a558fb 22%, #4922e5 42%, transparent 72%);
  }

  .glow-horizon-root.side-left {
    background: radial-gradient(ellipse 65% 85% at 0% 50%, #ffffff 0%, #a558fb 22%, #4922e5 42%, transparent 72%);
  }

  .glow-horizon-root.side-right {
    background: radial-gradient(ellipse 65% 85% at 100% 50%, #ffffff 0%, #a558fb 22%, #4922e5 42%, transparent 72%);
  }

  .glow-arc {
    position: absolute;
    inset: 0;
    border-radius: 100%;
    background: var(--arc-color, #ffffff);
    filter: blur(var(--arc-blur, 0px));
    box-shadow: var(--arc-box-shadow);
    transform: scale(var(--arc-scale)) translate(0, 0);
    transition: transform var(--arc-duration) var(--arc-ease) var(--arc-delay);
  }

  .glow-arc.has-offset.axis-y {
    transform: scale(var(--arc-scale)) translateY(var(--arc-start));
  }
  .glow-arc.has-offset.axis-y.settled {
    transform: scale(var(--arc-scale)) translateY(var(--arc-end));
  }

  .glow-arc.has-offset.axis-x {
    transform: scale(var(--arc-scale)) translateX(var(--arc-start));
  }
  .glow-arc.has-offset.axis-x.settled {
    transform: scale(var(--arc-scale)) translateX(var(--arc-end));
  }
</style>