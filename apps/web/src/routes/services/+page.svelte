<script lang="ts">
  import SiteMenu from "$lib/components/ui/SiteMenu.svelte";
  import FeatureCards from "$lib/components/ui-registry/FeatureCards.svelte";

  type FeatureIcon = "contracts" | "scheduling" | "processing" | "diagnostics";

  const services: { title: string; description: string; icon: FeatureIcon }[] = [
    { title: "Проверка безопасности", description: "Blackbox, graybox и whitebox-проверки сайтов, веб-приложений и API с понятным отчётом.", icon: "contracts" },
    { title: "DevSecOps и CI/CD", description: "Настройка SAST, DAST, SCA и защиты пайплайнов без лишнего шума для команды.", icon: "scheduling" },
    { title: "Triage уязвимостей", description: "Разбор отчётов сканеров и bug bounty, отсев false positive и приоритизация исправлений.", icon: "diagnostics" },
    { title: "Attack Surface", description: "Мониторинг внешнего периметра: поддомены, порты, утечки и случайно опубликованные данные.", icon: "processing" },
    { title: "Документация и процессы", description: "Политики, регламенты, чек-листы и понятные правила безопасности для команды.", icon: "contracts" },
    { title: "Автоматизация", description: "Скрипты и сервисы для повторяющихся задач: от bash до решений под индивидуальные требования.", icon: "scheduling" }
  ];
</script>

<main class="services-page">
  <SiteMenu />
  <section class="services-hero" aria-labelledby="services-title">
    <h1 id="services-title">услуги</h1>
  </section>
  <section class="services-grid" aria-label="Список услуг">
    <FeatureCards cards={services} />
  </section>
</main>

<style>
  .services-page {
    min-height: 100dvh;
    background: var(--background);
    padding: 7rem 1rem 5rem;
  }
  .services-hero {
    display: flex;
    justify-content: center;
    max-width: 64rem;
    margin: 0 auto 2rem;
    text-align: center;
  }
  h1 {
    margin: 0;
    color: var(--foreground);
    font-size: clamp(4rem, 14vw, 12rem);
    font-weight: 500;
    line-height: 0.9;
    letter-spacing: -0.08em;
    text-transform: lowercase;
  }
  .services-grid {
    max-width: 64rem;
    margin: 0 auto;
  }
</style>
