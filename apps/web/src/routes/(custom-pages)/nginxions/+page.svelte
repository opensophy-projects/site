<script lang="ts">
	import ArrowUpRight from 'carbon-icons-svelte/lib/ArrowUpRight.svelte';
	import LogoGithub from 'carbon-icons-svelte/lib/LogoGithub.svelte';
	import PageSeo from '$lib/components/seo/PageSeo.svelte';
	import SiteMenu from '$lib/components/ui-registry/SiteMenu.svelte';
	import Badge from '$lib/components/ui-registry/Badge.svelte';
	import FirewallIllustration from '$lib/components/home/FirewallIllustration.svelte';
	import { siteConfig } from '$lib/config/site';
	import {
		flagshipProducts,
		nginxionsFeatures,
		nginxionsLinks,
		nginxionsPrinciples
	} from '$lib/config/products';
	import { contactsState } from '$lib/stores/contacts.svelte';

	const product = flagshipProducts.nginxions;
	const title = 'NginxionS — прокси и платформа защиты приложений с ML-WAF | opensophy';
	const description =
		'NginxionS — open-source обратный прокси на nginx со встроенной защитой: WAF на машинном обучении (open-appsec), CrowdSec, свой центр сертификации и mTLS, аналитика трафика и роли. Работает без облака.';
	const keywords = [
		'NginxionS',
		'обратный прокси',
		'reverse proxy',
		'nginx',
		'WAF',
		'ML WAF',
		'open-appsec',
		'CrowdSec',
		'mTLS',
		'PKI',
		'Nginx Proxy Manager',
		'NPMplus',
		'self-hosted',
		'open source'
	];

	const origin = new URL(siteConfig.url).origin;
	const structuredData = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: product.name,
		description,
		applicationCategory: 'SecurityApplication',
		operatingSystem: 'Linux, Docker',
		url: `${origin}/nginxions`,
		downloadUrl: nginxionsLinks.github,
		softwareRequirements: 'Docker Engine 26+, Docker Compose 2.23+',
		creativeWorkStatus: 'В разработке',
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
		featureList: nginxionsFeatures.map((f) => f.name),
		author: { '@type': 'Organization', name: 'Opensophy', url: origin }
	});
</script>

<PageSeo {title} {description} {keywords} />
<svelte:head>
	<svelte:element this={'script'} type="application/ld+json">{structuredData}</svelte:element>
</svelte:head>

<main id="main-content" class="ngx-page">
	<SiteMenu />

	<!-- ─── Hero ─── -->
	<section class="hero">
		<div class="hero-copy">
			<p class="hero-status">
				<Badge variant="warning">В разработке</Badge>
			</p>
			<h1 class="hero-title">{product.name}</h1>
			<p class="hero-tagline">
				Прокси и платформа защиты приложений нового поколения с&nbsp;открытым исходным кодом
			</p>
			<p class="hero-desc">{product.description}</p>
			<div class="actions">
				<a class="btn btn-primary" href={nginxionsLinks.github} target="_blank" rel="noopener noreferrer">
					<LogoGithub size={16} /> Открыть на GitHub
				</a>
				<a class="btn" href={nginxionsLinks.docker} target="_blank" rel="noopener noreferrer">
					Docker Hub <ArrowUpRight size={16} />
				</a>
			</div>
		</div>
		<div class="hero-visual">
			<FirewallIllustration />
		</div>
	</section>

	<!-- ─── Возможности ─── -->
	<section class="block" aria-labelledby="features-title">
		<p class="overline"><Badge variant="default">Возможности</Badge></p>
		<h2 id="features-title" class="block-title">Всё для защиты сервисов в&nbsp;одном интерфейсе</h2>
		<ul class="features">
			{#each nginxionsFeatures as feature, i (feature.name)}
				<li class="feature inset-shadow bg-background-inset">
					<div class="feature-card card bg-background">
						<span class="feature-index">{String(i + 1).padStart(2, '0')}</span>
						<h3 class="feature-name">{feature.name}</h3>
						<p class="feature-text">{feature.text}</p>
					</div>
				</li>
			{/each}
		</ul>
	</section>

	<!-- ─── Принципы ─── -->
	<section class="block" aria-labelledby="principles-title">
		<p class="overline"><Badge variant="default">Принципы</Badge></p>
		<h2 id="principles-title" class="block-title">Как устроен NginxionS</h2>
		<ul class="principles">
			{#each nginxionsPrinciples as principle (principle.name)}
				<li class="principle">
					<h3 class="feature-name">{principle.name}</h3>
					<p class="feature-text">{principle.text}</p>
				</li>
			{/each}
		</ul>
	</section>

	<!-- ─── Контакты ─── -->
	<section class="block cta">
		<h2 class="block-title">Нужна помощь с внедрением?</h2>
		<p class="block-lead">Расскажите о задаче — поможем развернуть и настроить NginxionS под ваши сервисы.</p>
		<div class="actions">
			<button type="button" class="btn btn-primary" onclick={() => contactsState.open()}>Написать нам</button>
		</div>
	</section>
</main>

<style>
	.ngx-page {
		min-height: 100dvh;
		background: var(--background);
		color: var(--foreground);
	}

	/* ─── Hero ─── */
	.hero {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
		align-items: center;
		gap: clamp(1.5rem, 4vw, 4rem);
		width: 100%;
		max-width: 82rem;
		margin: 0 auto;
		padding: clamp(7rem, 12vw, 9rem) 1.5rem clamp(2rem, 5vw, 4rem);
		box-sizing: border-box;
	}

	.hero-status {
		margin: 0 0 1rem;
	}

	.hero-title {
		margin: 0;
		font-size: clamp(3rem, 7vw, 5.5rem);
		font-weight: 500;
		line-height: 1;
		letter-spacing: -0.04em;
	}

	.hero-tagline {
		margin: 1.25rem 0 0;
		font-size: clamp(1.25rem, 2.2vw, 1.75rem);
		font-weight: 500;
		line-height: 1.25;
		letter-spacing: -0.025em;
		color: var(--accent);
		text-wrap: balance;
	}

	.hero-desc {
		margin: 1.25rem 0 0;
		max-width: 36rem;
		font-size: clamp(1rem, 1.3vw, 1.15rem);
		line-height: 1.55;
		color: var(--foreground-muted);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 2rem;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-height: 2.9rem;
		padding: 0.7rem 1.25rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm, 0.55rem);
		background: var(--background-inset);
		font: inherit;
		font-size: 0.95rem;
		font-weight: 600;
		text-decoration: none;
		color: var(--foreground);
		cursor: pointer;
	}

	.btn-primary {
		border-color: transparent;
		background: var(--accent);
		color: #fff;
	}

	/* ─── Блоки ─── */
	.block {
		width: 100%;
		max-width: 82rem;
		margin: 0 auto;
		padding: clamp(2.5rem, 5vw, 4.5rem) 1.5rem 0;
		box-sizing: border-box;
	}

	.overline {
		display: flex;
		justify-content: center;
		margin: 0 0 1rem;
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.block-title {
		margin: 0 auto;
		max-width: 44rem;
		font-size: clamp(1.75rem, 3.4vw, 2.6rem);
		font-weight: 500;
		line-height: 1.15;
		letter-spacing: -0.03em;
		text-align: center;
		text-wrap: balance;
	}

	.block-lead {
		margin: 1rem auto 0;
		max-width: 42rem;
		font-size: clamp(1rem, 1.3vw, 1.15rem);
		line-height: 1.55;
		text-align: center;
		color: var(--foreground-muted);
	}

	/* ─── Сетка возможностей ─── */
	.features {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.75rem;
		margin: clamp(1.75rem, 3vw, 2.5rem) 0 0;
		padding: 0;
		list-style: none;
	}

	/* Последняя карточка добирает неполный ряд */
	.feature:last-child:nth-child(3n + 2) {
		grid-column: span 2;
	}

	.feature {
		padding: 0.375rem;
		border-radius: var(--radius-xl);
	}

	.feature-card {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		height: 100%;
		padding: 1.4rem 1.5rem 1.5rem;
		border-radius: var(--radius-lg);
		box-sizing: border-box;
	}

	.feature-index {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--accent);
	}

	.feature-name {
		margin: 0;
		font-size: 1.15rem;
		font-weight: 600;
		letter-spacing: -0.02em;
	}

	.feature-text {
		margin: 0;
		font-size: 0.98rem;
		line-height: 1.55;
		color: var(--foreground-muted);
	}

	/* ─── Принципы ─── */
	.principles {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1rem clamp(1.5rem, 3vw, 3rem);
		margin: clamp(1.75rem, 3vw, 2.5rem) 0 0;
		padding: 0;
		list-style: none;
	}

	.principle {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.cta {
		padding-bottom: clamp(4rem, 8vw, 7rem);
		text-align: center;
	}

	.cta .actions {
		justify-content: center;
	}

	@media (max-width: 1023px) {
		.hero {
			grid-template-columns: 1fr;
		}

		.features {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.feature:last-child:nth-child(3n + 2) {
			grid-column: auto;
		}

		.feature:last-child:nth-child(odd) {
			grid-column: span 2;
		}
	}

	@media (max-width: 767px) {
		.features,
		.principles {
			grid-template-columns: 1fr;
		}

		.feature:last-child:nth-child(odd) {
			grid-column: auto;
		}

		.hero {
			padding-left: 1rem;
			padding-right: 1rem;
		}

		.block {
			padding-left: 1rem;
			padding-right: 1rem;
		}
	}
</style>
