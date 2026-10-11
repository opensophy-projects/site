<script lang="ts">
  import { brandingConfig } from "$lib/config/branding";
  import SiteMenu from "$lib/components/ui-registry/SiteMenu.svelte";
  import AsciiObject from "$lib/components/ui-registry/AsciiObject.svelte";
  import Button from "$lib/components/ui-registry/Button.svelte";
  import DiaText from "$lib/components/ui-registry/DiaText.svelte";
  import { contactsState } from "$lib/stores/contacts.svelte";

  const audiences = [
    {
      title: "Для начинающих",
      reveal: "статьи, разборы и образовательный контент",
    },
    {
      title: "Для разработчиков",
      reveal: "open source продукты и готовые инженерные решения",
    },
    {
      title: "Для компаний",
      reveal: "доступные услуги в сфере безопасности и DevSecOps",
    },
  ];
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
  <section class="hero-section relative flex w-full justify-center px-4 pt-20 sm:px-6">
    <div class="hero-card" aria-hidden="true">
      <div class="hero-bg"></div>
    </div>

    <div class="hero-inner relative z-10 grid w-full max-w-5xl items-center gap-8 px-2 py-16 sm:gap-10 sm:px-4 sm:py-20 lg:grid-cols-[1fr_auto_1fr] lg:gap-12 lg:py-24">
      <div class="hero-copy">
        <p class="hero-eyebrow">OpenSophy</p>
        <h1>Мастерская DevSecOps</h1>
        <p class="hero-description">
          Безопасная инфраструктура, open source и инженерные решения без лишней сложности.
        </p>
        <div class="hero-actions">
          <Button size="md" variant="primary" onclick={() => contactsState.open()}>
            Контакты
          </Button>
          <Button size="md" variant="secondary" href="/solutions">
            Посмотреть услуги
          </Button>
        </div>
      </div>

      <div class="hero-ascii" aria-label="ASCII логотип OpenSophy">
        <AsciiObject
          src={brandingConfig.logo}
          ascii={true}
          colored={false}
          color="#f43f5e"
          highlight="#f43f5e"
          background=""
          cellSize={8}
          contrast={1.5}
          exposure={1}
          scale={5}
          orbit={false}
          zoom={false}
          autoRotate={false}
          floatIntensity={0}
          rotationIntensity={0}
          class="ascii-logo-canvas"
        />
      </div>

      <div class="hero-audiences" aria-label="Для кого OpenSophy">
        {#each audiences as audience}
          <div class="audience-item">
            <DiaText
              text={audience.title}
              revealText={audience.reveal}
              revealOnHover={true}
              duration={900}
              sweepColors={["#f43f5e", "#fda4af", "#ffffff"]}
              textClass="audience-title"
            />
          </div>
        {/each}
      </div>
    </div>
  </section>
</main>

<style>
  .hero-section {
    min-height: calc(100dvh - 1rem);
    overflow: hidden;
  }

  .hero-card {
    position: absolute;
    top: 5rem;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    max-width: 80rem;
    margin: 0 auto;
    overflow: hidden;
    border-radius: var(--radius-3xl, 3.3rem);
    pointer-events: none;
  }

  .hero-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(
      125% 125% at 50% 0%,
      transparent 40%,
      #f43f5e 68%,
      #fda4af 86%,
      #fff1f2 100%
    );
    opacity: 0.28;
  }

  :global(.dark) .hero-bg {
    opacity: 0.22;
  }

  .hero-inner {
    min-height: calc(100dvh - 5rem);
  }

  .hero-copy {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    max-width: 22rem;
  }

  .hero-eyebrow {
    margin: 0 0 0.75rem;
    color: var(--accent);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    max-width: 20rem;
    color: var(--foreground);
    font-size: clamp(2.25rem, 5vw, 4.4rem);
    font-weight: 500;
    letter-spacing: -0.045em;
    line-height: 0.98;
  }

  .hero-description {
    max-width: 21rem;
    margin: 1.35rem 0 0;
    color: var(--foreground-muted);
    font-size: clamp(0.95rem, 1.5vw, 1.08rem);
    line-height: 1.65;
  }

  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
    margin-top: 1.5rem;
  }

  .hero-ascii {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: clamp(15rem, 28vw, 25rem);
    height: clamp(15rem, 28vw, 25rem);
    justify-self: center;
    color: var(--accent);
  }

  :global(.ascii-logo-canvas) {
    position: relative;
    z-index: 1;
    display: block;
    width: 100%;
    height: 100%;
  }

  .hero-audiences {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1.5rem;
    min-width: 0;
    max-width: 25rem;
    justify-self: end;
  }

  .audience-item {
    min-width: 0;
    color: var(--foreground);
  }

  .audience-title {
    font-size: clamp(1rem, 1.6vw, 1.15rem);
    font-weight: 600;
    line-height: 1.35;
    letter-spacing: -0.015em;
  }

  @media (max-width: 1023px) {
    .hero-section {
      min-height: auto;
    }

    .hero-inner {
      min-height: auto;
      grid-template-columns: minmax(0, 1fr) minmax(15rem, 22rem);
    }

    .hero-ascii {
      grid-column: 2;
      grid-row: 1 / span 2;
    }

    .hero-audiences {
      grid-column: 1 / -1;
      grid-row: 2;
      justify-self: stretch;
      max-width: none;
      padding-top: 1rem;
    }
  }

  @media (max-width: 639px) {
    .hero-section {
      padding-left: 1rem;
      padding-right: 1rem;
    }

    .hero-inner {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 2rem;
      padding-top: 3rem;
      padding-bottom: 4rem;
    }

    .hero-copy {
      max-width: none;
    }

    .hero-ascii {
      order: -1;
      width: min(78vw, 21rem);
      height: min(78vw, 21rem);
      align-self: center;
    }

    .hero-audiences {
      gap: 1.1rem;
      padding-top: 0;
    }

    .hero-card {
      top: 5rem;
      border-radius: var(--radius-2xl, 2rem);
    }

    .reveal {
      white-space: normal;
    }
  }
</style>
