<script lang="ts">
	import type { ClassValue } from 'clsx';
	import { cn } from '../../utils/cn';
	type Props = {
		class?: ClassValue;
		onContactsClick?: () => void;
	}
	let { class: className, onContactsClick }: Props = $props();
</script>
<section class={cn('team-section', className)}>
	<div class="team-inner">
		<p class="section-overline">О создателе</p>
		<h2 class="team-heading">
			DevSecOps-инженер<br />и исследователь<br /><span class="text-accent">безопасности</span>
		</h2>
		<p class="team-sub">
			Внедрение DevSecOps, аудит приложений и инфраструктуры, автоматизация, ответственное раскрытие уязвимостей.
		</p>
		<div class="team-tags">
			{#each ['DevSecOps', 'CI/CD Security', 'SAST / DAST / SCA', 'Docker Security', 'Bash & Python', 'Web App Audit', 'AI Security'] as tag (tag)}
				<span class="team-tag">{tag}</span>
			{/each}
		</div>
		<p class="team-open-to-work">
			Открыт к предложениям — ищу компанию или команду в роли DevSecOps-инженера.
			<button type="button" class="team-link team-contact-btn" onclick={onContactsClick}>Написать</button>
		</p>
	</div>
</section>
<style>
	.team-section {
		width: 100%;
		padding-top: clamp(2rem, 4vw, 3rem);
		padding-bottom: clamp(4rem, 8vw, 7rem);
	}
	.team-inner {
		max-width: 80rem;
		margin: 0 auto;
		padding: 0 1rem;
		max-width: 42rem;
	}
	.section-overline {
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--foreground-muted);
		margin: 0 0 1.5rem;
	}
	.team-heading {
		font-size: clamp(1.75rem, 3vw, 2.5rem);
		font-weight: 500;
		letter-spacing: -0.02em;
		line-height: 1.2;
		color: var(--foreground);
		margin: 0 0 1.25rem;
	}
	.team-sub {
		font-size: 0.9rem;
		line-height: 1.7;
		color: var(--foreground-muted);
		margin: 0 0 1.5rem;
	}
	.team-link {
		color: var(--accent);
		text-decoration: none;
		transition: opacity 150ms ease-out;
	}
	.team-link:hover { opacity: 0.75; }
	.team-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-bottom: 1.75rem;
	}
	.team-tag {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--foreground-muted);
		background: var(--background-inset);
		border: 1px solid var(--border);
		padding: 0.2rem 0.55rem;
		border-radius: 999px;
	}
	.team-open-to-work {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-size: 0.875rem;
		color: var(--foreground-muted);
		margin: 0;
	}
	.team-contact-btn {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		font-size: inherit;
		font-weight: 500;
	}
</style>