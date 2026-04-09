<script lang="ts">
	import { page } from "$app/state";
	import favicon from "$lib/assets/favicon.svg";
	import PageHeader from "$lib/components/page-header.svelte";
	import SearchButton from "$lib/components/search-button.svelte";
	import { Heading } from "$lib/components/ui/heading";
	import { getI18n } from "$lib/i18n";
	import type { SearchOverlayConfig } from "../search-overlay.svelte.ts";

	const i18n = $derived(getI18n(page.data.locale));
	let {
		searchLabel = i18n.messages.header.search,
		showSearchButton = false,
		searchOverlayConfig
	}: {
		searchLabel?: string;
		showSearchButton?: boolean;
		searchOverlayConfig?: SearchOverlayConfig;
	} = $props();
</script>

<PageHeader>
	<div class="flex items-center gap-4">
		<img src={favicon} alt="bAIbus" class="size-8 rounded-md object-contain" />
		<Heading as="h1" size="3xl">
			bAIbus
		</Heading>
	</div>
	{#if showSearchButton || searchOverlayConfig}
		<SearchButton
			aria-label={searchLabel}
			overlayConfig={searchOverlayConfig}
		/>
	{/if}
</PageHeader>
