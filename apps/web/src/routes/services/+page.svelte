<script lang="ts">
  import SiteMenu from "$lib/components/ui/SiteMenu.svelte";
  import FeatureCards from "$lib/components/ui-registry/FeatureCards.svelte";
  type FeatureIcon = "contracts" | "scheduling" | "processing" | "diagnostics";
  const services: { title: string; description: string; icon: FeatureIcon }[] = [
    {
      title: "Проверка безопасности снаружи",
      description: "Blackbox, graybox и whitebox-проверки сайтов, веб-приложений и API так, как это делал бы реальный злоумышленник — с понятным отчётом.",
      icon: "contracts"
    },
    {
      title: "Автоматическая проверка в CI/CD",
      description: "Подключаю SAST, DAST, SCA к вашему пайплайну — уязвимости ловятся при каждом коммите, в фоне, не мешая разработке.",
      icon: "scheduling"
    },
    {
      title: "Защита CI/CD пайплайна",
      description: "Закрываю дыры в сборке и деплое: секреты не утекают, права не избыточны, подмена кода невозможна. Для GitHub Actions и GitLab CI.",
      icon: "processing"
    },
    {
      title: "Triage уязвимостей",
      description: "Разбираю накопленный backlog от сканеров или bug bounty: отсеиваю false positive, расставляю приоритеты — что чинить срочно, что может подождать.",
      icon: "diagnostics"
    },
    {
      title: "Построение процесса безопасности",
      description: "Выстраиваю всё с нуля: выбор инструментов, настройка процессов проверки, обучение команды, чек-листы. Для тех, кто растёт и понимает, что пора.",
      icon: "contracts"
    },
    {
      title: "Attack Surface Monitoring",
      description: "Регулярно проверяю, что «торчит» наружу: новые поддомены, открытые порты, случайно опубликованные данные. Отчёт — если появилось что-то опасное.",
      icon: "processing"
    },
    {
      title: "Консультация «посмотри и скажи»",
      description: "Короткий созвон или переписка — показываете проект, я говорю, на что обратить внимание глазами безопасника. Без глубокого аудита, просто быстро.",
      icon: "diagnostics"
    },
    {
      title: "Поиск утечек данных",
      description: "Ищу, не «светятся» ли уже ваши данные в сети — в даркнете, на хакерских форумах, в слитых архивах. До того, как об этом узнают клиенты.",
      icon: "diagnostics"
    },
    {
      title: "Документация и политики",
      description: "Пишу политики безопасности, регламенты на случай инцидента, инструкции и чек-листы — понятным языком, чтобы ими реально пользовались.",
      icon: "contracts"
    },
    {
      title: "Автоматизация",
      description: "Превращаю повторяющиеся ручные задачи в скрипты и сервисы: от bash до сложных решений под индивидуальные требования команды.",
      icon: "scheduling"
    }
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