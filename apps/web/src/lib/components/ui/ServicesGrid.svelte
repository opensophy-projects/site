<script lang="ts">
  import FlameWrap from "$lib/components/ui-registry/FlameWrap.svelte";
  const flameColor: [number, number, number] = [0.956, 0.247, 0.369];
  const heights = [
    55, 40, 70, 45, 90, 60, 35, 80, 50, 75, 42, 88, 30, 65, 48, 92, 38, 72, 55,
    85, 44, 68, 36, 78, 52, 62, 47, 58,
  ];
  function gear(
    cx: number,
    cy: number,
    teeth: number,
    outer: number,
    inner: number,
  ) {
    const pts: string[] = [];
    const step = (Math.PI * 2) / teeth;
    for (let i = 0; i < teeth; i++) {
      const base = i * step - Math.PI / 2;
      for (const [part, r] of [
        [0.18, inner],
        [0.32, outer],
        [0.68, outer],
        [0.82, inner],
      ] as [number, number][])
        pts.push(
          `${(cx + Math.cos(base + step * part) * r).toFixed(2)} ${(cy + Math.sin(base + step * part) * r).toFixed(2)}`,
        );
    }
    return `M${pts.join(" L")} Z`;
  }
  const gearOuter = gear(100, 100, 12, 72, 58),
    gearInner = gear(100, 100, 12, 64, 52);
</script>

<section class="services-grid">
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
      ><div class="card-shell card-wide">{@render devsecops()}</div></FlameWrap
    >
  </div>
  <div class="card-shell card-pentest">{@render pentest()}</div>
  <div class="card-shell card-review">{@render review()}</div>
  <div class="card-shell card-leak">{@render leak()}</div>
  <div class="card-shell card-consult">{@render consult()}</div>
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
      ><div class="card-shell card-wide">{@render trouble()}</div></FlameWrap
    >
  </div>
</section>
{#snippet devsecops()}<div class="card-inner">
    <div class="visual-area">
      <div class="svg-visual">
        <svg viewBox="0 0 200 200" fill="none"
          ><path
            d="M100 44L138 57V95C138 120 120 138 100 148C80 138 62 120 62 95V57Z"
            stroke="currentColor"
            stroke-width="2"
          /><path
            d="M100 52L132 63V95C132 116 116 132 100 141C84 132 68 116 68 95V63Z"
            stroke="currentColor"
            opacity=".55"
          /><path
            d="M82 98L95 112L120 84"
            stroke="var(--accent)"
            stroke-width="4"
            stroke-linecap="round"
          /></svg
        >
      </div>
    </div>
    {@render body(
      "Интеграция DevSecOps",
      "Выстраиваю DevSecOps в вашем проекте под ключ: от автоматических проверок кода и зависимостей до безопасных пайплайнов и понятных правил для команды. Безопасность становится частью обычной разработки, а не отдельным этапом в конце.",
      true,
    )}
  </div>{/snippet}
{#snippet pentest()}<div class="card-inner">
    <div class="visual-area"><div class="pt"><i></i><b></b><em></em></div></div>
    {@render body(
      "Проверка безопасности (blackbox, graybox, whitebox)",
      "Проверяю сайт, приложение или API в подходящем формате: снаружи, с частичным доступом или с полным доступом к коду и ручной проверкой находок.",
    )}
  </div>{/snippet}
{#snippet review()}<div class="card-inner">
    <div class="visual-area bars">
      {#each heights as height, i}<i
          class:accent={[4, 9, 12, 18, 23, 26].includes(i)}
          style:height="{height}%"
        ></i>{/each}
    </div>
    {@render body(
      "Code review безопасности",
      "Разбираю исходный код на уязвимости: от хардкод-паролей, ключей API и токенов (в том числе в git-истории) до слабых мест в логике, например обхода проверок доступа и защиты, держащейся лишь на флаге или настройке. Помогаю исправить найденное.",
    )}
  </div>{/snippet}
{#snippet leak()}<div class="card-inner">
    <div class="visual-area">
      <div class="svg-visual">
        <svg viewBox="0 0 180 140" fill="none"
          ><circle
            cx="74"
            cy="60"
            r="36"
            stroke="currentColor"
            stroke-width="2.5"
          /><circle
            cx="74"
            cy="60"
            r="29"
            stroke="currentColor"
            opacity=".3"
          /><path
            d="M100 86L134 120"
            stroke="currentColor"
            stroke-width="9"
            stroke-linecap="round"
          /><path
            d="M58 52H90M58 72H76"
            stroke="currentColor"
            stroke-width="2"
          /><path
            d="M58 62H84"
            stroke="var(--accent)"
            stroke-width="2.5"
          /></svg
        >
      </div>
    </div>
    {@render body(
      "Поиск утечек данных (Data Leak Search)",
      "Проверяю, не утекли ли ваши конфиденциальные данные в интернет: ищу в слитых базах и дампах, публичных архивах, открытых источниках (OSINT) и других местах, где они могли оказаться.",
    )}
  </div>{/snippet}
{#snippet consult()}<div class="card-inner">
    <div class="visual-area">
      <div class="svg-visual">
        <svg viewBox="0 0 220 130" fill="none"
          ><path
            d="M22 18H112C119 18 124 23 124 30V58C124 65 119 70 112 70H52L34 84V70H22C15 70 10 65 10 58V30C10 23 15 18 22 18Z"
            stroke="currentColor"
          /><text x="28" y="51" fill="currentColor">?</text><path
            d="M56 36C62 32 68 40 74 36C80 32 86 40 92 36M56 52C62 48 68 56 74 52"
            stroke="currentColor"
          /><path
            d="M108 62H198C205 62 210 67 210 74V102C210 109 205 114 198 114H186V128L168 114H108C101 114 96 109 96 102V74C96 67 101 62 108 62Z"
            stroke="var(--accent)"
          /><path
            d="M112 80C118 76 124 84 130 80C136 76 142 84 148 80M112 96C118 92 124 100 130 96"
            stroke="var(--accent)"
          /></svg
        >
      </div>
    </div>
    {@render body(
      "Консультация",
      "Помогу разобраться с задачей: подскажу подходящие инструменты, оценю архитектуру и безопасность, отвечу на вопросы по DevSecOps, инфраструктуре и автоматизации.",
    )}
  </div>{/snippet}
{#snippet trouble()}<div class="card-inner">
    <div class="visual-area">
      <div class="svg-visual">
        <svg viewBox="0 0 200 200" fill="none"
          ><path d={gearOuter} stroke="currentColor" stroke-width="2" /><path
            d={gearInner}
            stroke="currentColor"
            opacity=".55"
          /><circle
            cx="100"
            cy="100"
            r="34"
            stroke="currentColor"
            opacity=".3"
          /><circle
            cx="100"
            cy="100"
            r="20"
            stroke="currentColor"
            opacity=".55"
          /><circle cx="100" cy="100" r="7" fill="var(--accent)" /></svg
        >
      </div>
    </div>
    {@render body(
      "Поиск и устранение неполадок",
      "Что-то не запускается, тормозит или настроено «как получилось»? Нахожу причину и исправляю: Docker, Linux-серверы, конфигурации, пайплайны. Помогаю с настройкой, оптимизацией и проверкой, чтобы всё работало стабильно.",
      true,
    )}
  </div>{/snippet}
{#snippet body(title: string, description: string, recommended = false)}<div
    class="card-body"
  >
    <div class="meta">
      <p>Услуга</p>
      {#if recommended}<span>Рекомендуется</span>{/if}
    </div>
    <h3>{title}</h3>
    <p class="desc">{description}</p>
  </div>{/snippet}

<style>
  .services-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    width: 100%;
  }
  .card-devsecops {
    grid-column: 1/-1;
    grid-row: 1;
  }
  .card-pentest {
    grid-column: 1;
    grid-row: 2;
  }
  .card-review {
    grid-column: 2;
    grid-row: 2;
  }
  .card-leak {
    grid-column: 1;
    grid-row: 3;
  }
  .card-consult {
    grid-column: 2;
    grid-row: 3;
  }
  .card-trouble {
    grid-column: 1/-1;
    grid-row: 4;
  }
  .flame-slot {
    margin-top: 2.5rem;
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
    box-shadow: inset 0 0 0 0.5px oklch(from var(--highlight) l c h / 8%);
  }
  .card-inner {
    border-radius: 0.5rem;
    border: 1px solid var(--border);
    background: var(--background);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 18rem;
    height: 100%;
    box-sizing: border-box;
  }
  .card-wide .card-inner {
    min-height: 11rem;
    flex-direction: row;
  }
  .card-wide .visual-area {
    width: 46%;
    height: auto;
  }
  .card-wide .card-body {
    justify-content: center;
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
  .meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .meta p {
    font:
      700 0.6rem ui-monospace,
      monospace;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--foreground-muted);
    margin: 0;
  }
  .meta span {
    padding: 0.2rem 0.5rem;
    border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
    border-radius: 999px;
    color: var(--accent);
    font:
      700 0.55rem ui-monospace,
      monospace;
    text-transform: uppercase;
  }
  h3 {
    font-size: 1.05rem;
    line-height: 1.3;
    margin: 0;
  }
  .desc {
    font-size: 0.85rem;
    line-height: 1.6;
    color: var(--foreground-muted);
    margin: 0;
  }
  .svg-visual {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    color: var(--foreground);
  }
  .svg-visual svg {
    width: min(82%, 13rem);
    height: auto;
  }
  .pt {
    position: absolute;
    inset: 0;
  }
  .pt i {
    position: absolute;
    left: 50%;
    height: 100%;
    border-left: 1px solid var(--border);
  }
  .pt b,
  .pt em {
    position: absolute;
    border: 1px solid var(--border);
    border-radius: 50%;
    aspect-ratio: 1;
    left: -3rem;
    right: -3rem;
    top: 1rem;
  }
  .pt b {
    border-right-color: var(--accent);
  }
  .pt em {
    left: 0;
    right: 0;
    top: 3.5rem;
    border-left-color: var(--accent);
  }
  .bars {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding: 1.25rem 1.25rem 0.5rem;
  }
  .bars i {
    flex: 1;
    max-width: 7px;
    background: color-mix(in srgb, var(--foreground) 12%, transparent);
  }
  .bars i.accent {
    background: var(--accent);
  }
  @media (max-width: 600px) {
    .services-grid {
      grid-template-columns: 1fr;
    }
    .card-devsecops,
    .card-pentest,
    .card-review,
    .card-leak,
    .card-consult,
    .card-trouble {
      grid-column: 1;
      grid-row: auto;
    }
    .card-wide .card-inner {
      flex-direction: column;
    }
    .card-wide .visual-area {
      width: 100%;
      height: 9.5rem;
    }
  }
</style>
