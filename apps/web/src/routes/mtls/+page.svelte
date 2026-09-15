<script lang="ts">
	import PageSeo from '$lib/components/seo/PageSeo.svelte';
  import SiteMenu from "$lib/components/ui/SiteMenu.svelte";
  import Card from "$lib/components/docs/markdown/Card.svelte";
  import Faq from "$lib/components/docs/markdown/Faq.svelte";
  import Badge from "$lib/components/ui-registry/Badge.svelte";
  import Button from "$lib/components/ui-registry/Button.svelte";
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

<PageSeo title="os.mtls — mTLS-сертификаты для Traefik" description="Bash-скрипт для выпуска, продления и мгновенного отзыва клиентских mTLS-сертификатов Traefik." type="website" />

<main
  class="relative flex min-h-dvh w-full flex-col items-center bg-background pt-20 text-foreground"
>
  <SiteMenu />

  <section
    class="hero-section relative flex w-full items-center justify-center px-6 py-20 md:py-28"
  >
    <div class="hero-card" aria-hidden="true"><div class="hero-bg"></div></div>
    <div
      class="relative z-10 flex w-full max-w-5xl flex-col items-center gap-7 text-center"
    >
      <p
        class="text-sm font-medium uppercase tracking-[0.18em] text-foreground-muted"
      >
        os.mtls
      </p>
      <h1 class="hero-heading">
        mTLS-сертификаты для Traefik без CRL, OCSP и лишней боли
      </h1>
      <p class="max-w-3xl text-lg text-foreground-muted md:text-xl">
        Bash-скрипт, который выпускает, продлевает и мгновенно отзывает
        клиентские сертификаты — без перезагрузки Traefik, без передачи паролей через argv и без сетевых уведомлений.
      </p>
      <div class="flex flex-wrap justify-center gap-3">
        <Button href={githubUrl}>Открыть на GitHub</Button>
      </div>
      <div class="flex flex-wrap justify-center gap-2">
        <Badge>MIT License</Badge><Badge>Bash + OpenSSL + Python3</Badge><Badge
          >Требует root</Badge
        >
      </div>
    </div>
  </section>

  <section class="section-block w-full max-w-5xl px-4">
    <p class="section-overline">Почему это вообще нужно</p>
    <div class="grid gap-4 md:grid-cols-3">
      {#each problems as [title, text] (title)}<Card {title}>{text}</Card>{/each}
    </div>
  </section>

  <section class="section-block w-full max-w-5xl px-4">
    <p class="section-overline">Как работает</p>
    <h2 class="section-heading">
      CA bundle на сервис + мгновенная пересборка при отзыве
    </h2>
    <div class="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div class="space-y-4 text-foreground-muted">
        <p>
          Traefik доверяет не клиентским сертификатам напрямую, а bundle-файлу
          (caFiles) — общему или отдельному для каждого сервиса. Скрипт
          управляет содержимым bundle: выпуск клиента добавляет запись, отзыв
          — удаляет её и пересобирает файл.
        </p>
        <p>
          File provider Traefik подхватывает изменение сам, поэтому доступ
          блокируется мгновенно и без перезагрузки. Файл <code>crl.pem</code>
          — дополнительный артефакт для внешних потребителей, а не основной
          механизм отзыва.
        </p>
      </div>
      <div class="grid gap-3">
        <div class="chain-row">bundle[api].caFiles ← client.crt (alice)</div>
        <div class="chain-row">bundle[api].caFiles ← client.crt (bob)</div>
      </div>
    </div>
    <div class="mt-6 grid gap-3 md:grid-cols-3">
      <div class="benefit"><Checkmark />Гранулярный отзыв</div>
      <div class="benefit"><Renew />Без reload Traefik</div>
      <div class="benefit"><Terminal />Только openssl и python3</div>
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
    max-width: 64rem;
    margin: 0;
    font-size: clamp(2.3rem, 7vw, 5.2rem);
    font-weight: 500;
    letter-spacing: -0.04em;
    line-height: 1.05;
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
  .chain-row {
    border-left: 2px solid var(--color-accent);
    padding: 0.75rem 1rem;
    background: var(--background);
    border-radius: var(--radius-sm);
    font-family: monospace;
    color: var(--foreground);
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