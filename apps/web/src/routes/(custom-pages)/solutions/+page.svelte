<script lang="ts">
  import PageSeo from "$lib/components/seo/PageSeo.svelte";
  import SiteMenu from "$lib/components/ui-registry/SiteMenu.svelte";
  import ServicesGrid from "$lib/components/ui-registry/ServicesGrid.svelte";
  import { contactsState } from "$lib/stores/contacts.svelte";

  const servicesStructuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://opensophy.com/#organization",
        name: "Opensophy",
        url: "https://opensophy.com/",
        email: "opensophy@gmail.com",
        sameAs: ["https://github.com/opensophy-projects"]
      },
      {
        "@type": "ItemList",
        name: "Услуги Opensophy",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            item: {
              "@type": "Service",
              name: "Интеграция DevSecOps",
              description: "Интеграция автоматических проверок безопасности кода и зависимостей, поиска секретов и безопасных сборок в CI/CD-пайплайны.",
              provider: { "@id": "https://opensophy.com/#organization" },
              url: "https://opensophy.com/solutions"
            }
          },
          {
            "@type": "ListItem",
            position: 2,
            item: {
              "@type": "Service",
              name: "Пентест сайтов и веб-приложений",
              description: "Тестирование на проникновение в форматах blackbox, graybox и whitebox с подтверждением находок и рекомендациями по исправлению.",
              provider: { "@id": "https://opensophy.com/#organization" },
              url: "https://opensophy.com/solutions"
            }
          },
          {
            "@type": "ListItem",
            position: 3,
            item: {
              "@type": "Service",
              name: "Code review безопасности",
              description: "Анализ исходного кода на уязвимости, секреты, ошибки логики и проблемы контроля доступа.",
              provider: { "@id": "https://opensophy.com/#organization" },
              url: "https://opensophy.com/solutions"
            }
          },
          {
            "@type": "ListItem",
            position: 4,
            item: {
              "@type": "Service",
              name: "Поиск утечек данных и аудит внешнего периметра",
              description: "Поиск открытых данных и секретов, OSINT, проверка публично доступных сервисов, поддоменов и конфигураций.",
              provider: { "@id": "https://opensophy.com/#organization" },
              url: "https://opensophy.com/solutions"
            }
          },
          {
            "@type": "ListItem",
            position: 5,
            item: {
              "@type": "Service",
              name: "Комплаенс и документы по информационной безопасности",
              description: "Оценка процессов информационной безопасности, требований 152-ФЗ и ISO/IEC 27001, подготовка политик и регламентов.",
              provider: { "@id": "https://opensophy.com/#organization" },
              url: "https://opensophy.com/solutions"
            }
          },
          {
            "@type": "ListItem",
            position: 6,
            item: {
              "@type": "Service",
              name: "Автоматизация инфраструктуры и устранение неполадок",
              description: "Автоматизация резервного копирования, мониторинга, сетевых правил и ключей доступа; диагностика Docker, Linux и CI/CD.",
              provider: { "@id": "https://opensophy.com/#organization" },
              url: "https://opensophy.com/solutions"
            }
          },
          {
            "@type": "ListItem",
            position: 7,
            item: {
              "@type": "Service",
              name: "Разработка сайтов и веб-приложений",
              description: "Разработка лендингов, корпоративных сайтов и веб-приложений с интеграцией API, авторизацией и вниманием к безопасности и производительности.",
              provider: { "@id": "https://opensophy.com/#organization" },
              url: "https://opensophy.com/solutions"
            }
          }
        ]
      }
    ]
  });
</script>

<PageSeo
  title="Услуги DevSecOps и безопасности — opensophy"
  description="Услуги Opensophy: интеграция DevSecOps в CI/CD, пентест сайтов и веб-приложений (blackbox, graybox, whitebox), аудит безопасности и внешнего периметра, OSINT, code review, поиск утечек данных и секретов, управление доступами, комплаенс по 152-ФЗ и ISO 27001, документы по ИБ, автоматизация инфраструктуры, устранение неполадок, консультации и разработка сайтов и веб-приложений."
  type="website"
/>

<svelte:head>
  <svelte:element this={"script"} type="application/ld+json">
    {servicesStructuredData}
  </svelte:element>
</svelte:head>

<main class="min-h-dvh bg-background text-foreground">
  <SiteMenu />

  <div class="mx-auto w-full max-w-5xl px-4 py-24 md:py-32">
    <header class="mb-12 max-w-3xl"></header>

    <ServicesGrid />

    <section class="mt-14 flex flex-wrap justify-center gap-3 text-center">
      <a class="action" href="/data-policy">
        Политика обработки данных
      </a>

      <button class="action primary" onclick={() => contactsState.open()}>
        Заказать услугу
      </button>

      <a class="action" href="/service-policy">
        Политика оказания услуг
      </a>
    </section>
  </div>
</main>

<style>
  .action {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border: 1px solid var(--border);
    border-radius: 0.55rem;
    padding: 0.7rem 1rem;
    font-weight: 600;
  }

  .primary {
    border-color: transparent;
    background: var(--accent);
    color: white;
  }
</style>