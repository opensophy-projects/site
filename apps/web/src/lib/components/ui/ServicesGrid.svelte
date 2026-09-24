<script lang="ts">
  import AsciiObject from "$lib/components/ui-registry/AsciiObject.svelte";
  import FlameWrap from "$lib/components/ui-registry/FlameWrap.svelte";

  const flameColor: [number, number, number] = [0.956, 0.247, 0.369];

  // Цвет ASCII-рендеров совпадает с акцентом сайта (--accent)
  const asciiColor = "#f43f5e";
  // Серый для «приглушённых» частей рисунков (как foreground 12–55% в оригинале)
  const asciiGray = "#6b6b76";

  // ── Размеры рисунков (scale) — крутить тут ─────────────────────────
  const SCALE = {
    shield: 4.4, // было 5 — чуть меньше
    pentest: 6, // viewBox 450×152 ≈ размер карточки
    review: 6, // viewBox 450×152 ≈ размер карточки
    leak: 4.2, // было 5 — поменьше
    consult: 6.5, // было 5 — побольше
    gear: 4.4, // как щит
  };

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

  // Обёртка svg -> data URL: AsciiObject грузит src через fetch,
  // data: URL работает без дополнительных файлов в /static
  const svgSource = (svg: string) =>
    `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  // ── Щит ────────────────────────────────────────────────────────────
  const shieldSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <path fill="#ffffff" d="M100 44 L138 57 L138 95 C138 120 120 138 100 148 C80 138 62 120 62 95 L62 57 Z"/>
    <path fill="#000000" fill-rule="evenodd" d="M100 44 L138 57 L138 95 C138 120 120 138 100 148 C80 138 62 120 62 95 L62 57 Z M100 52 L132 63 L132 95 C132 116 116 132 100 141 C84 132 68 116 68 95 L68 63 Z"/>
    <path fill="#ffffff" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" d="M82 98 L95 112 L120 84"/>
  </svg>`;

  // ── Проверка безопасности: как в оригинале ─────────────────────────
  // Холст 450×152 (≈ размер области рисунка). Большие дуги выходят за края
  // и обрезаются, вертикальная линия по центру.
  // Серый слой: вертикаль + левая половина внешней дуги + правая половина внутренней.
  // Акцентный слой: правая половина внешней дуги + левая половина внутренней.
  const pentestGraySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 152">
    <rect x="223" y="0" width="4" height="152" fill="#ffffff"/>
    <path d="M225 19.2 A273 273 0 0 0 225 565.2" fill="none" stroke="#ffffff" stroke-width="4"/>
    <path d="M225 56 A225 225 0 0 1 225 506" fill="none" stroke="#ffffff" stroke-width="4"/>
  </svg>`;
  const pentestAccentSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 152">
    <path d="M225 19.2 A273 273 0 0 1 225 565.2" fill="none" stroke="#ffffff" stroke-width="4"/>
    <path d="M225 56 A225 225 0 0 0 225 506" fill="none" stroke="#ffffff" stroke-width="4"/>
  </svg>`;

  // ── Code review: столбики, в основном серые + немного акцентных ────
  const barsHeights = [
    55, 40, 70, 45, 90, 60, 35, 80, 50, 75, 42, 88, 30, 65, 48, 92, 38, 72, 55,
    85, 44, 68, 36, 78, 52, 62, 47, 58,
  ];
  const accentBars = new Set([4, 9, 12, 18, 23, 26]);

  const buildBars = (accent: boolean) => {
    const padX = 20;
    const baseY = 146;
    const maxH = 122;
    const slot = (450 - padX * 2) / barsHeights.length;
    const bw = 8;
    const rects = barsHeights
      .map((h, i) => {
        if (accentBars.has(i) !== accent) return "";
        const bh = (h / 100) * maxH;
        const x = padX + i * slot + (slot - bw) / 2;
        return `<rect x="${x.toFixed(2)}" y="${(baseY - bh).toFixed(2)}" width="${bw}" height="${bh.toFixed(2)}" rx="1.5" fill="#ffffff"/>`;
      })
      .join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 152">${rects}</svg>`;
  };
  const barsGraySvg = buildBars(false);
  const barsAccentSvg = buildBars(true);

  // ── Лупа ───────────────────────────────────────────────────────────
  const leakSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 140">
    <circle cx="74" cy="60" r="36" fill="#ffffff"/>
    <circle cx="74" cy="60" r="29" fill="#000000" fill-rule="evenodd"/>
    <path fill="#ffffff" stroke="#ffffff" stroke-width="2" stroke-linecap="round" d="M58 52H90"/>
    <path fill="#ffffff" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" d="M58 62H84"/>
    <path fill="#ffffff" stroke="#ffffff" stroke-width="2" stroke-linecap="round" d="M58 72H76"/>
    <path d="M100 86 L134 120" stroke="#ffffff" stroke-width="9" stroke-linecap="round"/>
    <path d="M50 44C55 36 63 32 71 31" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  </svg>`;

  // ── Консультация: одно облачко серое, второе акцентное ─────────────
  // Серый слой — облачко клиента (с «?» и строчками)
  const chatGraySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 130">
    <path fill="#ffffff" d="M22 18H112C118.6 18 124 23.4 124 30V58C124 64.6 118.6 70 112 70H52L34 84V70H22C15.4 70 10 64.6 10 58V30C10 23.4 15.4 18 22 18Z"/>
    <text x="28" y="51" font-family="ui-monospace, monospace" font-size="22" font-weight="700" fill="#000000">?</text>
    <path d="M56 36C62 32 68 40 74 36C80 32 86 40 92 36C98 32 104 40 110 36" stroke="#000000" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    <path d="M56 52C62 48 68 56 74 52C80 48 86 56 92 52" stroke="#000000" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  </svg>`;
  // Акцентный слой — облачко ответа
  const chatAccentSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 130">
    <path fill="#ffffff" d="M108 62H198C204.6 62 210 67.4 210 74V102C210 108.6 204.6 114 198 114H186V128L168 114H108C101.4 114 96 108.6 96 102V74C96 67.4 101.4 62 108 62Z"/>
    <path d="M112 80C118 76 124 84 130 80C136 76 142 84 148 80C154 76 160 84 166 80C172 76 178 84 184 80C190 76 194 82 198 80" stroke="#000000" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    <path d="M112 96C118 92 124 100 130 96C136 92 142 100 148 96C154 92 160 100 166 96" stroke="#000000" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  </svg>`;

  // ── Шестерня ───────────────────────────────────────────────────────
  const gearSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <path fill="#ffffff" d="${gearOuter}"/>
    <path fill="#000000" fill-rule="evenodd" d="${gearOuter} M100 134 A34 34 0 1 1 100 66 A34 34 0 1 1 100 134 Z"/>
    <path fill="#ffffff" d="M100 134 A34 34 0 1 1 100 66 A34 34 0 1 1 100 134 Z M100 120 A20 20 0 1 1 100 80 A20 20 0 1 1 100 120 Z"/>
    <circle cx="100" cy="100" r="7" fill="#ffffff"/>
  </svg>`;

  const asciiVisuals = {
    shield: svgSource(shieldSvg),
    pentestGray: svgSource(pentestGraySvg),
    pentestAccent: svgSource(pentestAccentSvg),
    reviewGray: svgSource(barsGraySvg),
    reviewAccent: svgSource(barsAccentSvg),
    leak: svgSource(leakSvg),
    consultGray: svgSource(chatGraySvg),
    consultAccent: svgSource(chatAccentSvg),
    gear: svgSource(gearSvg),
  };
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

    /* ═══ ASCII-рендеры иллюстраций (как логотип на главной) ═══ */
    .ascii-visual {
      position: absolute;
      inset: 0;
      pointer-events: none; /* отключаем вращение мышью */
    }
    /* Слои (серый + акцентный) лежат друг на друге в одной и той же области */
    .ascii-layer {
      position: absolute;
      inset: 0;
    }
  </style>

  <!-- ══════════════════════════════════════════════════════════════════
       1. ИНТЕГРАЦИЯ DEVSECOPS — щит (чуть меньше)
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
            <div class="ascii-visual" aria-hidden="true">
              <AsciiObject
                src={asciiVisuals.shield}
                colored={false}
                color={asciiColor}
                highlight={asciiColor}
                class="h-full w-full"
                background=""
                cellSize={6}
                scale={SCALE.shield}
                orbit={false}
                autoRotate={false}
                rotationIntensity={0}
                floatIntensity={1.2}
                floatSpeed={1.5}
              />
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
       2. ПРОВЕРКА БЕЗОПАСНОСТИ — как в оригинале, без левитации
       ══════════════════════════════════════════════════════════════════ -->
  <div class="card-shell card-pentest">
    <div class="card-inner">
      <div class="visual-area">
        <div class="ascii-visual" aria-hidden="true">
          <!-- серый слой: вертикаль + приглушённые половины дуг -->
          <div class="ascii-layer">
            <AsciiObject
              src={asciiVisuals.pentestGray}
              colored={false}
              color={asciiGray}
              highlight={asciiGray}
              class="h-full w-full"
              background=""
              cellSize={6}
              scale={SCALE.pentest}
              orbit={false}
              autoRotate={false}
              rotationIntensity={0}
              floatIntensity={0}
              floatSpeed={0}
            />
          </div>
          <!-- акцентный слой: яркие половины дуг -->
          <div class="ascii-layer">
            <AsciiObject
              src={asciiVisuals.pentestAccent}
              colored={false}
              color={asciiColor}
              highlight={asciiColor}
              class="h-full w-full"
              background=""
              cellSize={6}
              scale={SCALE.pentest}
              orbit={false}
              autoRotate={false}
              rotationIntensity={0}
              floatIntensity={0}
              floatSpeed={0}
            />
          </div>
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
       3. CODE REVIEW БЕЗОПАСНОСТИ — серые столбики + чуть акцентных,
          крупнее, без левитации
       ══════════════════════════════════════════════════════════════════ -->
  <div class="card-shell card-review">
    <div class="card-inner">
      <div class="visual-area" aria-hidden="true">
        <div class="ascii-visual">
          <div class="ascii-layer">
            <AsciiObject
              src={asciiVisuals.reviewGray}
              colored={false}
              color={asciiGray}
              highlight={asciiGray}
              class="h-full w-full"
              background=""
              cellSize={6}
              scale={SCALE.review}
              orbit={false}
              autoRotate={false}
              rotationIntensity={0}
              floatIntensity={0}
              floatSpeed={0}
            />
          </div>
          <div class="ascii-layer">
            <AsciiObject
              src={asciiVisuals.reviewAccent}
              colored={false}
              color={asciiColor}
              highlight={asciiColor}
              class="h-full w-full"
              background=""
              cellSize={6}
              scale={SCALE.review}
              orbit={false}
              autoRotate={false}
              rotationIntensity={0}
              floatIntensity={0}
              floatSpeed={0}
            />
          </div>
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
       4. ПОИСК УТЕЧЕК ДАННЫХ — лупа (поменьше)
       ══════════════════════════════════════════════════════════════════ -->
  <div class="card-shell card-leak">
    <div class="card-inner">
      <div class="visual-area" aria-hidden="true">
        <div class="ascii-visual">
          <AsciiObject
            src={asciiVisuals.leak}
            colored={false}
            color={asciiColor}
            highlight={asciiColor}
            class="h-full w-full"
            background=""
            cellSize={6}
            scale={SCALE.leak}
            orbit={false}
            autoRotate={false}
            rotationIntensity={0}
            floatIntensity={1.2}
            floatSpeed={1.5}
          />
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
       5. КОНСУЛЬТАЦИЯ — одно облачко серое, второе акцентное, крупнее
       ══════════════════════════════════════════════════════════════════ -->
  <div class="card-shell card-consult">
    <div class="card-inner">
      <div class="visual-area" aria-hidden="true">
        <div class="ascii-visual">
          <!-- серое облачко (вопрос) -->
          <div class="ascii-layer">
            <AsciiObject
              src={asciiVisuals.consultGray}
              colored={false}
              color={asciiGray}
              highlight={asciiGray}
              class="h-full w-full"
              background=""
              cellSize={6}
              scale={SCALE.consult}
              orbit={false}
              autoRotate={false}
              rotationIntensity={0}
              floatIntensity={1.2}
              floatSpeed={1.5}
            />
          </div>
          <!-- акцентное облачко (ответ) -->
          <div class="ascii-layer">
            <AsciiObject
              src={asciiVisuals.consultAccent}
              colored={false}
              color={asciiColor}
              highlight={asciiColor}
              class="h-full w-full"
              background=""
              cellSize={6}
              scale={SCALE.consult}
              orbit={false}
              autoRotate={false}
              rotationIntensity={0}
              floatIntensity={1.2}
              floatSpeed={1.5}
            />
          </div>
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
       6. ПОИСК И УСТРАНЕНИЕ НЕПОЛАДОК — шестерня (чуть меньше, как щит)
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
            <div class="ascii-visual" aria-hidden="true">
              <AsciiObject
                src={asciiVisuals.gear}
                colored={false}
                color={asciiColor}
                highlight={asciiColor}
                class="h-full w-full"
                background=""
                cellSize={6}
                scale={SCALE.gear}
                orbit={false}
                autoRotate={false}
                rotationIntensity={0}
                floatIntensity={1.2}
                floatSpeed={1.5}
              />
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