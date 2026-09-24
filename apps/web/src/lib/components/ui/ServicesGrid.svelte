<script lang="ts">
  import AsciiVisual from "$lib/components/ui/AsciiVisual.svelte";
  import FlameWrap from "$lib/components/ui-registry/FlameWrap.svelte";
  import { onMount } from "svelte";
  import { canRunHeavyEffects } from "$lib/utils/perf";

  // Мощное устройство → ASCII-рендер, слабое → лёгкие оригинальные
  // иллюстрации (inline SVG/CSS, цвета берутся из переменных темы).
  let mounted = $state(false);
  let heavy = $state(false);
  onMount(() => {
    heavy = canRunHeavyEffects();
    mounted = true;
  });

  const BAR_HEIGHTS = [
    55, 40, 70, 45, 90, 60, 35, 80, 50, 75, 42, 88, 30, 65, 48, 92, 38, 72, 55,
    85, 44, 68, 36, 78, 52, 62, 47, 58,
  ];
  const ACCENT_BARS = new Set([4, 9, 12, 18, 23, 26]);

  // Шестерня: считаем контур зубьев по кругу
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

  const flameColor: [number, number, number] = [0.956, 0.247, 0.369];

  // Цвет ASCII-рендеров совпадает с акцентом сайта (--accent)
  const asciiColor = "#f43f5e";
  // Серый для «приглушённых» частей рисунков (как foreground 12–55% в оригинале)
  const asciiGray = "#6b6b76";

  // ── Размеры рисунков (scale) — крутить тут ─────────────────────────
  const SCALE = {
    shield: 4.4,
    pentest: 12.5,
    review: 12.5,
    leak: 4.2,
    consult: 5.8,
    gear: 4.4,
  };

  const gearOuter = buildGearPath(100, 100, 12, 72, 58);
  const gearInner = buildGearPath(100, 100, 12, 64, 52);

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

  // ── Как совмещаем серый и акцентный слои ───────────────────────────
  // Каждый слой содержит ВСЕ фигуры: свои — белые (видимые), чужие — чёрные
  // (пустые в ASCII), чтобы рамки слоёв были идентичными.
  const layerSvg = (viewBox: string, own: string, other: string) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${other}${own}</svg>`;

  // ── Проверка безопасности ──────────────────────────────────────────
  const PENTEST_VB = "0 0 450 152";
  const pentestGrayEls = (c: string) => `
    <rect x="222" y="0" width="6" height="152" fill="${c}"/>
    <path d="M225 19.2 A273 273 0 0 0 225 565.2" fill="none" stroke="${c}" stroke-width="6"/>
    <path d="M225 56 A225 225 0 0 1 225 506" fill="none" stroke="${c}" stroke-width="6"/>`;
  const pentestAccentEls = (c: string) => `
    <path d="M225 19.2 A273 273 0 0 1 225 565.2" fill="none" stroke="${c}" stroke-width="6"/>
    <path d="M225 56 A225 225 0 0 0 225 506" fill="none" stroke="${c}" stroke-width="6"/>`;
  const pentestGraySvg = layerSvg(PENTEST_VB, pentestGrayEls("#ffffff"), pentestAccentEls("#000000"));
  const pentestAccentSvg = layerSvg(PENTEST_VB, pentestAccentEls("#ffffff"), pentestGrayEls("#000000"));

  // ── Code review: столбики ──────────────────────────────────────────
  const barsEls = (accent: boolean, color: string) => {
    const padX = 20;
    const baseY = 146;
    const maxH = 122;
    const slot = (450 - padX * 2) / BAR_HEIGHTS.length;
    const bw = 9;
    return BAR_HEIGHTS
      .map((h, i) => {
        if (ACCENT_BARS.has(i) !== accent) return "";
        const bh = (h / 100) * maxH;
        const x = padX + i * slot + (slot - bw) / 2;
        return `<rect x="${x.toFixed(2)}" y="${(baseY - bh).toFixed(2)}" width="${bw}" height="${bh.toFixed(2)}" rx="1.5" fill="${color}"/>`;
      })
      .join("");
  };
  const barsGraySvg = layerSvg("0 0 450 152", barsEls(false, "#ffffff"), barsEls(true, "#000000"));
  const barsAccentSvg = layerSvg("0 0 450 152", barsEls(true, "#ffffff"), barsEls(false, "#000000"));

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

  // ── Консультация ───────────────────────────────────────────────────
  const chatGrayEls = (fill: string, hole: string) => `<g transform="translate(-4 -6)">
    <path fill="${fill}" d="M22 18H112C118.6 18 124 23.4 124 30V58C124 64.6 118.6 70 112 70H52L34 84V70H22C15.4 70 10 64.6 10 58V30C10 23.4 15.4 18 22 18Z"/>
    <text x="28" y="51" font-family="ui-monospace, monospace" font-size="22" font-weight="700" fill="${hole}">?</text>
    <path d="M56 36C62 32 68 40 74 36C80 32 86 40 92 36C98 32 104 40 110 36" stroke="${hole}" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    <path d="M56 52C62 48 68 56 74 52C80 48 86 56 92 52" stroke="${hole}" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  </g>`;
  const chatAccentEls = (fill: string, hole: string) => `<g transform="translate(4 16)">
    <path fill="${fill}" d="M108 62H198C204.6 62 210 67.4 210 74V102C210 108.6 204.6 114 198 114H186V128L168 114H108C101.4 114 96 108.6 96 102V74C96 67.4 101.4 62 108 62Z"/>
    <path d="M112 80C118 76 124 84 130 80C136 76 142 84 148 80C154 76 160 84 166 80C172 76 178 84 184 80C190 76 194 82 198 80" stroke="${hole}" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    <path d="M112 96C118 92 124 100 130 96C136 92 142 100 148 96C154 92 160 100 166 96" stroke="${hole}" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  </g>`;
  const CHAT_VB = "0 0 220 150";
  const chatGraySvg = layerSvg(CHAT_VB, chatGrayEls("#ffffff", "#000000"), chatAccentEls("#000000", "#000000"));
  const chatAccentSvg = layerSvg(CHAT_VB, chatAccentEls("#ffffff", "#000000"), chatGrayEls("#000000", "#000000"));

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

    /* ═══ Лёгкие оригинальные иллюстрации (слабые устройства) ═══ */
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

  <!-- 1. ИНТЕГРАЦИЯ DEVSECOPS — щит -->
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
            {#if mounted}
            {#if heavy}
<div class="ascii-visual" aria-hidden="true">
              <AsciiVisual
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
            {:else}
            <div class="svg-visual shield-visual" aria-hidden="true">
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 44 L138 57 L138 95 C138 120 120 138 100 148 C80 138 62 120 62 95 L62 57 Z" stroke="color-mix(in srgb, var(--foreground, #fff) 80%, transparent)" stroke-width="2" stroke-linejoin="round" fill="none" />
                <path d="M100 52 L132 63 L132 95 C132 116 116 132 100 141 C84 132 68 116 68 95 L68 63 Z" stroke="color-mix(in srgb, var(--foreground, #fff) 55%, transparent)" stroke-width="1.2" stroke-linejoin="round" fill="none" />
                <path d="M82 98 L95 112 L120 84" stroke="var(--accent, #f03e5f)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
              </svg>
            </div>
            {/if}
          {/if}
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

  <!-- 2. ПРОВЕРКА БЕЗОПАСНОСТИ -->
  <div class="card-shell card-pentest">
    <div class="card-inner">
      <div class="visual-area">
        {#if mounted}
            {#if heavy}
<div class="ascii-visual" aria-hidden="true">
          <!-- серый слой (на слабых устройствах здесь целая цветная картинка) -->
          <div class="ascii-layer">
            <AsciiVisual
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
          <!-- акцентный слой: на слабых устройствах не нужен -->
          <div class="ascii-layer">
            <AsciiVisual
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
            {:else}
            <div class="pt-visual" aria-hidden="true">
            <div class="pt-vline"></div>
            <div class="pt-arc-outer"></div>
            <div class="pt-arc-outer-accent"></div>
            <div class="pt-arc-inner"></div>
            <div class="pt-arc-inner-accent"></div>
          </div>
            {/if}
          {/if}
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

  <!-- 3. CODE REVIEW БЕЗОПАСНОСТИ -->
  <div class="card-shell card-review">
    <div class="card-inner">
      <div class="visual-area" aria-hidden="true">
        {#if mounted}
            {#if heavy}
<div class="ascii-visual">
          <div class="ascii-layer">
            <AsciiVisual
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
            <AsciiVisual
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
            {:else}
            <div class="dev-bars">
            {#each BAR_HEIGHTS as h, i (i)}
              <div class="dev-bar" class:dev-bar-accent={ACCENT_BARS.has(i)} style="height: {h}%"></div>
            {/each}
          </div>
            {/if}
          {/if}
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

  <!-- 4. ПОИСК УТЕЧЕК ДАННЫХ — лупа -->
  <div class="card-shell card-leak">
    <div class="card-inner">
      <div class="visual-area" aria-hidden="true">
        {#if mounted}
            {#if heavy}
<div class="ascii-visual">
          <AsciiVisual
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
            {:else}
            <div class="svg-visual leak-visual">
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
            {/if}
          {/if}
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

  <!-- 5. КОНСУЛЬТАЦИЯ -->
  <div class="card-shell card-consult">
    <div class="card-inner">
      <div class="visual-area" aria-hidden="true">
        {#if mounted}
            {#if heavy}
<div class="ascii-visual">
          <!-- серое облачко (вопрос) -->
          <div class="ascii-layer">
            <AsciiVisual
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
            <AsciiVisual
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
            {:else}
            <div class="svg-visual chat-visual">
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
            {/if}
          {/if}
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

  <!-- 6. ПОИСК И УСТРАНЕНИЕ НЕПОЛАДОК — шестерня -->
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
            {#if mounted}
            {#if heavy}
<div class="ascii-visual" aria-hidden="true">
              <AsciiVisual
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
            {:else}
            <div class="svg-visual gear-visual" aria-hidden="true">
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d={gearOuter} stroke="color-mix(in srgb, var(--foreground, #fff) 80%, transparent)" stroke-width="2" stroke-linejoin="round" fill="none" />
                <path d={gearInner} stroke="color-mix(in srgb, var(--foreground, #fff) 55%, transparent)" stroke-width="1.2" stroke-linejoin="round" fill="none" />
                <circle cx="100" cy="100" r="34" stroke="color-mix(in srgb, var(--foreground, #fff) 30%, transparent)" stroke-width="1.5" fill="none" />
                <circle cx="100" cy="100" r="20" stroke="color-mix(in srgb, var(--foreground, #fff) 55%, transparent)" stroke-width="1.2" fill="none" />
                <circle cx="100" cy="100" r="7" fill="var(--accent, #f03e5f)" />
              </svg>
            </div>
            {/if}
          {/if}
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
