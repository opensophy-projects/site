<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { resolve } from '$app/paths';
	import { brandingConfig, siteConfig } from '$lib';
	import FloatingMenu from '$lib/components/ui/FloatingMenu.svelte';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
	import { contactsState } from '$lib/stores/contacts.svelte';
	import Email from 'carbon-icons-svelte/lib/Email.svelte';
	import LogoGithub from 'carbon-icons-svelte/lib/LogoGithub.svelte';
	import Close from 'carbon-icons-svelte/lib/Close.svelte';
	const menuGroups = [
		{
			title: 'Платформа',
			links: [
				{ label: 'Документация', href: resolve('/docs') },
				{ label: 'Статьи', href: resolve('/article') },
				{ label: 'Компоненты', href: resolve('/components') }
			]
		},
		{
			title: 'Проект',
			links: [
				{
					label: 'Контакты',
					href: '#',
					onclick: (e: MouseEvent) => {
						e.preventDefault();
						contactsState.open();
					}
				}
			]
		}
	];
	const contacts = [
		{
			label: 'GitHub',
			href: siteConfig.links.github,
			icon: LogoGithub
		},
		{
			label: siteConfig.links.email,
			href: `mailto:${siteConfig.links.email}`,
			icon: Email
		}
	];
	function handleOverlayKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') contactsState.close();
	}
</script>
<FloatingMenu {menuGroups}>
	{#snippet centerContent()}
		<span class="font-medium lowercase tracking-tight text-foreground">{brandingConfig.name}</span>
	{/snippet}
	{#snippet actionsEnd()}
		<ThemeToggle />
	{/snippet}
</FloatingMenu>
{#if contactsState.isOpen}
	<div
		class="contacts-overlay fixed inset-0 z-[100] flex items-center justify-center bg-background-inset/80 backdrop-blur-sm"
		onclick={() => { contactsState.close(); }}
		onkeydown={handleOverlayKeydown}
		role="button"
		tabindex="-1"
		aria-label="Закрыть контакты"
	>
		<div
			class="contacts-modal relative w-full max-w-sm rounded-lg border border-border bg-background p-6 shadow-2xl"
			onclick={(e) => { e.stopPropagation(); }}
			onkeydown={(e) => { e.stopPropagation(); }}
			role="dialog"
			aria-modal="true"
			aria-label="Контакты"
			tabindex="-1"
		>
			<button
				type="button"
				class="absolute top-3 right-3 flex size-8 items-center justify-center rounded-sm text-foreground-muted transition-colors hover:bg-background-muted hover:text-foreground"
				onclick={() => { contactsState.close(); }}
				aria-label="Закрыть"
			>
				<Close size={18} />
			</button>
			<h2 class="mb-1 text-lg font-medium tracking-tight text-foreground">Контакты</h2>
			<p class="mb-5 text-sm text-foreground-muted">Свяжитесь через удобный канал.</p>
			<div class="flex flex-col gap-2">
				{#each contacts as contact (contact.href)}
					{@const Icon = contact.icon}
					<a
						href={contact.href}
						target={contact.href.startsWith('http') ? '_blank' : undefined}
						rel={contact.href.startsWith('http') ? 'external' : undefined}
						class="flex items-center gap-3 rounded-sm border border-border bg-background-inset px-4 py-3 text-sm font-medium text-foreground-muted transition-colors duration-150 ease-out hover:bg-background-muted hover:text-foreground"
					>
						<Icon size={18} />
						<span class="truncate">{contact.label}</span>
					</a>
				{/each}
			</div>
		</div>
	</div>
{/if}
<style>
	.contacts-overlay {
		animation: fade-in 200ms ease-out;
	}
	.contacts-modal {
		animation: scale-in 250ms ease-out;
	}
	@keyframes fade-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	@keyframes scale-in {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>