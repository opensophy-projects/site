<script lang="ts">
  import { onMount } from "svelte";
  import ServicesGrid from "$lib/components/ui-registry/ServicesGrid.svelte";
  import AsciiVisual from "$lib/components/ui-registry/AsciiVisual.svelte";
  import CardProject from "$lib/components/ui-registry/CardProject.svelte";
  import SiteMenu from "$lib/components/ui-registry/SiteMenu.svelte";
  import LogoCarousel from "$lib/components/ui-registry/logo-carousel.svelte";
  import Badge from "$lib/components/ui-registry/Badge.svelte";
  import Faq from "$lib/components/ui-registry/Faq.svelte";
  import ShieldInfinity from "$lib/components/ui-registry/ShieldInfinity.svelte";
  import Phosphor from "$lib/components/ui-registry/Phosphor.svelte";
  import Terminal from "$lib/components/ui-registry/Terminal.svelte";
  import Close from "carbon-icons-svelte/lib/Close.svelte";
  import { contactsState } from "$lib/stores/contacts.svelte";

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
  // Помещаются ли все логотипы в одну строку (проверяется по скрытой копии)
  let fits = $state(true);
  let sponsorsEl = $state<HTMLElement | undefined>();
  let measureEl = $state<HTMLElement | undefined>();

  // Карусель: всегда на мобильном, на ПК — только если логотипы не помещаются
  const useCarousel = $derived(isMobile || !fits);
  const groupSize = $derived(isMobile ? 1 : 2);

  function measureSponsors() {
    if (!sponsorsEl || !measureEl) return;
    fits = measureEl.offsetWidth <= sponsorsEl.clientWidth;
  }

  onMount(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    isMobile = mq.matches;
    const onChange = (e: MediaQueryListEvent) => {
      isMobile = e.matches;
    };
    mq.addEventListener("change", onChange);

    const ro = new ResizeObserver(measureSponsors);
    if (sponsorsEl) ro.observe(sponsorsEl);
    if (measureEl) ro.observe(measureEl);
    measureSponsors();

    return () => {
      mq.removeEventListener("change", onChange);
      ro.disconnect();
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

  const faqItems = [
    {
      question: "Кто автор Opensophy?",
      answer:
        "Даниил Кулешов — основатель и руководитель Opensophy. С 2025 года занимаюсь DevSecOps: выстраиваю безопасные пайплайны, встраиваю безопасность в разработку и настраиваю инфраструктуру с нуля. До этого занимался white hat-хакингом и bug bounty, а ещё раньше был графическим дизайнером, преподавал программирование и работал комьюнити-менеджером в NetEase Games."
    },
    {
      question: "Какие услуги вы оказываете?",
      answer:
        "Тестирование на проникновение (blackbox / graybox / whitebox), внедрение процессов безопасной разработки (DevSecOps), поиск утечек данных, настройка защиты инфраструктуры, автоматизация и обучение."
    },
    {
      question: "Сколько стоят услуги?",
      answer:
        "Средний чек — от 5 до 20 тысяч рублей. Точная стоимость зависит от объёма работ и сроков: мы обсуждаем задачу, согласовываем условия и фиксируем их письменно до начала работ."
    },
    {
      question: "Как проходит работа?",
      answer:
        "Вы описываете задачу, мы согласовываем объём, сроки и стоимость, затем подписываем разрешение на работы. После этого я провожу проверку строго в рамках согласованного периметра и отдаю отчёт понятным языком, с приоритетами: что исправить сейчас, а что может подождать."
    },
    {
      question: "Проверяете ли вы системы без разрешения?",
      answer:
        "Нет. Я ничего не проверяю и не тестирую без письменного разрешения владельца системы. В нём указано, какие системы проверяются, какими методами и в какие даты. Всё, что не входит в согласованный перечень, не проверяется."
    },
    {
      question: "Как быстро вы отвечаете и сдаёте отчёт?",
      answer:
        "На запросы, отправленные на opensophy@gmail.com, я отвечаю в течение 3 рабочих дней. Отчёт по результатам работ направляю в течение недели после полного завершения технических работ."
    },
    {
      question: "Что вы гарантируете?",
      answer:
        "Работу только в согласованных границах, отсутствие разрушительных действий (DoS, удаление или изменение данных, социальная инженерия) без отдельной договорённости, конфиденциальность найденных данных и минимально необходимые доказательства уязвимостей. При риске необратимых последствий я останавливаюсь и сообщаю вам."
    },
    {
      question: "Чего вы не гарантируете?",
      answer:
        "Автоматизированные проверки, включая AI-assisted анализ кода, не гарантируют обнаружение всех уязвимостей и не заменяют полноценный ручной аудит, если он требуется по закону или отраслевым стандартам. Результаты отражают состояние систем на момент проведения работ."
    },
    {
      question: "Можно ли изменить условия или остановить работы?",
      answer:
        "Да. Изменения объёма, сроков или стоимости оформляются дополнительным соглашением в течение 5 рабочих дней. Заказчик может приостановить или прекратить работы по письменному уведомлению. О приостановке с моей стороны я уведомляю в течение 1 рабочего дня."
    },
    {
      question: "Как с вами связаться?",
      answer:
        "Напишите на opensophy@gmail.com или нажмите «Заказать услуги» в разделе выше. Если есть вопросы о том, как я работаю, лучше задать их до заказа — обсудим детали."
    },
    {
      question: "Рассматриваете ли вы трудоустройство в компанию?",
      answer:
        "Да, вы можете предложить мне работу. Я рассматриваю предложения от 150 тысяч рублей, готов к удалённой работе и к переезду. Подробнее — на Хабр Карьере: https://career.habr.com/opensophy"
    }
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
  <section class="hero-section relative flex w-full items-center justify-center">
    <!-- Изогнутое свечение (горизонт) -->
    <div class="hero-card" aria-hidden="true">
      <div class="hero-halo"></div>
      <div class="hero-arc"></div>
    </div>

    <div class="hero-inner">
      <div class="hero-copy">
        <h1 class="hero-lead">
          <span class="text-foreground">opensophy</span>
          <span class="hero-lead-line text-accent">Мастерская DevSecOps</span>
        </h1>
        <div class="services-actions hero-actions">
          <button
            type="button"
            class="services-action services-action-primary"
            onclick={() => contactsState.open()}>Контакты</button
          >
          <a class="services-action" href="/solutions">Услуги</a>
        </div>
      </div>

      <div class="hero-logo" aria-label="Opensophy ASCII logo">
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
            <span class="text-accent">на каждом этапе.</span> Дополнительно внедряем защитный экран на базе искусственного интеллекта: он учится распознавать новые атаки в реальном времени и блокирует их до того, как они нанесут вред. Обычные фильтры пропускают нестандартные угрозы, а
            <span class="text-accent">наш WAF адаптируется под них автоматически.</span> Вам не нужно постоянно обновлять правила — защита становится умнее с каждой атакой.
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
            <span class="text-strong">Настраиваем автоматическую выгрузку отчетов, рассылку уведомлений, проверку данных и другие рутинные операции.</span> То, что сотрудники делают вручную каждый день или неделю,
            <span class="text-accent">будет происходить само по расписанию.</span> Освобождаем время команды для реальной работы.
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
            <span class="text-strong">Разрабатываем сайты и внутренние инструменты, настраиваем серверы и устраняем сбои.</span> Если система тормозит, не запускается или требует доработки —
            <span class="text-accent">мы сможем найти причину и наладим работу.</span>
          </p>
        </div>
      </article>
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
      <a class="services-action" href="/service-policy">Политика оказания услуг</a>
    </div>
  </section>

  <!-- FAQ Section -->
  <section class="cta-section relative flex w-full items-center justify-center px-6 py-16 md:py-24">
    <div class="cta-card" aria-hidden="true">
      <div class="cta-bg"></div>
    </div>

    <div class="relative z-10 w-full max-w-5xl mx-auto">
      <p class="section-overline"><Badge variant="default">Вопросы и ответы</Badge></p>
      <Faq items={faqItems} />
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
  }

  /* Карточка со свечением: растянута на всю секцию, скруглена снизу */
  .hero-card {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    overflow: hidden;
    box-shadow: none;
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
    top: calc(100% - 4rem);
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
    gap: clamp(1.5rem, 4vw, 4rem);
    width: calc(100% - 2rem);
    max-width: 80rem;
    margin: 0 auto;
    padding: 0 1.25rem;
  }

  .hero-copy {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  /* Стиль как у блока «Opensophy занимается…» */
  .hero-lead {
    margin: 0;
    font-size: clamp(1.75rem, 3.5vw, 2.6rem);
    font-weight: 500;
    line-height: 1.4;
    color: var(--foreground-muted);
  }

  .hero-lead-line {
    display: block;
  }

  .hero-actions {
    justify-content: flex-start;
    margin-top: 0.75rem;
  }

  .hero-logo {
    position: relative;
    width: 100%;
    justify-self: end;
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
    }

    .hero-arc {
      top: calc(100% - 3rem);
      width: 220%;
      height: 26rem;
    }

    .hero-inner {
      grid-template-columns: 1fr;
      width: 100%;
      padding: 0 1rem;
      gap: 0.5rem;
    }

    .hero-copy {
      align-items: center;
      text-align: center;
    }

    .hero-actions {
      justify-content: center;
    }

    .hero-logo {
      justify-self: center;
      height: clamp(18rem, 88vw, 26rem);
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

  /* ─── Component showcase ─────────────────────────────────── */
  /* Ширина совпадает с границами свечения (hero-card): 92rem */
  .component-showcase {
    width: calc(100% - 2rem);
    max-width: 92rem;
    margin: 0 auto;
    padding: 0.5rem 1.25rem clamp(3rem, 6vw, 6rem);
    box-sizing: border-box;
  }

  .component-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-items: start;
    gap: clamp(1.5rem, 3.5vw, 4rem);
    width: 100%;
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
    min-height: clamp(18rem, 27vw, 25rem);
  }

  .component-visual :global(svg) {
    display: block;
    width: 100%;
    max-width: 100%;
    max-height: none;
  }

  .component-copy {
    width: 100%;
    text-align: left;
  }

  .component-copy h2 {
    margin: 0 0 0.85rem;
    color: var(--foreground);
    font-size: clamp(1.2rem, 1.7vw, 1.55rem);
    font-weight: 600;
    line-height: 1.25;
    letter-spacing: -0.025em;
  }

  /* Стиль текста как в блоке «Opensophy — это инициатива…» */
  .component-copy p {
    margin: 0;
    color: var(--foreground-muted);
    font-size: clamp(0.95rem, 1.15vw, 1.1rem);
    font-weight: 500;
    line-height: 1.6;
    letter-spacing: -0.01em;
  }

  .component-copy .text-strong {
    color: var(--foreground);
  }

  .component-copy .text-accent {
    color: var(--accent);
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

  /* ─── CTA Section ──────────────────────────────────────────── */
  .cta-section {
    position: relative;
  }

  .cta-card {
    position: absolute;
    inset: 0;
    max-width: 80rem;
    margin-left: auto;
    margin-right: auto;
    left: 0;
    right: 0;
    overflow: hidden;
    border-top-left-radius: var(--radius-3xl, 3.3rem);
    border-top-right-radius: var(--radius-3xl, 3.3rem);
    box-shadow: none;
  }

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
    transition: background 150ms ease-out, transform 150ms ease-out, box-shadow 150ms ease-out;
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

  .products-section {
    position: relative;
    z-index: 1;
  }

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