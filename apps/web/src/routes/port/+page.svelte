<script lang="ts">
  import SiteMenu from "$lib/components/ui/SiteMenu.svelte";
  import Card from "$lib/components/docs/markdown/Card.svelte";
  import CardProject from "$lib/components/ui/CardProject.svelte";
  import Button from "$lib/components/ui-registry/Button.svelte";

  const features = [
    [
      "Гибкое развертывание приложений",
      "Развертывайте любое приложение с помощью Nixpacks, Heroku Buildpacks или собственного Dockerfile — под ваш стек.",
    ],
    [
      "Нативная поддержка Docker Compose",
      "Развёртывайте сложные приложения нативно с полной интеграцией Docker Compose для бесшовной оркестрации.",
    ],
    [
      "Поддержка нескольких серверов",
      "Разворачивайте приложения на удалённых серверах без лишней настройки.",
    ],
    [
      "Продвинутое управление пользователями",
      "Контролируйте доступ пользователей с детальными ролями и правами — деплои остаются защищёнными и организованными.",
    ],
    [
      "Управление базами данных с бэкапами",
      "Управляйте и делайте бэкапы MySQL, PostgreSQL, MongoDB, MariaDB, Redis прямо из Dokploy.",
    ],
    [
      "Доступ через API и CLI",
      "Нужна кастомная функциональность? Dokploy предоставляет полный доступ к API и CLI под ваши задачи.",
    ],
    [
      "Кластеры Docker Swarm",
      "Масштабируйте развёртывания с встроенной поддержкой Docker Swarm для надёжных многоузловых приложений.",
    ],
    [
      "Открытые шаблоны",
      "Быстрый старт с готовыми шаблонами для популярных инструментов вроде Supabase, Cal.com и PocketBase.",
    ],
    [
      "Никакой привязки к вендору",
      "Полная свобода изменять, масштабировать и кастомизировать Dokploy под свои нужды.",
    ],
    [
      "Мониторинг и алерты в реальном времени",
      "Отслеживайте нагрузку CPU, памяти и сети в реальном времени по всем развёртываниям для полной прозрачности.",
    ],
    [
      "Развёртывания с ИИ-ассистентом",
      "Подключайте ИИ-инструменты к Dokploy через MCP или развёртывайте приложения, созданные ИИ, в контролируемой песочнице с SSO и мультитенантностью.",
    ],
    [
      "Self-hosted и открытый исходный код",
      "Создан для разработчиков, которым нужен полный контроль и гибкость — с самостоятельным хостингом и открытым кодом.",
    ],
  ];

  const enterpriseFeatures = [
    [
      "SSO / SAML",
      "Бесшовная аутентификация через корпоративных провайдеров идентификации для безопасного централизованного управления доступом.",
    ],
    [
      "SCIM Provisioning",
      "Автоматическое создание, обновление и деактивация пользователей из Okta, Entra ID или любого SCIM 2.0-совместимого провайдера идентификации.",
    ],
    [
      "Журналы аудита",
      "Полное отслеживание всех системных действий для соответствия требованиям безопасности, комплаенса и подотчётности.",
    ],
    [
      "Гибкая RBAC-модель",
      "Детальное разграничение прав доступа на основе ролей, гарантирующее, что нужные права есть только у нужных людей.",
    ],
    [
      "Точечный контроль пользователей",
      "Назначайте удалённые серверы и конкретные git-провайдеры отдельным участникам команды.",
    ],
    [
      "White Labeling",
      "Представляйте Dokploy как собственную платформу — с кастомным брендингом, логотипом и цветовой схемой для вашей организации или клиентов.",
    ],
    [
      "mTLS-управление",
      "Быстрое создание и управление mTLS-сертификатами для Traefik. Позволяет надёжно ограничить доступ к сервисам и серверам без лишних сложностей.",
    ],
    [
      "Русифицированный интерфейс",
      "Полная локализация платформы на русский язык — комфортная работа без языкового барьера для русскоязычных разработчиков.",
    ],
  ];
</script>

<svelte:head>
  <title>os.dokploy — сервер уровня Enterprise</title>
  <meta
    name="description"
    content="os.dokploy — форк Dokploy для управления серверами, деплоя приложений и бесплатных enterprise-возможностей."
  />
</svelte:head>

<main
  class="relative flex min-h-dvh w-full flex-col items-center bg-background pt-20 text-foreground"
>
  <SiteMenu />

  <section
    class="hero-section relative flex w-full items-center justify-center px-6 py-20 md:py-28"
  >
    <div class="hero-card" aria-hidden="true"><div class="hero-bg"></div></div>
    <div
      class="relative z-10 flex w-full max-w-5xl flex-col items-center gap-7 text-center"
    >
      <p
        class="text-sm font-medium uppercase tracking-[0.18em] text-foreground-muted"
      >
        OS.PORT
      </p>
      <h1 class="hero-heading">Свой сервер уровня Enterprise</h1>
      <p class="max-w-3xl text-lg text-foreground-muted md:text-xl">
        Упростите управление проектами и данными, обеспечьте надежный мониторинг
        и защитите резервные копии — и все это без лишних хлопот, связанных с
        мелочами.
      </p>
      <div class="flex flex-wrap justify-center gap-3">
        <Button variant="secondary">в разработке</Button>
      </div>
    </div>
  </section>

  <section class="section-block w-full max-w-5xl px-4">
    <p class="section-overline">Что такое os.port?</p>
    <h2 class="section-heading">Платформа для деплоя почти чего угодно</h2>
    <p class="max-w-4xl text-lg leading-relaxed text-foreground-muted">
      Это форк проекта Dokploy, платформа для управления серверами и деплоя
      приложения, развернуть можно почти всё что угодно: Docker Compose,
      Nixpacks, Buildpacks или свой Dockerfile. SSO/SAML, SCIM, аудит-логи,
      RBAC, White Labeling, mTLS — всё, что нужно для enterprise-инфраструктуры,
      входит бесплатно.
    </p>
  </section>

  <section class="section-block w-full max-w-5xl px-4">
    <p class="section-overline">Что внутри</p>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each features as [title, text] (title)}<Card {title}>{text}</Card>{/each}
    </div>
  </section>

  <section class="section-block w-full max-w-5xl px-4">
    <p class="section-overline">Enterprise без доплаты</p>
    <h2 class="section-heading">
      Наш <span class="text-accent"
        >os.port бесплатно предоставляет Enterprise-версию</span
      >, в которую входит:
    </h2>
    <div class="grid gap-4 md:grid-cols-2">
      {#each enterpriseFeatures as [title, text] (title)}
        <CardProject
          className="min-h-40"
          colors={["#f43f5e", "#f472b6", "#b2263e"]}
          glowColor="350 90 72"
          glowIntensity={1.15}
        >
          <div class="p-5">
            <h3 class="text-lg font-semibold tracking-tight text-foreground">
              {title}
            </h3>
            <p class="mt-2 text-sm leading-relaxed text-foreground-muted">
              {text}
            </p>
          </div>
        </CardProject>
      {/each}
    </div>
    <p class="mt-6 text-center text-sm font-medium text-accent">
      функционал форка будет пополняться.
    </p>
  </section>

  <section class="bottom-gradient-section" aria-hidden="true">
    <div class="bottom-gradient-card">
      <div class="bottom-gradient-bg"></div>
    </div>
  </section>
</main>

<style>
  .hero-section {
    min-height: 56vh;
  }
  .hero-card {
    position: absolute;
    top: -5rem;
    right: 0;
    bottom: 0;
    left: 0;
    max-width: 80rem;
    margin: auto;
    overflow: hidden;
    border-top-left-radius: var(--radius-3xl, 3.3rem);
    border-top-right-radius: var(--radius-3xl, 3.3rem);
  }
  .hero-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.28;
    background: radial-gradient(
      125% 125% at 50% 100%,
      transparent 40%,
      #f43f5e 68%,
      #fda4af 86%,
      #fff1f2 100%
    );
  }
  :global(.dark) .hero-bg,
  :global(.dark) .bottom-gradient-bg {
    opacity: 0.22;
  }
  .hero-heading {
    max-width: 64rem;
    margin: 0;
    font-size: clamp(2.3rem, 7vw, 5.2rem);
    font-weight: 500;
    letter-spacing: -0.04em;
    line-height: 1.05;
  }
  .section-block {
    position: relative;
    padding-top: clamp(2.5rem, 5vw, 4rem);
    padding-bottom: clamp(2.5rem, 5vw, 4rem);
  }
  .section-overline {
    margin-bottom: 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--foreground-muted);
  }
  .section-heading {
    margin: 0 0 1.5rem;
    font-size: clamp(1.8rem, 4vw, 3rem);
    font-weight: 500;
    letter-spacing: -0.03em;
  }
  .bottom-gradient-section {
    position: relative;
    min-height: clamp(12rem, 28vw, 22rem);
    width: 100%;
  }
  .bottom-gradient-card {
    position: absolute;
    inset: 0;
    max-width: 80rem;
    margin: auto;
    overflow: hidden;
    border-bottom-left-radius: var(--radius-3xl, 3.3rem);
    border-bottom-right-radius: var(--radius-3xl, 3.3rem);
  }
  .bottom-gradient-bg {
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
</style>
