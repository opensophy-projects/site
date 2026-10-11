<script lang="ts">
  import { brandingConfig } from "$lib/config/branding";
  import SiteMenu from "$lib/components/ui-registry/SiteMenu.svelte";
  import TextLoop from "$lib/components/ui-registry/TextLoop.svelte";

  const heroLoopTexts = ["Open Source", "DevSecOps"];
</script>

<a
  href="#main-content"
  class="sr-only fixed top-3 left-3 z-100 bg-foreground px-4 py-2 text-sm text-background-inset focus:not-sr-only"
>
  Skip to main content
</a>

<main
  id="main-content"
  tabindex="-1"
  class="relative flex min-h-dvh w-full flex-col items-center bg-background"
>
  <SiteMenu />

  <!-- Hero Section -->
  <section
    class="hero-section relative mx-auto flex w-full max-w-5xl items-center justify-center px-4 py-24 md:py-32"
  >
    <div class="hero-card" aria-hidden="true">
      <div class="hero-bg"></div>
    </div>

    <div
      class="relative z-10 flex w-full max-w-5xl flex-col items-center gap-4 text-center"
    >
      <p class="hero-name">{brandingConfig.name}</p>
      <p class="hero-lead">
        здесь про <TextLoop
          texts={heroLoopTexts}
          interval={2200}
          class="text-accent"
        />
      </p>
    </div>
  </section>
</main>
