<script lang="ts">
  import PageSeo from '$lib/components/seo/PageSeo.svelte';
  import SiteMenu from '$lib/components/ui/SiteMenu.svelte';
  import FlameWrap from '$lib/components/ui-registry/FlameWrap.svelte';
  import ArrowRight from 'carbon-icons-svelte/lib/ArrowRight.svelte';
  import { contactsState } from '$lib/stores/contacts.svelte';

  const services = [
    { visual: '◒', title: 'Проверка безопасности (blackbox, graybox, whitebox)', description: 'Проверяю сайт, приложение или API в подходящем формате: снаружи, с частичным доступом или с полным доступом к коду и ручной проверкой находок.' },
    { visual: '⌘', title: 'Code review безопасности', description: 'Разбираю исходный код на уязвимости: от хардкод-паролей, ключей API и токенов (в том числе в git-истории) до слабых мест в логике, например обхода проверок доступа и защиты, держащейся лишь на флаге или настройке. Помогаю исправить найденное.' },
    { visual: '⌕', title: 'Поиск утечек данных (Data Leak Search)', description: 'Проверяю, не утекли ли ваши конфиденциальные данные в интернет: ищу в слитых базах и дампах, публичных архивах, открытых источниках (OSINT) и других местах, где они могли оказаться.' },
    { visual: '∞', title: 'Интеграция DevSecOps', badge: 'Рекомендуется', flame: true, description: 'Выстраиваю DevSecOps в вашем проекте под ключ: от автоматических проверок кода и зависимостей до безопасных пайплайнов и понятных правил для команды. Безопасность становится частью обычной разработки, а не отдельным этапом в конце.' },
    { visual: '〰 ? 〰', title: 'Консультация', description: 'Помогу разобраться с задачей: подскажу подходящие инструменты, оценю архитектуру и безопасность, отвечу на вопросы по DevSecOps, инфраструктуре и автоматизации.' },
    { visual: '▱\n▱\n▱', title: 'Поиск и устранение неполадок', badge: 'Рекомендуется', flame: true, description: 'Что-то не запускается, тормозит или настроено «как получилось»? Нахожу причину и исправляю: Docker, Linux-серверы, конфигурации, пайплайны. Помогаю с настройкой, оптимизацией и проверкой, чтобы всё работало стабильно.' }
  ];
</script>

<PageSeo title="Услуги DevSecOps и безопасности — opensophy" description="Услуги Opensophy: аудит безопасности, code review, поиск утечек, внедрение DevSecOps, консультации и устранение неполадок." type="website" />
<main class="min-h-dvh bg-background text-foreground"><SiteMenu />
  <div class="mx-auto w-full max-w-5xl px-4 py-24 md:py-32">
    <header class="mb-12 max-w-3xl"><p class="text-sm font-semibold uppercase tracking-[.16em] text-foreground-muted">услуги</p><h1 class="mt-3 text-4xl font-medium tracking-tight md:text-6xl">DevSecOps и безопасность без лишней сложности.</h1><p class="mt-5 text-lg leading-8 text-foreground-muted">Помогаю сделать разработку, инфраструктуру и безопасность устойчивее.</p></header>
    <section class="grid gap-4 md:grid-cols-2">{#each services as service (service.title)}
      {#if service.flame}<FlameWrap class="service-flame" height={60} spread={5} radius={14}><div class="service-card flame-card">{@render card(service)}</div></FlameWrap>
      {:else}<div class="service-card">{@render card(service)}</div>{/if}
    {/each}</section>
    <section class="mt-14 flex flex-wrap gap-3"><button class="action primary" onclick={() => contactsState.open()}>Заказать услуги <ArrowRight size={16}/></button><a class="action" href="/service-policy">Политика оказания услуг</a></section>
  </div>
</main>

{#snippet card(service: (typeof services)[number])}
  <div class="visual" aria-hidden="true">{service.visual}</div><div class="p-6"><div class="mb-3 flex flex-wrap items-center gap-2"><span class="eyebrow">Услуга</span>{#if service.badge}<span class="badge">{service.badge}</span>{/if}</div><h2 class="text-xl font-semibold leading-snug">{service.title}</h2><p class="mt-3 text-sm leading-6 text-foreground-muted">{service.description}</p></div>
{/snippet}

<style>
  .service-card { overflow:hidden; border:1px solid var(--border); border-radius:.875rem; background:var(--background-inset); min-height: 100%; }
  .flame-card { border-color: var(--border); background:var(--background-inset); }
  :global(.service-flame) { border: 1px solid var(--border); border-radius: .875rem; }
  .visual { display:grid; place-items:center; min-height:9rem; white-space:pre-line; border-bottom:1px solid var(--border); background:radial-gradient(circle at 50% 100%, color-mix(in srgb, var(--accent) 15%, transparent), transparent 65%); color:var(--accent); font: 500 clamp(2.5rem, 6vw, 4rem)/1 ui-monospace, monospace; }
  .eyebrow { font:700 .65rem/1 ui-monospace,monospace; letter-spacing:.12em; text-transform:uppercase; color:var(--foreground-muted); }.badge { border:1px solid color-mix(in srgb,var(--accent) 55%,transparent); border-radius:999px; padding:.2rem .5rem; color:var(--accent); font-size:.7rem; font-weight:600; }.action { display:inline-flex; align-items:center; gap:.5rem; border:1px solid var(--border); border-radius:.55rem; padding:.7rem 1rem; font-weight:600; }.primary{border-color:transparent;background:var(--accent);color:white;}
</style>
