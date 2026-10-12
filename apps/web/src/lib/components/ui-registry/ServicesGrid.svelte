<script lang="ts">
  import FlameWrap from "$lib/components/ui-registry/FlameWrap.svelte";

  type VisualKind =
    | "shield"
    | "pentest"
    | "review"
    | "leak"
    | "perimeter"
    | "access"
    | "compliance"
    | "docs"
    | "automation"
    | "consult"
    | "gear"
    | "web";

  type Service = {
    id: string;
    title: string;
    description: string;
    price: string;
    visual: VisualKind;
    wide?: boolean;
    recommended?: boolean;
  };

  const services: Service[] = [
    {
      id: "devsecops",
      title: "Интеграция DevSecOps",
      description:
        "Встраиваем автоматические проверки безопасности в ваши CI/CD-пайплайны: анализ кода и зависимостей, поиск секретов, безопасные сборки и понятные правила для команды. Безопасность становится частью обычной разработки, а не отдельным этапом в конце.",
      price: "3 000 ₽/час",
      visual: "shield",
      wide: true,
      recommended: true,
    },
    {
      id: "pentest",
      title: "Пентест (blackbox, graybox, whitebox)",
      description:
        "Проверяем сайт или приложение так, как это сделал бы внешний атакующий. Каждую находку подтверждаем вручную и объясняем, как её исправить. Graybox и whitebox (с частичным или полным доступом) — по отдельному scope и смете.",
      price: "от 75 000 ₽",
      visual: "pentest",
    },
    {
      id: "review",
      title: "Code review безопасности",
      description:
        "Разбираем исходный код на уязвимости: хардкод-пароли, ключи API и токены (в том числе в git-истории), слабые места в логике, обход проверок доступа. Помогаем исправить найденное.",
      price: "от 30 000 ₽",
      visual: "review",
    },
    {
      id: "leak",
      title: "Поиск утечек данных (Data Leak Search)",
      description:
        "Проверяем, не оказались ли данные вашего бренда или домена в открытом доступе: публичные архивы, открытые источники (OSINT), доступные дампы. Каждую находку верифицируем и описываем в отчёте.",
      price: "от 9 900 ₽",
      visual: "leak",
    },
    {
      id: "perimeter",
      title: "Аудит внешнего периметра и OSINT",
      description:
        "Выясняем, что о вашей инфраструктуре можно узнать снаружи: открытые сервисы, забытые поддомены, доступные конфигурационные файлы и резервные копии, упоминания в публичных источниках. Безопасно проверяем найденные риски в согласованных границах.",
      price: "от 50 000 ₽",
      visual: "perimeter",
    },
    {
      id: "access",
      title: "Управление доступами и ролями",
      description:
        "Проверяем, кто и к каким данным и системам имеет доступ, находим избыточные права и строим ролевую модель по принципу минимально необходимых привилегий. Снижаем риски ошибок сотрудников и внутренних угроз.",
      price: "от 9 900 ₽",
      visual: "access",
    },
    {
      id: "compliance",
      title: "Комплаенс и управление ИБ-рисками",
      description:
        "Оцениваем, насколько ваши процессы и системы соответствуют требованиям 152-ФЗ и ISO/IEC 27001, находим пробелы и риски. Составляем понятный план: что исправить в первую очередь, а что можно отложить.",
      price: "от 14 900 ₽",
      visual: "compliance",
    },
    {
      id: "docs",
      title: "Документы и регламенты информационной безопасности",
      description:
        "Готовим документы под процессы вашей компании: политику конфиденциальности, положение об обработке персональных данных, правила разграничения доступа, инструкции для сотрудников и внутренние регламенты.",
      price: "от 9 900 ₽",
      visual: "docs",
    },
    {
      id: "automation",
      title: "Автоматизация",
      description:
        "Берём на себя рутину инфраструктуры: ежедневные бэкапы данных и логов, управление сетью и firewall-правилами, ротацию ключей доступа, мониторинг сервисов, оптимизацию git-репозиториев и очистку устаревших артефактов.",
      price: "от 32 000 ₽",
      visual: "automation",
    },
    {
      id: "consult",
      title: "Консультация",
      description:
        "Поможем разобраться с задачей: подскажем подходящие инструменты, оценим архитектуру и безопасность, ответим на вопросы по DevSecOps, инфраструктуре и автоматизации.",
      price: "По запросу",
      visual: "consult",
    },
    {
      id: "trouble",
      title: "Поиск и устранение неполадок",
      description:
        "Что-то не запускается, тормозит или настроено «как получилось»? Находим причину и исправляем: Docker, Linux-серверы, конфигурации, CI/CD-пайплайны. Помогаем с настройкой и проверкой, чтобы всё работало стабильно.",
      price: "от 7 800 ₽",
      visual: "gear",
      wide: true,
      recommended: true,
    },
    {
      id: "web",
      title: "Разработка сайтов и веб-приложений",
      description:
        "Разрабатываем сайты для бизнеса: лендинги, корпоративные сайты, а при необходимости — веб-приложения с авторизацией и ролями. Подключаем API и внешние сервисы, уделяем внимание безопасности, производительности и удобству.",
      price: "от 35 000 ₽",
      visual: "web",
      wide: true,
      recommended: true,
    },
  ];

  const BAR_HEIGHTS = [
    55, 40, 70, 45, 90, 60, 35, 80, 50, 75, 42, 88, 30, 65, 48, 92, 38, 72, 55,
    85, 44, 68, 36, 78, 52, 62, 47, 58,
  ];
  const ACCENT_BARS = new Set([4, 9, 12, 18, 23, 26]);

  const AUTOMATION_ITEMS = [
    "бэкап данных и логов",
    "правила firewall",
    "ротация ключей доступа",
  ];

  function buildGearPath(
    cx: number,
    cy: number,
    teeth: number,
    rOuter: number,
    rInner: number,
  ): string {
    const step = (Math.PI * 2) / teeth;
    const a = step * 0.18;
    const b = step * 0.32;
    const c = step * 0.68;
    const d = step * 0.82;
    const pts: string[] = [];
    for (let i = 0; i < teeth; i++) {
      const base = i * step - Math.PI / 2;
      const seq: [number, number][] = [
        [base + a, rInner],
        [base + b, rOuter],
        [base + c, rOuter],
        [base + d, rInner],
      ];
      for (const [ang, r] of seq) {
        pts.push(
          `${(cx + Math.cos(ang) * r).toFixed(2)} ${(cy + Math.sin(ang) * r).toFixed(2)}`,
        );
      }
    }
    return `M${pts.join(" L")} Z`;
  }

  const gearOuter = buildGearPath(100, 100, 12, 72, 58);
  const gearInner = buildGearPath(100, 100, 12, 64, 52);

  const flameColor: [number, number, number] = [0.956, 0.247, 0.369];
</script>

{#snippet visual(kind: VisualKind)}
  {#if kind === "shield"}
    <div class="svg-visual shield-visual" aria-hidden="true">
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 44 L138 57 L138 95 C138 120 120 138 100 148 C80 138 62 120 62 95 L62 57 Z" stroke="color-mix(in srgb, var(--foreground, #fff) 80%, transparent)" stroke-width="2" stroke-linejoin="round" fill="none" />
        <path d="M100 52 L132 63 L132 95 C132 116 116 132 100 141 C84 132 68 116 68 95 L68 63 Z" stroke="color-mix(in srgb, var(--foreground, #fff) 55%, transparent)" stroke-width="1.2" stroke-linejoin="round" fill="none" />
        <path d="M82 98 L95 112 L120 84" stroke="var(--accent, #f03e5f)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      </svg>
    </div>
  {:else if kind === "pentest"}
    <div class="pt-visual" aria-hidden="true">
      <div class="pt-vline"></div>
      <div class="pt-arc-outer"></div>
      <div class="pt-arc-outer-accent"></div>
      <div class="pt-arc-inner"></div>
      <div class="pt-arc-inner-accent"></div>
    </div>
  {:else if kind === "review"}
    <div class="dev-bars" aria-hidden="true">
      {#each BAR_HEIGHTS as h, i (i)}
        <div class="dev-bar" class:dev-bar-accent={ACCENT_BARS.has(i)} style="height: {h}%"></div>
      {/each}
    </div>
  {:else if kind === "leak"}
    <div class="svg-visual" aria-hidden="true">
      <svg viewBox="0 0 180 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="74" cy="60" r="36" fill="color-mix(in srgb, currentColor 8%, transparent)" stroke="currentColor" stroke-width="2.5" />
        <circle cx="74" cy="60" r="29" stroke="color-mix(in srgb, currentColor 30%, transparent)" stroke-width="1" fill="none" />
        <path d="M100 86 L134 120" stroke="currentColor" stroke-width="9" stroke-linecap="round" />
        <path d="M58 52H90" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.7" />
        <path d="M58 62H84" stroke="var(--accent, #e8834a)" stroke-width="2.5" stroke-linecap="round" />
        <path d="M58 72H76" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.7" />
        <path d="M50 44C55 36 63 32 71 31" stroke="var(--accent, #e8834a)" stroke-width="2.5" stroke-linecap="round" />
      </svg>
    </div>
  {:else if kind === "perimeter"}
    <div class="svg-visual" aria-hidden="true">
      <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="70" r="60" stroke="color-mix(in srgb, currentColor 18%, transparent)" stroke-width="1.2" />
        <circle cx="100" cy="70" r="40" stroke="color-mix(in srgb, currentColor 30%, transparent)" stroke-width="1.2" />
        <circle cx="100" cy="70" r="20" stroke="color-mix(in srgb, currentColor 50%, transparent)" stroke-width="1.4" />
        <path d="M100 4V136M34 70H166" stroke="color-mix(in srgb, currentColor 14%, transparent)" stroke-width="1" />
        <path d="M100 70L142 28" stroke="var(--accent, #e8834a)" stroke-width="2" stroke-linecap="round" />
        <circle cx="100" cy="70" r="4" fill="currentColor" />
        <circle cx="142" cy="28" r="5" fill="var(--accent, #e8834a)" />
        <circle cx="62" cy="48" r="3.5" fill="var(--accent, #e8834a)" opacity="0.7" />
        <circle cx="128" cy="104" r="3" fill="currentColor" opacity="0.6" />
        <circle cx="52" cy="96" r="3" fill="currentColor" opacity="0.6" />
      </svg>
    </div>
  {:else if kind === "access"}
    <div class="svg-visual" aria-hidden="true">
      <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 42V62M100 62H40V86M100 62H160V86M100 62V86" stroke="color-mix(in srgb, currentColor 40%, transparent)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="100" cy="28" r="14" fill="color-mix(in srgb, currentColor 8%, transparent)" stroke="currentColor" stroke-width="2" />
        <circle cx="100" cy="28" r="4.5" fill="var(--accent, #e8834a)" />
        <rect x="22" y="86" width="36" height="28" rx="6" stroke="color-mix(in srgb, currentColor 55%, transparent)" stroke-width="1.6" />
        <rect x="82" y="86" width="36" height="28" rx="6" fill="color-mix(in srgb, var(--accent, #e8834a) 14%, transparent)" stroke="var(--accent, #e8834a)" stroke-width="1.8" />
        <rect x="142" y="86" width="36" height="28" rx="6" stroke="color-mix(in srgb, currentColor 55%, transparent)" stroke-width="1.6" />
        <path d="M92 100l5 5 11-11" stroke="var(--accent, #e8834a)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M152 100H168" stroke="color-mix(in srgb, currentColor 40%, transparent)" stroke-width="2" stroke-linecap="round" />
        <path d="M32 100H48" stroke="color-mix(in srgb, currentColor 40%, transparent)" stroke-width="2" stroke-linecap="round" />
      </svg>
    </div>
  {:else if kind === "compliance"}
    <div class="svg-visual" aria-hidden="true">
      <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M58 14H112L142 44V122C142 125 140 127 137 127H58C55 127 53 125 53 122V19C53 16 55 14 58 14Z" fill="color-mix(in srgb, currentColor 8%, transparent)" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
        <path d="M112 14V44H142" stroke="color-mix(in srgb, currentColor 50%, transparent)" stroke-width="1.6" stroke-linejoin="round" />
        <path d="M68 62H126M68 76H116M68 90H100" stroke="color-mix(in srgb, currentColor 40%, transparent)" stroke-width="2.5" stroke-linecap="round" />
        <circle cx="136" cy="108" r="20" fill="var(--background, #000)" stroke="var(--accent, #e8834a)" stroke-width="2.4" />
        <path d="M126 108l7 7 12-14" stroke="var(--accent, #e8834a)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>
  {:else if kind === "docs"}
    <div class="svg-visual" aria-hidden="true">
      <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="42" y="22" width="76" height="100" rx="7" transform="rotate(-8 80 72)" stroke="color-mix(in srgb, currentColor 28%, transparent)" stroke-width="1.4" />
        <rect x="62" y="16" width="76" height="100" rx="7" fill="var(--background, #000)" stroke="currentColor" stroke-width="2" />
        <path d="M76 36H122" stroke="var(--accent, #e8834a)" stroke-width="3" stroke-linecap="round" />
        <path d="M76 54H124M76 68H116M76 82H124M76 96H102" stroke="color-mix(in srgb, currentColor 40%, transparent)" stroke-width="2.2" stroke-linecap="round" />
        <circle cx="128" cy="104" r="9" stroke="var(--accent, #e8834a)" stroke-width="2" />
        <path d="M124 104l3 3 5-6" stroke="var(--accent, #e8834a)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>
  {:else if kind === "automation"}
    <div class="auto-visual" aria-hidden="true">
      {#each AUTOMATION_ITEMS as item, i (item)}
        <div class="auto-item" class:auto-item-muted={i === 2}>
          <span class="auto-check">✓</span>
          <span>{item}</span>
        </div>
      {/each}
    </div>
  {:else if kind === "consult"}
    <div class="svg-visual chat-visual" aria-hidden="true">
      <svg viewBox="0 0 220 130" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 18H112C118.6 18 124 23.4 124 30V58C124 64.6 118.6 70 112 70H52L34 84V70H22C15.4 70 10 64.6 10 58V30C10 23.4 15.4 18 22 18Z" fill="color-mix(in srgb, currentColor 14%, transparent)" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
        <text x="28" y="51" font-family="ui-monospace, monospace" font-size="22" font-weight="700" fill="currentColor">?</text>
        <path d="M56 36C62 32 68 40 74 36C80 32 86 40 92 36C98 32 104 40 110 36" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none" />
        <path d="M56 52C62 48 68 56 74 52C80 48 86 56 92 52" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.6" />
        <path d="M108 62H198C204.6 62 210 67.4 210 74V102C210 108.6 204.6 114 198 114H186V128L168 114H108C101.4 114 96 108.6 96 102V74C96 67.4 101.4 62 108 62Z" fill="color-mix(in srgb, var(--accent, #e8834a) 15%, transparent)" stroke="var(--accent, #e8834a)" stroke-width="1.8" stroke-linejoin="round" />
        <path d="M112 80C118 76 124 84 130 80C136 76 142 84 148 80C154 76 160 84 166 80C172 76 178 84 184 80C190 76 194 82 198 80" stroke="var(--accent, #e8834a)" stroke-width="1.8" stroke-linecap="round" fill="none" />
        <path d="M112 96C118 92 124 100 130 96C136 92 142 100 148 96C154 92 160 100 166 96" stroke="var(--accent, #e8834a)" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.6" />
      </svg>
    </div>
  {:else if kind === "gear"}
    <div class="svg-visual gear-visual" aria-hidden="true">
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d={gearOuter} stroke="color-mix(in srgb, var(--foreground, #fff) 80%, transparent)" stroke-width="2" stroke-linejoin="round" fill="none" />
        <path d={gearInner} stroke="color-mix(in srgb, var(--foreground, #fff) 55%, transparent)" stroke-width="1.2" stroke-linejoin="round" fill="none" />
        <circle cx="100" cy="100" r="34" stroke="color-mix(in srgb, var(--foreground, #fff) 30%, transparent)" stroke-width="1.5" fill="none" />
        <circle cx="100" cy="100" r="20" stroke="color-mix(in srgb, var(--foreground, #fff) 55%, transparent)" stroke-width="1.2" fill="none" />
        <circle cx="100" cy="100" r="7" fill="var(--accent, #f03e5f)" />
      </svg>
    </div>
  {:else if kind === "web"}
    <div class="svg-visual web-visual" aria-hidden="true">
      <svg viewBox="0 0 220 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="14" y="12" width="192" height="126" rx="10" fill="color-mix(in srgb, currentColor 6%, transparent)" stroke="color-mix(in srgb, var(--foreground, #fff) 80%, transparent)" stroke-width="2" />
        <path d="M14 38H206" stroke="color-mix(in srgb, var(--foreground, #fff) 40%, transparent)" stroke-width="1.4" />
        <circle cx="30" cy="25" r="3.5" fill="var(--accent, #f03e5f)" />
        <circle cx="43" cy="25" r="3.5" fill="color-mix(in srgb, currentColor 40%, transparent)" />
        <circle cx="56" cy="25" r="3.5" fill="color-mix(in srgb, currentColor 40%, transparent)" />
        <rect x="74" y="19" width="116" height="12" rx="6" stroke="color-mix(in srgb, currentColor 35%, transparent)" stroke-width="1.2" />
        <rect x="28" y="52" width="86" height="12" rx="4" fill="var(--accent, #f03e5f)" opacity="0.85" />
        <path d="M28 76H114M28 88H96" stroke="color-mix(in srgb, currentColor 40%, transparent)" stroke-width="2.4" stroke-linecap="round" />
        <rect x="28" y="104" width="40" height="18" rx="5" stroke="var(--accent, #f03e5f)" stroke-width="1.8" />
        <rect x="132" y="52" width="60" height="70" rx="6" stroke="color-mix(in srgb, currentColor 40%, transparent)" stroke-width="1.6" />
        <path d="M132 88L150 72L166 90L176 80L192 96" stroke="color-mix(in srgb, currentColor 55%, transparent)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>
  {/if}
{/snippet}

{#snippet card(s: Service)}
  <div class="card-shell" class:card-wide={s.wide}>
    <div class="card-inner">
      <div class="visual-area">
        {@render visual(s.visual)}
      </div>
      <div class="card-body">
        <div class="card-meta">
          <p class="card-badge">Услуга</p>
          {#if s.recommended}
            <span class="card-tag">Рекомендуется</span>
          {/if}
        </div>
        <h3 class="card-title">{s.title}</h3>
        <p class="card-desc">{s.description}</p>
        <div class="card-pricing">
          <p class="card-price">{s.price}</p>
        </div>
      </div>
    </div>
  </div>
{/snippet}

<section class="services-grid">
  {#each services as s (s.id)}
    <div class="service" class:service-wide={s.wide} class:flame-slot={s.recommended}>
      {#if s.recommended}
        <FlameWrap
          color={flameColor}
          radius={12}
          height={90}
          spread={8}
          intensity={0.5}
          sparks={1.2}
          smoke={1}
          scorch={0}
        >
          {@render card(s)}
        </FlameWrap>
      {:else}
        {@render card(s)}
      {/if}
    </div>
  {/each}
</section>

<style>
  .services-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    width: 100%;
    box-sizing: border-box;
  }

  .service {
    min-width: 0;
  }

  .service-wide {
    grid-column: 1 / -1;
  }

  .flame-slot {
    margin-top: 2.5rem;
  }

  @media (max-width: 600px) {
    .services-grid {
      grid-template-columns: 1fr;
    }
    .service-wide {
      grid-column: 1;
    }
  }

  .card-shell {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    border-radius: 0.75rem;
    background: var(--background-inset);
    padding: 0.375rem;
    height: 100%;
    box-sizing: border-box;
    box-shadow:
      inset 0px 1px 1px -0.5px rgba(0, 0, 0, 0.06),
      inset 0px 3px 3px -1.5px rgba(0, 0, 0, 0.06),
      inset 0px 6px 6px -3px rgba(0, 0, 0, 0.06),
      inset 0 -0.5px rgba(255, 255, 255, 0.08),
      inset 0 0 0 0.5px oklch(from var(--highlight) l c h / 8%);
  }

  .card-inner {
    position: relative;
    border-radius: 0.5rem;
    border: 1px solid var(--border);
    background: var(--background);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 18rem;
    height: 100%;
    box-sizing: border-box;
    box-shadow:
      0 -0.5px rgba(255, 255, 255, 0.08),
      0 4px 8px rgba(0, 0, 0, 0.06),
      0 0 0 0.5px oklch(from var(--highlight) l c h / 8%),
      0 1px 6px -4px #000;
  }

  .card-wide .card-inner {
    min-height: 11rem;
    flex-direction: row;
  }
  .card-wide .visual-area {
    width: 46%;
    height: auto;
    flex-shrink: 0;
  }
  .card-wide .card-body {
    flex: 1;
    justify-content: center;
  }

  @media (max-width: 600px) {
    .card-wide .card-inner {
      flex-direction: column;
    }
    .card-wide .visual-area {
      width: 100%;
      height: 9.5rem;
    }
  }

  .visual-area {
    position: relative;
    height: 9.5rem;
    overflow: hidden;
    flex-shrink: 0;
  }

  .card-body {
    padding: 1rem 1.25rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
  }

  .card-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }

  .card-badge {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--foreground-muted, rgba(255, 255, 255, 0.4));
    margin: 0;
  }

  .card-tag {
    display: inline-flex;
    align-items: center;
    height: 1.2rem;
    padding: 0 0.5rem;
    border-radius: 999px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.55rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent, #e8834a);
    background: color-mix(in srgb, var(--accent, #e8834a) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent, #e8834a) 35%, transparent);
  }

  .card-title {
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.3;
    color: var(--foreground);
    margin: 0;
  }

  .card-desc {
    font-size: 0.82rem;
    line-height: 1.6;
    color: var(--foreground-muted, rgba(255, 255, 255, 0.55));
    margin: 0;
    flex: 1;
  }

  .card-pricing {
    margin-top: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border, rgba(255, 255, 255, 0.1));
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .card-price {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 700;
    line-height: 1.2;
    color: var(--foreground);
    font-variant-numeric: tabular-nums;
  }

  @media (min-width: 768px) {
    .card-title {
      font-size: 1.125rem;
    }
    .card-desc {
      font-size: 0.9rem;
    }
    .card-price {
      font-size: 1.15rem;
    }
    .card-badge {
      font-size: 0.65rem;
    }
    .card-tag {
      font-size: 0.6rem;
    }
  }

  .pt-visual {
    position: absolute;
    inset: 0;
  }
  .pt-vline {
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 1px;
    background: color-mix(in srgb, var(--foreground, #fff) 12%, transparent);
  }
  .pt-arc-outer,
  .pt-arc-outer-accent {
    position: absolute;
    left: -3rem;
    right: -3rem;
    top: 1.2rem;
    aspect-ratio: 1;
    border-radius: 50%;
  }
  .pt-arc-outer {
    border: 1px solid color-mix(in srgb, var(--foreground, #fff) 10%, transparent);
  }
  .pt-arc-outer-accent {
    border: 1px solid var(--accent, #e8834a);
    -webkit-mask-image: linear-gradient(90deg, transparent 50%, black 50%);
    mask-image: linear-gradient(90deg, transparent 50%, black 50%);
  }
  .pt-arc-inner,
  .pt-arc-inner-accent {
    position: absolute;
    left: 0;
    right: 0;
    top: 3.5rem;
    aspect-ratio: 1;
    border-radius: 50%;
  }
  .pt-arc-inner {
    border: 1px solid color-mix(in srgb, var(--foreground, #fff) 10%, transparent);
  }
  .pt-arc-inner-accent {
    border: 1px solid var(--accent, #e8834a);
    -webkit-mask-image: linear-gradient(90deg, black 50%, transparent 50%);
    mask-image: linear-gradient(90deg, black 50%, transparent 50%);
  }

  .dev-bars {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    height: 100%;
    padding: 1.25rem 1.25rem 0.5rem;
  }
  .dev-bar {
    flex: 1;
    background: color-mix(in srgb, var(--foreground, #fff) 12%, transparent);
    border-radius: 2px 2px 0 0;
    min-width: 3px;
    max-width: 7px;
  }
  .dev-bar-accent {
    background: var(--accent, #e8834a) !important;
  }

  .auto-visual {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0 1.5rem;
  }
  .auto-item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    width: 100%;
    max-width: 18rem;
    min-height: 2rem;
    padding: 0.42rem 0.75rem;
    border-radius: 999px;
    border: 1px solid var(--border, rgba(255, 255, 255, 0.1));
    background: color-mix(in srgb, var(--background-inset) 70%, transparent);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.7rem;
    color: var(--foreground-muted, rgba(255, 255, 255, 0.55));
    overflow: hidden;
  }
  .auto-item span:last-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }
  .auto-check {
    display: grid;
    place-items: center;
    flex: 0 0 1.1rem;
    width: 1.1rem;
    height: 1.1rem;
    border-radius: 50%;
    background: var(--accent, #e8834a);
    color: #fff;
    font-size: 0.6rem;
    font-weight: 800;
  }
  .auto-item-muted {
    opacity: 0.6;
  }

  .svg-visual {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--foreground, #fff);
  }
  .svg-visual :global(svg) {
    width: min(78%, 11rem);
    height: auto;
  }
  .shield-visual :global(svg) {
    width: min(88%, 14rem);
  }
  .chat-visual :global(svg) {
    width: min(88%, 14rem);
  }
  .gear-visual :global(svg) {
    width: min(70%, 10rem);
  }
  .web-visual :global(svg) {
    width: min(86%, 15rem);
  }
</style>