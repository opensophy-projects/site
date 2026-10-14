<script lang="ts">
  import { brandingConfig } from "$lib/config/branding";
  import { siteConfig } from "$lib/config/site";
  import FloatingMenu from "$lib/components/ui-registry/FloatingMenu.svelte";
  import Button from "$lib/components/ui-registry/Button.svelte";
  import ThemeToggle from "$lib/components/ui-registry/ThemeToggle.svelte";
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
        {
          label: "NPMOS",
          description:
            "Nginx Proxy Manager by OpenSophy — обратный прокси на базе Nginx с веб-интерфейсом и механизмами безопасности. В разработке, 0%.",
          href: "/#products",
          icon: Network_3,
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
      description:
        "Аудит безопасности, DevSecOps, консультации и помощь с инфраструктурой.",
      href: "/solutions",
      icon: IbmCloudGateKeeper,
    },
    {
      label: "Политика оказания услуг",
      description: "Узнайте, как я работаю перед тем, как заказать услугу.",
      href: "/service-policy",
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