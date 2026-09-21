<script lang="ts">
  import PageSeo from "$lib/components/seo/PageSeo.svelte";
  import SiteMenu from "$lib/components/ui/SiteMenu.svelte";
  import ServicesGrid from "$lib/components/ui/ServicesGrid.svelte";
  import { contactsState } from "$lib/stores/contacts.svelte";
</script>

<PageSeo
  title="Услуги DevSecOps и безопасности — opensophy"
  description="Услуги Opensophy: аудит безопасности, code review, поиск утечек, внедрение DevSecOps, консультации и устранение неполадок."
  type="website"
/>
<main class="min-h-dvh bg-background text-foreground">
  <SiteMenu />
  <div class="mx-auto w-full max-w-5xl px-4 py-24 md:py-32">
    <header class="mb-12 max-w-3xl">
      <p
        class="text-sm font-semibold uppercase tracking-[.16em] text-foreground-muted"
      >
        услуги
      </p>
      <h1 class="mt-3 text-4xl font-medium tracking-tight md:text-6xl">
        DevSecOps и безопасность без лишней сложности.
      </h1>
      <p class="mt-5 text-lg leading-8 text-foreground-muted">
        Помогаю сделать разработку, инфраструктуру и безопасность устойчивее.
      </p>
    </header>
    <ServicesGrid />
    <section class="mt-14 flex flex-wrap gap-3">
      <button class="action primary" onclick={() => contactsState.open()}
        >Заказать услуги</button
      ><a class="action" href="/service-policy">Политика оказания услуг</a>
    </section>
  </div>
</main>

<style>
  .action {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border: 1px solid var(--border);
    border-radius: 0.55rem;
    padding: 0.7rem 1rem;
    font-weight: 600;
  }
  .primary {
    border-color: transparent;
    background: var(--accent);
    color: white;
  }
</style>
