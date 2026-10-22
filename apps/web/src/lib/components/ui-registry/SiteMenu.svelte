<script lang="ts">
  import { brandingConfig } from "$lib/config/branding";
  import FloatingMenu from "$lib/components/ui-registry/FloatingMenu.svelte";
  import Button from "$lib/components/ui-registry/Button.svelte";
  import ThemeToggle from "$lib/components/ui-registry/ThemeToggle.svelte";
  import { contactsState } from "$lib/stores/contacts.svelte";
  import { searchState } from "$lib/stores/search.svelte";
  import ChevronRight from "carbon-icons-svelte/lib/ChevronRight.svelte";
  import Close from "carbon-icons-svelte/lib/Close.svelte";
  import DocumentMultiple_01 from "carbon-icons-svelte/lib/DocumentMultiple_01.svelte";
  import Email from "carbon-icons-svelte/lib/Email.svelte";
  import Network_3 from "carbon-icons-svelte/lib/Network_3.svelte";
  import Policy from "carbon-icons-svelte/lib/Policy.svelte";
  import Search from "carbon-icons-svelte/lib/Search.svelte";
  import QHintonPlot from "carbon-icons-svelte/lib/QHintonPlot.svelte";
  import IbmCloudGateKeeper from "carbon-icons-svelte/lib/IbmCloudGateKeeper.svelte";
  import Book from "carbon-icons-svelte/lib/Book.svelte";
  import LocationCurrent from "carbon-icons-svelte/lib/LocationCurrent.svelte";

  // ---- Продукты ----
  const productColumns = [
    {
      title: "Платформы",
      links: [
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
          description:
            "Библиотека готовых UI-компонентов с живым превью и гибкими настройками.",
          href: "/components/overview",
          icon: QHintonPlot,
        },
      ],
    },
    {
      title: "Инструменты",
      links: [
        {
          label: "os.mtls",
          description:
            "Инструмент для быстрого создания и управления mTLS-сертификатами для Traefik.",
          href: "/mtls",
          icon: Network_3,
        },
      ],
    },
  ];

  // ---- Компоненты: прямая ссылка в навигации (без выпадающей панели) ----
  const _componentsLink = {
    id: "components",
    label: "Компоненты",
    href: "/components",
  };

  // ---- Решения: плоский ряд карточек ----
  const solutionLinks = [
    {
      label: "Услуги",
      description: "Аудит безопасности, DevSecOps, консультации и помощь с инфраструктурой.",
      href: "/solutions",
      icon: IbmCloudGateKeeper,
    },
    {
      label: "Политика оказания услуг",
      href: "/service-policy",
      icon: Policy,
    },
    {
      label: "Политика обработки данных",
      href: "/data-policy",
      icon: Policy,
    },
  ];

  // ---- Ресурсы: плоский ряд карточек ----
  const resourceLinks = [
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

  let acceptedPolicies = $state(false);

  function openServiceEmail() {
    if (!acceptedPolicies) return;
    window.location.href = "mailto:opensophy@mail.ru";
  }

  function handleOverlayKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") contactsState.close();
  }
</script>

{#snippet productsPanel(isMobile: boolean)}
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
                class="inset-shadow inline-flex shrink-0 rounded-xl bg-background-inset p-1.5"
              >
                <span
                  class="card relative inline-flex size-9 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors duration-150 group-hover/link:border-accent/60 group-hover/link:text-accent group-active/link:scale-[0.95]"
                >
                  <Icon size={20} />
                </span>
              </span>
              <span class="min-w-0 flex-1 leading-tight">
                <span class="block text-sm font-medium text-foreground">
                  {link.label}
                </span>
                <span
                  class="mt-1 block text-sm leading-snug text-foreground-muted"
                >
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

{#snippet solutionsPanel(_isMobile: boolean)}
  <div data-slot="row" class="grid grid-cols-1 gap-2 p-4 md:grid-cols-2">
    {#each solutionLinks as link (link.href)}
      {@const Icon = link.icon}
      <a
        href={link.href}
        class="menu-link group/link relative flex items-center gap-3 rounded-lg p-2 pr-2.5 text-left text-foreground transition-colors duration-200 {link.href === '/solutions' ? 'md:col-span-2 md:justify-center rounded-none pb-5' : ''}"
      >
        <span
          class="inset-shadow inline-flex shrink-0 rounded-xl bg-background-inset p-1.5"
        >
          <span
            class="card relative inline-flex size-9 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors duration-150 group-hover/link:border-accent/60 group-hover/link:text-accent group-active/link:scale-[0.95]"
          >
            <Icon size={20} />
          </span>
        </span>
        <span class="min-w-0 flex-1 leading-tight">
          <span class="block text-sm font-medium text-foreground">
            {link.label}
          </span>
          {#if link.description}
            <span class="mt-1 block text-sm leading-snug text-foreground-muted">
              {link.description}
            </span>
          {/if}
        </span>
      </a>
      {#if link.href === "/solutions"}
        <div class="hidden h-px w-full bg-border md:col-span-2 md:block" aria-hidden="true"></div>
      {/if}
    {/each}
  </div>
{/snippet}

{#snippet resourcesPanel(isMobile: boolean)}
  <div data-slot="row" class="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2">
    {#each resourceLinks as link (link.href)}
      {@const Icon = link.icon}
      <a
        href={link.href}
        class="menu-link group/link relative flex items-center gap-3 rounded-lg p-2 pr-2.5 text-left text-foreground transition-colors duration-200"
      >
        <span
          class="inset-shadow inline-flex shrink-0 rounded-xl bg-background-inset p-1.5"
        >
          <span
            class="card relative inline-flex size-9 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors duration-150 group-hover/link:border-accent/60 group-hover/link:text-accent group-active/link:scale-[0.95]"
          >
            <Icon size={20} />
          </span>
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
        onclick={() => {
          contactsState.open();
        }}
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
    <span class="inset-shadow inline-flex rounded-xl bg-background-inset p-1.5">
      <button
        type="button"
        class="card relative inline-flex size-9 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors duration-150 hover:border-accent/60 active:scale-[0.95]"
        onclick={() => {
          searchState.open();
        }}
        aria-label="Открыть поиск"
      >
        <span class="sr-only">Открыть поиск</span>
        <Search size={16} />
      </button>
    </span>
  {/snippet}
  {#snippet mobileFooter()}
    <div class="mobile-footer-btn w-full">
      <Button variant="secondary" size="lg" href="/status">Статус</Button>
    </div>
    <div class="mobile-footer-btn w-full">
      <Button
        variant="primary"
        size="lg"
        onclick={() => {
          contactsState.open();
        }}
      >
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
        Для сотрудничества и общения пишите в Telegram. По вопросам покупки услуг и решений — на почту.
      </p>
      <div class="flex flex-col gap-3">
        <a
          href="https://t.me/opensophy"
          target="_blank"
          rel="noreferrer"
          class="flex items-center gap-3 rounded-sm border border-border bg-background-inset px-4 py-3 text-sm font-medium text-foreground-muted transition-colors duration-150 ease-out hover:bg-background-muted hover:text-foreground"
        >
          <LocationCurrent size={18} />
          <span>Telegram: @opensophy</span>
        </a>
        <div class="rounded-sm border border-border bg-background-inset p-4">
          <p class="mb-3 text-sm font-medium text-foreground">Покупка услуг и решений</p>
          <label class="flex items-start gap-2 text-sm leading-relaxed text-foreground-muted">
            <input
              type="checkbox"
              bind:checked={acceptedPolicies}
              class="mt-1 size-4 shrink-0" style="accent-color: var(--accent)"
            />
            <span>
              Я согласен с <a class="underline" href="/service-policy" target="_blank" rel="noreferrer">Политикой оказания услуг</a>
              и <a class="underline" href="/data-policy" target="_blank" rel="noreferrer">Политикой обработки данных</a>.
            </span>
          </label>
          <button
            type="button"
            disabled={!acceptedPolicies}
            onclick={openServiceEmail}
            class="mt-3 w-full rounded-sm border border-transparent bg-accent px-4 py-3 text-sm font-medium text-background transition-colors disabled:cursor-not-allowed disabled:border-border disabled:bg-background-muted disabled:text-foreground-muted"
          >
            Написать на почту
          </button>
          <p class="mt-2 select-none text-center text-xs text-foreground-muted" aria-label="Адрес электронной почты">
            Почта откроется после согласия с обеими политиками
          </p>
        </div>
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