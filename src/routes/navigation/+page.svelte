<script lang="ts">
	import { page } from "$app/state";
	import AppBottomNav from "$lib/components/app-bottom-nav.svelte";
	import AppHeader from "$lib/components/app-header.svelte";
	import { Card, CardList } from "$lib/components/ui/card";
	import { getI18n } from "$lib/i18n";
	import { MapPinned, Route } from "@lucide/svelte";

	const i18n = $derived(getI18n(page.data.locale));
	const quickActions = $derived(i18n.messages.navigation.quickActions);
</script>

<svelte:head>
	<title>{i18n.messages.navigation.title} | AIBus</title>
	<meta
		name="description"
		content={i18n.messages.navigation.metaDescription}
	/>
</svelte:head>

<div class="bg-slate-50 text-slate-800">
	<div class="mx-auto flex h-dvh max-w-screen-sm flex-col">
		<div class="route-transition-shell min-h-0 flex flex-1 flex-col">
			<AppHeader searchLabel={i18n.messages.header.searchRoutes} />

			<main class="min-h-0 flex-1 overflow-y-auto px-6 py-6">
				<section aria-labelledby="navigation-heading">
					<h2
						id="navigation-heading"
						class="text-lg font-extrabold tracking-tight text-slate-800"
					>
						{i18n.messages.navigation.heading}
					</h2>

					<Card class="mt-8 px-5 py-5">
						<div class="flex items-start gap-4">
							<div class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
								<Route class="size-7 text-slate-500" strokeWidth={2.1} />
							</div>
							<div>
								<h3 class="text-xl font-bold tracking-tight text-slate-800">
									{i18n.messages.navigation.cardTitle}
								</h3>
								<p class="mt-2 leading-7 text-slate-600">
									{i18n.messages.navigation.cardDescription}
								</p>
							</div>
						</div>
					</Card>

					<CardList class="mt-8">
						{#each quickActions as action}
							<Card>
								<div class="flex items-center gap-4">
									<div class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
										<MapPinned class="size-7 text-slate-500" strokeWidth={2.1} />
									</div>
									<p class="text-lg font-bold tracking-tight text-slate-800">
										{action}
									</p>
								</div>
							</Card>
						{/each}
					</CardList>
				</section>
			</main>
		</div>

		<AppBottomNav />
	</div>
</div>
