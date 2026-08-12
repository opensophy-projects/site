<script lang="ts">
  import SiteMenu from "$lib/components/ui/SiteMenu.svelte";
  import Security from "carbon-icons-svelte/lib/Security.svelte";
  import IbmCloudContinuousDelivery from "carbon-icons-svelte/lib/IbmCloudContinuousDelivery.svelte";
  import Flow from "carbon-icons-svelte/lib/Flow.svelte";
  import ChartEvaluation from "carbon-icons-svelte/lib/ChartEvaluation.svelte";
  import Construction from "carbon-icons-svelte/lib/Construction.svelte";
  import Radar from "carbon-icons-svelte/lib/Radar.svelte";
  import Chat from "carbon-icons-svelte/lib/Chat.svelte";
  import SearchLocate from "carbon-icons-svelte/lib/SearchLocate.svelte";
  import Document from "carbon-icons-svelte/lib/Document.svelte";
  import Terminal from "carbon-icons-svelte/lib/Terminal.svelte";

  const services = [
    {
      title: "Проверка безопасности (blackbox, graybox, whitebox)",
      icon: Security,
      text: "Проверяю ваш сайт или приложение так, как это делал бы реальный злоумышленник — без доступа к коду, только через то, что видно снаружи. Ищу дыры: слабые пароли, открытые данные, уязвимые формы, незащищённые API, дыры в логике входа и так далее.",
      details: [
        "Blackbox — проверяю систему снаружи, без доступа к коду и внутренней информации.",
        "Graybox — есть частичный доступ: тестовый аккаунт или базовое понимание архитектуры.",
        "Whitebox — полный доступ к коду. Реализую через AI-инструменты: код прогоняется через AI+сканеры, находки проверяю вручную.",
      ],
      note: "В зависимости от того, что вы можете предоставить, подбираем нужный формат проверки.",
      fit: "Подходит для: сайтов, веб-приложений, API, которые уже работают в проде.",
    },
    {
      title:
        "Настройка автоматической проверки безопасности (CI/CD + SAST/DAST/SCA)",
      icon: IbmCloudContinuousDelivery,
      text: "Подключаю к вашему проекту инструменты, которые сами, автоматически, при каждом обновлении кода проверяют его на уязвимости. Настраиваю всё так, чтобы проверки шли в фоне и не мешали основной разработке.",
      fit: "Подходит для: команд, которые хотят ловить уязвимости автоматически, ещё до релиза, а не после.",
    },
    {
      title: "Защита CI/CD пайплайна",
      icon: Flow,
      text: "Проверяю и закрываю дыры в том, как у вас собирается и деплоится код: секреты не должны утекать, права доступа не должны быть избыточными, сборка не должна быть уязвима к подмене кода.",
      fit: "Подходит для: команд с GitHub Actions / GitLab CI.",
    },
    {
      title: "Разбор найденных уязвимостей (Triage)",
      icon: ChartEvaluation,
      text: "Если у вас уже есть куча отчётов от сканеров или bug bounty программы, беру эту кучу, разбираю, отсеиваю ложные срабатывания, расставляю приоритеты: что чинить срочно, а что может подождать.",
      fit: "Подходит для: компаний, у которых накопился backlog находок и не хватает рук/времени его разгрести.",
    },
    {
      title: "Построение процесса безопасности с нуля",
      icon: Construction,
      text: "Если в компании вообще нет процессов безопасности разработки — прихожу и выстраиваю всё с нуля: от выбора инструментов до настройки процессов проверки, обучения команды и написания понятных правил/чеклистов.",
      fit: "Подходит для: компаний, которые растут и понимают, что пора заняться безопасностью, но не знают, с чего начать.",
    },
    {
      title: 'Проверка "что видно снаружи" (Attack Surface Monitoring)',
      icon: Radar,
      text: "Регулярно проверяю, что у вас торчит наружу в интернет: новые поддомены, открытые порты, случайно опубликованные файлы или данные. Присылаю отчёт, если появилось что-то новое и потенциально опасное.",
      fit: "Подходит для: компаний, у которых инфраструктура постоянно меняется и легко что-то забыть закрыть.",
    },
    {
      title: 'Разовая консультация "посмотри и скажи, что не так"',
      icon: Chat,
      text: "Короткий созвон/переписка — вы показываете проект, я быстро смотрю глазами безопасника и говорю, на что обратить внимание, прежде чем что-то пойдёт не так.",
      fit: "Подходит для: тех, кто на старте и хочет сверить часы перед запуском.",
    },
    {
      title: "Поиск утечек данных (Data Leak Search)",
      icon: SearchLocate,
      text: "Ищу, не утекли ли куда-то данные компании или пользователя — базы пользователей, пароли, внутренние документы, переписки. Проверяю даркнет, форумы хакеров, паблики с утечками, открытые базы данных, слитые архивы.",
      fit: "Подходит для: лиц или компаний, которые хотят знать, светятся ли уже их данные в сети.",
    },
    {
      title: "Написание документации",
      icon: Document,
      text: "Пишу понятную техническую и security-документацию: политики безопасности, регламенты на случай инцидента, инструкции по настройке инфраструктуры, чек-листы для команды.",
      fit: "Подходит для: компаний, которым нужна документация для внутреннего порядка, тендера или аудита, но писать её некому.",
    },
    {
      title: "Автоматизация",
      icon: Terminal,
      text: "Автоматизируем рутину — от простого bash-скрипта до сложных решений под индивидуальные требования. Повторяющиеся ручные задачи превращаю в скрипт или сервис, который делает всё сам.",
      fit: "Подходит для: команд, которые тратят время на однотипные ручные операции и хотят это время освободить.",
    },
  ];
</script>

<main class="services-page">
  <SiteMenu />
  <section class="services-hero">
    <p class="overline">Услуги</p>
    <h1>Практичная безопасность для сайтов, приложений и команд разработки.</h1>
    <p>
      Проверки, автоматизация, DevSecOps-процессы, triage находок и поиск утечек
      — в понятном формате и с письменным согласованием работ.
    </p>
  </section>
  <section class="services-grid" aria-label="Список услуг">
    {#each services as service, index (service.title)}
      {@const Icon = service.icon}
      <article class="service-card">
        <div class="service-icon"><Icon size={24} /></div>
        <span class="service-number">{String(index + 1).padStart(2, "0")}</span>
        <h2>{service.title}</h2>
        <p>{service.text}</p>
        {#if service.details}
          <ul>
            {#each service.details as detail}<li>{detail}</li>{/each}
          </ul>
        {/if}
        {#if service.note}<p class="note">{service.note}</p>{/if}
        <p class="fit">{service.fit}</p>
      </article>
    {/each}
  </section>
</main>

<style>
  .services-page {
    min-height: 100dvh;
    background: var(--background);
    padding: 7rem 1rem 5rem;
  }
  .services-hero {
    max-width: 64rem;
    margin: 0 auto 2rem;
  }
  .overline,
  .service-number {
    font-family: ui-monospace, monospace;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--foreground-muted);
    font-size: 0.75rem;
    font-weight: 700;
  }
  h1 {
    max-width: 54rem;
    margin: 0.75rem 0 1rem;
    color: var(--foreground);
    font-size: clamp(2.25rem, 6vw, 4.5rem);
    line-height: 1.05;
    letter-spacing: -0.04em;
  }
  .services-hero p:last-child {
    max-width: 44rem;
    color: var(--foreground-muted);
    line-height: 1.7;
  }
  .services-grid {
    max-width: 64rem;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }
  .service-card {
    position: relative;
    border: 1px solid var(--border);
    border-radius: 1rem;
    background: var(--background-inset);
    padding: 1.25rem;
    box-shadow: 0 1px 10px rgba(0, 0, 0, 0.04);
  }
  .service-icon {
    display: grid;
    place-items: center;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 0.75rem;
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    color: var(--accent);
    margin-bottom: 1rem;
  }
  .service-number {
    position: absolute;
    top: 1.25rem;
    right: 1.25rem;
  }
  h2 {
    margin: 0 0 0.75rem;
    color: var(--foreground);
    font-size: 1.15rem;
    line-height: 1.35;
  }
  p,
  li {
    color: var(--foreground-muted);
    line-height: 1.65;
    font-size: 0.95rem;
  }
  ul {
    margin: 0.75rem 0;
    padding-left: 1.1rem;
  }
  .note {
    color: var(--foreground);
    font-style: italic;
  }
  .fit {
    margin-top: 1rem;
    color: var(--foreground);
    font-weight: 600;
  }
  @media (max-width: 760px) {
    .services-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
