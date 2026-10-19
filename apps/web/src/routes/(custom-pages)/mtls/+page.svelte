<script lang="ts">
	import PageSeo from '$lib/components/seo/PageSeo.svelte';
  import SiteMenu from "$lib/components/ui-registry/SiteMenu.svelte";
  import Card from "$lib/components/docs/markdown/Card.svelte";
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
    [
      "Корневой CA",
      "ca create / info / backup / restore. Ключ CA можно зашифровать паролем (--encrypt). Резервная копия включает CA, базу, конфиг, пресеты и журнал, restore отклоняет небезопасные архивы.",
    ],
    [
      "Выпуск сертификатов",
      "cert issue: ключ клиента, собственный промежуточный CA, подпись, проверка цепочки и .p12. Выпуск идёт через временный каталог, при ошибке существующие файлы не затрагиваются. cert verify показывает данные сертификата и проверяет цепочку.",
    ],
    [
      "Перевыпуск",
      "cert renew выпускает сертификат заново: новый ключ и новый промежуточный CA под тем же именем. Старый отзывается только после успешного выпуска нового. Клиенту нужен новый .p12.",
    ],
    [
      "Отзыв и удаление",
      "cert revoke убирает CA клиента из bundle и перезаписывает конфиг Traefik. cert delete отзывает сертификат и удаляет его файлы с диска.",
    ],
    [
      "Контроль сроков",
      "cert scan находит истёкшие, скоро истекающие (по умолчанию за 30 дней) и сертификаты с нераспознанной датой. Если есть что показать, команда завершается с ненулевым кодом. Уведомления наружу не отправляются.",
    ],
    [
      "PKCS#12 и пароли",
      "Пароль .p12 обязателен по умолчанию (REQUIRE_P12_PASSWORD=1). Пароли для openssl передаются через временный файл 0600, а не через argv. Пароль из --pass виден в history и ps, безопаснее MTLS_P12_PASSWORD или ввод в меню.",
    ],
    [
      "Shared / per-service bundle",
      "Режим shared (по умолчанию): один bundle на все сервисы. Режим per-service: отдельный bundle на каждый сервис.",
    ],
    [
      "Сервисы new / patch",
      "new: скрипт создаёт роутер и сервис Traefik для домена. patch: добавляет mTLS-опцию в существующий роутер в другом yml-файле, например Dokploy. service delete снимает патч, delete-full отзывает и удаляет все сертификаты сервиса, его файлы и блок конфига.",
    ],
    [
      "Пресеты путей",
      "preset save / apply / list / delete сохраняют пути Traefik dynamic, CA и клиентов и имя выходного файла. В меню есть встроенные пресеты: Dokploy, Traefik и локальный.",
    ],
    [
      "Журнал аудита",
      "JSONL: время, действие, пользователь и детали, просмотр через audit --last N. После 10 МиБ журнал архивируется в .1.gz, предыдущий архив заменяется.",
    ],
    [
      "Безопасная запись",
      "Файлы состояния и конфиги заменяются атомарно, запись по symlink отклоняется. Патчи чужих роутеров проверяются до замены, перед записью делается копия .bak с меткой времени. Имена сервисов и сертификатов ограничены латиницей, цифрами, «.», «_» и «-». Параллельные запуски блокируются через flock.",
    ],
    [
      "Меню и CLI",
      "Без аргументов скрипт открывает интерактивное меню: сертификаты, сервисы, пути, резервная копия. С аргументами работает как CLI: ca, cert, service, preset, config, gen, audit.",
    ],
  ];
</script>

<PageSeo title="os.mtls — mTLS-сертификаты для Traefik" description="Bash-скрипт для выпуска, перевыпуска и отзыва клиентских mTLS-сертификатов Traefik." type="website" />

<main
  class="relative flex min-h-dvh w-full flex-col items-center bg-background pt-20 text-foreground"
>
  <SiteMenu />

  <!-- Hero -->
  <section class="hero-section relative flex w-full items-center justify-center">
    <!-- Изогнутое свечение (горизонт), как на главной -->
    <div class="hero-card" aria-hidden="true">
      <div class="hero-halo"></div>
      <div class="hero-arc"></div>
    </div>

    <div class="hero-inner">
      <p
        class="text-sm font-medium uppercase tracking-[0.18em] text-foreground-muted"
      >
        os.mtls
      </p>
      <h1 class="hero-heading">mTLS-сертификаты для Traefik без CRL и OCSP</h1>
      <p class="hero-sub">
        Bash-скрипт, который выпускает, перевыпускает и отзывает клиентские
        сертификаты. Отзыв работает через пересборку CA bundle, перезапуск
        Traefik не нужен.
      </p>
      <div class="hero-actions">
        <Button href={githubUrl}>Открыть на GitHub</Button>
        <a class="hero-link" href="#how">Как это работает<ArrowRight size={16} /></a>
      </div>
      <div class="flex flex-wrap justify-center gap-2">
        <Badge>MIT License</Badge><Badge>Bash + OpenSSL + Python3</Badge><Badge
          >Требует root</Badge
        >
      </div>
    </div>
  </section>

  <!-- Почему это вообще нужно -->
  <section class="section-block wide px-4">
    <p class="section-overline"><Badge variant="default">Почему это вообще нужно</Badge></p>
    <div class="grid-3">
      {#each problems as [title, text] (title)}<Card {title}>{text}</Card>{/each}
    </div>
  </section>

  <!-- Как работает -->
  <section id="how" class="section-block how wide px-4">
    <p class="section-overline"><Badge variant="accent">Как работает</Badge></p>
    <h2 class="section-heading">Отзыв через bundle: у каждого клиента свой CA</h2>
    <p class="how-lead">
      Traefik проверяет только подпись: сертификат проходит, если его выпустил
      один из CA в <code>caFiles</code>. Поэтому скрипт выпускает каждому клиенту
      собственный промежуточный CA и кладёт в bundle именно его. Убрали CA из
      bundle, и клиент больше не проходит.
    </p>

    <div class="how-body">
      <div class="how-illustration">
        <MtlsRevocation />
      </div>

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

      <div class="benefits">
        <div class="benefit"><Checkmark />Отзыв одного клиента</div>
        <div class="benefit"><Renew />Без перезапуска Traefik</div>
        <div class="benefit"><Terminal />Один bash-скрипт</div>
      </div>
    </div>
  </section>

  <!-- Кому подойдёт -->
  <section class="section-block wide px-4">
    <p class="section-overline"><Badge variant="default">Кому подойдёт</Badge></p>
    <div class="grid-4">
      {#each audiences as [title, text] (title)}<Card {title}>{text}</Card>{/each}
    </div>
  </section>

  <!-- Что внутри: розовая панель, как «Продукты» на главной -->
  <section class="section-block features-section w-full px-4">
    <div class="features-panel">
      <p class="section-overline"><Badge variant="default">Что внутри</Badge></p>
      <div class="grid-3 features-grid">
        {#each features as [title, text] (title)}<Card {title}>{text}</Card>{/each}
      </div>
    </div>
  </section>

  <section class="bottom-gradient-section" aria-hidden="true">
    <div class="bottom-gradient-card">
      <div class="bottom-gradient-bg"></div>
    </div>
  </section>
</main>

<style>
  /* ─── Hero ─────────────────────────────────────────────────── */
  .hero-section {
    position: relative;
    min-height: 34rem;
    padding: 6rem 0 5rem;
  }

  .hero-card {
    position: absolute;
    top: 0;
    bottom: -4rem;
    left: 0;
    right: 0;
    width: 100%;
    overflow: hidden;
    pointer-events: none;
    -webkit-mask-image: linear-gradient(to bottom, #000 calc(100% - 6rem), transparent 100%);
    mask-image: linear-gradient(to bottom, #000 calc(100% - 6rem), transparent 100%);
  }

  .hero-halo {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(
        ellipse 75% 55% at 50% 100%,
        rgba(244, 63, 94, 0.5) 0%,
        rgba(244, 63, 94, 0.22) 38%,
        transparent 72%
      ),
      radial-gradient(
        ellipse 100% 70% at 50% 100%,
        rgba(244, 63, 94, 0.12) 0%,
        transparent 75%
      );
  }

  .hero-arc {
    position: absolute;
    left: 50%;
    top: calc(100% - 8rem);
    width: 165%;
    height: 42rem;
    transform: translateX(-50%);
    border-radius: 50%;
    background: var(--background);
    border-top: 1px solid rgba(253, 164, 175, 0.85);
    box-shadow:
      0 -2px 14px rgba(253, 164, 175, 0.55),
      0 -10px 40px rgba(244, 63, 94, 0.55),
      0 -28px 90px rgba(244, 63, 94, 0.3),
      inset 0 3px 22px rgba(244, 63, 94, 0.35);
    pointer-events: none;
  }

  :global(.dark) .hero-halo {
    opacity: 0.9;
  }

  .hero-inner {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    width: calc(100% - 2rem);
    max-width: 56rem;
    margin: 0 auto;
    padding: 0 1.25rem;
    text-align: center;
  }

  .hero-heading {
    max-width: 52rem;
    margin: 0;
    font-size: clamp(2.2rem, 6vw, 4.2rem);
    font-weight: 500;
    letter-spacing: -0.04em;
    line-height: 1.07;
  }

  .hero-sub {
    max-width: 40rem;
    margin: 0;
    font-size: clamp(1.1rem, 1.6vw, 1.35rem);
    font-weight: 500;
    line-height: 1.45;
    letter-spacing: -0.02em;
    color: var(--foreground-muted);
  }

  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
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

  @media (max-width: 1023px) {
    .hero-section {
      min-height: 0;
      padding-top: 5rem;
      padding-bottom: 5rem;
    }
    .hero-arc {
      top: calc(100% - 7rem);
      width: 220%;
      height: 26rem;
    }
  }

  /* ─── Раскладка секций ───────────────────────────────────── */
  /* Ширина как у блоков главной: 92rem */
  .wide {
    width: 92rem;
    max-width: calc(100vw - 2rem);
    margin: 0 auto;
    box-sizing: border-box;
  }

  .section-block {
    position: relative;
    padding-top: clamp(1.5rem, 3vw, 2.5rem);
    padding-bottom: clamp(1.5rem, 3vw, 2.5rem);
  }

  .section-overline {
    display: flex;
    justify-content: center;
    text-align: center;
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--foreground-muted);
    margin-bottom: 1rem;
  }

  .section-heading {
    margin: 0 0 1rem;
    text-align: center;
    font-size: clamp(1.75rem, 3.5vw, 2.6rem);
    font-weight: 500;
    line-height: 1.3;
    letter-spacing: -0.02em;
  }

  .grid-3 {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
  }
  .grid-4 {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.75rem;
  }

  @media (max-width: 1099px) {
    .grid-3 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .grid-4 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media (max-width: 639px) {
    .grid-3,
    .grid-4 {
      grid-template-columns: 1fr;
    }
  }

  /* ─── Как работает ───────────────────────────────────────── */
  .how {
    scroll-margin-top: 6rem;
  }
  .how-lead {
    max-width: 46rem;
    margin: 0 auto 2rem;
    text-align: center;
    font-size: clamp(1.05rem, 1.4vw, 1.25rem);
    font-weight: 500;
    line-height: 1.55;
    letter-spacing: -0.01em;
    color: var(--foreground-muted);
  }
  .how-lead code {
    font-family: monospace;
    font-size: 0.95em;
    color: var(--foreground);
  }
  .how-body {
    max-width: 76rem;
    margin: 0 auto;
  }
  .how-illustration {
    margin-bottom: 1.5rem;
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
    gap: 0.75rem;
    margin-top: 1.5rem;
  }
  .step {
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
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  .benefits {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    margin-top: 1.5rem;
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
    .modes,
    .benefits {
      grid-template-columns: 1fr;
    }
  }

  /* ─── Что внутри: розовая панель ─────────────────────────── */
  .features-section {
    position: relative;
    z-index: 1;
  }

  .features-panel {
    width: 100%;
    max-width: 92rem;
    margin: 0 auto;
    box-sizing: border-box;
    padding: 2.5rem 1.25rem;
    border-radius: var(--radius-3xl, 3.3rem);
    background: radial-gradient(
      farthest-corner at 50% 50%,
      color-mix(in srgb, color-mix(in srgb, #f43f5e 85%, white) 32%, transparent) 0%,
      color-mix(in srgb, #f43f5e 32%, transparent) 55%,
      color-mix(in srgb, color-mix(in srgb, #f43f5e 80%, black) 32%, transparent) 100%
    );
  }

  :global(.dark) .features-panel {
    background: radial-gradient(
      farthest-corner at 50% 50%,
      color-mix(in srgb, color-mix(in srgb, #f43f5e 85%, white) 22%, transparent) 0%,
      color-mix(in srgb, #f43f5e 22%, transparent) 55%,
      color-mix(in srgb, color-mix(in srgb, #f43f5e 80%, black) 22%, transparent) 100%
    );
  }

  .features-grid {
    max-width: 80rem;
    margin: 0 auto;
  }

  @media (max-width: 767px) {
    .features-panel {
      padding: 2rem 0.75rem;
      border-radius: 1.75rem;
    }
  }

  /* ─── Нижнее свечение ────────────────────────────────────── */
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
  :global(.dark) .bottom-gradient-bg {
    opacity: 0.22;
  }
</style>