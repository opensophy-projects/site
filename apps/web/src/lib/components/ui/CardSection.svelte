<script lang="ts">
	// ─── Tool badges for card 1 ───────────────────────────────────────────────
	const _securityTools = ["SCA", "SAST", "DAST", "LINT", "WAF", "IaC"];

	// ─── Automation checklist items ───────────────────────────────────────────
	const automationVisible = [
		"ежедневный бэкап данных и логов",
		"управление сетью и firewall-правилами",
		"оптимизация работы git-репозиториев",
	];
	const automationHidden = [
		"ротация ключей доступа",
		"мониторинг состояния сервисов",
		"автоочистка устаревших артефактов",
	];
</script>

<section class="services-grid">
	<style>
		/* ── Grid layout ─────────────────────────────────────────────────── */
		.services-grid {
			display: grid;
			grid-template-columns: 1fr 1fr;
			grid-template-rows: auto auto auto;
			gap: 0.75rem;
			width: 100%;
			box-sizing: border-box;
		}

		/* Card 1 — top-left */
		.card-security-analysis { grid-column: 1; grid-row: 1; }
		/* Card 2 — top-right */
		.card-pentest            { grid-column: 2; grid-row: 1; }
		/* Card 3 — full-width middle */
		.card-automation         { grid-column: 1 / -1; grid-row: 2; }
		/* Card 4 — bottom-left */
		.card-dev                { grid-column: 1; grid-row: 3; }
		/* Card 5 — bottom-right */
		.card-access             { grid-column: 2; grid-row: 3; }
		/* Card 6 — full-width bottom (knowledge) */
		.card-knowledge          { grid-column: 1 / -1; grid-row: 4; }

		@media (max-width: 600px) {
			.services-grid {
				grid-template-columns: 1fr;
			}
			.card-security-analysis,
			.card-pentest,
			.card-automation,
			.card-dev,
			.card-access,
			.card-knowledge {
				grid-column: 1;
				grid-row: auto;
			}
		}

		/* ── Shared card shell ────────────────────────────────────────────── */
		.card-shell {
			inset-shadow: var(--inset-shadow, inset 0 1px 0 rgba(255,255,255,0.06));
			position: relative;
			overflow: hidden;
			border-radius: 0.5rem;
			background: var(--background-inset);
			padding: 0.375rem;
		}

		.card-inner {
			position: relative;
			border-radius: 0.375rem;
			background: var(--background);
			overflow: hidden;
			display: flex;
			flex-direction: column;
			min-height: 18rem;
		}

		/* ── Visual areas ────────────────────────────────────────────────── */
		.visual-area {
			position: relative;
			height: 9rem;
			overflow: hidden;
			flex-shrink: 0;
		}


		/* ── Card text ───────────────────────────────────────────────────── */
		.card-body {
			padding: 1rem 1.25rem 1.25rem;
			display: flex;
			flex-direction: column;
			gap: 0.5rem;
			flex: 1;
		}

		.card-badge {
			font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
			font-size: 0.6rem;
			font-weight: 700;
			letter-spacing: 0.12em;
			text-transform: uppercase;
			color: var(--foreground-muted, rgba(255,255,255,0.4));
			margin-bottom: 0.25rem;
		}

		.card-title {
			font-size: 1rem;
			font-weight: 600;
			line-height: 1.3;
			color: var(--foreground);
			margin: 0;
		}

		.card-desc {
			font-size: 0.82rem;
			line-height: 1.6;
			color: var(--foreground-muted, rgba(255,255,255,0.55));
			margin: 0;
			flex: 1;
		}

		@media (min-width: 768px) {
			.card-title { font-size: 1.125rem; }
			.card-desc  { font-size: 0.9rem; }
			.card-badge { font-size: 0.65rem; }
		}

		.card-price {
			display: flex;
			align-items: baseline;
			gap: 0.3em;
			margin-top: 0.75rem;
		}
		.card-price-from {
			font-family: ui-monospace, monospace;
			font-size: 0.6rem;
			font-weight: 500;
			letter-spacing: 0.06em;
			text-transform: uppercase;
			color: var(--foreground-muted, rgba(255,255,255,0.35));
		}
		.card-price-value {
			font-size: 1rem;
			font-weight: 600;
			color: var(--foreground);
			letter-spacing: -0.01em;
		}

		/* ═══════════════════════════════════════════════════════════════════
		   CARD 1 — Security Analysis Visual
		   Tool badges on horizontal lines (like the Seamless Integrations card)
		   ═══════════════════════════════════════════════════════════════════ */
		.sa-visual {
			display: flex;
			flex-direction: column;
			justify-content: space-around;
			padding: 1.1rem 0 0.5rem;
			height: 100%;
			gap: 0;
		}

		.sa-row {
			position: relative;
			display: flex;
			align-items: center;
			justify-content: center;
			height: 2.1rem;
			gap: 0.75rem;
		}

		/* horizontal connector line */
		.sa-row::before {
			content: '';
			position: absolute;
			inset: 0;
			margin: auto 0;
			height: 1px;
			background: var(--border, rgba(255,255,255,0.1));
		}

		.sa-badge {
			position: relative;
			display: inline-flex;
			align-items: center;
			height: 1.75rem;
			padding: 0 0.65rem;
			border-radius: 999px;
			background: var(--background);
			border: 1px solid var(--border, rgba(255,255,255,0.12));
			box-shadow: 0 2px 8px rgba(0,0,0,0.28);
			font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
			font-size: 0.65rem;
			font-weight: 700;
			letter-spacing: 0.06em;
			color: var(--foreground-muted, rgba(255,255,255,0.55));
			white-space: nowrap;
			z-index: 2;
		}

		/* accent the first badge in each row */
		.sa-badge-accent {
			color: var(--accent, #e8834a);
			border-color: color-mix(in srgb, var(--accent, #e8834a) 30%, transparent);
		}

		/* slight stagger while keeping badges in the visible center zone */
		.sa-row:nth-child(1) { transform: translateX(-1.5rem); }
		.sa-row:nth-child(2) { transform: translateX(1.5rem); }
		.sa-row:nth-child(3) { transform: translateX(-0.75rem); }

		/* ═══════════════════════════════════════════════════════════════════
		   CARD 2 — Pentest Visual (concentric arcs, like Real-time Sync)
		   ═══════════════════════════════════════════════════════════════════ */
		.pt-visual {
			position: absolute;
			inset: 0;
		}

		/* vertical centre line */
		.pt-vline {
			position: absolute;
			left: 50%;
			top: 0; bottom: 0;
			width: 1px;
			background: color-mix(in srgb, var(--foreground, #fff) 12%, transparent);
		}

		/* outer arc */
		.pt-arc-outer {
			position: absolute;
			left: -3rem; right: -3rem;
			top: 1.2rem;
			aspect-ratio: 1;
			border-radius: 50%;
			border: 1px solid color-mix(in srgb, var(--foreground, #fff) 10%, transparent);
		}

		/* outer arc accent half */
		.pt-arc-outer-accent {
			position: absolute;
			left: -3rem; right: -3rem;
			top: 1.2rem;
			aspect-ratio: 1;
			border-radius: 50%;
			border: 1px solid var(--accent, #e8834a);
			/* show only right half */
			-webkit-mask-image: linear-gradient(90deg, transparent 50%, black 50%);
			mask-image: linear-gradient(90deg, transparent 50%, black 50%);
		}

		/* inner arc */
		.pt-arc-inner {
			position: absolute;
			left: 0; right: 0;
			top: 3.5rem;
			aspect-ratio: 1;
			border-radius: 50%;
			border: 1px solid color-mix(in srgb, var(--foreground, #fff) 10%, transparent);
		}

		/* inner arc accent half — lime, like the original */
		.pt-arc-inner-accent {
			position: absolute;
			left: 0; right: 0;
			top: 3.5rem;
			aspect-ratio: 1;
			border-radius: 50%;
			border: 1px solid #84cc16;
			-webkit-mask-image: linear-gradient(90deg, black 50%, transparent 50%);
			mask-image: linear-gradient(90deg, black 50%, transparent 50%);
		}

		/* ═══════════════════════════════════════════════════════════════════
		   CARD 3 — Automation (full-width checklist)
		   ═══════════════════════════════════════════════════════════════════ */
		.auto-visual {
			display: flex;
			flex-direction: column;
			align-items: center;
			padding: 1.25rem 1.5rem 0.5rem;
			gap: 0.45rem;
			height: 100%;
			position: relative;
		}

		.auto-item {
			display: flex;
			align-items: center;
			gap: 0.6rem;
			width: 100%;
			max-width: 32rem;
			min-height: 2rem;
			padding: 0.42rem 0.75rem;
			border-radius: 999px;
			border: 1px solid var(--border, rgba(255,255,255,0.1));
			background: color-mix(in srgb, var(--background-inset) 70%, transparent);
			font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
			font-size: 0.7rem;
			color: var(--foreground-muted, rgba(255,255,255,0.55));
			overflow: hidden;
		}

		.auto-item span:last-child {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			min-width: 0;
		}

		.auto-check {
			display: grid;
			place-items: center;
			flex: 0 0 1.1rem;
			width: 1.1rem;
			height: 1.1rem;
			border-radius: 50%;
			background: #2f6bff;
			color: #fff;
			font-size: 0.6rem;
			font-weight: 800;
		}

		.auto-hidden {
			position: relative;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 0.45rem;
			width: 100%;
			opacity: 0.42;
			-webkit-mask-image: linear-gradient(180deg, black 0%, transparent 100%);
			mask-image: linear-gradient(180deg, black 0%, transparent 100%);
		}

		.auto-item-muted .auto-check {
			background: color-mix(in srgb, #2f6bff 35%, rgba(255,255,255,0.15));
		}

		/* full-width card gets a wider visual and shorter min-height */
		.card-automation .card-inner {
			min-height: 10rem;
			flex-direction: row;
		}

		.card-automation .visual-area {
			width: 52%;
			height: auto;
			flex-shrink: 0;
			border-radius: 0 0 0 0.375rem;
		}

		.card-automation .card-body {
			flex: 1;
			justify-content: center;
		}

		@media (max-width: 600px) {
			.card-automation .card-inner {
				flex-direction: column;
			}
			.card-automation .visual-area {
				width: 100%;
				height: 9rem;
			}
		}

		/* ═══════════════════════════════════════════════════════════════════
		   CARD 4 — Web Dev Visual (vertical bars, like Developer First)
		   ═══════════════════════════════════════════════════════════════════ */
		.dev-bars {
			display: flex;
			align-items: flex-end;
			justify-content: space-between;
			gap: 0;
			height: 100%;
			padding: 1.25rem 1.25rem 0.5rem;
		}

		.dev-bar {
			flex: 1;
			background: color-mix(in srgb, var(--foreground, #fff) 12%, transparent);
			border-radius: 2px 2px 0 0;
			min-width: 3px;
			max-width: 7px;
		}

		.dev-bar-accent {
			background: var(--accent, #e8834a) !important;
		}

		/* ═══════════════════════════════════════════════════════════════════
		   CARD 5 — Secure Access Visual (shield, like Enterprise Ready)
		   ═══════════════════════════════════════════════════════════════════ */
		.access-shield {
			position: absolute;
			inset: 0;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.access-shield svg {
			width: 7rem;
			height: 7rem;
			opacity: 0.18;
		}

		.access-shield-inner svg {
			position: absolute;
			width: 5rem;
			height: 5rem;
			opacity: 1;
		}

		/* lock icon overlay */
		.access-chips {
			position: absolute;
			inset: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 0.5rem;
			flex-wrap: wrap;
			padding: 1rem;
			z-index: 3;
		}

		.access-chip {
			display: inline-flex;
			align-items: center;
			height: 1.6rem;
			padding: 0 0.6rem;
			border-radius: 999px;
			border: 1px solid var(--border, rgba(255,255,255,0.1));
			background: color-mix(in srgb, var(--background) 80%, transparent);
			font-family: ui-monospace, monospace;
			font-size: 0.62rem;
			font-weight: 700;
			letter-spacing: 0.05em;
			color: var(--foreground-muted, rgba(255,255,255,0.5));
			white-space: nowrap;
		}

		/* ═══════════════════════════════════════════════════════════════════
		   CARD 6 — Knowledge Visual (open book lines, like Real-time Sync)
		   ═══════════════════════════════════════════════════════════════════ */
		.knowledge-visual {
			position: absolute;
			inset: 0;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.knowledge-visual svg {
			width: min(90%, 18rem);
			height: auto;
			opacity: 0.85;
		}
	</style>

	<!-- ══════════════════════════════════════════════════════════════════════
	     CARD 1 — Интеграция анализа безопасности
	     ══════════════════════════════════════════════════════════════════════ -->
	<div class="card-shell card-security-analysis">
		<div class="card-inner">
			<div class="visual-area" style="height: 9.5rem;">
				<div class="sa-visual" aria-hidden="true">
					<!-- Row 1: SCA · SAST -->
					<div class="sa-row">
						<span class="sa-badge sa-badge-accent">SCA</span>
						<span class="sa-badge">SAST</span>
					</div>
					<!-- Row 2: DAST · LINT (offset right) -->
					<div class="sa-row">
						<span class="sa-badge sa-badge-accent">DAST</span>
						<span class="sa-badge">LINT</span>
					</div>
					<!-- Row 3: WAF · IaC -->
					<div class="sa-row">
						<span class="sa-badge">WAF</span>
						<span class="sa-badge sa-badge-accent">IaC Scan</span>
					</div>
				</div>
			</div>
			<div class="card-body">
				<p class="card-badge">Услуга</p>
				<h3 class="card-title">Интеграция анализа безопасности</h3>
				<p class="card-desc">
					Интегрируем автоматический анализ кода на уязвимости на каждом этапе разработки.
					Проверяем исходный код, тестируем работающее приложение и отслеживаем уязвимости
					в библиотеках — всё автоматически в CI/CD без участия команды.
				</p>
				<div class="card-price">
					<span class="card-price-from">от</span>
					<span class="card-price-value">10 000 ₽</span>
				</div>
			</div>
		</div>
	</div>

	<!-- ══════════════════════════════════════════════════════════════════════
	     CARD 2 — Проверка защищённости
	     ══════════════════════════════════════════════════════════════════════ -->
	<div class="card-shell card-pentest">
		<div class="card-inner">
			<div class="visual-area" style="height: 9.5rem; overflow: hidden; position: relative;">
				<div class="pt-visual" aria-hidden="true">
					<div class="pt-vline"></div>
					<div class="pt-arc-outer"></div>
					<div class="pt-arc-outer-accent"></div>
					<div class="pt-arc-inner"></div>
					<div class="pt-arc-inner-accent"></div>
				</div>
			</div>
			<div class="card-body">
				<p class="card-badge">Услуга</p>
				<h3 class="card-title">Проверка защищённости</h3>
				<p class="card-desc">
					Этично проверяем сервис или сервер на наличие уязвимостей: открытые точки входа,
					слабые конфигурации и всё, что может стать проблемой раньше, чем вы об этом узнаете.
				</p>
				<div class="card-price">
					<span class="card-price-from">от</span>
					<span class="card-price-value">5 000 ₽</span>
				</div>
			</div>
		</div>
	</div>

	<!-- ══════════════════════════════════════════════════════════════════════
	     CARD 3 — Автоматизация (full-width)
	     ══════════════════════════════════════════════════════════════════════ -->
	<div class="card-shell card-automation">
		<div class="card-inner">
			<!-- Visual: checklist on the left side -->
			<div class="visual-area">
				<div class="auto-visual" aria-hidden="true">
					{#each automationVisible as item, i (item)}
						<div class="auto-item" class:auto-item-muted={i === 2}>
							<span class="auto-check">✓</span>
							<span>{item}</span>
						</div>
					{/each}
					<div class="auto-hidden">
						{#each automationHidden as item (item)}
							<div class="auto-item auto-item-muted">
								<span class="auto-check">✓</span>
								<span>{item}</span>
							</div>
						{/each}
					</div>
				</div>
			</div>
			<!-- Text on the right -->
			<div class="card-body">
				<p class="card-badge">Услуга</p>
				<h3 class="card-title">Автоматизация</h3>
				<p class="card-desc">
					Автоматизируем рутину — от простого bash-скрипта до сложных решений под
					индивидуальные требования.
				</p>
				<div class="card-price">
					<span class="card-price-from">от</span>
					<span class="card-price-value">15 000 ₽</span>
				</div>
			</div>
		</div>
	</div>

	<!-- ══════════════════════════════════════════════════════════════════════
	     CARD 4 — Разработка под заказ
	     ══════════════════════════════════════════════════════════════════════ -->
	<div class="card-shell card-dev">
		<div class="card-inner">
			<div class="visual-area" style="height: 9.5rem;" aria-hidden="true">
				<div class="dev-bars">
					{#each Array(28) as _, i (i)}
						{@const heights = [55,40,70,45,90,60,35,80,50,75,42,88,30,65,48,92,38,72,55,85,44,68,36,78,52,62,47,58]}
						<div
							class="dev-bar"
							class:dev-bar-accent={[4,9,12,18,23,26].includes(i)}
							style="height: {heights[i % heights.length]}%"
						></div>
					{/each}
				</div>
			</div>
			<div class="card-body">
				<p class="card-badge">Услуга</p>
				<h3 class="card-title">Разработка под заказ</h3>
				<p class="card-desc">
					Создаём сайты, лендинги и веб-системы под любой стек — React, Svelte, Next.js,
					Node.js и другие. Пишем чистый, поддерживаемый код и сдаём в срок.
				</p>
				<div class="card-price">
					<span class="card-price-from">от</span>
					<span class="card-price-value">20 000 ₽</span>
				</div>
			</div>
		</div>
	</div>

	<!-- ══════════════════════════════════════════════════════════════════════
	     CARD 5 — Настройка безопасного доступа
	     ══════════════════════════════════════════════════════════════════════ -->
	<div class="card-shell card-access">
		<div class="card-inner">
			<div class="visual-area" style="height: 9.5rem; position: relative;" aria-hidden="true">
				<!-- Large faded shield -->
				<div class="access-shield">
					<svg viewBox="0 0 92 104" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M46 4L82 18V46C82 70 68 88 46 100C24 88 10 70 10 46V18L46 4Z"
							stroke="currentColor"
							stroke-width="1.5"
							fill="none"
						/>
					</svg>
				</div>
				<!-- Chips for protocols -->
				<div class="access-chips">
					<span class="access-chip">mTLS</span>
					<span class="access-chip">VPN</span>
					<span class="access-chip">Zero Trust</span>
					<span class="access-chip">SSH</span>
					<span class="access-chip">OIDC</span>
				</div>
			</div>
			<div class="card-body">
				<p class="card-badge">Услуга</p>
				<h3 class="card-title">Настройка безопасного доступа</h3>
				<p class="card-desc">
					Настраиваем и интегрируем защищённый доступ к сервисам и серверам. Подбираем
					решение под задачу — mTLS, VPN, Zero Trust или другой подход. Доступ получают
					только те, кому вы это разрешили.
				</p>
				<div class="card-price">
					<span class="card-price-from">от</span>
					<span class="card-price-value">10 000 ₽</span>
				</div>
			</div>
		</div>
	</div>

	<!-- ══════════════════════════════════════════════════════════════════════
	     CARD 6 — Знания каждому! (full-width)
	     ══════════════════════════════════════════════════════════════════════ -->
	<div class="card-shell card-knowledge">
		<div class="card-inner" style="flex-direction: row; min-height: 10rem;">
			<!-- Open book SVG visual -->
			<div class="visual-area" style="width: 44%; height: auto; flex-shrink: 0;">
				<div class="knowledge-visual" aria-hidden="true">
					<svg viewBox="0 0 220 150" fill="none" xmlns="http://www.w3.org/2000/svg"
						style="animation: bookFloat 6.8s ease-in-out infinite;">
						<!-- left page -->
						<path
							d="M108 118C82 101 56 96 26 101V31C57 25 82 33 108 51Z"
							fill="color-mix(in srgb, currentColor 8%, transparent)"
							stroke="color-mix(in srgb, currentColor 20%, transparent)"
							stroke-width="1.4"
						/>
						<!-- right page -->
						<path
							d="M112 118C138 101 164 96 194 101V31C163 25 138 33 112 51Z"
							fill="color-mix(in srgb, currentColor 8%, transparent)"
							stroke="color-mix(in srgb, currentColor 20%, transparent)"
							stroke-width="1.4"
						/>
						<!-- spine -->
						<path d="M110 51V122" stroke="color-mix(in srgb, currentColor 22%, transparent)" stroke-width="1.4" stroke-linecap="round"/>
						<!-- left text lines -->
						<path d="M43 51C62 49 80 53 96 63"  stroke="color-mix(in srgb, currentColor 16%, transparent)" stroke-width="1.4" stroke-linecap="round" fill="none"/>
						<path d="M43 70C63 68 80 72 96 82"  stroke="color-mix(in srgb, currentColor 16%, transparent)" stroke-width="1.4" stroke-linecap="round" fill="none"/>
						<path d="M43 89C63 87 80 91 96 101" stroke="color-mix(in srgb, currentColor 16%, transparent)" stroke-width="1.4" stroke-linecap="round" fill="none"/>
						<!-- right text lines -->
						<path d="M177 51C158 49 140 53 124 63"  stroke="color-mix(in srgb, currentColor 16%, transparent)" stroke-width="1.4" stroke-linecap="round" fill="none"/>
						<path d="M177 70C157 68 140 72 124 82"  stroke="color-mix(in srgb, currentColor 16%, transparent)" stroke-width="1.4" stroke-linecap="round" fill="none"/>
						<path d="M177 89C157 87 140 91 124 101" stroke="color-mix(in srgb, currentColor 16%, transparent)" stroke-width="1.4" stroke-linecap="round" fill="none"/>
						<!-- shadow -->
						<path d="M26 101C58 98 83 104 110 122C137 104 162 98 194 101"
							stroke="color-mix(in srgb, currentColor 28%, transparent)" stroke-width="1.4" stroke-linecap="round" fill="none"/>
					</svg>
				</div>
			</div>
			<!-- Text -->
			<div class="card-body" style="justify-content: center;">
				<p class="card-badge">Открытые знания</p>
				<h3 class="card-title">Знания каждому!</h3>
				<p class="card-desc">
					Пишем понятные статьи и гайды по DevSecOps и не только. Рассказываем как настроить
					безопасность с нуля и сделать её частью культуры команды.
				</p>
			</div>
		</div>
	</div>
</section>

<style>
	@keyframes bookFloat {
		0%, 100% { transform: translateY(0) rotate(-1deg); }
		50%       { transform: translateY(-0.6rem) rotate(1deg); }
	}
</style>