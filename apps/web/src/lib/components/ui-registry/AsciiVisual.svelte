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

  type AsciiObjectProps = ComponentProps<typeof AsciiObject>;

  type Props = Omit<AsciiObjectProps, "class" | "src"> & {
    class?: string;
    src?: string;
    imgClass?: string;
    alt?: string;
    forceAscii?: boolean;
  };

  let {
    class: className = "",
    imgClass = "h-full w-full object-contain",
    alt = "",
    src = "",
    forceAscii = false,
    onLoad: onLoadCallback = null,
    onError: onErrorCallback = null,
    ...options
  }: Props = $props();

  let heavy = $state(false);
  let mounted = $state(false);
  let ready = $state(false);

  $effect(() => {
    heavy = forceAscii || canRunHeavyEffects();
    mounted = true;
    ready = !heavy;
  });

  function handleLoad(): void {
    ready = true;
    onLoadCallback?.();
  }

  function handleError(error: unknown): void {
    onErrorCallback?.(error);
  }
</script>

{#if mounted && heavy}
  <div class={className} style="position: relative;">
    {#if src && !ready}
      <img
        {src}
        {alt}
        loading="eager"
        fetchpriority="high"
        decoding="async"
        aria-hidden={alt ? undefined : true}
        class={imgClass}
        style="position: absolute; inset: 0; display: block;"
      />
    {/if}
    <AsciiObject
      {src}
      class="absolute inset-0 h-full w-full"
      {...options}
      onLoad={handleLoad}
      onError={handleError}
    />
  </div>
{:else if mounted}
  <div class={className} style="position: relative;">
    {#if src}
      <img
        {src}
        {alt}
        loading="eager"
        fetchpriority="high"
        decoding="async"
        aria-hidden={alt ? undefined : true}
        class={imgClass}
        style="display: block;"
      />
    {/if}
  </div>
{/if}