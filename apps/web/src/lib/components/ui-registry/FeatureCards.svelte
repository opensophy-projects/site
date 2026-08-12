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
  import DataBase from 'carbon-icons-svelte/lib/DataBase.svelte';
  import DocumentSecurity from 'carbon-icons-svelte/lib/DocumentSecurity.svelte';
  import Terminal from 'carbon-icons-svelte/lib/Terminal.svelte';

  type IconKey =
    | 'contracts' | 'scheduling' | 'processing' | 'diagnostics'
    | 'security' | 'settings' | 'shield' | 'report'
    | 'network' | 'search' | 'idea' | 'database'
    | 'document' | 'terminal';

  type Section = {
    label: string;
    text: string;
  };

  type FeatureCard = {
    title: string;
    description: string;
    icon: IconKey;
    wide?: boolean;
    sections?: Section[];
    footer?: string;
  };

  type Props = {
    class?: string;
    cards?: FeatureCard[];
  };

  const defaultCards: FeatureCard[] = [];
  let { class: className = '', cards = defaultCards }: Props = $props();

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

{#snippet iconSnippet(icon: IconKey, size: number)}
  {#if icon === 'security'}<Security {size} />
  {:else if icon === 'settings'}<Settings {size} />
  {:else if icon === 'shield'}<ShieldAlert {size} />
  {:else if icon === 'report'}<Report {size} />
  {:else if icon === 'network'}<NetworkAdminControl {size} />
  {:else if icon === 'search'}<Search {size} />
  {:else if icon === 'idea'}<Idea {size} />
  {:else if icon === 'database'}<DataBase {size} />
  {:else if icon === 'document'}<DocumentSecurity {size} />
  {:else if icon === 'terminal'}<Terminal {size} />
  {:else if icon === 'scheduling'}<Time {size} />
  {:else if icon === 'processing'}<Layers {size} />
  {:else}<Information {size} />
  {/if}
{/snippet}

<div class={cn('inset-shadow w-full overflow-hidden rounded-xl bg-background-inset p-2', className)}>
  <div class="flex flex-col gap-2">
    {#each rows as row}
      {#if row.type === 'wide'}
        <div class="inset-shadow relative overflow-hidden rounded-lg bg-background-inset p-1.5">
          <article class="rounded-md bg-background p-5 sm:p-7 flex flex-col gap-5">

            <!-- Иконка + заголовок в одну строку -->
            <div class="flex items-center gap-3">
              <div class="inset-shadow grid size-11 shrink-0 place-items-center rounded-sm bg-background-inset text-accent">
                {@render iconSnippet(row.card.icon, 28)}
              </div>
              <h3 class="text-lg font-medium tracking-tight text-foreground leading-snug">
                {row.card.title}
              </h3>
            </div>

            <!-- Основное описание -->
            <p class="text-base font-normal tracking-normal text-foreground-muted leading-relaxed">
              {row.card.description}
            </p>

            <!-- Секции (blackbox / graybox / whitebox и т.п.) -->
            {#if row.card.sections && row.card.sections.length > 0}
              <div class="flex flex-col gap-3 border-t border-foreground/8 pt-4">
                {#each row.card.sections as section}
                  <div class="flex gap-3">
                    <span class="shrink-0 text-sm font-medium text-accent w-20">{section.label}</span>
                    <span class="text-sm text-foreground-muted leading-relaxed">{section.text}</span>
                  </div>
                {/each}
              </div>
            {/if}

            <!-- Подходит для -->
            {#if row.card.footer}
              <p class="text-sm text-foreground/40 border-t border-foreground/8 pt-4">
                {row.card.footer}
              </p>
            {/if}

          </article>
        </div>

      {:else}
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {#each row.cards as card (card.title)}
            <div class="inset-shadow relative overflow-hidden rounded-lg bg-background-inset p-1.5">
              <article class="flex flex-col gap-4 rounded-md bg-background p-5 sm:p-6 min-h-52 sm:min-h-64">

                <!-- Иконка + заголовок в одну строку -->
                <div class="flex items-center gap-3">
                  <div class="inset-shadow grid size-11 shrink-0 place-items-center rounded-sm bg-background-inset text-accent">
                    {@render iconSnippet(card.icon, 28)}
                  </div>
                  <h3 class="text-base font-medium tracking-tight text-foreground leading-snug">
                    {card.title}
                  </h3>
                </div>

                <!-- Описание -->
                <p class="text-sm font-normal tracking-normal text-foreground-muted leading-relaxed">
                  {card.description}
                </p>

                <!-- Подходит для -->
                {#if card.footer}
                  <p class="text-xs text-foreground/40 mt-auto pt-3 border-t border-foreground/8">
                    {card.footer}
                  </p>
                {/if}

              </article>
            </div>
          {/each}
        </div>
      {/if}
    {/each}
  </div>
</div>