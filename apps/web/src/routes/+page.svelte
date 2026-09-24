<script lang="ts">
  import { brandingConfig } from "$lib";
  import ServicesGrid from "$lib/components/ui/ServicesGrid.svelte";
  import AsciiObject from "$lib/components/ui-registry/AsciiObject.svelte";
  import CardProject from "$lib/components/ui/CardProject.svelte";
  import SiteMenu from "$lib/components/ui/SiteMenu.svelte";
  import TextLoop from "$lib/components/ui/TextLoop.svelte";
  import Badge from "$lib/components/ui-registry/Badge.svelte";
  import Close from "carbon-icons-svelte/lib/Close.svelte";
  import { contactsState } from "$lib/stores/contacts.svelte";

  const heroLoopTexts = ["Open Source", "DevSecOps"];

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
    colors: string[];
    glowColor: string;
    status: ProjectStatus;
  };

  const projects: Project[] = [
    {
      title: "os.docs",
      description:
        "Платформа для документации и публикации контента. Подходит для технических команд, авторов и всех, кто хочет структурированно делиться знаниями.",
      colors: ["#f43f5e", "#f472b6", "#b2263e"],
      glowColor: "350 90 72",
      status: {
        variant: "released",
        label: "Проект в релизе",
        href: "https://opensophy.com/docs/opensophy-docs",
      },
    },
    {
      title: "os.ui",
      description:
        "Библиотека готовых UI-компонентов с живым превью и гибкими настройками. Включает анимации, интерактивные блоки и фирменные компоненты Opensophy — для разработчиков и дизайнеров.",
      colors: ["#f43f5e", "#f472b6", "#b2263e"],
      glowColor: "350 90 72",
      status: {
        variant: "released",
        label: "Проект в релизе",
        href: "https://opensophy.com/components/overview",
      },
    },
    {
      title: "os.mtls",
      description:
        "Инструмент для быстрого создания и управления mTLS-сертификатами для Traefik. Позволяет надёжно закрыть доступ к сервисам и серверам без лишних сложностей.",
      colors: ["#f43f5e", "#f472b6", "#b2263e"],
      glowColor: "350 90 72",
      status: {
        variant: "released",
        label: "Проект в релизе",
        href: "https://opensophy.com/mtls",
      },
    },
    {
      title: "os.compose",
      description: "Библиотека готовых Docker Compose-шаблонов для DevSecOps.",
      colors: ["#f43f5e", "#f472b6", "#b2263e"],
      glowColor: "350 90 72",
      status: {
        variant: "in-progress",
        label: "Проект развивается",
        href: "https://opensophy.com/templates/docker",
      },
    },
    {
      title: "os.dokploy",
      description:
        "Форк проекта Dokploy — платформа для управления серверами и деплоя приложений. Бесплатная enterprise-версия с обновлённым дизайном, встроенным управлением mTLS и русификацией.",
      colors: ["#f43f5e", "#f472b6", "#b2263e"],
      glowColor: "350 90 72",
      status: {
        variant: "released",
        label: "Проект в релизе",
        href: "https://opensophy.com/dokploy",
      },
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
    class="hero-section relative flex w-full items-center justify-center px-6 py-24 md:py-32"
  >
    <div class="hero-card" aria-hidden="true">
      <div class="hero-bg"></div>
    </div>

    <div
      class="relative z-10 flex flex-col items-center gap-4 text-center max-w-5xl w-full"
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

  <!-- About Section -->
  <section class="section-block w-full max-w-5xl mx-auto px-4">
    <p class="section-overline"><Badge variant="accent">Что такое Opensophy?</Badge></p>
    <h2 class="section-lead text-foreground-muted about-copy">
      <span class="text-foreground">Opensophy</span><button
        type="button"
        class="about-note"
        aria-label="Что означает название">?</button
      > <span class="about-dash">—</span> это инициатива, которая развивает
      <span class="text-accent">DevSecOps и Open Source</span> и делает их доступнее
      для разработчиков и команд.
    </h2>
    <div class="about-ascii" aria-hidden="true">
      <AsciiObject
        src="/logo.png"
        colored={false}
        color="#f43f5e"
        highlight="#f43f5e"
        class="h-full w-full"
        background=""
        cellSize={6}
        scale={5}
        orbit={true}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
    </div>
  </section>

  <!-- What We Do Section -->
  <section class="section-block w-full max-w-5xl mx-auto px-4">
    <p class="section-overline"><Badge variant="accent">Чем занимается</Badge></p>
    <h2 class="section-lead text-foreground-muted">
      <span class="text-foreground">Opensophy занимается&nbsp;</span><span
        class="text-accent"
        >внедрением DevSecOps: автоматизацией, безопасностью и инфраструктурой</span
      >, развитием open-source инструментов для разработчиков и DevOps-команд, а
      также подготовкой образовательных материалов.
    </h2>
  </section>

  <!-- Projects Section -->
  <section class="section-block products-section w-full max-w-5xl mx-auto px-4">
    <div class="products-glow" aria-hidden="true"></div>
    <p class="section-overline"><Badge variant="default">Продукты</Badge></p>
    <div class="projects-grid">
      {#each projects as project (project.title)}
        <CardProject
          colors={project.colors}
          glowColor={project.glowColor}
          borderRadius={12}
        >
          <div class="project-card-body">
            <div class="project-card-header">
              <span class="project-slug">{project.title}</span>
              {#if project.status.modalText}
                {@const modalText = project.status.modalText}
                <button
                  type="button"
                  class="project-status project-status-{project.status
                    .variant} project-status-link"
                  onclick={() => {
                    openStatusModal(modalText);
                  }}
                >
                  {project.status.label}
                </button>
              {:else if project.status.href}
                <a
                  href={project.status.href}
                  target={isExternal(project.status.href)
                    ? "_blank"
                    : undefined}
                  rel={isExternal(project.status.href)
                    ? "noreferrer"
                    : undefined}
                  class="project-status project-status-{project.status
                    .variant} project-status-link"
                >
                  {project.status.label}
                </a>
              {:else}
                <span
                  class="project-status project-status-{project.status.variant}"
                >
                  {project.status.label}
                </span>
              {/if}
            </div>
            <p class="project-desc">{project.description}</p>
          </div>
        </CardProject>
      {/each}
    </div>
  </section>

  <!-- Services Section -->
  <section class="section-block w-full max-w-5xl mx-auto px-4">
    <p class="section-overline"><Badge variant="accent">Услуги</Badge></p>
    <ServicesGrid />
    <div class="services-actions">
      <a class="services-action" href="/solutions">Посмотреть все услуги</a>
      <button
        type="button"
        class="services-action services-action-primary"
        onclick={() => contactsState.open()}>Заказать услуги</button
      >
      <a class="services-action" href="/service-policy"
        >Политика оказания услуг</a
      >
    </div>
  </section>

  <!-- About Author Section -->
  <section class="section-block author-section w-full max-w-5xl mx-auto px-4">
    <div class="author-glow" aria-hidden="true"></div>
    <p class="section-overline"><Badge variant="accent">Об авторе</Badge></p>
    <div class="author-copy">
      <p class="section-lead text-accent">
        Привет! Меня зовут <span class="text-foreground">Даниил Кулешов</span>, я
        основатель и руководитель Opensophy. С 2025 года занимаюсь DevSecOps:
        выстраиваю безопасные пайплайны, встраиваю безопасность в процесс
        разработки и настраиваю инфраструктуру с нуля почти под любой стек и
        любые ресурсы. Если инфраструктура уже есть, найду, что в ней не так, и
        починю.
      </p>
      <p class="section-lead text-accent">
        До этого я занимался white hat-хакингом и bug bounty: искал уязвимости в
        реальных проектах и передавал отчёты разработчикам.
      </p>
      <p class="section-lead text-accent">
        В IT я пришёл не через безопасность. Сначала работал графическим
        дизайнером, потом преподавал программирование, а затем стал
        комьюнити-менеджером крупной мобильной игры в NetEase Games. И только
        после этого выбрал кибербезопасность.
      </p>
      <p class="section-lead text-accent">
        Сейчас я развиваю Opensophy: пишу open-source продукты и помогаю
        командам, компаниям, проектам с безопасностью и инфраструктурой.
        Продолжаю учиться и делюсь знаниями в статьях.
      </p>
    </div>
  </section>
</main>

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
      onclick={(e) => {
        e.stopPropagation();
      }}
      onkeydown={(e) => {
        e.stopPropagation();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Информация о статусе"
      tabindex="-1"
    >
      <button
        type="button"
        class="status-modal-close"
        onclick={closeStatusModal}
        aria-label="Закрыть"
      >
        <Close size={18} />
      </button>
      <p class="status-modal-text">{statusModalText}</p>
    </div>
  </div>
{/if}

<style>
  /* ─── Hero Section ─────────────────────────────────────────── */
  .hero-section {
    min-height: 70vh;
    position: relative;
  }

  .hero-card {
    position: absolute;
    inset: 0;
    max-width: 80rem;
    margin-left: auto;
    margin-right: auto;
    left: 0;
    right: 0;
    overflow: hidden;
    border-bottom-left-radius: var(--radius-3xl, 3.3rem);
    border-bottom-right-radius: var(--radius-3xl, 3.3rem);
    box-shadow: none;
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

  /* ─── CTA Section ──────────────────────────────────────────── */
  .cta-section {
    position: relative;
  }

  /* Та же карточка что у hero — но градиент идёт сверху вниз */
  .cta-card {
    position: absolute;
    inset: 0;
    max-width: 80rem;
    margin-left: auto;
    margin-right: auto;
    left: 0;
    right: 0;
    overflow: hidden;
    /* Скругление сверху — зеркально hero */
    border-top-left-radius: var(--radius-3xl, 3.3rem);
    border-top-right-radius: var(--radius-3xl, 3.3rem);
    box-shadow: none;
  }

  /* Градиент сверху вниз (at 50% 0% → прозрачный внизу) */
  .cta-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(
      125% 125% at 50% 100%,
      transparent 40%,
      #f43f5e 68%,
      #fda4af 86%,
      #fff1f2 100%
    );
    opacity: 0.28;
  }

  :global(.dark) .cta-bg {
    opacity: 0.22;
  }

  /* CTA Typography */
  .cta-heading {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 500;
    letter-spacing: -0.02em;
    line-height: 1.15;
    color: var(--foreground);
    margin: 0;
  }

  .cta-sub {
    font-size: clamp(0.95rem, 1.5vw, 1.1rem);
    line-height: 1.7;
    color: var(--foreground-muted);
    margin: 0;
  }

  /* CTA Button */
  .cta-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    padding: 0.65rem 1.4rem;
    border-radius: var(--radius-sm, 0.55rem);
    background: var(--accent);
    color: #fff;
    font-size: 0.9rem;
    font-weight: 500;
    letter-spacing: 0.01em;
    border: none;
    cursor: pointer;
    transition:
      background 150ms ease-out,
      transform 150ms ease-out,
      box-shadow 150ms ease-out;
    box-shadow: 0 2px 12px rgba(244, 63, 94, 0.25);
  }

  .cta-button:hover {
    background: color-mix(in oklch, var(--accent) 85%, black);
    transform: translateY(-1px);
    box-shadow: 0 4px 20px rgba(244, 63, 94, 0.35);
  }

  .cta-button:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(244, 63, 94, 0.2);
  }

  /* ─── Section Layout ───────────────────────────────────────── */
  /* Уменьшены отступы между секциями, чтобы блоки "Что такое Opensophy?"
     и "Чем занимается" помещались в один экран */
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

  .about-note {
    position: relative;
    display: inline-grid;
    place-items: center;
    width: 0.9rem;
    height: 0.9rem;
    margin-left: 0.1rem;
    transform: translateY(-0.75rem);
    vertical-align: middle;
    border-radius: 999px;
    background: var(--accent);
    color: white;
    font-size: 0.8rem;
    cursor: help;
  }
  .about-note::after {
    content: "от «open philosophy» — «открытая философия»";
    position: absolute;
    right: 0;
    top: calc(100% + 0.5rem);
    z-index: 5;
    width: max-content;
    max-width: 16rem;
    padding: 0.55rem 0.7rem;
    border-radius: 0.5rem;
    background: var(--foreground);
    color: var(--background);
    font-size: 0.8rem;
    line-height: 1.35;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s;
  }
  .about-note:hover::after,
  .about-note:focus::after {
    opacity: 1;
  }

  /* Логотип: без overflow:hidden, чтобы контейнер его не обрезал.
     Высота и верхний отступ уменьшены под компактную вёрстку. */
  .about-ascii {
    height: 17rem;
    margin-top: 0.5rem;
    overflow: visible;
  }

  /* ─── Products Section Glow ────────────────────────────────── */
  .products-section {
    position: relative;
    z-index: 1;
  }

  /* Квадратный блок свечения позади карточек продуктов.
     Теперь это полностью залитый прямоугольник только акцентным цветом:
     без прозрачного "провала" в центре и без чёрных/белых углов —
     градиент идёт от чуть более светлого акцента в центре
     к чуть более тёмному акценту по краям, оставаясь в одной гамме. */
  .products-glow {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80rem;
    max-width: 100vw;
    height: 100%;
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
    .about-note {
      transform: translateY(-0.6rem);
    }
    .about-note::after {
      right: auto;
      left: -0.5rem;
      width: 13rem;
    }
    .about-ascii {
      height: 13rem;
    }
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
  }

  .services-action-primary {
    border-color: transparent;
    background: var(--accent);
    color: #fff;
  }

  /* ─── About Author Section ─────────────────────────────────── */
  .author-section {
    position: relative;
    z-index: 1;
    padding-top: clamp(2rem, 4vw, 3rem);
    padding-bottom: clamp(2rem, 4vw, 3rem);
  }

  /* Тот же блок, что и у «Продуктов», но серый вместо акцентного */
  .author-glow {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80rem;
    max-width: 100vw;
    height: 100%;
    z-index: -1;
    overflow: hidden;
    pointer-events: none;
    border-radius: var(--radius-3xl, 3.3rem);
    background: radial-gradient(
      farthest-corner at 50% 50%,
      color-mix(in srgb, var(--foreground-muted) 60%, white) 0%,
      var(--foreground-muted) 55%,
      color-mix(in srgb, var(--foreground-muted) 80%, black) 100%
    );
    opacity: 0.2;
  }

  :global(.dark) .author-glow {
    opacity: 0.16;
  }

  .author-copy {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  @media (max-width: 600px) {
    .author-glow {
      width: 160%;
    }
  }

  /* ─── Projects Grid ────────────────────────────────────────── */
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  @media (max-width: 479px) {
    .projects-grid {
      grid-template-columns: 1fr;
    }
  }

  /* ─── Project Card ─────────────────────────────────────────── */
  .project-card-body {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding: 1.25rem 1.375rem 1.375rem;
    min-height: 10.5rem;
  }

  .project-card-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
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

  .project-status-in-progress {
    text-transform: uppercase;
    color: var(--foreground-muted);
    background: var(--background-inset);
    border: 1px solid var(--border);
    padding: 0.15rem 0.45rem;
    border-radius: 999px;
  }

  .project-status-released {
    text-transform: uppercase;
    color: var(--foreground-muted);
    background: var(--background-inset);
    border: 1px solid var(--border);
    padding: 0.15rem 0.45rem;
    border-radius: 999px;
  }

  .project-status-frozen {
    text-transform: uppercase;
    color: var(--foreground-muted);
    background: var(--background-inset);
    border: 1px solid var(--border);
    padding: 0.15rem 0.45rem;
    border-radius: 999px;
  }

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
    transition:
      color 150ms ease-out,
      text-decoration-color 150ms ease-out;
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
    transition:
      background 150ms ease-out,
      color 150ms ease-out;
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
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes status-modal-scale-in {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .project-desc {
    font-size: 0.8rem;
    line-height: 1.6;
    color: var(--foreground-muted);
    margin: 0;
    flex: 1;
  }

  @media (min-width: 768px) {
    .project-desc {
      font-size: 0.85rem;
    }
  }
</style>