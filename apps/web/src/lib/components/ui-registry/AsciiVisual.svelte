<script lang="ts">
  /**
   * Обёртка над AsciiObject (WebGL/ASCII-рендер).
   *
   * По умолчанию на слабых устройствах (смартфоны, планшеты, маломощные ПК)
   * тяжёлый ASCII-рендер не запускается — вместо него показывается обычная
   * картинка (<img>) с тем же src.
   *
   * Для конкретного места fallback можно отключить: forceAscii={true}.
   * Тогда ASCII-рендер запускается на любом устройстве, включая мобильные.
   */
  import type { ComponentProps } from "svelte";
  import AsciiObject from "$lib/components/ui-registry/AsciiObject.svelte";
  import { canRunHeavyEffects } from "$lib/utils/perf";

  // Типы пропсов берём напрямую из компонента, а не через отдельный
  // именованный экспорт (он не резолвился и превращался в 'error' type).
  type AsciiObjectProps = ComponentProps<typeof AsciiObject>;

  type Props = Omit<AsciiObjectProps, "class" | "src"> & {
    class?: string;
    src?: string;
    /** CSS-класс для картинки-замены на слабых устройствах */
    imgClass?: string;
    /** Альтернативный текст для картинки на слабых устройствах */
    alt?: string;
    /** Всегда рендерить ASCII, без картинки-замены на слабых устройствах */
    forceAscii?: boolean;
  };

  let {
    class: className = "",
    imgClass = "h-full w-full object-contain",
    alt = "",
    src = "",
    forceAscii = false,
    ...options
  }: Props = $props();

  // Решение принимается один раз на клиенте после монтирования.
  let heavy = $state(false);
  let mounted = $state(false);

  $effect(() => {
    heavy = forceAscii || canRunHeavyEffects();
    mounted = true;
  });
</script>

{#if mounted && heavy}
  <AsciiObject {src} class={className} {...options} />
{:else if mounted}
  <!-- Слабое устройство: лёгкая статичная картинка вместо WebGL-рендера -->
  <div class={className} style="position: relative;">
    {#if src}
      <img
        {src}
        {alt}
        loading="lazy"
        decoding="async"
        aria-hidden={alt ? undefined : true}
        class={imgClass}
        style="display: block;"
      />
    {/if}
  </div>
{/if}