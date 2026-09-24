<script lang="ts">
  import FlameWrap from "$lib/components/ui-registry/FlameWrap.svelte";

  const flameColor: [number, number, number] = [0.956, 0.247, 0.369];

  // Шестерня: считаем контур зубьев по кругу
  function buildGearPath(
    cx: number,
    cy: number,
    teeth: number,
    rOuter: number,
    rInner: number,
  ): string {
    const step = (Math.PI * 2) / teeth;
    // доли шага: подъём, вершина, спуск, впадина
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
</script>

<section class="services-grid">
  <style>
    /* ── Grid ────────────────────────────────────────────────────────── */
    .services-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      width: 100%;
      box-sizing: border-box;
    }

    .card-devsecops { grid-column: 1 / -1; grid-row: 1; }
    .card-pentest   { grid-column: 1; grid-row: 2; }
    .card-review    { grid-column: 2; grid-row: 2; }
    .card-leak      { grid-column: 1; grid-row: 3; }
    .card-consult   { grid-column: 2; grid-row: 3; }
    .card-trouble   { grid-column: 1 / -1; grid-row: 4; }

    .flame-slot { margin-top: 2.5rem; }

    @media (max-width: 600px) {
      .services-grid { grid-template-columns: 1fr; }
      .card-devsecops,
      .card-pentest,
      .card-review,
      .card-leak,
      .card-consult,
      .card-trouble { grid-column: 1; grid-row: auto; }
    }

    /* ── Shared card shell ─────── */
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
      .card-wide .card-inner { flex-direction: column; }
      .card-wide .visual-area { width: 100%; height: 9.5rem; }
    }

    /* ── Visual area / text ──────────────────────────────────────────── */
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

    @media (min-width: 768px) {
      .card-title { font-size: 1.125rem; }
      .card-desc  { font-size: 0.9rem; }
      .card-badge { font-size: 0.65rem; }
      .card-tag   { font-size: 0.6rem; }
    }

    /* ═══ PENTEST ═══ */
    .pt-visual { position: absolute; inset: 0; }
    .pt-vline {
      position: absolute; left: 50%; top: 0; bottom: 0; width: 1px;
      background: color-mix(in srgb, var(--foreground, #fff) 12%, transparent);
    }
    .pt-arc-outer, .pt-arc-outer-accent {
      position: absolute; left: -3rem; right: -3rem; top: 1.2rem;
      aspect-ratio: 1; border-radius: 50%;
    }
    .pt-arc-outer {
      border: 1px solid color-mix(in srgb, var(--foreground, #fff) 10%, transparent);
    }
    .pt-arc-outer-accent {
      border: 1px solid var(--accent, #e8834a);
      -webkit-mask-image: linear-gradient(90deg, transparent 50%, black 50%);
      mask-image: linear-gradient(90deg, transparent 50%, black 50%);
    }
    .pt-arc-inner, .pt-arc-inner-accent {
      position: absolute; left: 0; right: 0; top: 3.5rem;
      aspect-ratio: 1; border-radius: 50%;
    }
    .pt-arc-inner {
      border: 1px solid color-mix(in srgb, var(--foreground, #fff) 10%, transparent);
    }
    .pt-arc-inner-accent {
      border: 1px solid var(--accent, #e8834a);
      -webkit-mask-image: linear-gradient(90deg, black 50%, transparent 50%);
      mask-image: linear-gradient(90deg, black 50%, transparent 50%);
    }

    /* ═══ CODE REVIEW ═══ */
    .dev-bars {
      display: flex; align-items: flex-end; justify-content: space-between;
      height: 100%; padding: 1.25rem 1.25rem 0.5rem;
    }
    .dev-bar {
      flex: 1;
      background: color-mix(in srgb, var(--foreground, #fff) 12%, transparent);
      border-radius: 2px 2px 0 0; min-width: 3px; max-width: 7px;
    }
    .dev-bar-accent { background: var(--accent, #e8834a) !important; }

    /* ═══ SVG-иллюстрации (общие, без анимаций) ═══ */
    .svg-visual {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      color: var(--foreground, #fff);
    }
    .svg-visual svg { height: auto; }
    .leak-visual svg   { width: min(82%, 12rem); }
    .shield-visual svg { width: min(88%, 14rem); }
    .chat-visual svg   { width: min(88%, 14rem); }
    .gear-visual svg   { width: min(70%, 10rem); }
  </style>

  <!-- ══════════════════════════════════════════════════════════════════
       1. ИНТЕГРАЦИЯ DEVSECOPS — щит
       ══════════════════════════════════════════════════════════════════ -->
  <div class="card-devsecops flame-slot">
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
      <div class="card-shell card-wide">
        <div class="card-inner">
          <div class="visual-area">
            <div class="svg-visual shield-visual" aria-hidden="true">
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Щит: внешний контур -->
                <path
                  d="M100 44
                     L138 57
                     L138 95
                     C138 120 120 138 100 148
                     C80 138 62 120 62 95
                     L62 57
                     Z"
                  stroke="color-mix(in srgb, var(--foreground, #fff) 80%, transparent)"
                  stroke-width="2"
                  stroke-linejoin="round"
                  fill="none"
                />
                <!-- Щит: внутренний контур -->
                <path
                  d="M100 52
                     L132 63
                     L132 95
                     C132 116 116 132 100 141
                     C84 132 68 116 68 95
                     L68 63
                     Z"
                  stroke="color-mix(in srgb, var(--foreground, #fff) 55%, transparent)"
                  stroke-width="1.2"
                  stroke-linejoin="round"
                  fill="none"
                />
                <!-- Галочка -->
                <path
                  d="M82 98 L95 112 L120 84"
                  stroke="var(--accent, #f03e5f)"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  fill="none"
                />
              </svg>
            </div>
          </div>
          <div class="card-body">
            <div class="card-meta">
              <p class="card-badge">Услуга</p>
              <span class="card-tag">Рекомендуется</span>
            </div>
            <h3 class="card-title">Интеграция DevSecOps</h3>
            <p class="card-desc">
              Выстраиваю DevSecOps в вашем проекте под ключ: от автоматических
              проверок кода и зависимостей до безопасных пайплайнов и понятных
              правил для команды. Безопасность становится частью обычной
              разработки, а не отдельным этапом в конце.
            </p>
          </div>
        </div>
      </div>
    </FlameWrap>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════
       2. ПРОВЕРКА БЕЗОПАСНОСТИ
       ══════════════════════════════════════════════════════════════════ -->
  <div class="card-shell card-pentest">
    <div class="card-inner">
      <div class="visual-area">
        <div class="pt-visual" aria-hidden="true">
          <div class="pt-vline"></div>
          <div class="pt-arc-outer"></div>
          <div class="pt-arc-outer-accent"></div>
          <div class="pt-arc-inner"></div>
          <div class="pt-arc-inner-accent"></div>
        </div>
      </div>
      <div class="card-body">
        <div class="card-meta">
          <p class="card-badge">Услуга</p>
        </div>
        <h3 class="card-title">
          Проверка безопасности (blackbox, graybox, whitebox)
        </h3>
        <p class="card-desc">
          Проверяю сайт, приложение или API в подходящем формате: снаружи, с
          частичным доступом или с полным доступом к коду и ручной проверкой
          находок.
        </p>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════
       3. CODE REVIEW БЕЗОПАСНОСТИ
       ══════════════════════════════════════════════════════════════════ -->
  <div class="card-shell card-review">
    <div class="card-inner">
      <div class="visual-area" aria-hidden="true">
        <div class="dev-bars">
          {#each Array(28) as _, i (i)}
            {@const heights = [
              55, 40, 70, 45, 90, 60, 35, 80, 50, 75, 42, 88, 30, 65, 48, 92,
              38, 72, 55, 85, 44, 68, 36, 78, 52, 62, 47, 58,
            ]}
            <div
              class="dev-bar"
              class:dev-bar-accent={[4, 9, 12, 18, 23, 26].includes(i)}
              style="height: {heights[i % heights.length]}%"
            ></div>
          {/each}
        </div>
      </div>
      <div class="card-body">
        <div class="card-meta">
          <p class="card-badge">Услуга</p>
        </div>
        <h3 class="card-title">Code review безопасности</h3>
        <p class="card-desc">
          Разбираю исходный код на уязвимости: от хардкод-паролей, ключей API и
          токенов (в том числе в git-истории) до слабых мест в логике, например
          обхода проверок доступа и защиты, держащейся лишь на флаге или
          настройке. Помогаю исправить найденное.
        </p>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════
       4. ПОИСК УТЕЧЕК ДАННЫХ — перерисованная лупа
       ══════════════════════════════════════════════════════════════════ -->
  <div class="card-shell card-leak">
    <div class="card-inner">
      <div class="visual-area" aria-hidden="true">
        <div class="svg-visual leak-visual">
          <svg viewBox="0 0 180 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Линза: центр (74, 60), r=36 -->
            <circle
              cx="74" cy="60" r="36"
              fill="color-mix(in srgb, currentColor 8%, transparent)"
              stroke="currentColor"
              stroke-width="2.5"
            />
            <!-- Внутренний тонкий ободок -->
            <circle
              cx="74" cy="60" r="29"
              stroke="color-mix(in srgb, currentColor 30%, transparent)"
              stroke-width="1"
              fill="none"
            />
            <!-- Ручка: начинается на внешнем крае линзы
                 (74+36*cos45, 60+36*sin45) = (99.5, 85.5), внутрь не заходит -->
            <path
              d="M100 86 L134 120"
              stroke="currentColor"
              stroke-width="9"
              stroke-linecap="round"
            />
            <!-- Строки «данных» внутри линзы -->
            <path
              d="M58 52H90"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              opacity="0.7"
            />
            <path
              d="M58 62H84"
              stroke="var(--accent, #e8834a)"
              stroke-width="2.5"
              stroke-linecap="round"
            />
            <path
              d="M58 72H76"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              opacity="0.7"
            />
            <!-- Блик на стекле -->
            <path
              d="M50 44C55 36 63 32 71 31"
              stroke="var(--accent, #e8834a)"
              stroke-width="2.5"
              stroke-linecap="round"
            />
          </svg>
        </div>
      </div>
      <div class="card-body">
        <div class="card-meta">
          <p class="card-badge">Услуга</p>
        </div>
        <h3 class="card-title">Поиск утечек данных (Data Leak Search)</h3>
        <p class="card-desc">
          Проверяю, не утекли ли ваши конфиденциальные данные в интернет: ищу в
          слитых базах и дампах, публичных архивах, открытых источниках (OSINT)
          и других местах, где они могли оказаться.
        </p>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════
       5. КОНСУЛЬТАЦИЯ
       ══════════════════════════════════════════════════════════════════ -->
  <div class="card-shell card-consult">
    <div class="card-inner">
      <div class="visual-area" aria-hidden="true">
        <div class="svg-visual chat-visual">
          <svg viewBox="0 0 220 130" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Облачко клиента -->
            <path
              d="M22 18H112C118.6 18 124 23.4 124 30V58C124 64.6 118.6 70 112 70H52L34 84V70H22C15.4 70 10 64.6 10 58V30C10 23.4 15.4 18 22 18Z"
              fill="color-mix(in srgb, currentColor 14%, transparent)"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linejoin="round"
            />
            <text
              x="28" y="51"
              font-family="ui-monospace, monospace"
              font-size="22" font-weight="700"
              fill="currentColor"
            >?</text>
            <path
              d="M56 36C62 32 68 40 74 36C80 32 86 40 92 36C98 32 104 40 110 36"
              stroke="currentColor"
              stroke-width="1.8" stroke-linecap="round" fill="none"
            />
            <path
              d="M56 52C62 48 68 56 74 52C80 48 86 56 92 52"
              stroke="currentColor"
              stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.6"
            />

            <!-- Облачко ответа -->
            <path
              d="M108 62H198C204.6 62 210 67.4 210 74V102C210 108.6 204.6 114 198 114H186V128L168 114H108C101.4 114 96 108.6 96 102V74C96 67.4 101.4 62 108 62Z"
              fill="color-mix(in srgb, var(--accent, #e8834a) 15%, transparent)"
              stroke="var(--accent, #e8834a)"
              stroke-width="1.8"
              stroke-linejoin="round"
            />
            <path
              d="M112 80C118 76 124 84 130 80C136 76 142 84 148 80C154 76 160 84 166 80C172 76 178 84 184 80C190 76 194 82 198 80"
              stroke="var(--accent, #e8834a)"
              stroke-width="1.8" stroke-linecap="round" fill="none"
            />
            <path
              d="M112 96C118 92 124 100 130 96C136 92 142 100 148 96C154 92 160 100 166 96"
              stroke="var(--accent, #e8834a)"
              stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.6"
            />
          </svg>
        </div>
      </div>
      <div class="card-body">
        <div class="card-meta">
          <p class="card-badge">Услуга</p>
        </div>
        <h3 class="card-title">Консультация</h3>
        <p class="card-desc">
          Помогу разобраться с задачей: подскажу подходящие инструменты, оценю
          архитектуру и безопасность, отвечу на вопросы по DevSecOps,
          инфраструктуре и автоматизации.
        </p>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════
       6. ПОИСК И УСТРАНЕНИЕ НЕПОЛАДОК — одна большая шестерня в стиле щита
       ══════════════════════════════════════════════════════════════════ -->
  <div class="card-trouble flame-slot">
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
      <div class="card-shell card-wide">
        <div class="card-inner">
          <div class="visual-area">
            <div class="svg-visual gear-visual" aria-hidden="true">
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Внешний контур шестерни (яркий, как внешний контур щита) -->
                <path
                  d={gearOuter}
                  stroke="color-mix(in srgb, var(--foreground, #fff) 80%, transparent)"
                  stroke-width="2"
                  stroke-linejoin="round"
                  fill="none"
                />
                <!-- Внутренний контур зубьев (приглушённый) -->
                <path
                  d={gearInner}
                  stroke="color-mix(in srgb, var(--foreground, #fff) 55%, transparent)"
                  stroke-width="1.2"
                  stroke-linejoin="round"
                  fill="none"
                />
                <!-- Кольцо тела шестерни -->
                <circle
                  cx="100" cy="100" r="34"
                  stroke="color-mix(in srgb, var(--foreground, #fff) 30%, transparent)"
                  stroke-width="1.5"
                  fill="none"
                />
                <!-- Центральное отверстие -->
                <circle
                  cx="100" cy="100" r="20"
                  stroke="color-mix(in srgb, var(--foreground, #fff) 55%, transparent)"
                  stroke-width="1.2"
                  fill="none"
                />
                <!-- Акцентная точка в центре -->
                <circle cx="100" cy="100" r="7" fill="var(--accent, #f03e5f)" />
              </svg>
            </div>
          </div>
          <div class="card-body">
            <div class="card-meta">
              <p class="card-badge">Услуга</p>
              <span class="card-tag">Рекомендуется</span>
            </div>
            <h3 class="card-title">Поиск и устранение неполадок</h3>
            <p class="card-desc">
              Что-то не запускается, тормозит или настроено «как получилось»?
              Нахожу причину и исправляю: Docker, Linux-серверы, конфигурации,
              пайплайны. Помогаю с настройкой, оптимизацией и проверкой, чтобы
              всё работало стабильно.
            </p>
          </div>
        </div>
      </div>
    </FlameWrap>
  </div>
</section>