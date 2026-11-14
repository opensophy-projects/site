<script lang="ts">
  import { onMount, type Component } from "svelte";
  import SiteMenu from "$lib/components/ui-registry/SiteMenu.svelte";
  import LogoCarousel from "$lib/components/ui-registry/logo-carousel.svelte";
  import Badge from "$lib/components/ui-registry/Badge.svelte";
  import ShieldInfinity from "$lib/components/ui-registry/ShieldInfinity.svelte";
  import Phosphor from "$lib/components/ui-registry/Phosphor.svelte";
  import Terminal from "$lib/components/ui-registry/Terminal.svelte";
  import Radar from "$lib/components/ui-registry/Radar.svelte";
  import NginxionsSection from "$lib/components/home/NginxionsSection.svelte";
  import ProductsPanel from "$lib/components/home/ProductsPanel.svelte";
  import { contactsState } from "$lib/stores/contacts.svelte";

  // ─── Тяжёлые эффекты hero ─────────────────────────────────────
  // three.js и WebGL-эффекты не входят в критический путь: страница сразу
  // показывает статичный постер логотипа и CSS-дугу, а живые эффекты
  // догружаются после загрузки страницы. На медленной сети или в режиме
  // экономии трафика они не грузятся вовсе — постер остаётся на месте.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type LazyComponent = Component<any> | null;
  let AsciiObject = $state<LazyComponent>(null);
  let ArcFlame = $state<LazyComponent>(null);
  let GhostCursor = $state<LazyComponent>(null);
  // Живой ASCII-рендер отрисован — статичный постер можно убрать
  let logoLive = $state(false);

  type NetworkInformation = { saveData?: boolean; effectiveType?: string };

  function shouldLoadEffects() {
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    if (connection?.saveData) return false;
    if (connection?.effectiveType && /(^|-)2g$/.test(connection.effectiveType)) return false;
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function loadEffects() {
    // Каждый эффект независим: сбой одной загрузки не ломает остальные
    void import("$lib/components/ui-registry/ArcFlame.svelte")
      .then((m) => (ArcFlame = m.default))
      .catch(() => undefined);
    void import("$lib/components/ui-registry/AsciiObject.svelte")
      .then((m) => (AsciiObject = m.default))
      .catch(() => undefined);
    void import("$lib/components/ui-registry/GhostCursor.svelte")
      .then((m) => (GhostCursor = m.default))
      .catch(() => undefined);
  }

  // ─── Нам доверяют ─────────────────────────────────────────────
  type Sponsor = { name: string; description: string; logo?: string };

  const sponsors: Sponsor[] = [
    {
      name: "RUVDS",
      description: "Российский хостинг-провайдер и международный облачный сервис",
      logo: "/ruvds-logo.png",
    },
    {
      name: "Кондор",
      description:
        "Проектировщик и интегратор комплексных систем безопасности и связи",
    },
    {
      name: "Ziree Medical",
      description:
        "Китайский производитель высокотехнологичного медицинского оборудования и устройств фототерапии",
      logo: "/zireelogo.png",
    },
  ];

  // Мобильный режим: крупнее ASCII-лого и всегда карусель партнёров
  let isMobile = $state(false);
  // Телефон (< 768px): без GhostCursor, без текста и кнопок в hero
  let isPhone = $state(false);
  // Помещаются ли все логотипы в одну строку (проверяется по скрытой копии)
  let fits = $state(true);
  let sponsorsEl = $state<HTMLElement | undefined>();
  let measureEl = $state<HTMLElement | undefined>();

  // Hero: ASCII-логотип. GhostCursor плавно гаснет, когда курсор приближается к нему
  let logoEl = $state<HTMLElement | undefined>();
  let ghostOpacity = $state(1);

  // Дуга hero: ArcFlame берёт из неё эллипс, по которому горит огонь
  let arcEl = $state<HTMLElement | undefined>();

  // Карусель: всегда на мобильном, на ПК — только если логотипы не помещаются
  const useCarousel = $derived(isMobile || !fits);
  const groupSize = $derived(isMobile ? 1 : 2);

  function measureSponsors() {
    if (!sponsorsEl || !measureEl) return;
    fits = measureEl.offsetWidth <= sponsorsEl.clientWidth;
  }

  function smoothstep(edge0: number, edge1: number, x: number) {
    const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  let rafId = 0;
  function onPointerMove(e: PointerEvent) {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      if (!logoEl) return;
      const l = logoEl.getBoundingClientRect();
      if (!l.width || !l.height) return;
      const cx = l.left + l.width / 2;
      const cy = l.top + l.height / 2;
      // Нормированное эллиптическое расстояние: 1 = край логотипа
      const dx = (e.clientX - cx) / (l.width / 2);
      const dy = (e.clientY - cy) / (l.height / 2);
      const d = Math.hypot(dx, dy);
      // Внутри логотипа (d < 0.6) — полностью погашен, к d = 1.5 плавно возвращается
      ghostOpacity = smoothstep(0.6, 1.5, d);
    });
  }

  onMount(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    isMobile = mq.matches;
    const onChange = (e: MediaQueryListEvent) => {
      isMobile = e.matches;
    };
    mq.addEventListener("change", onChange);

    const phoneMq = window.matchMedia("(max-width: 767px)");
    isPhone = phoneMq.matches;
    const onPhoneChange = (e: MediaQueryListEvent) => {
      isPhone = e.matches;
    };
    phoneMq.addEventListener("change", onPhoneChange);

    const ro = new ResizeObserver(measureSponsors);
    if (sponsorsEl) ro.observe(sponsorsEl);
    if (measureEl) ro.observe(measureEl);
    measureSponsors();

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    // Эффекты — только после полной загрузки страницы и в свободное время
    let effectsTimer = 0;
    const scheduleEffects = () => {
      if (!shouldLoadEffects()) return;
      effectsTimer = window.setTimeout(loadEffects, 200);
    };
    if (document.readyState === "complete") scheduleEffects();
    else window.addEventListener("load", scheduleEffects, { once: true });

    return () => {
      window.clearTimeout(effectsTimer);
      window.removeEventListener("load", scheduleEffects);
      mq.removeEventListener("change", onChange);
      phoneMq.removeEventListener("change", onPhoneChange);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  });

  // Цвет пламени совпадает с акцентом сайта (#f43f5e)
  const flameColor: [number, number, number] = [0.956, 0.247, 0.369];
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
  class="relative flex flex-col w-full min-h-dvh items-center bg-background"
>
  <SiteMenu />

  <!-- Hero Section -->
  <section
    class="hero-section relative flex w-full items-center justify-center"
    style="--ghost-opacity: {ghostOpacity};"
  >
    <!-- Изогнутое свечение (горизонт) -->
    <div class="hero-card" aria-hidden="true">
      <div class="hero-halo"></div>
      <div class="hero-arc" bind:this={arcEl}></div>
      <!-- Огонь по дуге: эллипс берётся из .hero-arc -->
      {#if ArcFlame}
      <ArcFlame
        arc={arcEl}
        color={flameColor}
        height={isMobile ? 110 : 170}
        intensity={0.85}
        turbulence={0.6}
        melt={6}
        sparks={1.8}
        smoke={1.3}
        rim={3}
      />
      {/if}
    </div>

    {#if GhostCursor && !isPhone}
      <GhostCursor color="#f43f5e" zIndex={1} class="hero-ghost" />
    {/if}

    <div class="hero-inner">
      <h1 class="hero-lead">
        <span class="text-foreground">opensophy</span>
        <span class="hero-lead-line text-accent">Мастерская DevSecOps</span>
      </h1>

      <div class="hero-logo" bind:this={logoEl}>
        <!-- Статичный постер: есть в HTML с первого байта и не зависит от JS -->
        <picture class="hero-poster" class:hero-poster-hidden={logoLive}>
          <source media="(max-width: 1023px)" srcset="/logo-ascii-narrow.webp" />
          <img
            src="/logo-ascii-wide.webp"
            alt="Логотип Opensophy, собранный из ASCII-символов"
            decoding="async"
            fetchpriority="high"
            draggable="false"
          />
        </picture>
        {#if AsciiObject}
          <AsciiObject
            src="/logo-1024.png"
            ascii={true}
            colored={false}
            color="#f43f5e"
            highlight="#f43f5e"
            background=""
            cellSize={isMobile ? 8 : 9}
            contrast={1.5}
            exposure={1}
            scale={isMobile ? 5 : 4}
            orbit={false}
            autoRotate={false}
            rotationIntensity={0.5}
            floatIntensity={isMobile ? 1.5 : 2.5}
            floatSpeed={1.6}
            class="hero-logo-canvas {logoLive ? '' : 'hero-logo-canvas-pending'}"
            onLoad={() => {
              // Два кадра на отрисовку модели, затем плавная смена постера
              requestAnimationFrame(() => requestAnimationFrame(() => (logoLive = true)));
            }}
          />
        {/if}
      </div>

      <div class="services-actions hero-actions">
        <button
          type="button"
          class="services-action services-action-primary"
          onclick={() => contactsState.open()}>Контакты</button
        >
        <a class="services-action" href="/solutions">Услуги</a>
      </div>
    </div>
  </section>

  <!-- Sponsors Section -->
  <section class="sponsors-section w-full max-w-5xl mx-auto px-4">
    <p class="section-overline"><Badge variant="default">Нам доверяют</Badge></p>
    <div class="sponsors-wrap" bind:this={sponsorsEl}>
      <div class="sponsors-measure" bind:this={measureEl} aria-hidden="true" inert>
        {#each sponsors as s (s.name)}
          <span class="sponsor">{@render sponsorFace(s)}</span>
        {/each}
      </div>

      {#if useCarousel}
        <LogoCarousel items={sponsors} count={groupSize}>
          {#snippet children(item: Sponsor)}
            {@render sponsor(item)}
          {/snippet}
        </LogoCarousel>
      {:else}
        <div class="sponsors-row">
          {#each sponsors as s (s.name)}
            {@render sponsor(s)}
          {/each}
        </div>
      {/if}
    </div>
  </section>

  <!-- About us -->
  <section class="section-block about-us-section w-full max-w-6xl mx-auto px-4" aria-label="О нас">
    <p class="section-overline"><Badge variant="accent">О нас</Badge></p>
    <p class="about-us-copy">
      <span class="text-foreground">Opensophy — это команда специалистов в области информационной безопасности и разработки.</span>
      Мы оказываем услуги по внедрению
      <span class="text-accent">DevSecOps, автоматизации процессов и настройке инфраструктуры</span>, а также разрабатываем программное обеспечение и создаем образовательный контент.
    </p>
  </section>

  <!-- Services showcase -->
  <section class="component-showcase" aria-label="Наши направления">
    <div class="component-grid">
      <article class="component-cell">
        <div class="component-visual component-visual-shield">
          <ShieldInfinity accent="#f43f5e" width="100%" />
        </div>
        <div class="component-copy">
          <h2>Автоматическая защита бизнеса</h2>
          <p>
            <span class="text-strong">Настраиваем систему так, чтобы она сама проверяла код и настройки</span>
            <span class="text-accent">на каждом этапе.</span> Наш WAF на базе ИИ учится распознавать новые атаки и блокирует их автоматически.
          </p>
        </div>
      </article>
      <article class="component-cell">
        <div class="component-visual component-visual-phosphor">
          <Phosphor accent="#f43f5e" width="100%" showControls={false} />
        </div>
        <div class="component-copy">
          <h2>Автоматизируем повторяющиеся задачи</h2>
          <p>
            <span class="text-strong">Автоматизируем выгрузку отчетов, рассылку уведомлений и проверку данных:</span>
            <span class="text-accent">рутина будет выполняться сама по расписанию,</span> а команда займётся реальной работой.
          </p>
        </div>
      </article>
      <article class="component-cell">
        <div class="component-visual component-visual-terminal">
          <Terminal accent="#f43f5e" width="100%" showControls={false} />
        </div>
        <div class="component-copy">
          <h2>Создаем цифровые продукты и чиним техническую часть</h2>
          <p>
            <span class="text-strong">Разрабатываем сайты и внутренние инструменты, настраиваем серверы и устраняем сбои.</span> Если система тормозит или не запускается —
            <span class="text-accent">найдём причину и наладим работу.</span>
          </p>
        </div>
      </article>
      <article class="component-cell">
        <div class="component-visual component-visual-radar">
          <Radar scope="self" />
        </div>
        <div class="component-copy">
          <h2>Комплексная проверка безопасности и закрытие рисков</h2>
          <p>
            <span class="text-strong">Проводим полный пассивный и процессный аудит вашей компании,</span>
            <span class="text-accent">выявляя уязвимости до того, как о них узнают хакеры или регуляторы.</span>
          </p>
        </div>
      </article>
    </div>

    <div class="services-actions showcase-actions">
      <a class="services-action services-action-primary" href="/solutions">Посмотреть все услуги</a>
    </div>
  </section>

  <!-- Продукты: NginxionS -->
  <NginxionsSection />

  <!-- Продукты: os.ui · os.mtls · os.docs -->
  <ProductsPanel />

  <!-- Contacts -->
  <section class="section-block contact-section" aria-label="Контакты">
    <p class="section-overline"><Badge variant="accent">Контакты</Badge></p>
    <div class="inset-shadow relative overflow-hidden rounded-xl bg-background-inset p-1.5">
      <div class="contact-card card rounded-lg bg-background">
        <h2 class="contact-title">
          <span class="text-foreground">Остались вопросы?</span>
          <span class="text-accent">Напишите нам</span>
        </h2>
        <p class="contact-text">
          Расскажите о задаче — подскажем, как её решить, и подберём подходящую услугу.
        </p>
        <div class="services-actions contact-actions">
          <button
            type="button"
            class="services-action services-action-primary"
            onclick={() => contactsState.open()}>Написать нам</button
          >
        </div>
      </div>
    </div>
  </section>
</main>

{#snippet sponsorFace(s: Sponsor)}
  {#if s.logo}
    <img src={s.logo} alt={s.name} class="sponsor-logo" loading="lazy" decoding="async" />
  {:else}
    <span class="sponsor-text">{s.name}</span>
  {/if}
{/snippet}

{#snippet sponsor(s: Sponsor)}
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div class="sponsor" tabindex="0" role="group" aria-label="{s.name}: {s.description}">
    {@render sponsorFace(s)}
    <span class="sponsor-tip" role="tooltip">{s.description}</span>
  </div>
{/snippet}

<style>
  /* ─── Hero ─────────────────────────────────────────────────── */
  .hero-section {
    position: relative;
    min-height: 40rem;
    padding: 6rem 0 5rem;
    --arc-rx: 82.5%;
    --arc-ry: 21rem;
    --arc-cy: calc(100% + 17rem);
    --ghost-opacity: 1;
  }

  .hero-card {
    position: absolute;
    top: 0;
    bottom: -4rem;
    left: 0;
    right: 0;
    width: 100%;
    overflow: hidden;
    box-shadow: none;
    pointer-events: none;
    -webkit-mask-image: linear-gradient(
      to bottom,
      #000 calc(100% - 6rem),
      rgba(0, 0, 0, 0.85) calc(100% - 4.8rem),
      rgba(0, 0, 0, 0.5) calc(100% - 3rem),
      rgba(0, 0, 0, 0.15) calc(100% - 1.2rem),
      transparent 100%
    );
    mask-image: linear-gradient(
      to bottom,
      #000 calc(100% - 6rem),
      rgba(0, 0, 0, 0.85) calc(100% - 4.8rem),
      rgba(0, 0, 0, 0.5) calc(100% - 3rem),
      rgba(0, 0, 0, 0.15) calc(100% - 1.2rem),
      transparent 100%
    );
  }

  /* Затухания — по плавной кривой с промежуточными точками: на больших
     тёмных экранах обычный двухточечный градиент даёт видимые полосы */
  .hero-halo {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(
        ellipse 75% 55% at 50% 100%,
        rgba(244, 63, 94, 0.500) 0.0%,
        rgba(244, 63, 94, 0.496) 7.2%,
        rgba(244, 63, 94, 0.471) 14.4%,
        rgba(244, 63, 94, 0.418) 21.6%,
        rgba(244, 63, 94, 0.341) 28.8%,
        rgba(244, 63, 94, 0.250) 36.0%,
        rgba(244, 63, 94, 0.159) 43.2%,
        rgba(244, 63, 94, 0.082) 50.4%,
        rgba(244, 63, 94, 0.029) 57.6%,
        rgba(244, 63, 94, 0.004) 64.8%,
        rgba(244, 63, 94, 0.000) 72.0%
      ),
      radial-gradient(
        ellipse 100% 70% at 50% 100%,
        rgba(244, 63, 94, 0.120) 0.0%,
        rgba(244, 63, 94, 0.119) 7.5%,
        rgba(244, 63, 94, 0.113) 15.0%,
        rgba(244, 63, 94, 0.100) 22.5%,
        rgba(244, 63, 94, 0.082) 30.0%,
        rgba(244, 63, 94, 0.060) 37.5%,
        rgba(244, 63, 94, 0.038) 45.0%,
        rgba(244, 63, 94, 0.020) 52.5%,
        rgba(244, 63, 94, 0.007) 60.0%,
        rgba(244, 63, 94, 0.001) 67.5%,
        rgba(244, 63, 94, 0.000) 75.0%
      );
  }

  .hero-arc {
    position: absolute;
    left: 50%;
    top: calc(100% - 8rem);
    width: 165%;
    height: 42rem;
    transform: translateX(-50%);
    border-radius: 50%;
    background: var(--background);
    border-top: 1px solid rgba(253, 164, 175, 0.85);
    box-shadow:
      0 -2px 14px rgba(253, 164, 175, 0.55),
      0 -10px 40px rgba(244, 63, 94, 0.55),
      0 -28px 90px rgba(244, 63, 94, 0.3),
      inset 0 3px 22px rgba(244, 63, 94, 0.35);
    pointer-events: none;
  }

  :global(.dark) .hero-halo {
    opacity: 0.9;
  }

  .hero-inner {
    position: relative;
    z-index: 10;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
    align-items: center;
    column-gap: clamp(1.5rem, 4vw, 4rem);
    row-gap: 0;
    width: calc(100% - 2rem);
    max-width: 80rem;
    margin: 0 auto;
    padding: 0 1.25rem;
  }

  :global(.hero-ghost) {
    opacity: var(--ghost-opacity, 1);
    transition: opacity 250ms ease-out;
    -webkit-mask-image: radial-gradient(
      ellipse var(--arc-rx) var(--arc-ry) at 50% var(--arc-cy),
      transparent 99%,
      #000 100%
    );
    mask-image: radial-gradient(
      ellipse var(--arc-rx) var(--arc-ry) at 50% var(--arc-cy),
      transparent 99%,
      #000 100%
    );
  }

  .hero-lead {
    margin: 0;
    font-size: clamp(1.75rem, 3.5vw, 2.6rem);
    font-weight: 500;
    line-height: 1.4;
    color: var(--foreground-muted);
    grid-column: 1;
    grid-row: 1;
    align-self: end;
  }

  .hero-lead-line {
    display: block;
  }

  .services-actions.hero-actions {
    grid-column: 1;
    grid-row: 2;
    align-self: start;
    justify-content: flex-start;
    margin-top: 1.5rem;
  }

  .hero-logo {
    position: relative;
    width: 100%;
    justify-self: end;
    grid-column: 2;
    grid-row: 1 / span 2;
    align-self: center;
    height: clamp(22rem, 34vw, 36rem);
    color: var(--accent);
  }

  :global(.hero-logo-canvas) {
    position: absolute !important;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    transition: opacity 500ms ease-out;
  }

  :global(.hero-logo-canvas-pending) {
    opacity: 0;
  }

  .hero-poster {
    position: absolute;
    inset: 0;
    pointer-events: none;
    transition: opacity 500ms ease-out;
  }

  .hero-poster img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    user-select: none;
  }

  .hero-poster-hidden {
    opacity: 0;
  }

  @media (max-width: 1023px) {
    .hero-section {
      min-height: 0;
      padding-top: 5rem;
      padding-bottom: 5rem;
      --arc-rx: 110%;
      --arc-ry: 13rem;
      --arc-cy: calc(100% + 10rem);
    }

    .hero-arc {
      top: calc(100% - 7rem);
      width: 220%;
      height: 26rem;
    }

    .hero-inner {
      grid-template-columns: 1fr;
      width: 100%;
      padding: 0 1rem;
      row-gap: 0.5rem;
    }

    .hero-lead {
      grid-column: 1;
      grid-row: auto;
      align-self: auto;
      text-align: center;
    }

    .hero-logo {
      grid-column: 1;
      grid-row: auto;
      align-self: auto;
      justify-self: center;
      height: clamp(18rem, 88vw, 26rem);
    }

    .services-actions.hero-actions {
      grid-column: 1;
      grid-row: auto;
      align-self: auto;
      justify-content: center;
      margin-top: 0.5rem;
    }
  }

  @media (max-width: 767px) {
    .hero-lead {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
    }

    .services-actions.hero-actions {
      display: none;
    }
  }

  /* ─── Sponsors ─────────────────────────────────────────────── */
  .sponsors-section {
    padding-top: 1.25rem;
    padding-bottom: 5rem;
  }

  .sponsors-wrap {
    position: relative;
    display: flex;
    justify-content: center;
    min-height: 7.5rem;
  }

  .sponsors-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4rem;
  }

  .sponsors-measure {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    gap: 4rem;
    width: max-content;
    visibility: hidden;
    pointer-events: none;
  }

  .sponsor {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 7.5rem;
    padding: 0 0.5rem;
    outline: none;
    opacity: 0.85;
    transition: opacity 150ms ease-out;
  }

  .sponsor:hover,
  .sponsor:focus-visible,
  .sponsor:focus {
    opacity: 1;
  }

  .sponsor-logo {
    display: block;
    height: 7rem;
    width: auto;
    max-width: none;
    object-fit: contain;
    filter: brightness(0);
  }

  :global(.dark) .sponsor-logo {
    filter: none;
  }

  .sponsor-text {
    font-size: 2.1rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    white-space: nowrap;
    color: var(--foreground);
  }

  @media (max-width: 1023px) {
    .sponsor-logo {
      height: 6rem;
    }
    .sponsor-text {
      font-size: 1.9rem;
    }
  }

  .sponsor-tip {
    position: absolute;
    top: calc(100% + 0.25rem);
    left: 50%;
    z-index: 20;
    width: max-content;
    max-width: min(16rem, 80vw);
    padding: 0.55rem 0.7rem;
    border-radius: 0.5rem;
    background: var(--foreground);
    color: var(--background);
    font-size: 0.8rem;
    line-height: 1.35;
    text-align: center;
    white-space: normal;
    opacity: 0;
    pointer-events: none;
    transform: translate(-50%, -4px);
    transition: opacity 150ms ease-out, transform 150ms ease-out;
  }

  .sponsor:hover .sponsor-tip,
  .sponsor:focus .sponsor-tip,
  .sponsor:focus-visible .sponsor-tip {
    opacity: 1;
    transform: translate(-50%, 0);
  }

  /* ─── About us ─────────────────────────────────────────────── */
  .about-us-section {
    padding-bottom: clamp(2.5rem, 5vw, 4.5rem);
  }

  .about-us-copy {
    margin: 0 auto;
    max-width: 100%;
    text-align: center;
    color: var(--foreground-muted);
    font-size: clamp(1.75rem, 3.5vw, 2.6rem);
    font-weight: 500;
    line-height: 1.45;
    letter-spacing: -0.02em;
  }

  /* ─── Component showcase ─────────────────────────────────── */
  .component-showcase {
    width: calc(100% - 2rem);
    max-width: 92rem;
    margin: 0 auto;
    padding: 0.5rem 1.25rem clamp(3rem, 6vw, 6rem);
    box-sizing: border-box;
  }

  .component-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    align-items: start;
    gap: clamp(1.5rem, 2.5vw, 3rem);
    width: 100%;
  }

  .component-showcase .showcase-actions {
    margin-top: clamp(2rem, 4vw, 3.5rem);
  }

  @media (max-width: 767px) {
    .component-showcase .showcase-actions {
      flex-direction: column;
      align-items: stretch;
      flex-wrap: nowrap;
      width: 100%;
      max-width: 24rem;
      margin-left: auto;
      margin-right: auto;
    }
  }

  .component-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    min-width: 0;
    gap: 1.25rem;
    overflow: visible;
  }

  .component-visual {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: clamp(14rem, 20vw, 22rem);
  }

  .component-visual :global(svg) {
    display: block;
    width: 100%;
    max-width: 100%;
    max-height: none;
  }

  .component-visual-radar {
    --hl-ink: var(--foreground);
    --hl-surface: var(--background);
    --hl-rim: var(--accent);
    --hl-accent: #f43f5e;
  }

  .component-copy {
    width: 100%;
    text-align: left;
  }

  .component-copy h2 {
    margin: 0 0 0.85rem;
    color: var(--foreground);
    font-size: clamp(1.1rem, 1.4vw, 1.4rem);
    font-weight: 600;
    line-height: 1.25;
    letter-spacing: -0.025em;
  }

  .component-copy p {
    margin: 0;
    color: var(--foreground-muted);
    font-size: clamp(1.1rem, 1.5vw, 1.45rem);
    font-weight: 500;
    line-height: 1.45;
    letter-spacing: -0.02em;
  }

  .component-copy .text-strong {
    color: var(--foreground);
  }

  .component-copy .text-accent {
    color: var(--accent);
  }

  @media (max-width: 1099px) {
    .component-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 3rem clamp(1.5rem, 3.5vw, 3rem);
    }

    .component-visual {
      min-height: clamp(16rem, 32vw, 22rem);
    }

    .component-copy h2 {
      font-size: clamp(1.2rem, 2.2vw, 1.5rem);
    }

    .component-copy p {
      font-size: clamp(1.15rem, 2.4vw, 1.5rem);
    }
  }

  @media (max-width: 767px) {
    .component-showcase {
      width: 100%;
      padding-left: 1rem;
      padding-right: 1rem;
    }

    .component-grid {
      grid-template-columns: 1fr;
      gap: 3rem;
    }

    .component-visual {
      min-height: 0;
      max-width: 28rem;
      margin: 0 auto;
    }

    .component-copy {
      max-width: 38rem;
      margin: 0 auto;
    }
  }

  /* ─── Section Layout ───────────────────────────────────────── */
  .section-block {
    padding-top: clamp(0.75rem, 1.5vw, 1.25rem);
    padding-bottom: clamp(1.5rem, 3vw, 2.5rem);
  }

  .section-overline {
    display: flex;
    justify-content: center;
    text-align: center;
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--foreground-muted);
    margin-bottom: 1rem;
  }

  .services-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1.25rem;
    justify-content: center;
  }

  .services-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.75rem;
    padding: 0.7rem 1rem;
    border-radius: var(--radius-sm, 0.55rem);
    border: 1px solid var(--border);
    background: var(--background-inset);
    color: var(--foreground);
    font-size: 0.9rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
  }

  .services-action-primary {
    border-color: transparent;
    background: var(--accent);
    color: #fff;
  }

  /* ─── Contacts ─────────────────────────────────────────────── */
  .contact-section {
    width: 82rem;
    max-width: calc(100vw - 2rem);
    margin: 0 auto;
    box-sizing: border-box;
    padding-bottom: clamp(3rem, 6vw, 6rem);
  }

  .contact-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.9rem;
    padding: 2.5rem 1.5rem;
    text-align: center;
    box-sizing: border-box;
  }

  .contact-title {
    margin: 0;
    font-size: clamp(1.75rem, 3.5vw, 2.6rem);
    font-weight: 500;
    line-height: 1.3;
    letter-spacing: -0.02em;
  }

  .contact-title span {
    display: block;
  }

  .contact-text {
    margin: 0;
    max-width: 34rem;
    font-size: clamp(1rem, 1.35vw, 1.2rem);
    font-weight: 500;
    line-height: 1.45;
    letter-spacing: -0.02em;
    color: var(--foreground-muted);
  }

  @media (max-width: 767px) {
    .contact-card {
      padding: 2rem 1.25rem;
    }

    .contact-actions {
      flex-direction: column;
      align-items: stretch;
      width: 100%;
      max-width: 20rem;
    }
  }
</style>