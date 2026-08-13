<script lang="ts">
  import SiteMenu from "$lib/components/ui/SiteMenu.svelte";
  import Card from "$lib/components/docs/markdown/Card.svelte";
  import Badge from "$lib/components/ui-registry/Badge.svelte";
  import Button from "$lib/components/ui-registry/Button.svelte";
  import Checkmark from "carbon-icons-svelte/lib/Checkmark.svelte";
  import Copy from "carbon-icons-svelte/lib/Copy.svelte";
  import Certificate from "carbon-icons-svelte/lib/Certificate.svelte";
  import Security from "carbon-icons-svelte/lib/Security.svelte";
  import Renew from "carbon-icons-svelte/lib/Renew.svelte";
  import Terminal from "carbon-icons-svelte/lib/Terminal.svelte";

  const githubUrl = "https://github.com/opensophy-projects/mtls";
  const quickStart = `git clone https://github.com/opensophy-projects/mtls.git
cd mtls
sudo ./cert-manager.sh init
sudo ./cert-manager.sh issue alice --service traefik
sudo ./cert-manager.sh revoke alice --service traefik`;

  const problems = [
    [
      "Traefik не умеет отзывать сертификаты",
      "Добавил клиента в caFiles — и всё, штатного способа заблокировать его без пересборки всего CA нет.",
    ],
    [
      "CRL/OCSP — оверинжиниринг",
      "Поднимать инфраструктуру списков отзыва ради 5–20 клиентских сертификатов — избыточно.",
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
      "Совместим из коробки, есть пресеты Dokploy, Traefik и локальный.",
    ],
  ];

  const features = [
    ["CLI + TUI", "Команды и интерактивный режим для ежедневных операций."],
    ["Контроль доступа", "Выпуск, отзыв и изоляция клиентов по сервисам."],
    [
      "Журнал аудита",
      "История действий: кто, когда и зачем выпускал сертификат.",
    ],
    ["Шифрование ключа CA", "Защита приватного ключа корневого центра."],
    [
      "Bundle per-service",
      "Отдельные bundle-файлы для разных сервисов Traefik.",
    ],
    ["Webhook-уведомления", "События можно отправлять во внешние системы."],
    ["Backup / Restore", "Резервное копирование и восстановление состояния."],
    [
      "Продление сертификатов",
      "Обновление клиентских сертификатов без ручного OpenSSL.",
    ],
    ["Проверка цепочки", "Валидация Root CA → Int-CA → client.crt."],
    ["Валидация YAML", "Проверка конфигурации перед применением."],
    ["Блокировка БД", "flock защищает состояние от конкурентных запусков."],
    ["Удаление сервиса", "Полная очистка service bundle и связанных записей."],
  ];

  const requirements = [
    ["openssl", "выпуск и проверка сертификатов"],
    ["python3", "служебная обработка данных"],
    ["bash ≥4", "исполнение CLI-скрипта"],
    ["flock", "безопасная блокировка БД"],
    ["curl*", "опциональные webhook-уведомления"],
    ["ip*", "опциональная диагностика окружения"],
  ];

  async function copyQuickStart() {
    await navigator.clipboard.writeText(quickStart);
  }
</script>

<svelte:head>
  <title>os.mtls — mTLS-сертификаты для Traefik</title>
  <meta
    name="description"
    content="Bash-скрипт для выпуска, продления и мгновенного отзыва клиентских mTLS-сертификатов Traefik."
  />
</svelte:head>

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
        клиентские сертификаты — без перезагрузки Traefik.
      </p>
      <div class="flex flex-wrap justify-center gap-3">
        <Button href={githubUrl}>→ Открыть на GitHub</Button>
        <Button href="#quick-start" variant="outline">Смотреть команды</Button>
      </div>
      <div class="flex flex-wrap justify-center gap-2">
        <Badge>MIT License</Badge><Badge>Bash + OpenSSL + Python3</Badge><Badge
          >v2.0</Badge
        >
      </div>
    </div>
  </section>

  <section class="section-block w-full max-w-5xl px-4">
    <p class="section-overline">Почему это вообще нужно</p>
    <div class="grid gap-4 md:grid-cols-3">
      {#each problems as [title, text]}<Card {title}>{text}</Card>{/each}
    </div>
    <div class="mt-6 text-center">
      <Button href="#quick-start" variant="outline"
        >Перейти к Quick Start</Button
      >
    </div>
  </section>

  <section class="section-block w-full max-w-5xl px-4">
    <p class="section-overline">Как работает</p>
    <h2 class="section-heading">
      Один промежуточный CA на клиента + bundle-файл
    </h2>
    <div class="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div class="space-y-4 text-foreground-muted">
        <p>
          Каждому клиенту создаётся свой промежуточный CA, подписанный корневым.
          Traefik доверяет не клиентским сертификатам напрямую, а bundle-файлу с
          промежуточными CA активных клиентов.
        </p>
        <p>
          Отзыв — это удаление промежуточного CA из bundle. File provider
          Traefik подхватывает изменение сам, поэтому доступ блокируется
          мгновенно и без перезагрузки.
        </p>
      </div>
      <div class="chain-card">
        <div>Root CA → Int-CA (alice) → client.crt (alice)</div>
        <div>Root CA → Int-CA (bob) → client.crt (bob)</div>
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
      {#each audiences as [title, text]}<Card {title}>{text}</Card>{/each}
    </div>
  </section>

  <section class="section-block w-full max-w-5xl px-4">
    <p class="section-overline">Что внутри</p>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each features as [title, text], i}<Card {title}
          ><span
            class="mb-3 inline-flex size-9 items-center justify-center rounded-sm bg-background-inset text-accent"
            >{#if i % 3 === 0}<Terminal />{:else if i % 3 === 1}<Security
              />{:else}<Certificate />{/if}</span
          ><span class="block">{text}</span></Card
        >{/each}
    </div>
  </section>

  <section id="quick-start" class="section-block w-full max-w-5xl px-4">
    <p class="section-overline">Quick Start</p>
    <div class="code-card">
      <button type="button" class="copy-button" onclick={copyQuickStart}
        ><Copy size={16} /> copy</button
      >
      <pre>{quickStart}</pre>
    </div>
  </section>

  <section class="section-block w-full max-w-5xl px-4">
    <p class="section-overline">Требования</p>
    <div class="overflow-hidden rounded-lg border border-border">
      {#each requirements as [name, text]}<div
          class="grid grid-cols-[9rem_1fr] gap-4 border-b border-border p-4 last:border-b-0"
        >
          <strong>{name}</strong><span class="text-foreground-muted"
            >{text}</span
          >
        </div>{/each}
    </div>
    <p class="mt-4 text-foreground-muted">
      <strong class="text-foreground"
        >Проверено на Ubuntu, платформа Dokploy.</strong
      >
    </p>
  </section>

  <section class="section-block w-full max-w-5xl px-4">
    <p class="section-overline">FAQ</p>
    <div class="grid gap-3">
      <Card title="Нужен ли root?"
        >Обычно да, но есть локальный пресет без sudo [бета].</Card
      ><Card title="Поддерживается ли ECDSA?"
        >Нет, только RSA — это известное ограничение.</Card
      ><Card title="Что будет, если Traefik перезагрузить?"
        >Ничего: hot-reload работает через file provider.</Card
      ><Card title="Как отозвать доступ клиенту?"
        >Командой cert revoke, эффект мгновенный.</Card
      ><Card title="Лицензия?">MIT.</Card>
    </div>
  </section>

  <section
    class="bottom-gradient-section flex items-center justify-center px-6 text-center"
  >
    <div class="bottom-gradient-card" aria-hidden="true">
      <div class="bottom-gradient-bg"></div>
    </div>
    <div class="relative z-10 flex flex-col items-center gap-4">
      <h2 class="section-heading">Готовы попробовать?</h2>
      <Button href={githubUrl}>→ GitHub: opensophy-projects/mtls.sh</Button>
      <div
        class="flex flex-wrap justify-center gap-4 text-sm text-foreground-muted"
      >
        <a href={`${githubUrl}/blob/main/LICENSE`}>MIT License</a><a href="/"
          >Другие проекты Opensophy</a
        ><span>Copyright © 2026 opensophy-projects</span>
      </div>
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
  .hero-bg,
  .bottom-gradient-bg {
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
  .chain-card {
    display: grid;
    gap: 1rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--background-inset);
    padding: 1.25rem;
    font-family: monospace;
    color: var(--foreground);
  }
  .chain-card div {
    border-left: 2px solid var(--color-accent);
    padding: 0.75rem 1rem;
    background: var(--background);
    border-radius: var(--radius-sm);
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
  .code-card {
    position: relative;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--background-inset);
  }
  .code-card pre {
    margin: 0;
    overflow: auto;
    padding: 1.25rem;
    color: var(--foreground);
    font-size: 0.9rem;
  }
  .copy-button {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--background);
    padding: 0.35rem 0.55rem;
    font-size: 0.75rem;
    color: var(--foreground-muted);
  }
  .bottom-gradient-section {
    position: relative;
    min-height: clamp(16rem, 34vw, 26rem);
    width: 100%;
    margin-top: 2rem;
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
    background: radial-gradient(
      125% 125% at 50% 0%,
      transparent 40%,
      #f43f5e 68%,
      #fda4af 86%,
      #fff1f2 100%
    );
  }
</style>
