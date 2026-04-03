	<script lang="ts">
		import { QueryClientProvider } from "@tanstack/svelte-query";

		import { createAppQueryClient } from "$lib/query/client";
		import './layout.css';
		import favicon from '$lib/assets/favicon.svg';

		let { children } = $props();
		const queryClient = createAppQueryClient();
	</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<QueryClientProvider client={queryClient}>
	{@render children()}
</QueryClientProvider>
