<script lang="ts">
	import ArrowRight from 'carbon-icons-svelte/lib/ArrowRight.svelte';
	import Badge from '$lib/components/ui-registry/Badge.svelte';
	import FirewallIllustration from './FirewallIllustration.svelte';
	import { flagshipProducts, nginxionsFeatures as features, nginxionsLinks } from '$lib/config/products';

	const product = flagshipProducts.nginxions;
</script>

<section class="ngx" id="nginxions" aria-labelledby="nginxions-title">
	<p class="ngx-overline"><Badge variant="default">Флагманский продукт</Badge></p>

	<header class="ngx-head">
		<div class="ngx-head-title">
			<p class="ngx-name">{product.name}</p>
			<h2 id="nginxions-title" class="ngx-title">
				Прокси и платформа защиты приложений нового поколения с&nbsp;открытым исходным кодом
			</h2>
		</div>
		<div class="ngx-head-copy">
			<p class="ngx-desc">{product.description}</p>
			<a class="ngx-more" href={nginxionsLinks.github} target="_blank" rel="noopener noreferrer">
				Подробнее <ArrowRight size={16} />
			</a>
		</div>
	</header>

	<div class="ngx-visual">
		<FirewallIllustration />
	</div>

	<div class="ngx-features">
		<p class="ngx-features-label">Возможности</p>
		<ul class="ngx-features-list">
			{#each features as feature (feature.name)}
				<li>
					<details name="nginxions-feature">
						<summary>
							<span>{feature.name}</span>
							<span class="ngx-plus" aria-hidden="true"></span>
						</summary>
						<p>
							{feature.text}
							<a href={nginxionsLinks.github} target="_blank" rel="noopener noreferrer">
								Подробнее&nbsp;→
							</a>
						</p>
					</details>
				</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	.ngx {
		width: 100%;
		max-width: 82rem;
		margin: 0 auto;
		padding: clamp(2.5rem, 6vw, 5rem) 1.5rem;
		box-sizing: border-box;
		scroll-margin-top: 6rem;
	}

	/* Метка раздела — как «Продукты»: по центру секции */
	.ngx-overline {
		display: flex;
		justify-content: center;
		margin: 0 0 clamp(1.5rem, 3vw, 2.5rem);
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	/* ─── Шапка: заголовок слева, описание справа ─── */
	.ngx-head {
		display: grid;
		grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
		gap: 2rem clamp(2rem, 6vw, 6rem);
		align-items: start;
	}

	.ngx-name {
		margin: 0 0 0.9rem;
		font-family: var(--font-mono);
		font-size: 0.8rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--accent);
	}

	.ngx-title {
		margin: 0;
		font-size: clamp(1.75rem, 3.4vw, 2.75rem);
		font-weight: 500;
		line-height: 1.12;
		letter-spacing: -0.035em;
		text-wrap: balance;
		color: var(--foreground);
	}

	.ngx-head-copy {
		padding-top: clamp(0rem, 2.2vw, 1.9rem);
	}

	.ngx-desc {
		margin: 0;
		font-size: clamp(1.05rem, 1.45vw, 1.3rem);
		font-weight: 400;
		line-height: 1.45;
		letter-spacing: -0.015em;
		color: var(--foreground);
	}

	.ngx-more {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		margin-top: 1.5rem;
		font-size: 0.95rem;
		font-weight: 500;
		text-decoration: none;
		color: var(--foreground-muted);
		transition: color 150ms ease-out;
	}

	.ngx-more :global(svg) {
		transition: transform 150ms ease-out;
	}

	.ngx-more:hover {
		color: var(--accent);
	}

	.ngx-more:hover :global(svg) {
		transform: translateX(3px);
	}

	/* ─── Иллюстрация ─── */
	.ngx-visual {
		width: 100%;
		max-width: 62rem;
		margin: clamp(1.5rem, 4vw, 3.5rem) auto clamp(2rem, 5vw, 4rem);
	}

	/* ─── Возможности ─── */
	.ngx-features {
		display: grid;
		grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr) minmax(0, 1fr);
		gap: 1rem clamp(2rem, 6vw, 6rem);
		padding-top: 1.75rem;
	}

	.ngx-features-label {
		margin: 0;
		font-size: 0.95rem;
		color: var(--foreground-muted);
	}

	.ngx-features-list {
		/* Колонки, а не grid: раскрытый пункт не растягивает соседа по строке */
		grid-column: 2 / -1;
		columns: 2;
		column-gap: clamp(2rem, 6vw, 6rem);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.ngx-features-list li {
		break-inside: avoid;
	}

	summary {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.4rem 0;
		font-size: 0.95rem;
		font-weight: 500;
		color: var(--foreground);
		list-style: none;
		cursor: pointer;
		transition: color 150ms ease-out;
	}

	summary::-webkit-details-marker {
		display: none;
	}

	summary:hover,
	details[open] summary {
		color: var(--accent);
	}

	/* Плюс превращается в минус у раскрытого пункта */
	.ngx-plus {
		position: relative;
		flex: none;
		width: 0.6rem;
		height: 0.6rem;
		color: var(--foreground-muted);
	}

	.ngx-plus::before,
	.ngx-plus::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 0;
		width: 100%;
		height: 1px;
		background: currentColor;
		transition: transform 200ms ease-out;
	}

	.ngx-plus::after {
		transform: rotate(90deg);
	}

	details[open] .ngx-plus::after {
		transform: rotate(0deg);
	}

	details p {
		margin: 0.15rem 0 0.9rem;
		max-width: 26rem;
		font-size: 0.9rem;
		line-height: 1.5;
		color: var(--foreground-muted);
	}

	details p a {
		white-space: nowrap;
		text-decoration: none;
		color: var(--foreground);
	}

	details p a:hover {
		color: var(--accent);
	}

	@media (max-width: 899px) {
		.ngx-head {
			grid-template-columns: 1fr;
		}

		.ngx-head-copy {
			padding-top: 0;
		}

		.ngx-features {
			grid-template-columns: 1fr;
		}

		.ngx-features-list {
			grid-column: 1;
		}
	}

	@media (max-width: 559px) {
		.ngx {
			padding-left: 1rem;
			padding-right: 1rem;
		}
	}

	/* Список возможностей — только на десктопе */
	@media (max-width: 767px) {
		.ngx-features {
			display: none;
		}

		.ngx-visual {
			margin-bottom: 0;
		}
	}
</style>
