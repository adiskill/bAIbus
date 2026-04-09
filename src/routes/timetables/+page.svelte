<script lang="ts">
	import { page } from "$app/state";
	import WorkInProgressPage from "$lib/components/work-in-progress-page.svelte";
	import { getI18n } from "$lib/i18n";

	const i18n = $derived(getI18n(page.data.locale));
</script>

<svelte:head>
	<title>{i18n.messages.timetables.title} | bAIbus</title>
	<meta
		name="description"
		content={i18n.messages.timetables.metaDescription}
	/>
</svelte:head>

<WorkInProgressPage
	featureName={i18n.messages.timetables.heading}
	messages={i18n.messages}
	searchLabel={i18n.messages.header.searchTimetables}
/>
