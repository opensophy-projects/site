<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import Time from 'carbon-icons-svelte/lib/Time.svelte';
  import Layers from 'carbon-icons-svelte/lib/Layers.svelte';
  import Information from 'carbon-icons-svelte/lib/Information.svelte';
  import Idea from 'carbon-icons-svelte/lib/Idea.svelte';
  import Security from 'carbon-icons-svelte/lib/Security.svelte';
  import Settings from 'carbon-icons-svelte/lib/Settings.svelte';
  import ShieldAlert from 'carbon-icons-svelte/lib/ShieldAlert.svelte';
  import Report from 'carbon-icons-svelte/lib/Report.svelte';
  import NetworkAdminControl from 'carbon-icons-svelte/lib/NetworkAdminControl.svelte';
  import Search from 'carbon-icons-svelte/lib/Search.svelte';
  import Idea2 from 'carbon-icons-svelte/lib/Idea.svelte';
  import DataBase from 'carbon-icons-svelte/lib/DataBase.svelte';
  import DocumentSecurity from 'carbon-icons-svelte/lib/DocumentSecurity.svelte';
  import Terminal from 'carbon-icons-svelte/lib/Terminal.svelte';

  type IconKey =
    | 'contracts' | 'scheduling' | 'processing' | 'diagnostics'
    | 'security' | 'settings' | 'shield' | 'report'
    | 'network' | 'search' | 'idea' | 'database'
    | 'document' | 'terminal';

  type FeatureCard = {
    title: string;
    description: string;
    icon: IconKey;
    wide?: boolean;
  };

  type Props = {
    class?: string;
    cards?: FeatureCard[];
  };

  const defaultCards: FeatureCard[] = [];
  let { class: className = '', cards = defaultCards }: Props = $props();

  // Build rows: wide card = full row, pair normals into rows of 2
  type Row = { type: 'wide'; card: FeatureCard } | { type: 'pair'; cards: FeatureCard[] };
  function buildRows(cards: FeatureCard[]): Row[] {
    const rows: Row[] = [];
    let i = 0;
    while (i < cards.length) {
      if (cards[i].wide) {
        rows.push({ type: 'wide', card: cards[i] });
        i++;
      } else {
        const pair = [cards[i]];
        if (i + 1 < cards.length && !cards[i + 1].wide) {
          pair.push(cards[i + 1]);
          i += 2;
        } else {
          i++;
        }
        rows.push({ type: 'pair', cards: pair });
      }
    }
    return rows;
  }

  const rows = $derived(buildRows(cards));
</script>

<div class={cn('inset-shadow w-full overflow-hidden rounded-xl bg-background-inset p-2', className)}>
  <div class="flex flex-col gap-2">
    {#each rows as row}
      {#if row.type === 'wide'}
        <div class="inset-shadow relative overflow-hidden rounded-lg bg-background-inset p-1.5">
          <article class="rounded-md bg-background p-4 sm:p-6 card-wide">
            <div class="flex items-start justify-between gap-6">
              <div class="flex-1 grid gap-4">
                <div class="inset-shadow grid size-12 place-items-center rounded-sm bg-background-inset text-accent shrink-0">
                  {#if row.card.icon === 'security'}
                    <Security size={32} />
                  {:else if row.card.icon === 'settings'}
                    <Settings size={32} />
                  {:else if row.card.icon === 'shield'}
                    <ShieldAlert size={32} />
                  {:else if row.card.icon === 'report'}
                    <Report size={32} />
                  {:else if row.card.icon === 'network'}
                    <NetworkAdminControl size={32} />
                  {:else if row.card.icon === 'search'}
                    <Search size={32} />
                  {:else if row.card.icon === 'idea'}
                    <Idea size={32} />
                  {:else if row.card.icon === 'database'}
                    <DataBase size={32} />
                  {:else if row.card.icon === 'document'}
                    <DocumentSecurity size={32} />
                  {:else if row.card.icon === 'terminal'}
                    <Terminal size={32} />
                  {:else if row.card.icon === 'contracts'}
                    <Idea2 size={32} />
                  {:else if row.card.icon === 'scheduling'}
                    <Time size={32} />
                  {:else if row.card.icon === 'processing'}
                    <Layers size={32} />
                  {:else}
                    <Information size={32} />
                  {/if}
                </div>
                <h3 class="text-xl font-medium tracking-tight text-foreground">{row.card.title}</h3>
                <p class="text-base font-normal tracking-normal text-foreground-muted whitespace-pre-line">
                  {row.card.description}
                </p>
              </div>
            </div>
          </article>
        </div>
      {:else}
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {#each row.cards as card (card.title)}
            <div class="inset-shadow relative overflow-hidden rounded-lg bg-background-inset p-1.5">
              <article class="grid h-54 rounded-md bg-background p-4 card sm:h-72 sm:p-6">
                <div class="flex items-start justify-start">
                  <div class="inset-shadow grid size-12 place-items-center rounded-sm bg-background-inset text-accent">
                    {#if card.icon === 'security'}
                      <Security size={32} />
                    {:else if card.icon === 'settings'}
                      <Settings size={32} />
                    {:else if card.icon === 'shield'}
                      <ShieldAlert size={32} />
                    {:else if card.icon === 'report'}
                      <Report size={32} />
                    {:else if card.icon === 'network'}
                      <NetworkAdminControl size={32} />
                    {:else if card.icon === 'search'}
                      <Search size={32} />
                    {:else if card.icon === 'idea'}
                      <Idea size={32} />
                    {:else if card.icon === 'database'}
                      <DataBase size={32} />
                    {:else if card.icon === 'document'}
                      <DocumentSecurity size={32} />
                    {:else if card.icon === 'terminal'}
                      <Terminal size={32} />
                    {:else if card.icon === 'contracts'}
                      <Idea2 size={32} />
                    {:else if card.icon === 'scheduling'}
                      <Time size={32} />
                    {:else if card.icon === 'processing'}
                      <Layers size={32} />
                    {:else}
                      <Information size={32} />
                    {/if}
                  </div>
                </div>
                <div class="mt-auto grid gap-4">
                  <h3 class="text-xl font-medium tracking-tight text-foreground">{card.title}</h3>
                  <p class="text-base font-normal tracking-normal text-foreground-muted">
                    {card.description}
                  </p>
                </div>
              </article>
            </div>
          {/each}
        </div>
      {/if}
    {/each}
  </div>
</div>

<style>
  .card-wide {
    min-height: 14rem;
  }
</style>