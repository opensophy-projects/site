<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve */
  import { brandingConfig, siteConfig } from "$lib";
  import FloatingMenu from "$lib/components/ui/FloatingMenu.svelte";
  import ThemeToggle from "$lib/components/ui/ThemeToggle.svelte";
  import { contactsState } from "$lib/stores/contacts.svelte";
  import { searchState } from "$lib/stores/search.svelte";
  import Close from "carbon-icons-svelte/lib/Close.svelte";
  import Email from "carbon-icons-svelte/lib/Email.svelte";
  import Home from "carbon-icons-svelte/lib/Home.svelte";
  import LogoGithub from "carbon-icons-svelte/lib/LogoGithub.svelte";
  import Search from "carbon-icons-svelte/lib/Search.svelte";

  // 3 основные категории — они и показываются крупным текстом на мобильном первом уровне
  const menuGroups = [
    {
      title: "Продукты",
      links: [
        { label: "os.docs", href: "/docs/opensophy-docs" },
        { label: "os.dokploy", href: "/dokploy" },
        { label: "os.mtls", href: "/mtls" },
        { label: "os.ui", href: "/components/overview" },
      ],
    },
    {
      title: "Ресурсы",
      links: [
        { label: "База знаний", href: "/article/general" },
        { label: "Статус", href: "/status" },
        { label: "Шаблоны Docker", href: "/templates/docker/" },
      ],
    },
    {
      title: "Услуги",
      links: [
        { label: "Политика оказания услуг", href: "/service-policy" },
        { label: "Услуги", href: "/services" },
      ],
    },
  ];

  // Нижний блок меню: Главная (обычная ссылка) и Контакты (акцентный цвет)
  const footerLinks = [
    {
      label: "Главная",
      href: "/",
      icon: Home,
    },
    {
      label: "Контакты",
      href: "#",
      icon: Email,
      accent: true,
      onclick: (e: MouseEvent) => {
        e.preventDefault();
        contactsState.open();
      },
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

<FloatingMenu {menuGroups} {footerLinks}>
  {#snippet logo()}
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
      class="flex h-10 w-10 items-center justify-center rounded-sm text-foreground transition-colors duration-400 ease-[cubic-bezier(0.625,0.05,0,1)] hover:bg-background-muted"
      onclick={() => {
        searchState.open();
      }}
      aria-label="Открыть поиск"
    >
      <span class="sr-only">Открыть поиск</span>
      <Search size={16} />
    </button>
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