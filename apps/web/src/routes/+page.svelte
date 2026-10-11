<script lang="ts">
  import { onMount, type Component } from "svelte";
  import AsciiVisual from "$lib/components/ui-registry/AsciiVisual.svelte";
  import FlameWrap from "$lib/components/ui-registry/FlameWrap.svelte";
  import ArcFlame from "$lib/components/ui-registry/ArcFlame.svelte";
  import ArcTimeline from "$lib/components/ui-registry/ArcTimeline.svelte";
  import SiteMenu from "$lib/components/ui-registry/SiteMenu.svelte";
  import LogoCarousel from "$lib/components/ui-registry/logo-carousel.svelte";
  import Badge from "$lib/components/ui-registry/Badge.svelte";
  import ShieldInfinity from "$lib/components/ui-registry/ShieldInfinity.svelte";
  import Phosphor from "$lib/components/ui-registry/Phosphor.svelte";
  import Terminal from "$lib/components/ui-registry/Terminal.svelte";
  import Radar from "$lib/components/ui-registry/Radar.svelte";
  import GhostCursor from "$lib/components/ui-registry/GhostCursor.svelte";
  import DockerLogo from "$lib/components/ui-registry/DockerLogo.svelte";
  import Close from "carbon-icons-svelte/lib/Close.svelte";
  import DocumentMultiple_01 from "carbon-icons-svelte/lib/DocumentMultiple_01.svelte";
  import QHintonPlot from "carbon-icons-svelte/lib/QHintonPlot.svelte";
  import Network_3 from "carbon-icons-svelte/lib/Network_3.svelte";
  import WebServicesContainer from "carbon-icons-svelte/lib/WebServicesContainer.svelte";
  import { contactsState } from "$lib/stores/contacts.svelte";
  import { canRunHeavyEffects } from "$lib/utils/perf";

  // ─── Спонсоры ─────────────────────────────────────────────────
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

  // Мобильный режим: крупнее ASCII-лого и всегда карусель спонсоров
  let isMobile = $state(false);
  // Телефон (< 768px): без GhostCursor, без текста и кнопок в hero
  let isPhone = $state(false);
  // Мощное устройство: можно запускать тяжёлый огонь на дуге hero
  let heavyFx = $state(false);
  // Помещаются ли все логотипы в одну строку (проверяется по скрытой копии)
  let fits = $state(true);
  let sponsorsEl = $state<HTMLElement | undefined>();
  let measureEl = $state<HTMLElement | undefined>();

  // Hero: ASCII-логотип. GhostCursor плавно гаснет, когда курсор приближается к нему
  // (без маски-«дырки», поэтому никакого круга под логотипом нет).
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
    heavyFx = canRunHeavyEffects();

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

    return () => {
      mq.removeEventListener("change", onChange);
      phoneMq.removeEventListener("change", onPhoneChange);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  });

  type StatusVariant = "in-progress" | "released" | "frozen" | "not-started";

  type ProjectStatus = {
    variant: StatusVariant;
    label: string;
    href?: string;
    modalText?: string;
  };

  type Project = {
    title: string;
    description: string;
    icon: Component<{ size?: number; class?: string }>;
    status: ProjectStatus;
    /** Огонь вокруг карточки (только у os.dokploy) */
    flame?: boolean;
  };

  // Цвет пламени совпадает с акцентом сайта (#f43f5e)
  const flameColor: [number, number, number] = [0.956, 0.247, 0.369];

  const projects: Project[] = [
    {
      title: "os.docs",
      // Документы — платформа документации
      icon: DocumentMultiple_01,
      description:
        "Платформа для документации и публикации контента. Подходит для технических команд, авторов и всех, кто хочет структурированно делиться знаниями.",
      status: {
        variant: "released",
        label: "Проект в релизе",
        href: "https://opensophy.com/docs/opensophy-docs",
      },
    },
    {
      title: "os.ui",
      // Диаграмма-плитка — библиотека UI-компонентов
      icon: QHintonPlot,
      description:
        "Библиотека готовых UI-компонентов с живым превью и гибкими настройками. Включает анимации, интерактивные блоки и фирменные компоненты Opensophy — для разработчиков и дизайнеров.",
      status: {
        variant: "released",
        label: "Проект в релизе",
        href: "https://opensophy.com/components/overview",
      },
    },
    {
      title: "os.mtls",
      // Сеть — mTLS-сертификаты и доступ к сервисам
      icon: Network_3,
      description:
        "Инструмент для быстрого создания и управления mTLS-сертификатами для Traefik. Позволяет надёжно закрыть доступ к сервисам и серверам без лишних сложностей.",
      status: {
        variant: "released",
        label: "Проект в релизе",
        href: "https://opensophy.com/mtls",
      },
    },
    {
      title: "os.compose",
      // Логотип Docker — Docker Compose-шаблоны
      icon: DockerLogo,
      description: "Библиотека готовых Docker Compose-шаблонов для DevSecOps.",
      status: {
        variant: "in-progress",
        label: "Проект развивается",
        href: "https://opensophy.com/templates/docker",
      },
    },
    {
      title: "os.dokploy",
      // Контейнеры веб-сервисов — деплой и управление серверами
      icon: WebServicesContainer,
      flame: true,
      description:
        "Форк проекта Dokploy — платформа для управления серверами и деплоя приложений. Бесплатная enterprise-версия с обновлённым дизайном, встроенным управлением mTLS и русификацией.",
      status: {
        variant: "released",
        label: "Проект в релизе",
        href: "https://opensophy.com/dokploy",
      },
    },
  ];

  // ─── Команда ──────────────────────────────────────────────────
  type TeamMember = { name: string; role: string };

  const team: TeamMember[] = [
    { name: "Селезнева Богдана", role: "GRC-аналитик" },
    { name: "Кулешов Даниил", role: "DevSecOps-инженер" },
    { name: "Гаршина Александра", role: "DevOps-инженер" },
  ];

  // ─── История проекта (в хронологическом порядке) ──────────────
  // Первая дата — 21.12.2025, остальные — 2026 год. Сейчас 11 октября 2026.
  const timeline = [
    {
      time: "Декабрь 2025",
      steps: [{ icon: "21.12", content: "Создание проекта opensophy" }],
    },
    {
      time: "Январь 2026",
      steps: [
        { icon: "07.01", content: "Начало публикации образовательных статей и учебных материалов" },
      ],
    },
    {
      time: "Февраль 2026",
      steps: [{ icon: "19.02", content: "Заключение сотрудничества с Кондор" }],
    },
    {
      time: "Март 2026",
      steps: [
        { icon: "07.03", content: "Создание os.docs" },
        { icon: "27.03", content: "Заключение сотрудничества с RUVDS" },
      ],
    },
    {
      time: "Август 2026",
      steps: [{ icon: "20.08", content: "Большой ребрендинг проекта и философии" }],
    },
    {
      time: "Сентябрь 2026",
      steps: [
        { icon: "01.09", content: "Создание os.ui" },
        { icon: "10.09", content: "Создание os.dokploy" },
        { icon: "15.09", content: "Создание os.mtls" },
      ],
    },
    {
      time: "Октябрь 2026",
      steps: [{ icon: "11.10", content: "Формирование команды opensophy" }],
    },
  ];

  let statusModalOpen = $state(false);
  let statusModalText = $state("");

  function openStatusModal(text: string) {
    statusModalText = text;
    statusModalOpen = true;
  }

  function closeStatusModal() {
    statusModalOpen = false;
  }

  function isExternal(href: string) {
    return /^https?:\/\//.test(href);
  }
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
      {#if heavyFx}
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

    <!-- GhostCursor: ПК и планшет, не на телефоне. Маска вырезает область под дугой,
         а прозрачность плавно падает до нуля, когда курсор рядом с ASCII-логотипом. -->
    {#if !isPhone}
      <GhostCursor color="#f43f5e" zIndex={1} class="hero-ghost" />
    {/if}

    <div class="hero-inner">
      <h1 class="hero-lead">
        <span class="text-foreground">opensophy</span>
        <span class="hero-lead-line text-accent">Мастерская DevSecOps</span>
      </h1>

      <div class="hero-logo" aria-label="Opensophy ASCII logo" bind:this={logoEl}>
        <AsciiVisual
          src="/logo.png"
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
          class="hero-logo-canvas"
        />
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
    <p class="section-overline"><Badge variant="default">Спонсоры</Badge></p>
    <div class="sponsors-wrap" bind:this={sponsorsEl}>
      <div class="sponsors-measure" bind:this={measureEl} aria-hidden="true" inert>
        {#each sponsors as s (s.name)}
          <span class="sponsor">{@render sponsorFace(s)}</span>
        {/each}
      </div>

      {#if useCarousel}
        <LogoCarousel items={sponsors} count={groupSize}>
          {#snippet children(item)}
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
          <ShieldInfinity accent="#f43f5e" width="100%" showControls={false} />
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
          <!-- Радар следит за курсором только в пределах своего элемента, а не по всей странице -->
          <Radar scope="element" />
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
      <a class="services-action" href="/solutions">Посмотреть все услуги</a>
      <button
        type="button"
        class="services-action services-action-primary"
        onclick={() => contactsState.open()}>Заказать услуги</button
      >
      <a class="services-action" href="/service-policy">Политика оказания услуг</a>
    </div>
  </section>

  <!-- Projects Section -->
  <section class="section-block products-section w-full max-w-5xl mx-auto px-4">
    <div class="products-glow" aria-hidden="true"></div>

    <p class="section-overline"><Badge variant="default">Продукты</Badge></p>

    <div class="projects-grid">
      {#each projects as project, i (project.title)}
        {@const wide = projects.length % 2 === 1 && i === projects.length - 1}
        {#if project.flame}
          <!-- Огонь — только вокруг этой карточки (os.dokploy) -->
          <div class="flame-slot" class:project-shell-wide={wide}>
            <FlameWrap
              color={flameColor}
              radius={12}
              height={90}
              spread={8}
              intensity={0.5}
              sparks={1.2}
              smoke={1}
              scorch={0}
            >
              {@render projectCard(project, false)}
            </FlameWrap>
          </div>
        {:else}
          {@render projectCard(project, wide)}
        {/if}
      {/each}
    </div>
  </section>

  <!-- Team -->
  <section class="section-block team-section w-full max-w-5xl mx-auto px-4" aria-label="Команда">
    <p class="section-overline"><Badge variant="accent">Команда</Badge></p>
    <div class="team-grid">
      {#each team as member (member.name)}
        <div class="inset-shadow relative overflow-hidden rounded-xl bg-background-inset p-1.5">
          <article class="team-card card rounded-lg bg-background">
            <h3 class="team-name">{member.name}</h3>
            <p class="team-role">{member.role}</p>
          </article>
        </div>
      {/each}
    </div>
  </section>

  <!-- Timeline -->
  <section class="section-block timeline-section" aria-label="История проекта">
    <p class="section-overline"><Badge variant="default">История</Badge></p>
    <div class="w-full rounded-lg border border-border bg-background p-2">
      <ArcTimeline data={timeline} defaultActiveStep={{ time: "Октябрь 2026", stepIndex: 0 }} />
    </div>
  </section>
</main>

<!-- Карточка продукта: внешний inset-слой + внутренняя карточка -->
{#snippet projectCard(project: Project, span: boolean)}
  {@const Icon = project.icon}
  <div
    class="project-shell inset-shadow relative overflow-hidden rounded-xl bg-background-inset p-1.5"
    class:project-shell-wide={span}
  >
    <article class="project-card card rounded-lg bg-background">
      <div class="project-card-top">
        <div
          class="project-icon inset-shadow grid size-10 shrink-0 place-items-center rounded-sm bg-background-inset text-accent"
        >
          <Icon size={22} />
        </div>
        <div class="project-card-header">
          <span class="project-slug">{project.title}</span>
          {#if project.status.modalText}
            {@const modalText = project.status.modalText}
            <button
              type="button"
              class="project-status project-status-{project.status.variant} project-status-link"
              onclick={() => openStatusModal(modalText)}
            >
              {project.status.label}
            </button>
          {:else if project.status.href}
            <a
              href={project.status.href}
              target={isExternal(project.status.href) ? "_blank" : undefined}
              rel={isExternal(project.status.href) ? "noreferrer" : undefined}
              class="project-status project-status-{project.status.variant} project-status-link"
            >
              {project.status.label}
            </a>
          {:else}
            <span class="project-status project-status-{project.status.variant}">
              {project.status.label}
            </span>
          {/if}
        </div>
      </div>
      <p class="project-desc">{project.description}</p>
    </article>
  </div>
{/snippet}

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

{#if statusModalOpen}
  <div
    class="status-modal-overlay"
    onclick={closeStatusModal}
    onkeydown={(e) => {
      if (e.key === "Escape") closeStatusModal();
    }}
    role="button"
    tabindex="-1"
    aria-label="Закрыть"
  >
    <div
      class="status-modal"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-label="Информация о статусе"
      tabindex="-1"
    >
      <button type="button" class="status-modal-close" onclick={closeStatusModal} aria-label="Закрыть">
        <Close size={18} />
      </button>
      <p class="status-modal-text">{statusModalText}</p>
    </div>
  </div>
{/if}

<style>
  /* ─── Hero ─────────────────────────────────────────────────── */
  .hero-section {
    position: relative;
    min-height: 40rem;
    padding: 6rem 0 5rem;
    /* Эллипс дуги (для маски GhostCursor): полуоси и центр */
    --arc-rx: 82.5%;
    --arc-ry: 21rem;
    --arc-cy: calc(100% + 17rem);
    /* Плавность затухания GhostCursor возле логотипа — задаётся из JS */
    --ghost-opacity: 1;
  }

  /* Карточка со свечением: растянута на всю секцию, скруглена снизу */
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
    /* Плавное растворение внизу — никакой резкой границы между секциями */
    -webkit-mask-image: linear-gradient(to bottom, #000 calc(100% - 6rem), transparent 100%);
    mask-image: linear-gradient(to bottom, #000 calc(100% - 6rem), transparent 100%);
  }

  /* Мягкое облако света над горизонтом */
  .hero-halo {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(
        ellipse 75% 55% at 50% 100%,
        rgba(244, 63, 94, 0.5) 0%,
        rgba(244, 63, 94, 0.22) 38%,
        transparent 72%
      ),
      radial-gradient(
        ellipse 100% 70% at 50% 100%,
        rgba(244, 63, 94, 0.12) 0%,
        transparent 75%
      );
  }

  /* Огромный тёмный «шар» — его верхний край даёт изогнутую светящуюся линию */
  /* Эллипс с центром на нижней кромке: дуга идёт от угла до угла */
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

  /* GhostCursor:
     1) маска скрывает всё, что внутри эллипса дуги (параметры --arc-* совпадают с .hero-arc);
     2) opacity плавно уходит в 0 рядом с ASCII-логотипом (значение считается в JS).
     Никаких «дырок» в маске — поэтому круга вокруг логотипа больше нет. */
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

  /* Стиль как у блока «Opensophy занимается…» */
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
    display: block;
    width: 100%;
    height: 100%;
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

    /* Мобильный порядок: заголовок → логотип → кнопки */
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

  /* Телефон: в hero остаётся только логотип (h1 скрыт визуально, но есть для SEO/скринридеров) */
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

  /* ─── About us (между спонсорами и сеткой направлений) ──────── */
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
  /* Ширина совпадает с границами свечения (hero-card): 92rem */
  .component-showcase {
    width: calc(100% - 2rem);
    max-width: 92rem;
    margin: 0 auto;
    padding: 0.5rem 1.25rem clamp(3rem, 6vw, 6rem);
    box-sizing: border-box;
  }

  /* 4 карточки: 4 колонки на ПК, 2×2 на планшете, 1 колонка на телефоне */
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

  /* Мобильный: три кнопки друг под другом, на всю ширину */
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

  /* Тема радара: линии — цвет текста, заливка — фон, акцент — фирменный розовый */
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

  /* Стиль текста как в блоке «Opensophy — это инициатива…» */
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

  .products-section {
    position: relative;
    z-index: 1;
  }

  .products-glow {
    position: absolute;
    top: -2.5rem;
    left: 50%;
    transform: translateX(-50%);
    width: 92rem;
    max-width: calc(100vw - 2rem);
    height: calc(100% + 5rem);
    z-index: -1;
    overflow: hidden;
    pointer-events: none;
    border-radius: var(--radius-3xl, 3.3rem);
    background: radial-gradient(
      farthest-corner at 50% 50%,
      color-mix(in srgb, #f43f5e 85%, white) 0%,
      #f43f5e 55%,
      color-mix(in srgb, #f43f5e 80%, black) 100%
    );
    opacity: 0.32;
  }

  :global(.dark) .products-glow {
    opacity: 0.22;
  }

  @media (max-width: 600px) {
    .products-glow {
      width: 160%;
    }
  }

  .section-lead {
    font-size: clamp(1.75rem, 3.5vw, 2.6rem);
    font-weight: 500;
    line-height: 1.55;
    margin: 0;
    max-width: 100%;
  }

  .section-headlines {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    margin-bottom: 2.5rem;
  }

  .section-headline-plain {
    font-size: clamp(1.75rem, 3.5vw, 2.6rem);
    font-weight: 500;
    line-height: 1.55;
    color: var(--foreground);
    margin: 0;
    max-width: 100%;
  }

  .section-headline-muted {
    font-size: clamp(1.75rem, 3.5vw, 2.6rem);
    font-weight: 500;
    line-height: 1.55;
    color: var(--foreground-muted);
    margin: 0;
    max-width: 100%;
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

  /* ─── Products: карточки с иконками, огонь только у os.dokploy ── */
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
  }

  /* Обёртка огня: отступ сверху — место под языки пламени */
  .flame-slot {
    margin-top: 3rem;
  }

  .project-shell-wide {
    grid-column: 1 / -1;
  }

  @media (max-width: 639px) {
    .projects-grid {
      grid-template-columns: 1fr;
    }
    .project-shell-wide {
      grid-column: auto;
    }
  }

  .project-card {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    height: 100%;
    min-height: 11rem;
    padding: 1.25rem 1.375rem 1.375rem;
    box-sizing: border-box;
  }

  .project-shell {
    height: 100%;
    box-sizing: border-box;
  }

  .project-card-top {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .project-card-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    min-width: 0;
  }

  .project-slug {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: var(--foreground);
  }

  @media (min-width: 768px) {
    .project-slug {
      font-size: 1rem;
    }
  }

  .project-status {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    border: none;
    padding: 0;
    cursor: default;
  }

  .project-status-in-progress,
  .project-status-released,
  .project-status-frozen,
  .project-status-not-started {
    text-transform: uppercase;
    color: var(--foreground-muted);
    background: var(--background-inset);
    border: 1px solid var(--border);
    padding: 0.15rem 0.45rem;
    border-radius: 999px;
  }

  .project-status-link {
    display: inline-flex;
    align-items: center;
    font-size: 0.9rem;
    font-weight: 500;
    font-family: inherit;
    letter-spacing: normal;
    text-transform: none;
    text-decoration: underline;
    text-decoration-color: color-mix(in srgb, var(--accent) 50%, transparent);
    text-decoration-style: dotted;
    text-underline-offset: 4px;
    color: var(--accent);
    background: transparent;
    border: none;
    padding: 0;
    border-radius: 0;
    transition: color 150ms ease-out, text-decoration-color 150ms ease-out;
    cursor: pointer;
  }

  .project-status-link:hover,
  button.project-status-link:hover {
    color: var(--foreground);
    text-decoration-color: var(--foreground-muted);
  }

  .project-status-modal {
    cursor: pointer;
  }

  .status-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--background-inset) 80%, transparent);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    animation: status-modal-fade-in 200ms ease-out;
  }

  .status-modal {
    position: relative;
    width: 100%;
    max-width: 28rem;
    margin: 1rem;
    padding: 1.5rem;
    border-radius: var(--radius-sm, 0.55rem);
    border: 1px solid var(--border);
    background: var(--background);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    animation: status-modal-scale-in 250ms ease-out;
  }

  .status-modal-close {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: var(--radius-sm, 0.55rem);
    border: none;
    background: transparent;
    color: var(--foreground-muted);
    cursor: pointer;
    transition: background 150ms ease-out, color 150ms ease-out;
  }

  .status-modal-close:hover {
    background: var(--background-muted);
    color: var(--foreground);
  }

  .status-modal-text {
    font-size: 0.9rem;
    line-height: 1.7;
    color: var(--foreground-muted);
    margin: 0;
    padding-right: 1.5rem;
  }

  @keyframes status-modal-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes status-modal-scale-in {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  /* ─── Team ─────────────────────────────────────────────────── */
  .team-section {
    padding-top: clamp(2rem, 4vw, 3.5rem);
  }

  .team-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
  }

  @media (max-width: 767px) {
    .team-grid {
      grid-template-columns: 1fr;
    }
  }

  .team-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.75rem 1.25rem;
    text-align: center;
    box-sizing: border-box;
  }

  .team-name {
    margin: 0;
    font-size: clamp(1.05rem, 1.4vw, 1.25rem);
    font-weight: 600;
    letter-spacing: -0.02em;
    color: var(--foreground);
  }

  .team-role {
    margin: 0;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--accent);
  }

  /* Ширина как у розового блока секции «Продукты» (.products-glow) */
  .timeline-section {
    width: 92rem;
    max-width: calc(100vw - 2rem);
    margin: 0 auto;
    box-sizing: border-box;
    padding-bottom: clamp(3rem, 6vw, 6rem);
  }

  /* Текст как в остальных блоках: крупнее, насыщенность 500, плотный интервал */
  .project-desc {
    font-size: clamp(1rem, 1.35vw, 1.2rem);
    font-weight: 500;
    line-height: 1.45;
    letter-spacing: -0.02em;
    color: var(--foreground-muted);
    margin: 0;
    flex: 1;
  }
</style>