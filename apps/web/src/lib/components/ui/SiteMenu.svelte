<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve */
  import { siteConfig } from "$lib";
  import FloatingMenu from "$lib/components/ui/FloatingMenu.svelte";
  import ThemeToggle from "$lib/components/ui/ThemeToggle.svelte";
  import { contactsState } from "$lib/stores/contacts.svelte";
  import { searchState } from "$lib/stores/search.svelte";
  import Close from "carbon-icons-svelte/lib/Close.svelte";
  import Email from "carbon-icons-svelte/lib/Email.svelte";
  import LogoGithub from "carbon-icons-svelte/lib/LogoGithub.svelte";
  import Search from "carbon-icons-svelte/lib/Search.svelte";

  // "Продукты": 3 columns — Платформа / Библиотеки / Инструменты, plus a "статус проектов" footer link
  // "Услуги": single stacked list, plus "политика оказания услуг" footer link
  // "Ресурсы": 2 columns — Информационное / Платформа, plus "Контакты" as its own entry
  const menuCategories = [
    {
      label: "Продукты",
      columns: [
        {
          title: "Платформа",
          links: [
            {
              label: "os.docs",
              description: "Платформа для документации и публикации контента.",
              href: "/docs/opensophy-docs",
            },
            {
              label: "os.dokploy",
              description: "Платформа для управления серверами и деплоя приложений.",
              href: "/dokploy",
            },
          ],
        },
        {
          title: "Библиотеки",
          links: [
            {
              label: "os.compose",
              description: "Наши готовые шаблоны для инструментов DevSecOps/AppSec.",
              href: "/templates/docker/",
            },
            {
              label: "os.ui",
              description: "Библиотека готовых UI-компонентов с живым превью и гибкими настройками.",
              href: "/components/overview",
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
            },
          ],
        },
      ],
      footer: {
        label: "Статус проектов",
        href: "/status",
      },
    },
    {
      label: "Услуги",
      flatLinks: [
        {
          label: "Автоматизация",
          description: "Создаём автоматизацию любого уровня — от отдельных задач до сложных процессов.",
          href: "/services#automation",
        },
        {
          label: "Инфраструктура",
          description: "Настраиваем серверы, приложения и инструменты для стабильной работы проектов.",
          href: "/services#infrastructure",
        },
        {
          label: "Безопасность",
          description: "Встраиваем безопасность в разработку, тестирование и запуск ваших проектов.",
          href: "/services#security",
        },
      ],
      footer: {
        label: "Политика оказания услуг",
        href: "/service-policy",
      },
    },
    {
      label: "Ресурсы",
      columns: [
        {
          title: "Информационное",
          links: [
            {
              label: "Новости",
              description: "Последние новости и изменения в проекте.",
              href: "/news",
            },
            {
              label: "Блог",
              description: "Статьи автора проекта.",
              href: "/article/general",
            },
            {
              label: "Кейсы",
              description: "Примеры наших работ.",
              href: "/cases",
            },
          ],
        },
        {
          title: "Платформа",
          links: [
            {
              label: "Обучающий центр",
              description: "Теория и практика для специалистов DevSecOps.",
              href: "/learning-center",
            },
            {
              label: "Контакты",
              description: "Связаться через GitHub, Telegram или email.",
              href: "#",
              onclick: (e: MouseEvent) => {
                e.preventDefault();
                contactsState.open();
              },
            },
          ],
        },
      ],
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
      icon: Email,
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

<FloatingMenu categories={menuCategories}>
  {#snippet logo()}
    <a href="/" class="flex items-center px-2" aria-label="На главную">
      <img src="/logo.png" alt="Логотип" class="h-7 w-auto" />
    </a>
  {/snippet}
  {#snippet actionsEnd()}
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
    <ThemeToggle />
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
      class="contacts-modal relative w-full max-w-sm rounded-lg border border-border bg-background p-6 shadow-2xl"
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