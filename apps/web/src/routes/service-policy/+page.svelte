<script lang="ts">
  import PageSeo from "$lib/components/seo/PageSeo.svelte";
  import SiteMenu from "$lib/components/ui-registry/SiteMenu.svelte";
  import ServicesGrid from "$lib/components/ui-registry/ServicesGrid.svelte";
</script>

<PageSeo
  title="Услуги DevSecOps и безопасности — opensophy"
  description="Услуги Opensophy: внедрение DevSecOps, проверка безопасности и code review, аудит периметра и OSINT, поиск утечек, управление доступами, комплаенс, документы по ИБ, автоматизация, консультации и разработка сайтов."
  type="website"
/>

<main class="min-h-dvh bg-background text-foreground">
  <SiteMenu />

  <div class="mx-auto w-full max-w-5xl px-4 py-24 md:py-32">
    <header class="mb-12 max-w-3xl"></header>

    <ServicesGrid />

    <section class="note mt-14 max-w-3xl">
      <p>
        Указаны стартовые цены закрытых пакетов: у каждого есть чёткий объём,
        результат и срок. Всё, что выходит за рамки пакета, считаем отдельно и
        согласуем с вами заранее. Лицензии, хостинг, облачная инфраструктура,
        домены, платные API и сервисы в стоимость не входят, если это не
        оговорено отдельно.
      </p>
      <p>
        Проверки безопасности проводим только по письменному разрешению
        владельца системы и в согласованных границах. Для задач, объём которых
        нельзя оценить заранее, стоимость рассчитываем после короткого уточнения.
        Подробные условия — в <a href="/service-policy">политике оказания услуг</a>.
      </p>
    </section>
  </div>
</main>

<style>
  .note {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    font-size: 0.875rem;
    line-height: 1.65;
    color: var(--foreground-muted, rgba(255, 255, 255, 0.55));
  }

  .note p {
    margin: 0;
  }

  .note a {
    color: var(--foreground);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
</style>