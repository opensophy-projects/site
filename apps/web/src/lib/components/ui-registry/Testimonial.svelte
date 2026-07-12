<script lang="ts">
	import { cn } from '$lib/utils/cn';

	type Props = {
		avatar?: string;
		name: string;
		role?: string;
		content: string;
		class?: string;
	};

	let {
		avatar = '',
		name,
		role = '',
		content,
		class: className = ''
	}: Props = $props();

	const initials = $derived(
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- name is typed as required, but callers outside this codebase's type-checking (JS, dynamic props, unchecked SSR data) can still pass undefined at runtime.
		(name ?? '')
			.split(' ')
			.map((n) => n[0])
			.slice(0, 2)
			.join('')
			.toUpperCase()
	);
</script>

<div class={cn('inset-shadow rounded-md bg-background-inset p-[1.5px]', className)}>
	<div class="rounded-[calc(var(--radius-md)-1.5px)] bg-background p-4 card">
		<div class="flex items-start gap-3">
			{#if avatar}
				<img src={avatar} alt={name} class="size-10 rounded-full object-cover" />
			{:else}
				<div class="flex size-10 items-center justify-center rounded-full bg-accent/10 text-sm font-medium text-accent">
					{initials}
				</div>
			{/if}
			<div class="flex-1">
				<div class="flex items-center gap-2">
					<span class="text-sm font-medium text-foreground">{name}</span>
					{#if role}
						<span class="text-xs text-foreground-muted">· {role}</span>
					{/if}
				</div>
				<p class="mt-1.5 text-sm leading-relaxed text-foreground-muted">{content}</p>
			</div>
		</div>
	</div>
</div>
