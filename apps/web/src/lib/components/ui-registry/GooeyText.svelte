<script lang="ts" module>
  // Значения из ./conf и ./helpers в сообщении не пришли: ниже классическая формула
  // «gooey text» (порог по альфа-каналу + блюр). Замените на свои при необходимости.
  export const THRESHOLD_MATRIX = "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 255 -140";

  export function calculateBlur(visibility: number): number {
    return visibility > 0 ? Math.min(8 / visibility - 8, 100) : 100;
  }

  export function calculateOpacity(visibility: number): number {
    return visibility > 0 ? Math.pow(visibility, 0.4) : 0;
  }

  export type IGooeyText = {
    texts: string[];
    /** Длительность морфинга, сек */
    morphTime?: number;
    /** Пауза между морфингами, сек */
    cooldownTime?: number;
    fontSize?: number;
    color?: string;
    fontFamily?: string;
    fontWeight?: string | number;
    width?: number;
    height?: number;
    /** Inline-стили корневого элемента */
    style?: string;
    class?: string;
    textClass?: string;
  };
</script>

<script lang="ts">
  let {
    texts,
    morphTime = 1,
    cooldownTime = 0.25,
    fontSize = 48,
    color = "black",
    fontFamily,
    fontWeight = "bold",
    width = 300,
    height = 100,
    style = "",
    class: className = "",
    textClass = "",
  }: IGooeyText = $props();

  const uid = $props.id();
  const filterId = `${uid}-threshold`;

  const cycleTime = $derived(cooldownTime + morphTime);
  const cooldownFraction = $derived(cooldownTime / cycleTime);
  const total = $derived(texts.length);

  // «Главные часы»: 0 → texts.length, целая часть — текущий текст, дробная — прогресс цикла
  let clock = $state(0);

  $effect(() => {
    clock = 0;
    if (total < 2) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let start: number | undefined;

    const tick = (now: number) => {
      start ??= now;
      const elapsed = (now - start) / 1000;
      clock = (elapsed / cycleTime) % total;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  });

  function visibilityOf(index: number, c: number): number {
    const cycleIndex = Math.floor(c) % total;
    const nextIndex = (cycleIndex + 1) % total;
    const progressInCycle = c % 1;

    let morphProgress = 0;
    if (progressInCycle >= cooldownFraction) {
      morphProgress = (progressInCycle - cooldownFraction) / (1 - cooldownFraction);
    }

    if (index === cycleIndex) return 1 - morphProgress;
    if (index === nextIndex) return morphProgress;
    return 0;
  }

  const items = $derived(
    texts.map((text, index) => {
      const v = visibilityOf(index, clock);
      const blur = calculateBlur(v);
      const opacity = calculateOpacity(v);
      return {
        text,
        opacity,
        filter: opacity === 0 ? "none" : `blur(${blur.toFixed(2)}px)`,
      };
    }),
  );

  const fontCss = $derived(
    `font-size: ${fontSize}px; font-weight: ${fontWeight}; color: ${color};` +
      (fontFamily ? ` font-family: ${fontFamily};` : ""),
  );
</script>

<div
  class="gooey-text {className}"
  style="width: {width}px; height: {height}px; {style}"
>
  <span class="sr-only">{texts.join(", ")}</span>

  {#if total < 2}
    <div class="layer" aria-hidden="true">
      <span class="item {textClass}" style={fontCss}>{texts[0] ?? ""}</span>
    </div>
  {:else}
    <svg class="defs" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        <filter id={filterId} color-interpolation-filters="sRGB">
          <feColorMatrix in="SourceGraphic" type="matrix" values={THRESHOLD_MATRIX} />
        </filter>
      </defs>
    </svg>

    <div class="layer" aria-hidden="true" style="filter: url(#{filterId});">
      {#each items as item, i (i)}
        <span
          class="item {textClass}"
          style="{fontCss} opacity: {item.opacity}; filter: {item.filter};"
        >{item.text}</span>
      {/each}
    </div>
  {/if}
</div>

<style>
  .gooey-text {
    position: relative;
    overflow: hidden;
  }

  .defs {
    position: absolute;
    pointer-events: none;
  }

  .layer {
    position: absolute;
    inset: 0;
  }

  .item {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    line-height: 1;
    user-select: none;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>