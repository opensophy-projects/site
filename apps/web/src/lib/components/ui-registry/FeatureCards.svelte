<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import Time from 'carbon-icons-svelte/lib/Time.svelte';
	import Layers from 'carbon-icons-svelte/lib/Layers.svelte';
	import Information from 'carbon-icons-svelte/lib/Information.svelte';
	import Idea from 'carbon-icons-svelte/lib/Idea.svelte';
	import Security from 'carbon-icons-svelte/lib/Security.svelte';
	import IbmCloudContinuousDelivery from 'carbon-icons-svelte/lib/IbmCloudContinuousDelivery.svelte';
	import Flow from 'carbon-icons-svelte/lib/Flow.svelte';
	import ChartEvaluation from 'carbon-icons-svelte/lib/ChartEvaluation.svelte';
	import Construction from 'carbon-icons-svelte/lib/Construction.svelte';
	import Radar from 'carbon-icons-svelte/lib/Radar.svelte';
	import Chat from 'carbon-icons-svelte/lib/Chat.svelte';
	import SearchLocate from 'carbon-icons-svelte/lib/SearchLocate.svelte';
	import Document from 'carbon-icons-svelte/lib/Document.svelte';
	import Terminal from 'carbon-icons-svelte/lib/Terminal.svelte';

	type IconKey =
		| 'contracts'
		| 'scheduling'
		| 'processing'
		| 'diagnostics'
		| 'security'
		| 'cicd'
		| 'pipeline'
		| 'triage'
		| 'construction'
		| 'radar'
		| 'chat'
		| 'search'
		| 'document'
		| 'terminal';

	type FeatureCard = {
		title: string;
		description: string;
		icon: IconKey;
	};
	type Props = {
		class?: string;
		cards?: FeatureCard[];
	};
	const defaultCards: FeatureCard[] = [
		{
			title: 'Строгие контракты',
			description:
				'Описывайте компоненты с жёсткой валидацией параметров, типов и зависимостей ещё до запуска в продакшен.',
			icon: 'contracts'
		},
		{
			title: 'Планировщик кадров',
			description:
				'Управляйте потоком обработки с явным порядком стадий и поведением инвалидации под конкретный сценарий.',
			icon: 'scheduling'
		},
		{
			title: 'Постобработка',
			description:
				'Компонуйте проходы рендера и именованные таргеты — от одного полноэкранного шейдера до полных визуальных пайплайнов.',
			icon: 'processing'
		},
		{
			title: 'Диагностика ошибок',
			description:
				'Нормализуйте ошибки в структурированные отчёты с фрагментами исходника, подсказками и обработкой для продакшена.',
			icon: 'diagnostics'
		}
	];
	let { class: className = '', cards = defaultCards }: Props = $props();
</script>

<div class={cn('inset-shadow w-full overflow-hidden rounded-xl bg-background-inset p-2', className)}>
	<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
		{#each cards as card (card.title)}
			<div
				class="inset-shadow relative overflow-hidden rounded-lg bg-background-inset p-1.5"
			>
				<article class="grid min-h-54 rounded-md bg-background p-4 card sm:min-h-72 sm:p-6">
					<div class="flex items-start justify-start">
						<div
							class="inset-shadow grid size-12 place-items-center rounded-sm bg-background-inset text-accent"
						>
							{#if card.icon === 'contracts'}
								<Idea size={32} />
							{:else if card.icon === 'scheduling'}
								<Time size={32} />
							{:else if card.icon === 'processing'}
								<Layers size={32} />
							{:else if card.icon === 'security'}
								<Security size={32} />
							{:else if card.icon === 'cicd'}
								<IbmCloudContinuousDelivery size={32} />
							{:else if card.icon === 'pipeline'}
								<Flow size={32} />
							{:else if card.icon === 'triage'}
								<ChartEvaluation size={32} />
							{:else if card.icon === 'construction'}
								<Construction size={32} />
							{:else if card.icon === 'radar'}
								<Radar size={32} />
							{:else if card.icon === 'chat'}
								<Chat size={32} />
							{:else if card.icon === 'search'}
								<SearchLocate size={32} />
							{:else if card.icon === 'document'}
								<Document size={32} />
							{:else if card.icon === 'terminal'}
								<Terminal size={32} />
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
</div>