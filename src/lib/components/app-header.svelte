<script lang="ts">
	import { page } from "$app/state";
	import favicon from "$lib/assets/favicon.svg";
	import PageHeader from "$lib/components/page-header.svelte";
	import { Heading } from "$lib/components/ui/heading";
	import { getI18n } from "$lib/i18n";
	import { Search } from "@lucide/svelte";

	const i18n = $derived(getI18n(page.data.locale));
	let {
		searchLabel = i18n.messages.header.search,
		showSearchButton = true,
		onSearchClick
	}: {
		searchLabel?: string;
		showSearchButton?: boolean;
		onSearchClick?: (trigger: HTMLButtonElement) => void | Promise<void>;
	} = $props();
</script>

<PageHeader>
	<div class="flex items-center gap-4">
		<img src={favicon} alt="AIBus" class="size-8 rounded-md object-contain" />
		<Heading as="h1" size="3xl">
			AIBus
		</Heading>
	</div>
	{#if showSearchButton}
		<button
			type="button"
			class="flex size-10 items-center justify-center rounded-full text-slate-500 dark:text-slate-400"
			aria-label={searchLabel}
			onclick={(event) =>
				void onSearchClick?.(event.currentTarget as HTMLButtonElement)}
		>
			<Search class="size-7" strokeWidth={2.2} />
		</button>
	{/if}
</PageHeader>
