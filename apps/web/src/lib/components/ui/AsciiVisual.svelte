<script lang="ts">
  /**
   * Обёртка над AsciiObject (WebGL/ASCII-рендер).
   *
   * На слабых устройствах (смартфоны, планшеты, маломощные ПК) тяжёлый
   * ASCII-рендер не запускается — вместо него показывается обычная
   * картинка (<img>) с тем же src. Это чинит «белые экраны» и
   * неработающие иллюстрации в секции «Услуги» и логотип на главной.
   */
  import AsciiObject from "$lib/components/ui-registry/AsciiObject.svelte";
  import type { AsciiObjectOptions } from "$lib/components/ui-registry/AsciiObject.svelte";
  import { canRunHeavyEffects } from "$lib/utils/perf";

  type Props = AsciiObjectOptions & {
    class?: string;
    /** CSS-класс для картинки-замены на слабых устройствах */
    imgClass?: string;
    /** Альтернативный текст для картинки на слабых устройствах */
    alt?: string;
  };

  let {
    class: className = "",
    imgClass = "h-full w-full object-contain",
    alt = "",
    src = "",
    ...options
  }: Props = $props();

  // Решение принимается один раз на клиенте после монтирования.
  let heavy = $state(false);
  let mounted = $state(false);

  $effect(() => {
    heavy = canRunHeavyEffects();
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
