<script lang="ts">
  import SiteMenu from "$lib/components/ui/SiteMenu.svelte";
  import TextLoop from "$lib/components/ui/TextLoop.svelte";
  import Button from "$lib/components/ui-registry/Button.svelte";
  import LightTunnel from "$lib/components/ui-registry/LightTunnel.svelte";
  import PageSeo from "$lib/components/seo/PageSeo.svelte";

  const heroLoopTexts = [
    "интерфейсов",
    "карточек",
    "типографики",
    "медиа",
    "текстур",
    "документации",
  ];

  const GITHUB_UI_REGISTRY_URL =
    "https://github.com/opensophy-projects/site/tree/main/apps/web/src/lib/components/ui-registry";
</script>

<PageSeo
  title="Библиотека компонентов — opensophy"
  description="Готовые Svelte-компоненты Opensophy: интерфейс, карточки, типографика, медиа, текстуры и документация."
  type="website"
/>

<main
  id="main-content"
  tabindex="-1"
  class="relative flex min-h-dvh w-full flex-col items-center bg-background"
>
  <SiteMenu />

  <!-- Hero Section -->
  <section
    class="hero-section relative flex w-full items-center justify-center overflow-hidden px-6 py-24 md:py-32"
  >
    <div class="tunnel-bg" aria-hidden="true">
      <LightTunnel size={1.2} cableCount={60} thickness={0.6} glow={1.8} />
    </div>

    <div
      class="relative z-10 flex w-full max-w-5xl flex-col items-center gap-6 text-center"
    >
      <p class="hero-name">Библиотека компонентов</p>
      <h1 class="hero-lead">
        Готовые Svelte-компоненты для <TextLoop
          texts={heroLoopTexts}
          interval={2200}
          class="text-accent font-inherit"
        />
      </h1>

      <div class="hero-actions">
        <Button variant="primary" size="lg" href="/components/overview">
          Список и демка компонентов
        </Button>
        <Button variant="secondary" size="lg" href={GITHUB_UI_REGISTRY_URL}>
          Посмотреть в GitHub
        </Button>
      </div>
    </div>
  </section>
</main>

<style>
  /* ─── Hero Section ─────────────────────────────────────────── */
  .hero-section {
    min-height: 100dvh;
    position: relative;
  }

  /* ─── Фон секции (световой тоннель на весь блок) ───────────── */
  .tunnel-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  /* ─── Hero Typography ──────────────────────────────────────── */
  .hero-name {
    font-size: clamp(3rem, 8vw, 5.5rem);
    font-weight: 500;
    letter-spacing: -0.02em;
    color: var(--foreground);
    margin: 0;
    line-height: 1.1;
  }

  .hero-lead {
    font-size: clamp(1rem, 2.5vw, 1.5rem);
    font-weight: 500;
    line-height: 1.55;
    color: var(--foreground-muted);
    margin: 0;
  }

  /* ─── Hero Actions ─────────────────────────────────────────── */
  .hero-actions {
    margin-top: 1rem;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
  }
</style>