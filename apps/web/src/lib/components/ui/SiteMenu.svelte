<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve */
  import { brandingConfig, siteConfig } from "$lib";
  import FloatingMenu from "$lib/components/ui/FloatingMenu.svelte";
  import Button from "$lib/components/ui-registry/Button.svelte";
  import ThemeToggle from "$lib/components/ui/ThemeToggle.svelte";
  import DockerLogo from "$lib/components/ui/DockerLogo.svelte";
  import { contactsState } from "$lib/stores/contacts.svelte";
  import { searchState } from "$lib/stores/search.svelte";
  import ChevronRight from "carbon-icons-svelte/lib/ChevronRight.svelte";
  import Close from "carbon-icons-svelte/lib/Close.svelte";
  import DocumentMultiple_01 from "carbon-icons-svelte/lib/DocumentMultiple_01.svelte";
  import Email from "carbon-icons-svelte/lib/Email.svelte";
  import LogoGithub from "carbon-icons-svelte/lib/LogoGithub.svelte";
  import Network_3 from "carbon-icons-svelte/lib/Network_3.svelte";
  import Policy from "carbon-icons-svelte/lib/Policy.svelte";
  import Search from "carbon-icons-svelte/lib/Search.svelte";
  import QHintonPlot from "carbon-icons-svelte/lib/QHintonPlot.svelte";
  import Settings from "carbon-icons-svelte/lib/Settings.svelte";
  import Categories from "carbon-icons-svelte/lib/Categories.svelte";
  import Tag from "carbon-icons-svelte/lib/Tag.svelte";
  import WebServicesContainer from "carbon-icons-svelte/lib/WebServicesContainer.svelte";
  import IbmCloudGateKeeper from "carbon-icons-svelte/lib/IbmCloudGateKeeper.svelte";
  import AddServer from "carbon-icons-svelte/lib/AddServer.svelte";
  import UserFavoriteAltFilled from "carbon-icons-svelte/lib/UserFavoriteAltFilled.svelte";
  import Book from "carbon-icons-svelte/lib/Book.svelte";
  import LocationCurrent from "carbon-icons-svelte/lib/LocationCurrent.svelte";

  // ---- Продукты: 3 колонки ----
  const productColumns = [
    {
      title: "Платформы",
      links: [
        {
          label: "os.dokploy",
          description: "Платформа для управления серверами и деплоя приложений.",
          href: "/dokploy",
          icon: WebServicesContainer,
        },
        {
          label: "os.docs",
          description: "Платформа для документации и публикации контента.",
          href: "/docs/opensophy-docs",
          icon: DocumentMultiple_01,
        },
      ],
    },
    {
      title: "Библиотеки",
      links: [
        {
          label: "os.ui",
          description: "Библиотека готовых UI-компонентов с живым превью и гибкими настройками.",
          href: "/components/overview",
          icon: QHintonPlot,
        },
        {
          label: "os.compose",
          description: "Наши готовые шаблоны для инструментов DevSecOps/AppSec.",
          href: "/templates/docker/",
          icon: DockerLogo,
        },
      ],
    },
    {
      title: "Инструменты",
      links: [
        {
          label: "os.mtls",
          description: "Инструмент для быстрого создания и управления mTLS-сертификатами для Traefik.",
          href: "/mtls",
          icon: Network_3,
        },
      ],
    },
  ];

  // ---- Решения: плоский ряд карточек ----
  const solutionLinks = [
    {
      label: "Автоматизация",
      description: "Создаю автоматизацию любого уровня — от простых задач до сложных процессов.",
      href: "/solutions/automation",
      icon: Settings,
    },
    // TODO: create /solutions/security page
    // {
    //   label: "Безопасность",
    //   description: "Встраиваю безопасность в разработку, тестирование и запуск ваших проектов.",
    //   href: "/solutions/security",
    //   icon: IbmCloudGateKeeper,
    // },
    // TODO: create /solutions/infrastructure page
    // {
    //   label: "Инфраструктура",
    //   description: "Настраиваю серверы, приложения и инструменты для стабильной работы проектов.",
    //   href: "/solutions/infrastructure",
    //   icon: AddServer,
    // },
    {
      label: "Политика оказания услуг",
      description: "Узнайте о том как я работаю перед тем как заказать услугу.",
      href: "/service-policy",
      icon: Policy,
    },
  ];

  // ---- Ресурсы: плоский ряд карточек ----
  const resourceLinks = [
    {
      label: "Кейсы",
      description: "Примеры моих работ.",
      href: "/cases",
      icon: UserFavoriteAltFilled,
    },
    {
      label: "Новости",
      description: "Последние новости и изменения в проекте.",
      href: "/news",
      icon: Email,
    },
    {
      label: "База знаний",
      description: "Понятные статьи и гайды по DevSecOps и не только.",
      href: "/article/general",
      icon: Book,
    },
  ];

  const contacts = [
    {
      label: "GitHub",
      href: siteConfig.links.github,
      icon: LogoGithub,
    },
    {
      label: "@opensophy",
      href: siteConfig.links.telegram,
      icon: LocationCurrent,
    },
    {
      label: siteConfig.links.email,
      href: `mailto:${siteConfig.links.email}`,
      icon: Email,
    },
  ];

  function handleOverlayKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") contactsState.close();
  }
</script>

{#snippet productsPanel(isMobile)}
  <div data-slot="grid" class="grid grid-cols-1 md:grid-cols-3">
    {#each productColumns as column (column.title)}
      <div
        data-slot="column"
        class="flex flex-col gap-3 border-border p-4 first:md:border-l-0 md:min-h-[14rem] md:border-l"
      >
        <h3
          class="text-xs font-medium tracking-wider text-foreground-muted/50 uppercase"
        >
          {column.title}
        </h3>
        <div class="mt-1 flex flex-col gap-3">
          {#each column.links as link (link.href)}
            {@const Icon = link.icon}
            <a
              href={link.href}
              class="menu-link group/link relative flex items-center gap-3 rounded-lg p-2 pr-2.5 text-left text-foreground transition-colors duration-200"
            >
              <span
                class="group inset-shadow transition-scale relative inline-flex size-9 shrink-0 items-center justify-center rounded-sm bg-background-inset text-foreground duration-150 ease-out group-hover/link:text-accent group-active/link:scale-[0.95]"
              >
                <Icon size={20} />
              </span>
              <span class="min-w-0 flex-1 leading-tight">
                <span class="block text-sm font-medium text-foreground">
                  {link.label}
                </span>
                <span class="mt-1 block text-sm leading-snug text-foreground-muted">
                  {link.description}
                </span>
              </span>
              <ChevronRight
                class="shrink-0 text-foreground-muted/60 transition-colors duration-200 group-hover/link:text-accent"
                size={16}
              />
            </a>
          {/each}
        </div>
      </div>
    {/each}
  </div>
  {#if !isMobile}
    <div data-slot="panel-footer" class="border-t border-border px-4 py-2.5">
      <a
        href="/status"
        class="status-link inline-flex items-center gap-1 text-sm font-medium transition-colors duration-150"
      >
        Статус
        <ChevronRight size={14} />
      </a>
    </div>
  {/if}
{/snippet}

{#snippet solutionsPanel(isMobile)}
  <div
    data-slot="row"
    class="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 lg:grid-cols-4"
  >
    {#each solutionLinks as link (link.href)}
      {@const Icon = link.icon}
      <a
        href={link.href}
        class="menu-link group/link relative flex items-center gap-3 rounded-lg p-2 pr-2.5 text-left text-foreground transition-colors duration-200"
      >
        <span
          class="group inset-shadow transition-scale relative inline-flex size-9 shrink-0 items-center justify-center rounded-sm bg-background-inset text-foreground duration-150 ease-out group-hover/link:text-accent group-active/link:scale-[0.95]"
        >
          <Icon size={20} />
        </span>
        <span class="min-w-0 flex-1 leading-tight">
          <span class="block text-sm font-medium text-foreground">
            {link.label}
          </span>
          <span class="mt-1 block text-sm leading-snug text-foreground-muted">
            {link.description}
          </span>
        </span>
      </a>
    {/each}
  </div>
{/snippet}

{#snippet resourcesPanel(isMobile)}
  <div
    data-slot="row"
    class="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3"
  >
    {#each resourceLinks as link (link.href)}
      {@const Icon = link.icon}
      <a
        href={link.href}
        class="menu-link group/link relative flex items-center gap-3 rounded-lg p-2 pr-2.5 text-left text-foreground transition-colors duration-200"
      >
        <span
          class="group inset-shadow transition-scale relative inline-flex size-9 shrink-0 items-center justify-center rounded-sm bg-background-inset text-foreground duration-150 ease-out group-hover/link:text-accent group-active/link:scale-[0.95]"
        >
          <Icon size={20} />
        </span>
        <span class="min-w-0 flex-1 leading-tight">
          <span class="block text-sm font-medium text-foreground">
            {link.label}
          </span>
          <span class="mt-1 block text-sm leading-snug text-foreground-muted">
            {link.description}
          </span>
        </span>
      </a>
    {/each}
  </div>
  {#if !isMobile}
    <div data-slot="panel-footer" class="border-t border-border px-4 py-2.5">
      <button
        type="button"
        onclick={() => contactsState.open()}
        class="status-link inline-flex items-center gap-1 text-sm font-medium transition-colors duration-150"
      >
        Контакты
        <ChevronRight size={14} />
      </button>
    </div>
  {/if}
{/snippet}

<FloatingMenu
  triggers={[
    { id: "products", label: "Продукты", panel: productsPanel },
    { id: "solutions", label: "Решения", panel: solutionsPanel },
    { id: "resources", label: "Ресурсы", panel: resourcesPanel },
  ]}
>
  {#snippet logo()}
    <img src="/logo.png" alt={brandingConfig.name} class="size-7 shrink-0" />
    <span class="font-medium lowercase tracking-tight text-foreground"
      >{brandingConfig.name}</span
    >
  {/snippet}
  {#snippet actionsEnd()}
    <ThemeToggle />
    <button
      type="button"
      class="group inset-shadow transition-scale relative inline-flex size-9 items-center justify-center rounded-sm bg-background-inset text-foreground duration-150 ease-out active:scale-[0.95]"
      onclick={() => {
        searchState.open();
      }}
      aria-label="Открыть поиск"
    >
      <span class="sr-only">Открыть поиск</span>
      <Search size={16} />
    </button>
  {/snippet}
  {#snippet mobileFooter()}
    <div class="mobile-footer-btn w-full">
      <Button variant="secondary" size="lg" href="/status">Статус</Button>
    </div>
    <div class="mobile-footer-btn w-full">
      <Button variant="primary" size="lg" onclick={() => contactsState.open()}>
        Контакты
      </Button>
    </div>
  {/snippet}
</FloatingMenu>

{#if contactsState.isOpen}
  <div
    class="contacts-overlay fixed inset-0 z-[100] flex items-center justify-center bg-background-inset/80 backdrop-blur-sm"
    onclick={() => {
      contactsState.close();
    }}
    onkeydown={handleOverlayKeydown}
    role="button"
    tabindex="-1"
    aria-label="Закрыть контакты"
  >
    <div
      class="contacts-modal relative w-full max-w-sm rounded-lg border border-border bg-background p-6"
      onclick={(e) => {
        e.stopPropagation();
      }}
      onkeydown={(e) => {
        e.stopPropagation();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Контакты"
      tabindex="-1"
    >
      <button
        type="button"
        class="absolute top-3 right-3 flex size-8 items-center justify-center rounded-sm text-foreground-muted transition-colors hover:bg-background-muted hover:text-foreground"
        onclick={() => {
          contactsState.close();
        }}
        aria-label="Закрыть"
      >
        <Close size={18} />
      </button>
      <h2 class="mb-1 text-lg font-medium tracking-tight text-foreground">
        Контакты
      </h2>
      <p class="mb-5 text-sm text-foreground-muted">
        Свяжитесь через удобный канал.
      </p>
      <div class="flex flex-col gap-2">
        {#each contacts as contact (contact.href)}
          {@const Icon = contact.icon}
          <a
            href={contact.href}
            target={contact.href.startsWith("http") ? "_blank" : undefined}
            rel={contact.href.startsWith("http") ? "external" : undefined}
            class="flex items-center gap-3 rounded-sm border border-border bg-background-inset px-4 py-3 text-sm font-medium text-foreground-muted transition-colors duration-150 ease-out hover:bg-background-muted hover:text-foreground"
          >
            <Icon size={18} />
            <span class="truncate">{contact.label}</span>
          </a>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .mobile-footer-btn :global(span) {
    display: flex;
    width: 100%;
  }
  .mobile-footer-btn :global(a),
  .mobile-footer-btn :global(button) {
    flex: 1 1 auto;
    width: 100%;
  }
  .status-link {
    color: var(--accent);
  }
  .status-link:hover {
    color: var(--accent-secondary);
  }
  .contacts-overlay {
    animation: fade-in 200ms ease-out;
  }
  .contacts-modal {
    animation: scale-in 250ms ease-out;
  }
  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes scale-in {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
</style>