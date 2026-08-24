<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve */
  import { brandingConfig, siteConfig } from "$lib";
  import FloatingMenu from "$lib/components/ui/FloatingMenu.svelte";
  import ThemeToggle from "$lib/components/ui/ThemeToggle.svelte";
  import Button from "$lib/components/ui-registry/Button.svelte";
  import DockerLogo from "$lib/components/ui/DockerLogo.svelte";
  import { contactsState } from "$lib/stores/contacts.svelte";
  import { searchState } from "$lib/stores/search.svelte";
  import Categories from "carbon-icons-svelte/lib/Categories.svelte";
  import Close from "carbon-icons-svelte/lib/Close.svelte";
  import DocumentMultiple_01 from "carbon-icons-svelte/lib/DocumentMultiple_01.svelte";
  import Email from "carbon-icons-svelte/lib/Email.svelte";
  import Home from "carbon-icons-svelte/lib/Home.svelte";
  import LogoGithub from "carbon-icons-svelte/lib/LogoGithub.svelte";
  import Network_3 from "carbon-icons-svelte/lib/Network_3.svelte";
  import Policy from "carbon-icons-svelte/lib/Policy.svelte";
  import Search from "carbon-icons-svelte/lib/Search.svelte";
  import Send from "carbon-icons-svelte/lib/Send.svelte";
  import QHintonPlot from "carbon-icons-svelte/lib/QHintonPlot.svelte";
  import Settings from "carbon-icons-svelte/lib/Settings.svelte";
  import Tag from "carbon-icons-svelte/lib/Tag.svelte";
  import WebServicesContainer from "carbon-icons-svelte/lib/WebServicesContainer.svelte";

  // Верхний уровень: 3 категории. Каждая раскрывается в свой список ссылок.
  // "Главная" и "Контакты" вынесены в bottomActions (кнопки внизу мобильного меню).
  const menuGroups = [
    {
      title: "Продукты",
      icon: QHintonPlot,
      links: [
        {
          label: "os.docs",
          description: "Платформа для документации и публикации контента.",
          href: "/docs/opensophy-docs",
          icon: DocumentMultiple_01,
        },
        {
          label: "os.dokploy",
          description:
            "Платформа для управления серверами и деплоя приложений.",
          href: "/dokploy",
          icon: WebServicesContainer,
        },
        {
          label: "os.mtls",
          description:
            "Инструмент для быстрого создания и управления mTLS-сертификатами для Traefik.",
          href: "/mtls",
          icon: Network_3,
        },
        {
          label: "os.ui",
          description:
            "Библиотека готовых UI-компонентов с живым превью и гибкими настройками.",
          href: "/components/overview",
          icon: QHintonPlot,
        },
      ],
      // Вторая колонка группы "Продукты" — статус проектов (перенесено из "Ресурсы")
      statusLinks: [
        {
          label: "Статус",
          description: "Информация о разработке и состояние проектов.",
          href: "/status",
          icon: Settings,
        },
      ],
    },
    {
      title: "Ресурсы",
      icon: Categories,
      links: [
        {
          label: "База знаний",
          description: "Понятные статьи и гайды по DevSecOps и не только.",
          href: "/article/general",
          icon: Categories,
        },
        {
          label: "Шаблоны Docker",
          description:
            "Наши готовые шаблоны для инструментов DevSecOps/AppSec.",
          href: "/templates/docker/",
          icon: DockerLogo,
        },
      ],
    },
    {
      title: "Услуги",
      icon: Tag,
      links: [
        {
          label: "Политика оказания услуг",
          description:
            "Узнайте о том как мы работаем перед тем как заказать услугу.",
          href: "/service-policy",
          icon: Policy,
        },
        {
          label: "Услуги",
          description:
            "Узнайте актуальные услуги которые мы сейчас готовы предоставить.",
          href: "/services",
          icon: Tag,
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
      icon: Send,
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

<FloatingMenu {menuGroups}>
  {#snippet centerContent()}
    <span class="font-medium lowercase tracking-tight text-foreground"
      >{brandingConfig.name}</span
    >
  {/snippet}
  {#snippet actionsStart()}
    <ThemeToggle />
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
  {/snippet}
  {#snippet bottomActions()}
    <Button href="/" variant="secondary" size="lg" class="w-full">
      Главная
    </Button>
    <Button
      variant="primary"
      size="lg"
      class="w-full"
      onclick={() => {
        contactsState.open();
      }}
    >
      Контакты
    </Button>
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