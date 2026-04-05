<script lang="ts">
	import { page } from "$app/state";
	import WorkInProgressPage from "$lib/components/work-in-progress-page.svelte";
	import { getI18n } from "$lib/i18n";

	const i18n = $derived(getI18n(page.data.locale));
</script>

<svelte:head>
	<title>{i18n.messages.navigation.title} | AIBus</title>
	<meta
		name="description"
		content={i18n.messages.navigation.metaDescription}
	/>
</svelte:head>

<WorkInProgressPage
	featureName={i18n.messages.navigation.heading}
	messages={i18n.messages}
	searchLabel={i18n.messages.header.searchRoutes}
/>
