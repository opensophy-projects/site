<script lang="ts">
	import PageSeo from '$lib/components/seo/PageSeo.svelte';
  import SiteMenu from "$lib/components/ui-registry/SiteMenu.svelte";
  import Card from "$lib/components/docs/markdown/Card.svelte";
  import Faq from "$lib/components/docs/markdown/Faq.svelte";
  import Badge from "$lib/components/ui-registry/Badge.svelte";
  import MtlsRevocation from "$lib/components/ui-registry/MtlsRevocation.svelte";
  import Button from "$lib/components/ui-registry/Button.svelte";
  import ArrowRight from "carbon-icons-svelte/lib/ArrowRight.svelte";
  import Checkmark from "carbon-icons-svelte/lib/Checkmark.svelte";
  import Renew from "carbon-icons-svelte/lib/Renew.svelte";
  import Terminal from "carbon-icons-svelte/lib/Terminal.svelte";

  const githubUrl = "https://github.com/opensophy-projects/mtls";

  const problems = [
    [
      "Traefik не умеет отзывать сертификаты",
      "Добавил клиента в caFiles — и всё, штатного способа заблокировать его без пересборки всего CA нет.",
    ],
    [
      "CRL/OCSP — оверинжиниринг",
      "Поднимать инфраструктуру списков отзыва ради 5–20 клиентских сертификатов — избыточно. crl.pem остаётся лишь дополнительным артефактом для внешних потребителей.",
    ],
    [
      "Ручное управление не масштабируется",
      "openssl командами на память, файлы разбросаны по серверу, нет истории — кто, когда и зачем выпустил сертификат.",
    ],
  ];

  const steps = [
    [
      "1",
      "Выпуск",
      "cert issue создаёт для клиента собственный промежуточный CA, подписывает им клиентский сертификат, проверяет цепочку и добавляет этот CA в bundle. Клиент получает .p12.",
    ],
    [
      "2",
      "Отзыв",
      "cert revoke помечает клиента отозванным, пересобирает bundle без его CA и заново записывает mtls-manager.yml.",
    ],
    [
      "3",
      "Результат",
      "Traefik перечитывает конфиг и больше не находит CA для сертификата клиента. Перезапуск не нужен.",
    ],
  ];

  const audiences = [
    [
      "Self-hosted / homelab",
      "Dokploy, Traefik, VPS с несколькими сервисами за mTLS.",
    ],
    [
      "Небольшие DevOps-команды",
      "Контроль доступа к внутренним панелям/API без полноценного VPN.",
    ],
    [
      "Open-source инфраструктура",
      "Простой bash-инструмент без Go-бинарников и внешних зависимостей.",
    ],
    [
      "Traefik + Docker Compose",
      "Работает с shared или per-service CA bundle, hot-reload через file provider.",
    ],
  ];

  const features = [
    ["Управление CA", "ca create / info / backup / restore — свой корневой центр сертификации."],
    ["Жизненный цикл сертификатов", "cert issue / list / renew / verify / scan — без ручного OpenSSL."],
    ["Мгновенный отзыв", "cert revoke пересобирает CA bundle, доступ блокируется без reload Traefik."],
    ["Защищённые PKCS#12", "Клиентские .p12-файлы и зашифрованный приватный ключ CA."],
    ["Shared / per-service bundle", "Общий bundle или отдельный на сервис — гибкая изоляция клиентов."],
    ["Сервисы new / patch", "service add / list / delete / delete-full с двумя режимами применения."],
    ["Именованные пресеты", "preset save / apply / list / delete — сохранённые наборы путей и конфигурации."],
    ["JSONL-аудит с ротацией", "История действий: кто, когда и зачем выпускал или отзывал сертификат."],
    ["Безопасные пароли", "Пароль OpenSSL передаётся через временный файл 0600, а не через argv/history."],
    ["Safe-replace конфигурации", "Traefik YAML валидируется перед заменой, исходник сохраняется как .bak."],
    ["Блокировка БД", "flock защищает состояние от конкурентных запусков."],
    ["CI", "Bash syntax check, ShellCheck, smoke- и security-тесты на каждый push/PR."],
  ];

  const requirements = [
    ["openssl", "выпуск и проверка сертификатов"],
    ["python3", "служебная обработка данных"],
    ["bash ≥4", "исполнение CLI-скрипта"],
    ["flock", "безопасная блокировка БД"],
    ["gzip", "ротация audit-лога"],
    ["root (UID 0)", "работа с приватным ключевым материалом CA и клиентов"],
  ];

  const faqItems = [
    {
      question: "Нужен ли root?",
      answer: "Да, всегда — скрипт создаёт и читает приватные ключи CA и клиентов, поэтому требует UID 0 (sudo или root-shell).",
    },
    {
      question: "Как передать пароль сертификата?",
      answer: "Через интерактивный режим или временный файл с правами 0600 — не через --pass в production, иначе значение может попасть в history или process list.",
    },
    {
      question: "Что будет, если Traefik перезагрузить?",
      answer: "Ничего: hot-reload работает через file provider, пересборка bundle подхватывается автоматически.",
    },
    {
      question: "Как отозвать доступ клиенту?",
      answer: "Командой cert revoke — она пересобирает CA bundle, эффект мгновенный, reload Traefik не требуется.",
    },
    {
      question: "Лицензия?",
      answer: "MIT.",
    },
  ];
</script>

<PageSeo title="os.mtls — mTLS-сертификаты для Traefik" description="Bash-скрипт для выпуска, перевыпуска и отзыва клиентских mTLS-сертификатов Traefik." type="website" />

<main
  class="relative flex min-h-dvh w-full flex-col items-center bg-background pt-20 text-foreground"
>
  <SiteMenu />

  <section
    class="hero-section relative flex w-full flex-col items-center px-4 pt-14 pb-10 md:pt-20 md:pb-16"
  >
    <div class="hero-card" aria-hidden="true"><div class="hero-bg"></div></div>

    <div
      class="relative z-10 flex w-full max-w-4xl flex-col items-center gap-6 text-center"
    >
      <p
        class="text-sm font-medium uppercase tracking-[0.18em] text-foreground-muted"
      >
        os.mtls
      </p>
      <h1 class="hero-heading">mTLS-сертификаты для Traefik без CRL и OCSP</h1>
      <p class="max-w-2xl text-lg text-foreground-muted md:text-xl">
        Bash-скрипт, который выпускает, перевыпускает и отзывает клиентские
        сертификаты. Отзыв работает через пересборку CA bundle, перезапуск
        Traefik не нужен.
      </p>
      <div class="flex flex-wrap items-center justify-center gap-3">
        <Button href={githubUrl}>Открыть на GitHub</Button>
        <a class="hero-link" href="#how">Как это работает<ArrowRight size={16} /></a>
      </div>
      <div class="flex flex-wrap justify-center gap-2">
        <Badge>MIT License</Badge><Badge>Bash + OpenSSL + Python3</Badge><Badge
          >Требует root</Badge
        >
      </div>
    </div>

    <div class="relative z-10 mt-10 w-full hero-illustration md:mt-14">
      <MtlsRevocation />
    </div>
  </section>

  <section class="section-block w-full max-w-5xl px-4">
    <p class="section-overline">Почему это вообще нужно</p>
    <div class="grid gap-4 md:grid-cols-3">
      {#each problems as [title, text] (title)}<Card {title}>{text}</Card>{/each}
    </div>
  </section>

  <section id="how" class="section-block how w-full max-w-5xl px-4">
    <p class="section-overline">Как работает</p>
    <h2 class="section-heading">Отзыв через bundle: у каждого клиента свой CA</h2>
    <p class="how-lead">
      Traefik проверяет только подпись: сертификат проходит, если его выпустил
      один из CA в <code>caFiles</code>. Поэтому скрипт выпускает каждому клиенту
      собственный промежуточный CA и кладёт в bundle именно его. Убрали CA из
      bundle, и клиент больше не проходит.
    </p>

    <div class="trust" aria-label="Цепочка доверия">
      <div class="trust-node">
        <span class="trust-tag">корень</span>
        <strong>Root CA</strong>
        <span class="trust-note">подписывает промежуточные CA</span>
      </div>
      <ArrowRight class="trust-arrow" size={20} />
      <div class="trust-node trust-node--hot">
        <span class="trust-tag trust-tag--hot">лежит в bundle</span>
        <strong>CA клиента</strong>
        <span class="trust-note">свой на каждого клиента</span>
      </div>
      <ArrowRight class="trust-arrow" size={20} />
      <div class="trust-node">
        <span class="trust-tag">клиент</span>
        <strong>client.crt</strong>
        <span class="trust-note">подписан CA клиента, лежит в .p12</span>
      </div>
    </div>

    <div class="steps">
      {#each steps as [n, title, text] (n)}
        <div class="step">
          <span class="step-n">{n}</span>
          <h3 class="step-title">{title}</h3>
          <p class="step-text">{text}</p>
        </div>
      {/each}
    </div>

    <div class="bundles">
      <div class="bundle">
        <div class="bundle-head">
          <code>clients-bundle.crt</code><span>до отзыва</span>
        </div>
        <div class="bundle-row">int-ca.crt <span>alice</span></div>
        <div class="bundle-row">int-ca.crt <span>bob</span></div>
      </div>
      <ArrowRight class="bundles-arrow" size={20} />
      <div class="bundle">
        <div class="bundle-head">
          <code>clients-bundle.crt</code><span>после cert revoke для bob</span>
        </div>
        <div class="bundle-row">int-ca.crt <span>alice</span></div>
        <div class="bundle-row bundle-row--gone">int-ca.crt <span>bob</span></div>
      </div>
    </div>

    <div class="modes">
      <Card title="shared (по умолчанию)">
        Один bundle на все сервисы. Сертификат, выпущенный для одного сервиса,
        проходит и на остальных.
      </Card>
      <Card title="per-service">
        Отдельный bundle на каждый сервис, клиенты изолированы друг от друга.
      </Card>
    </div>

    <div class="mt-6 grid gap-3 md:grid-cols-3">
      <div class="benefit"><Checkmark />Отзыв одного клиента</div>
      <div class="benefit"><Renew />Без перезапуска Traefik</div>
      <div class="benefit"><Terminal />Один bash-скрипт</div>
    </div>
  </section>

  <section class="section-block w-full max-w-5xl px-4">
    <p class="section-overline">Кому подойдёт</p>
    <div class="grid gap-4 md:grid-cols-2">
      {#each audiences as [title, text] (title)}<Card {title}>{text}</Card>{/each}
    </div>
  </section>

  <section class="section-block w-full max-w-5xl px-4">
    <p class="section-overline">Что внутри</p>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each features as [title, text] (title)}<Card {title}>{text}</Card>{/each}
    </div>
  </section>

  <section class="section-block w-full max-w-5xl px-4">
    <p class="section-overline">Требования</p>
    <div class="overflow-hidden rounded-lg border border-border">
      {#each requirements as [name, text] (name)}<div
          class="grid grid-cols-[9rem_1fr] gap-4 border-b border-border p-4 last:border-b-0"
        >
          <strong>{name}</strong><span class="text-foreground-muted"
            >{text}</span
          >
        </div>{/each}
    </div>
    <p class="mt-4 text-center text-foreground-muted">
      <strong class="text-foreground"
        >Только Linux. Запуск строго от root — скрипт работает с приватным ключевым материалом.</strong
      >
    </p>
  </section>

  <section class="section-block w-full max-w-5xl px-4">
    <p class="section-overline">FAQ</p>
    <Faq items={faqItems} />
  </section>

  <section class="bottom-gradient-section" aria-hidden="true">
    <div class="bottom-gradient-card">
      <div class="bottom-gradient-bg"></div>
    </div>
  </section>
</main>

<style>
  .hero-section {
    min-height: 56vh;
  }
  .hero-illustration {
    max-width: 72rem;
  }
  .hero-card {
    position: absolute;
    top: -5rem;
    right: 0;
    bottom: 0;
    left: 0;
    max-width: 80rem;
    margin: auto;
    overflow: hidden;
    border-top-left-radius: var(--radius-3xl, 3.3rem);
    border-top-right-radius: var(--radius-3xl, 3.3rem);
  }
  .hero-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.28;
    background: radial-gradient(
      125% 125% at 50% 100%,
      transparent 40%,
      #f43f5e 68%,
      #fda4af 86%,
      #fff1f2 100%
    );
  }
  :global(.dark) .hero-bg,
  :global(.dark) .bottom-gradient-bg {
    opacity: 0.22;
  }
  .hero-heading {
    max-width: 52rem;
    margin: 0;
    font-size: clamp(2.2rem, 6vw, 4.2rem);
    font-weight: 500;
    letter-spacing: -0.04em;
    line-height: 1.07;
  }
  .hero-link {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.55rem 0.9rem;
    border-radius: var(--radius-sm);
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--foreground);
    transition: color 150ms ease-out;
  }
  .hero-link:hover {
    color: var(--color-accent);
  }
  .section-block {
    position: relative;
    padding-top: clamp(2.5rem, 5vw, 4rem);
    padding-bottom: clamp(2.5rem, 5vw, 4rem);
  }
  .section-overline {
    margin-bottom: 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--foreground-muted);
  }
  .section-heading {
    margin: 0 0 1.5rem;
    font-size: clamp(1.8rem, 4vw, 3rem);
    font-weight: 500;
    letter-spacing: -0.03em;
  }
  .benefit {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 0.9rem;
    background: var(--background);
  }
  .benefit :global(svg) {
    color: var(--color-accent);
  }

  /* ───── Как работает ───── */
  .how {
    scroll-margin-top: 6rem;
  }
  .how-lead {
    max-width: 46rem;
    margin: -0.5rem 0 2rem;
    font-size: 1.05rem;
    line-height: 1.65;
    color: var(--foreground-muted);
  }
  .how-lead code {
    font-family: monospace;
    font-size: 0.95em;
    color: var(--foreground);
  }

  /* цепочка доверия: Root CA → CA клиента → сертификат клиента */
  .trust {
    display: grid;
    grid-template-columns: 1fr auto 1fr auto 1fr;
    align-items: stretch;
    gap: 0.75rem;
  }
  .trust :global(.trust-arrow) {
    align-self: center;
    color: var(--foreground-muted);
  }
  .trust-node {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 1rem 1.1rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--background);
  }
  .trust-node strong {
    font-size: 1.1rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }
  .trust-node--hot {
    border-color: var(--color-accent);
    background: color-mix(in srgb, var(--color-accent) 7%, var(--background));
  }
  .trust-tag {
    align-self: flex-start;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--foreground-muted);
  }
  .trust-tag--hot {
    color: var(--color-accent);
  }
  .trust-note {
    font-size: 0.9rem;
    line-height: 1.4;
    color: var(--foreground-muted);
  }

  /* три шага */
  .steps {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-top: 1.5rem;
  }
  .step {
    position: relative;
    padding: 1.25rem 1.25rem 1.35rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--background);
  }
  .step-n {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    margin-bottom: 0.75rem;
    border-radius: 9999px;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--color-accent);
    background: color-mix(in srgb, var(--color-accent) 12%, var(--background));
  }
  .step-title {
    margin: 0 0 0.4rem;
    font-size: 1.1rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }
  .step-text {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.6;
    color: var(--foreground-muted);
  }
  .step-text :global(code) {
    font-family: monospace;
  }

  /* bundle до и после отзыва */
  .bundles {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }
  .bundles :global(.bundles-arrow) {
    color: var(--foreground-muted);
  }
  .bundle {
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--background);
  }
  .bundle-head {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 0.25rem 1rem;
    padding: 0.7rem 1rem;
    border-bottom: 1px solid var(--border);
    font-size: 0.8rem;
    color: var(--foreground-muted);
  }
  .bundle-head code {
    font-family: monospace;
    color: var(--foreground);
  }
  .bundle-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.7rem 1rem;
    border-left: 2px solid var(--color-accent);
    font-family: monospace;
    font-size: 0.9rem;
    color: var(--foreground);
  }
  .bundle-row + .bundle-row {
    border-top: 1px solid var(--border);
  }
  .bundle-row span {
    color: var(--foreground-muted);
  }
  .bundle-row--gone {
    border-left-color: var(--border);
    border-left-style: dashed;
    color: var(--foreground-muted);
    text-decoration: line-through;
    background: repeating-linear-gradient(
      135deg,
      transparent 0 6px,
      color-mix(in srgb, var(--foreground-muted) 8%, transparent) 6px 7px
    );
  }

  .modes {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-top: 1.5rem;
  }

  @media (max-width: 820px) {
    .trust,
    .bundles {
      grid-template-columns: 1fr;
    }
    .trust :global(.trust-arrow),
    .bundles :global(.bundles-arrow) {
      justify-self: center;
      transform: rotate(90deg);
    }
    .steps,
    .modes {
      grid-template-columns: 1fr;
    }
  }

  .bottom-gradient-section {
    position: relative;
    min-height: clamp(12rem, 28vw, 22rem);
    width: 100%;
  }
  .bottom-gradient-card {
    position: absolute;
    inset: 0;
    max-width: 80rem;
    margin: auto;
    overflow: hidden;
    border-bottom-left-radius: var(--radius-3xl, 3.3rem);
    border-bottom-right-radius: var(--radius-3xl, 3.3rem);
  }
  .bottom-gradient-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(
      125% 125% at 50% 0%,
      transparent 40%,
      #f43f5e 68%,
      #fda4af 86%,
      #fff1f2 100%
    );
    opacity: 0.28;
  }
</style>