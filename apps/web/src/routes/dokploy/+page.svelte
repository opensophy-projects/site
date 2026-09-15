<script lang="ts">
	import PageSeo from '$lib/components/seo/PageSeo.svelte';
	import { siteConfig } from '$lib/config/site';
  import SiteMenu from "$lib/components/ui/SiteMenu.svelte";
  import Card from "$lib/components/docs/markdown/Card.svelte";
  import CardProject from "$lib/components/ui/CardProject.svelte";
  import Button from "$lib/components/ui-registry/Button.svelte";
  import ChevronLeft from "carbon-icons-svelte/lib/ChevronLeft.svelte";
  import ChevronRight from "carbon-icons-svelte/lib/ChevronRight.svelte";

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

  const screenshots = Array.from({ length: 29 }, (_, index) => ({
    src: `/dokploy${index + 1}.png`,
    alt: `Интерфейс os.dokploy — скриншот ${index + 1}`,
  }));

	let earlyAccessOpen = $state(false);
  let activeScreenshot = $state(0);

  function showScreenshot(index: number) {
    activeScreenshot = (index + screenshots.length) % screenshots.length;
  }

	function closeEarlyAccess() {
		earlyAccessOpen = false;
	}
</script>

<svelte:window onkeydown={(event) => event.key === 'Escape' && closeEarlyAccess()} />

<PageSeo title="os.dokploy — сервер уровня Enterprise" description="os.dokploy — форк Dokploy для управления серверами, деплоя приложений и бесплатных enterprise-возможностей." type="website" />

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
        OS.DOKPLOY
      </p>
      <h1 class="hero-heading">Свой сервер уровня Enterprise</h1>
      <p class="max-w-3xl text-lg text-foreground-muted md:text-xl">
        Упростите управление проектами и данными, обеспечьте надежный мониторинг
        и защитите резервные копии — и все это без лишних хлопот, связанных с
        мелочами.
      </p>
      <div class="flex flex-wrap justify-center gap-3">
		<div class="relative">
			<Button onclick={() => (earlyAccessOpen = !earlyAccessOpen)}>Получить ранний доступ</Button>
			{#if earlyAccessOpen}
				<div class="early-access-menu" role="dialog" aria-label="Получение раннего доступа">
					<p class="text-sm leading-relaxed text-foreground-muted">
						Для получения доступа напишите нам удобным для вас способом. Обязательно укажите
						ссылку на ваш GitHub-профиль: доступ будет выдан в приватный репозиторий.
					</p>
					<div class="mt-3 grid gap-1">
						<a href={siteConfig.links.telegram} target="_blank" rel="noreferrer">Telegram @opensophy</a>
						<a href={`mailto:${siteConfig.links.email}`}>{siteConfig.links.email}</a>
					</div>
				</div>
			{/if}
		</div>
      </div>
    </div>
  </section>

  <section class="section-block w-full max-w-5xl px-4">
    <p class="section-overline">Что такое os.dokploy?</p>
    <h2 class="section-heading">Платформа для деплоя почти чего угодно</h2>
    <p class="max-w-4xl text-lg leading-relaxed text-foreground-muted">
      Это форк проекта Dokploy, платформа для управления серверами и деплоя
      приложения, развернуть можно почти всё что угодно: Docker Compose,
      Nixpacks, Buildpacks или свой Dockerfile. SSO/SAML, SCIM, аудит-логи,
      RBAC, White Labeling, mTLS — всё, что нужно для enterprise-инфраструктуры,
      входит бесплатно.
    </p>
  </section>

  <section class="section-block w-full max-w-6xl px-4">
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="section-overline">Интерфейс платформы</p>
        <h2 class="section-heading mb-0">Посмотрите os.dokploy в работе</h2>
      </div>
      <p class="text-sm text-foreground-muted">{activeScreenshot + 1} / {screenshots.length}</p>
    </div>

    <div class="screenshot-carousel" aria-roledescription="carousel" aria-label="Скриншоты os.dokploy">
      <img
        class="screenshot-carousel-image"
        src={screenshots[activeScreenshot].src}
        alt={screenshots[activeScreenshot].alt}
      />
      <button
        type="button"
        class="screenshot-carousel-control screenshot-carousel-control-prev"
        aria-label="Предыдущий скриншот"
        onclick={() => showScreenshot(activeScreenshot - 1)}
      >
        <ChevronLeft size={24} />
      </button>
      <button
        type="button"
        class="screenshot-carousel-control screenshot-carousel-control-next"
        aria-label="Следующий скриншот"
        onclick={() => showScreenshot(activeScreenshot + 1)}
      >
        <ChevronRight size={24} />
      </button>
    </div>

    <div class="screenshot-thumbnails" aria-label="Выбор скриншота">
      {#each screenshots as screenshot, index (screenshot.src)}
        <button
          type="button"
          class:active={activeScreenshot === index}
          aria-label={`Показать скриншот ${index + 1}`}
          aria-current={activeScreenshot === index ? "true" : undefined}
          onclick={() => showScreenshot(index)}
        >
          <img src={screenshot.src} alt="" loading="lazy" />
        </button>
      {/each}
    </div>
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
        >os.dokploy бесплатно предоставляет Enterprise-версию</span
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
	.early-access-menu {
		position: absolute;
		z-index: 20;
		top: calc(100% + 0.75rem);
		left: 50%;
		width: min(22rem, calc(100vw - 2rem));
		padding: 1rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-md, 0.375rem);
		background: var(--background-inset);
		box-shadow: var(--shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1));
		text-align: left;
		transform: translateX(-50%);
	}
	.early-access-menu a {
		border-radius: var(--radius-sm, 0.25rem);
		padding: 0.5rem 0.75rem;
		color: var(--foreground-muted);
		font-size: 0.875rem;
		font-weight: 500;
		transition: background-color 150ms ease-out, color 150ms ease-out;
	}
	.early-access-menu a:hover {
		background: var(--background-muted);
		color: var(--foreground);
	}
  .section-overline {
    margin-bottom: 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--foreground-muted);
  }
  .screenshot-carousel {
    position: relative;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: var(--radius-xl, 1rem);
    background: var(--background-inset);
    box-shadow: var(--shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1));
  }
  .screenshot-carousel-image {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 10;
    object-fit: contain;
    background: #111;
  }
  .screenshot-carousel-control {
    position: absolute;
    top: 50%;
    display: grid;
    width: 2.75rem;
    height: 2.75rem;
    place-items: center;
    transform: translateY(-50%);
    border: 1px solid rgb(255 255 255 / 0.3);
    border-radius: 9999px;
    background: rgb(17 17 17 / 0.75);
    color: #fff;
    cursor: pointer;
    transition: transform 150ms ease-out, background-color 150ms ease-out;
  }
  .screenshot-carousel-control:hover {
    background: rgb(17 17 17 / 0.95);
  }
  .screenshot-carousel-control:focus-visible,
  .screenshot-thumbnails button:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
  }
  .screenshot-carousel-control:active {
    transform: translateY(-50%) scale(0.94);
  }
  .screenshot-carousel-control-prev { left: 1rem; }
  .screenshot-carousel-control-next { right: 1rem; }
  .screenshot-thumbnails {
    display: flex;
    gap: 0.625rem;
    overflow-x: auto;
    padding: 1rem 0.25rem 0.25rem;
    scrollbar-width: thin;
  }
  .screenshot-thumbnails button {
    flex: 0 0 5rem;
    overflow: hidden;
    padding: 0;
    border: 2px solid transparent;
    border-radius: var(--radius-md, 0.375rem);
    background: var(--background-muted);
    cursor: pointer;
    opacity: 0.65;
    transition: border-color 150ms ease-out, opacity 150ms ease-out;
  }
  .screenshot-thumbnails button:hover,
  .screenshot-thumbnails button.active {
    border-color: var(--accent);
    opacity: 1;
  }
  .screenshot-thumbnails img {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 10;
    object-fit: cover;
  }
  @media (max-width: 640px) {
    .screenshot-carousel-control {
      width: 2.25rem;
      height: 2.25rem;
    }
    .screenshot-carousel-control-prev { left: 0.5rem; }
    .screenshot-carousel-control-next { right: 0.5rem; }
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
