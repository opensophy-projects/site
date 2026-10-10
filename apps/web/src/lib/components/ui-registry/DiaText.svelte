<script lang="ts" module>
  // Значения по умолчанию (замените на свои из ./const, если они у вас есть).
  // Easing из reanimated не переносится, поэтому здесь CSS-аналоги.
  export const DEFAULT_SWEEP_COLORS = ["#ffffff", "#c4b5fd", "#ffffff"];
  export const DEFAULT_BASE_COLOR = "currentColor";
  export const DEFAULT_DURATION = 1200;
  export const DEFAULT_DELAY = 0;
  export const DEFAULT_LOOP_DELAY = 0;
  export const DEFAULT_BAND_RATIO = 0.22;
  export const ENTER_DURATION = 350;
  export const EXIT_DURATION = 250;
  export const SWAP_SHIFT = 8; // px
  export const SWAP_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
  export const SWEEP_EASING = "cubic-bezier(0.4, 0, 0.2, 1)";

  export type IDiaText = {
    text: string | string[];
    sweepColors?: string[];
    baseColor?: string;
    duration?: number;
    delay?: number;
    loop?: boolean;
    loopDelay?: number;
    bandRatio?: number;
    autoPlay?: boolean;
    /** CSS-строка со стилями шрифта: "font-size: 24px; font-weight: 700" */
    textStyle?: string;
    /** CSS-строка для корневого элемента */
    style?: string;
    /** Класс корневого элемента */
    class?: string;
    /** Класс текста */
    textClass?: string;
    onSweepEnd?: (finishedIndex: number) => void;
  };
</script>

<script lang="ts">
  import { onDestroy } from "svelte";

  let {
    text,
    sweepColors = DEFAULT_SWEEP_COLORS,
    baseColor = DEFAULT_BASE_COLOR,
    duration = DEFAULT_DURATION,
    delay = DEFAULT_DELAY,
    loop = false,
    loopDelay = DEFAULT_LOOP_DELAY,
    bandRatio = DEFAULT_BAND_RATIO,
    autoPlay = true,
    textStyle = "",
    style = "",
    class: className = "",
    textClass = "",
    onSweepEnd,
  }: IDiaText = $props();

  const texts = $derived<string[]>(Array.isArray(text) ? [...text] : [text]);
  const textKey = $derived(texts.join(""));
  const isMulti = $derived(texts.length > 1);

  let index = $state(0);
  let cycle = $state(0);
  let width = $state(0);

  let contentEl: HTMLElement | undefined = $state();
  let sweepEl: HTMLElement | undefined = $state();
  let timer: ReturnType<typeof setTimeout> | undefined;

  // Сброс на первый текст при смене набора текстов
  let previousTextKey = "";
  $effect(() => {
    if (previousTextKey !== textKey) {
      previousTextKey = textKey;
      index = 0;
    }
  });

  const band = $derived(width * bandRatio);
  const strip = $derived(width + band);
  const ready = $derived(width > 0);
  const label = $derived(texts[index] ?? "");

  // Градиент: базовый цвет, затем полоса sweepColors на ведущем краю, затем прозрачность
  const gradient = $derived.by(() => {
    if (!ready) return "none";
    const start = (width / strip) * 100;
    const colors = [...sweepColors, "transparent"];
    const step = (100 - start) / (colors.length - 1);
    const stops = colors
      .map((c, i) => `${c} ${(start + step * i).toFixed(2)}%`)
      .join(", ");
    return `linear-gradient(90deg, ${baseColor} 0%, ${baseColor} ${start.toFixed(2)}%, ${stops})`;
  });

  function commitNext() {
    index = (index + 1) % texts.length;
    cycle += 1;
  }

  function handleSweepEnd(finishedIndex: number) {
    onSweepEnd?.(finishedIndex);
    if (!loop) return;

    timer = setTimeout(() => {
      if (!isMulti) {
        cycle += 1;
        return;
      }
      const exit = contentEl?.animate(
        [
          { opacity: 1, transform: "translateY(0)" },
          { opacity: 0, transform: `translateY(${-SWAP_SHIFT}px)` },
        ],
        { duration: EXIT_DURATION, easing: SWAP_EASING, fill: "forwards" },
      );
      if (!exit) return commitNext();
      exit.finished.then(commitNext).catch(() => undefined);
    }, loopDelay);
  }

  $effect(() => {
    if (!ready || !autoPlay || !sweepEl) return;

    const playing = index;

    // prefers-reduced-motion: без анимации, сразу итоговое состояние
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onSweepEnd?.(playing);
      return;
    }

    const animations: Animation[] = [];

    if (isMulti && contentEl) {
      animations.push(
        contentEl.animate(
          [
            { opacity: 0, transform: `translateY(${SWAP_SHIFT}px)` },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: ENTER_DURATION, easing: SWAP_EASING, fill: "both" },
        ),
      );
    }

    const sweep = sweepEl.animate(
      [
        { backgroundPositionX: "calc(var(--travel) * -1)" },
        { backgroundPositionX: "0px" },
      ],
      { duration, delay, easing: SWEEP_EASING, fill: "both" },
    );
    sweep.id = String(cycle);
    animations.push(sweep);

    sweep.finished.then(() => handleSweepEnd(playing)).catch(() => undefined);

    return () => {
      clearTimeout(timer);
      animations.forEach((a) => a.cancel());
    };
  });

  onDestroy(() => clearTimeout(timer));
</script>

<span class="dia-text {className}" {style}>
  <!-- Невидимый «измеритель» размера (и текст для скринридеров) -->
  <span class="sizer {textClass}" style={textStyle} bind:clientWidth={width}>{label}</span>

  {#if ready}
    <span
      class="content"
      aria-hidden="true"
      bind:this={contentEl}
      style:opacity={isMulti ? 0 : 1}
    >
      <span
        class="sweep {textClass}"
        bind:this={sweepEl}
        style="{textStyle}; --strip: {strip}px; --travel: {strip}px; background-image: {gradient};"
      >{label}</span>
    </span>
  {/if}
</span>

<style>
  .dia-text {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  .sizer {
    display: inline-block;
    white-space: nowrap;
    opacity: 0;
  }

  .content {
    position: absolute;
    inset: 0;
    pointer-events: none;
    display: flex;
    align-items: center;
  }

  .sweep {
    display: inline-block;
    white-space: nowrap;
    /* color не трогаем, чтобы currentColor в градиенте работал */
    -webkit-text-fill-color: transparent;
    -webkit-background-clip: text;
    background-clip: text;
    background-repeat: no-repeat;
    background-size: var(--strip) 100%;
    background-position-x: calc(var(--travel) * -1);
  }

  @media (prefers-reduced-motion: reduce) {
    .content {
      opacity: 1 !important;
    }
    .sweep {
      background-position-x: 0 !important;
    }
  }
</style>