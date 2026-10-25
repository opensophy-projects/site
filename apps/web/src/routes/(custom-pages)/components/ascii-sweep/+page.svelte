<script lang="ts">
  import PageSeo from "$lib/components/seo/PageSeo.svelte";
  import SiteMenu from "$lib/components/ui-registry/SiteMenu.svelte";
  import AsciiSweep from "$lib/components/ui-registry/AsciiSweep.svelte";

  let index = $state(0);
  let duration = $state(1.8);
  let band = $state(0.28);
  let scale = $state(2);
  let charset = $state<"ascii" | "blocks" | "binary">("ascii");

  const examples = [
    {
      eyebrow: "HUMAN WORKFLOW",
      title: "Judgement stays in the loop.",
      body: "People collaborate in a shared space. Every change is visible before it lands.",
      rows: [
        ["Creation", "Manually by a user"],
        ["Members", "Multiple users (invite-only)"],
        ["Access control", "Roles with granular rules"],
        ["Billing", "Tied to a seat"],
        ["Use case", "Review and pairing"],
      ],
    },
    {
      eyebrow: "AGENT WORKFLOW",
      title: "Let the routine move faster.",
      body: "Agents handle repeatable steps while people keep control of the important decisions.",
      rows: [
        ["Creation", "Assisted by an agent"],
        ["Members", "People and agents"],
        ["Access control", "Scoped permissions"],
        ["Billing", "Usage-based"],
        ["Use case", "Automation and delivery"],
      ],
    },
  ];
</script>

<PageSeo
  title="Ascii Sweep — UI-компоненты"
  description="Интерактивный Svelte-компонент AsciiSweep: переход между панелями с ASCII-символами, свечением и настройками."
  type="website"
/>

<svelte:head>
  <meta name="theme-color" content="#090b0a" />
</svelte:head>

<main class="page">
  <SiteMenu />

  <section class="intro">
    <a class="back" href="/components/overview">← Все компоненты</a>
    <p class="eyebrow">OS.UI / MOTION</p>
    <h1>ASCII <span>Sweep</span></h1>
    <p class="lead">
      Полоса светящихся ASCII-символов проходит по интерфейсу и незаметно
      заменяет одну панель другой. Переключайте вкладки, чтобы запустить эффект.
    </p>
    <div class="badges">
      <span> Svelte </span><span> WebGL · GLSL </span><span> Interactive</span>
    </div>
  </section>

  <section class="demo-section" aria-labelledby="demo-title">
    <div class="section-heading">
      <div>
        <p class="eyebrow">LIVE PREVIEW</p>
        <h2 id="demo-title">Демо</h2>
      </div>
      <span class="hint">Переключите вкладку</span>
    </div>

    <div class="demo-shell">
      <div class="tabs" role="tablist" aria-label="Вариант панели">
        {#each examples as example, i}
          <button
            type="button"
            role="tab"
            aria-selected={index === i}
            class:active={index === i}
            onclick={() => (index = i)}
          >
            <span class="tab-dot"></span>{example.eyebrow === "HUMAN WORKFLOW" ? "Human" : "Agent"}
          </button>
        {/each}
      </div>

      <AsciiSweep
        class="sweep"
        {index}
        duration={duration}
        band={band}
        scale={scale}
        {charset}
        color="#74f7a1"
        glow={1.35}
        turbulence={0.38}
        trail={0.7}
        tint={0.8}
        background="#101411"
      >
        {#snippet children()}
          {@const item = examples[0]}
          <article class="panel">
            <div class="panel-copy">
              <span class="panel-kicker">{item.eyebrow}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
            <div class="rows">
              {#each item.rows as row}
                <div class="row"><span>{row[0]}</span><strong>{row[1]}</strong></div>
              {/each}
            </div>
            <div class="panel-foot"><span class="status-dot"></span> SESSION ACTIVE <span>01 / 02</span></div>
          </article>
        {/snippet}
        {#snippet alternate()}
          {@const item = examples[1]}
          <article class="panel">
            <div class="panel-copy">
              <span class="panel-kicker">{item.eyebrow}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
            <div class="rows">
              {#each item.rows as row}
                <div class="row"><span>{row[0]}</span><strong>{row[1]}</strong></div>
              {/each}
            </div>
            <div class="panel-foot"><span class="status-dot"></span> AGENT READY <span>02 / 02</span></div>
          </article>
        {/snippet}
      </AsciiSweep>
      <p class="demo-note">Эффект запускается при смене вкладки. Направление зависит от выбранной панели.</p>
    </div>
  </section>

  <section class="settings-section" aria-labelledby="settings-title">
    <div class="section-heading">
      <div><p class="eyebrow">PLAY WITH IT</p><h2 id="settings-title">Настройки</h2></div>
      <button class="reset" onclick={() => { duration = 1.8; band = 0.28; scale = 2; charset = "ascii"; }}>Сбросить</button>
    </div>
    <div class="controls">
      <label>
        <span>Длительность <strong>{duration.toFixed(1)} сек.</strong></span>
        <input type="range" min="0.6" max="4" step="0.1" bind:value={duration} />
      </label>
      <label>
        <span>Ширина полосы <strong>{band.toFixed(2)}</strong></span>
        <input type="range" min="0.08" max="0.65" step="0.01" bind:value={band} />
      </label>
      <label>
        <span>Размер символа <strong>{scale.toFixed(1)} px</strong></span>
        <input type="range" min="1" max="4" step="0.5" bind:value={scale} />
      </label>
      <label>
        <span>Набор символов</span>
        <select bind:value={charset}>
          <option value="ascii">ASCII</option>
          <option value="blocks">Blocks</option>
          <option value="binary">Binary</option>
        </select>
      </label>
    </div>
    <p class="hint settings-hint">Измените параметр, затем переключите вкладку в демо, чтобы увидеть эффект перехода.</p>
  </section>

  <section class="usage-section">
    <p class="eyebrow">GET STARTED</p>
    <h2>Использование</h2>
    <p>Передайте два содержимых слота: основной через default snippet и альтернативный через <code>alternate</code>. Изменение <code>index</code> запускает переход.</p>
    <pre><code>{`<script>
  import AsciiSweep from "$lib/components/ui-registry/AsciiSweep.svelte";
  let index = $state(0);
</script>

<button onclick={() => (index = index ? 0 : 1)}>
  Switch panel
</button>

<AsciiSweep {index} duration={1.8} color="#74f7a1">
  {#snippet children()}
    <div>First panel</div>
  {/snippet}
  {#snippet alternate()}
    <div>Second panel</div>
  {/snippet}
</AsciiSweep>`}</code></pre>
    <div class="notice">
      <strong>Совместимость</strong>
      <p>Для нативного захвата HTML в Canvas требуется экспериментальный флаг Chrome HTML-in-Canvas. Компонент содержит fallback-рендеринг через Canvas 2D, но точность захвата может отличаться для сложных DOM-элементов и внешних медиа.</p>
    </div>
  </section>

  <footer><a href="/components/overview">← Назад к библиотеке компонентов</a><span>OS.UI · ASCII SWEEP</span></footer>
</main>

<style>
  :global(body) { background: #090b0a; }
  .page { min-height: 100dvh; background: #090b0a; color: #f0f4f0; padding-bottom: 5rem; }
  .intro, .demo-section, .settings-section, .usage-section, footer { width: min(100% - 2.5rem, 960px); margin-inline: auto; }
  .intro { padding: 5rem 0 3rem; }
  .back, footer a { color: #9ba79e; text-decoration: none; font-size: .9rem; }
  .back:hover, footer a:hover { color: #74f7a1; }
  .eyebrow { color: #74f7a1; font: 600 .72rem/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .16em; margin: 0 0 .9rem; }
  h1 { font-size: clamp(3.5rem, 10vw, 7.5rem); line-height: .95; letter-spacing: -.075em; margin: 2rem 0 1.25rem; font-weight: 650; }
  h1 span { color: #74f7a1; }
  .lead { max-width: 660px; color: #a7b0a9; font-size: clamp(1rem, 2vw, 1.2rem); line-height: 1.75; }
  .badges { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: 1.5rem; }
  .badges span { border: 1px solid #29332c; border-radius: 999px; padding: .45rem .75rem; color: #c2ccc4; font-size: .75rem; }
  .demo-section, .settings-section, .usage-section { margin-top: 3.5rem; }
  .section-heading { display: flex; align-items: end; justify-content: space-between; gap: 1rem; margin-bottom: 1.2rem; }
  h2 { font-size: clamp(1.7rem, 4vw, 2.5rem); letter-spacing: -.045em; margin: 0; }
  .hint { color: #849087; font-size: .82rem; }
  .demo-shell { border: 1px solid #26312a; border-radius: 18px; background: #101411; overflow: hidden; }
  .tabs { display: flex; gap: .4rem; border-bottom: 1px solid #26312a; padding: .75rem; }
  .tabs button { border: 1px solid transparent; border-radius: 9px; background: transparent; color: #9da89f; padding: .65rem 1rem; display: flex; align-items: center; gap: .55rem; cursor: pointer; }
  .tabs button.active { color: #e8f8ed; background: #1a241d; border-color: #304635; }
  .tab-dot, .status-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #64716a; }
  .active .tab-dot, .status-dot { background: #74f7a1; box-shadow: 0 0 10px #74f7a177; }
  .sweep { display: block; height: 370px; width: 100%; }
  .panel { box-sizing: border-box; min-height: 370px; height: 100%; padding: clamp(1.25rem, 4vw, 2.5rem); display: flex; flex-direction: column; justify-content: space-between; color: #edf5ef; background: #101411; }
  .panel-copy { max-width: 590px; }
  .panel-kicker { color: #74f7a1; font: 600 .68rem ui-monospace, monospace; letter-spacing: .13em; }
  .panel h3 { font-size: clamp(1.5rem, 4vw, 2.6rem); letter-spacing: -.05em; line-height: 1.12; margin: .9rem 0 .65rem; max-width: 520px; }
  .panel p { color: #9ca99f; line-height: 1.6; max-width: 520px; margin: 0; font-size: .95rem; }
  .rows { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .65rem 1.5rem; margin: 1.5rem 0; }
  .row { display: flex; justify-content: space-between; gap: .5rem; padding-bottom: .55rem; border-bottom: 1px solid #29332c; font-size: .78rem; }
  .row span { color: #849087; }
  .row strong { color: #d5ded7; text-align: right; font-weight: 500; }
  .panel-foot { display: flex; align-items: center; gap: .5rem; color: #7d8b80; font: .65rem ui-monospace, monospace; letter-spacing: .08em; }
  .panel-foot span:last-child { margin-left: auto; }
  .demo-note { color: #7f8b82; font-size: .8rem; margin: .9rem 0 0; }
  .controls { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
  .controls label { display: grid; gap: .9rem; padding: 1.1rem; border: 1px solid #26312a; border-radius: 12px; background: #101411; }
  .controls label > span { display: flex; justify-content: space-between; gap: .75rem; color: #b5c0b7; font-size: .85rem; }
  .controls strong { color: #74f7a1; font-weight: 500; }
  input[type="range"] { width: 100%; accent-color: #74f7a1; }
  select, .reset { border: 1px solid #334238; border-radius: 8px; padding: .55rem .7rem; background: #151c17; color: #e7f0e9; }
  .reset { cursor: pointer; font-size: .8rem; }
  .settings-hint { margin-top: 1rem; }
  .usage-section > p:not(.eyebrow) { color: #a7b0a9; line-height: 1.75; }
  code { color: #a6f5bd; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .86em; }
  pre { overflow-x: auto; border: 1px solid #26312a; background: #101411; border-radius: 14px; padding: 1.25rem; line-height: 1.7; color: #dce6de; font-size: .85rem; }
  pre code { font-size: inherit; white-space: pre; }
  .notice { border-left: 2px solid #74f7a1; background: #101411; padding: 1rem 1.2rem; margin-top: 1.5rem; }
  .notice strong { color: #74f7a1; font-size: .85rem; }
  .notice p { color: #a7b0a9; line-height: 1.7; margin-bottom: 0; font-size: .9rem; }
  footer { display: flex; justify-content: space-between; gap: 1rem; border-top: 1px solid #26312a; padding-top: 1.5rem; margin-top: 4rem; color: #657168; font: .7rem ui-monospace, monospace; letter-spacing: .08em; }
  @media (max-width: 620px) {
    .intro { padding-top: 3.5rem; }
    .controls, .rows { grid-template-columns: 1fr; }
    .sweep, .panel { min-height: 430px; height: 430px; }
    .row { font-size: .75rem; }
    .section-heading { align-items: start; }
    footer { flex-direction: column; }
  }
</style>
