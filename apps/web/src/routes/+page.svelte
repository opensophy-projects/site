<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve */
  import { brandingConfig } from "$lib";
  import CardSection from "$lib/components/ui/CardSection.svelte";
  import CardProject from "$lib/components/ui/CardProject.svelte";
  import SiteMenu from "$lib/components/ui/SiteMenu.svelte";
  import TextLoop from "$lib/components/ui/TextLoop.svelte";
  import ArrowRight from "carbon-icons-svelte/lib/ArrowRight.svelte";
  import Close from "carbon-icons-svelte/lib/Close.svelte";
  import { contactsState } from "$lib/stores/contacts.svelte";

  const heroLoopTexts = ["знания", "open-source", "безопасность", "разработку"];

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
      glowColor: "330 70 65",
      status: {
        variant: "released",
        label: "Проект в релизе",
        href: "https://github.com/opensophy-projects/docs",
      },
    },
    {
      title: "os.ui",
      description:
        "Библиотека готовых UI-компонентов с живым превью и гибкими настройками. Включает анимации, интерактивные блоки и фирменные компоненты Opensophy — для разработчиков и дизайнеров.",
      colors: ["#f43f5e", "#f472b6", "#b2263e"],
      glowColor: "330 70 65",
      status: {
        variant: "released",
        label: "Проект в релизе",
        href: "/components",
      },
    },
    {
      title: "os.mtls",
      description:
        "Инструмент для быстрого создания и управления mTLS-сертификатами для Traefik. Позволяет надёжно закрыть доступ к сервисам и серверам без лишних сложностей.",
      colors: ["#f43f5e", "#f472b6", "#b2263e"],
      glowColor: "330 70 65",
      status: {
        variant: "released",
        label: "Проект в релизе",
        href: "https://github.com/opensophy-projects/mtls",
      },
    },
    {
      title: "os.dokploy",
      description:
        "Форк проекта Dokploy — платформа для управления серверами и деплоя приложений. Бесплатная enterprise-версия с обновлённым дизайном, встроенным управлением mTLS и русификацией.",
      colors: ["#f43f5e", "#f472b6", "#b2263e"],
      glowColor: "330 70 65",
      status: { variant: "in-progress", label: "Скоро в релизе" },
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
        проект про <TextLoop
          texts={heroLoopTexts}
          interval={2200}
          class="text-accent"
        />
      </p>
    </div>
  </section>

  <!-- About Section -->
  <section class="section-block w-full max-w-5xl mx-auto px-4">
    <p class="section-overline">О проекте</p>
    <h2 class="section-lead text-foreground-muted">
      <span class="text-foreground">Opensophy</span> —
      <span class="text-accent">инициатива</span> открытой философии в IT. Качественные
      и доступные знания, услуги, инструменты и решения.
    </h2>
  </section>

  <!-- What We Do Section -->
  <section class="section-block w-full max-w-5xl mx-auto px-4">
    <p class="section-overline">Чем занимается</p>
    <div class="section-headlines">
      <h2 class="section-headline-plain">
        Учим безопасности, настраиваем защиту, автоматизируем рутину.
      </h2>
      <h2 class="section-headline-muted">
        От образовательных материалов до внедрения <span class="text-accent"
          >DevSecOps</span
        >
        в реальную инфраструктуру.
      </h2>
    </div>
    <CardSection />
    <div class="services-actions">
      <a class="services-action services-action-primary" href="/services"
        >Посмотреть все услуги</a
      >
      <a class="services-action" href="/service-policy"
        >Политика оказания услуг</a
      >
    </div>
  </section>

  <!-- Projects Section -->
  <section class="section-block w-full max-w-5xl mx-auto px-4">
    <p class="section-overline">Что разрабатывает</p>
    <h2 class="section-lead text-foreground-muted">
      <span class="text-foreground">Создаём</span>
      <span class="text-accent">open-source инструменты</span> для безопасной инфраструктуры
      и современных IT-команд.
    </h2>
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

  <!-- CTA Section -->
  <section
    class="cta-section relative flex w-full items-center justify-center px-6 py-24 md:py-32"
  >
    <div class="cta-card" aria-hidden="true">
      <div class="cta-bg"></div>
    </div>

    <div
      class="relative z-10 flex flex-col items-center gap-6 text-center max-w-5xl w-full"
    >
      <h2 class="cta-heading">
        Готовы к&nbsp;<span class="text-accent">сотрудничеству?</span>
      </h2>
      <p class="cta-sub">
        Нужна помощь с инфраструктурой, безопасностью или DevSecOps?<br />
        Напишите — отвечу в течение двух рабочих дней.
      </p>
      <button
        type="button"
        class="cta-button"
        onclick={() => {
          contactsState.open();
        }}
      >
        <span>Написать нам</span>
        <ArrowRight size={16} />
      </button>
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

  /* Форма градиента сменена с ellipse (значение по умолчанию для
     "125% 125%" с разными % по X/Y) на circle. Сильно вытянутый эллипс
     на большой площади даёт неравномерную интерполяцию по углам — именно
     это давало заметные диагональные "лучи" от центра на скриншотах.
     Круговая форма интерполируется одинаково по всем направлениям, без
     угловых артефактов. Радиус увеличен, чтобы визуально сохранить
     прежний охват формы (ellipse 125%/125% ~ circle с radius ~130% от
     farthest-corner). Альфа по-прежнему в стопах (rgba), не в opacity —
     см. предыдущий комментарий про двойное квантование. */
  .hero-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(
      circle 130% at 50% 0%,
      rgba(244, 63, 94, 0) 40%,
      rgba(244, 63, 94, 0.02) 43%,
      rgba(244, 63, 94, 0.045) 46%,
      rgba(244, 63, 94, 0.075) 49%,
      rgba(244, 63, 94, 0.11) 52%,
      rgba(244, 63, 94, 0.15) 55%,
      rgba(244, 63, 94, 0.185) 58%,
      rgba(244, 63, 94, 0.22) 61%,
      rgba(244, 63, 94, 0.255) 65%,
      rgba(244, 63, 94, 0.28) 68%,
      rgba(248, 92, 116, 0.28) 72%,
      rgba(251, 121, 138, 0.28) 76%,
      rgba(253, 143, 156, 0.28) 80%,
      rgba(253, 158, 169, 0.28) 83%,
      rgba(253, 164, 175, 0.28) 86%,
      rgba(254, 190, 197, 0.28) 90%,
      rgba(254, 210, 214, 0.28) 93%,
      rgba(255, 227, 230, 0.28) 96%,
      rgba(255, 238, 240, 0.28) 98%,
      rgba(255, 241, 242, 0.28) 100%
    );
  }

  :global(.dark) .hero-bg {
    opacity: 0.79;
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

  .cta-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(
      circle 130% at 50% 100%,
      rgba(244, 63, 94, 0) 40%,
      rgba(244, 63, 94, 0.02) 43%,
      rgba(244, 63, 94, 0.045) 46%,
      rgba(244, 63, 94, 0.075) 49%,
      rgba(244, 63, 94, 0.11) 52%,
      rgba(244, 63, 94, 0.15) 55%,
      rgba(244, 63, 94, 0.185) 58%,
      rgba(244, 63, 94, 0.22) 61%,
      rgba(244, 63, 94, 0.255) 65%,
      rgba(244, 63, 94, 0.28) 68%,
      rgba(248, 92, 116, 0.28) 72%,
      rgba(251, 121, 138, 0.28) 76%,
      rgba(253, 143, 156, 0.28) 80%,
      rgba(253, 158, 169, 0.28) 83%,
      rgba(253, 164, 175, 0.28) 86%,
      rgba(254, 190, 197, 0.28) 90%,
      rgba(254, 210, 214, 0.28) 93%,
      rgba(255, 227, 230, 0.28) 96%,
      rgba(255, 238, 240, 0.28) 98%,
      rgba(255, 241, 242, 0.28) 100%
    );
  }

  :global(.dark) .cta-bg {
    opacity: 0.79;
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
  .section-block {
    padding-top: clamp(2rem, 4vw, 3rem);
    padding-bottom: clamp(4rem, 8vw, 7rem);
  }

  .section-overline {
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--foreground-muted);
    margin-bottom: 2rem;
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