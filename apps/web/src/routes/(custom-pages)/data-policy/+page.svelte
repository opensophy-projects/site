<script lang="ts">
  import PageSeo from '$lib/components/seo/PageSeo.svelte';
  import SiteMenu from "$lib/components/ui-registry/SiteMenu.svelte";
</script>

<PageSeo title="Политика обработки данных — opensophy" description="Политика обработки данных Opensophy." type="website" />

<main class="policy-page">
  <SiteMenu />
  <article class="policy-document">
    <h1>Политика обработки данных</h1>
  </article>
</main>

<style>
  .policy-page {
    min-height: 100dvh;
    background: var(--background);
    padding: 7rem 1rem 5rem;
  }
  .policy-document {
    max-width: 52rem;
    margin: 0 auto;
  }
  h1 {
    margin: 0.75rem 0 2.5rem;
    color: var(--foreground);
    font-size: clamp(2.25rem, 6vw, 4rem);
    line-height: 1.08;
    letter-spacing: -0.04em;
  }
</style>
