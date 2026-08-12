<script lang="ts">
  import SiteMenu from "$lib/components/ui/SiteMenu.svelte";
  import FeatureCards from "$lib/components/ui-registry/FeatureCards.svelte";

  type FeatureIcon =
    | "security"
    | "cicd"
    | "pipeline"
    | "triage"
    | "construction"
    | "radar"
    | "chat"
    | "search"
    | "document"
    | "terminal";

  const services: { title: string; description: string; icon: FeatureIcon }[] = [
    {
      title: "Проверка безопасности",
      description:
        "Blackbox, graybox и whitebox-проверки сайтов, веб-приложений и API — так, как это делал бы реальный злоумышленник, с понятным отчётом по итогам.",
      icon: "security"
    },
    {
      title: "Автоматическая проверка безопасности",
      description:
        "Подключаю SAST, DAST и SCA к вашему CI/CD, чтобы уязвимости ловились автоматически при каждом обновлении кода, ещё до релиза.",
      icon: "cicd"
    },
    {
      title: "Защита CI/CD пайплайна",
      description:
        "Закрываю дыры в сборке и деплое: утечки секретов, избыточные права доступа, уязвимость сборки к подмене кода.",
      icon: "pipeline"
    },
    {
      title: "Triage уязвимостей",
      description:
        "Разбираю накопившиеся отчёты сканеров и bug bounty программ, отсеиваю ложные срабатывания и расставляю приоритеты.",
      icon: "triage"
    },
    {
      title: "Процесс безопасности с нуля",
      description:
        "Выстраиваю процессы безопасности разработки с нуля: инструменты, регламенты проверки, обучение команды и чек-листы.",
      icon: "construction"
    },
    {
      title: "Attack Surface Monitoring",
      description:
        "Регулярно проверяю внешний периметр: новые поддомены, открытые порты, случайно опубликованные файлы и данные.",
      icon: "radar"
    },
    {
      title: "Разовая консультация",
      description:
        "Короткий созвон или переписка — показываете проект, я смотрю на него глазами безопасника и говорю, на что обратить внимание.",
      icon: "chat"
    },
    {
      title: "Поиск утечек данных",
      description:
        "Проверяю, не утекли ли данные компании или пользователя: базы, пароли, документы. Мониторю даркнет, форумы и паблики с утечками.",
      icon: "search"
    },
    {
      title: "Документация и процессы",
      description:
        "Пишу понятную security-документацию: политики безопасности, регламенты на случай инцидента, инструкции и чек-листы для команды.",
      icon: "document"
    },
    {
      title: "Автоматизация",
      description:
        "Автоматизирую рутину — от простого bash-скрипта до сложных решений под индивидуальные требования.",
      icon: "terminal"
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
  <section class="contact-cta" aria-label="Как заказать">
    <p>
      Для оформления заказа или обсуждения деталей напишите мне на
      <a href="mailto:opensophy@gmail.com">opensophy@gmail.com</a>
      или в телеграм
      <a href="https://t.me/opensophy" target="_blank" rel="noopener noreferrer">@opensophy</a>
    </p>
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
    letter-spacing: 0.05em;
    text-transform: lowercase;
  }
  .services-grid {
    max-width: 64rem;
    margin: 0 auto;
  }
  .contact-cta {
    max-width: 64rem;
    margin: 3rem auto 0;
    text-align: center;
  }
  .contact-cta p {
    margin: 0;
    color: var(--foreground-muted);
    font-size: 1.125rem;
    font-weight: 400;
  }
  .contact-cta a {
    color: var(--accent);
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }
  .contact-cta a:hover {
    color: var(--foreground);
  }
</style>