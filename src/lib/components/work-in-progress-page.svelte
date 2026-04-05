<script lang="ts">
	import AppBottomNav from "$lib/components/app-bottom-nav.svelte";
	import AppHeader from "$lib/components/app-header.svelte";
	import { Button } from "$lib/components/ui/button";
	import { Card } from "$lib/components/ui/card";
	import { Heading } from "$lib/components/ui/heading";
	import type { LocalizedMessages } from "$lib/i18n/catalog";
	import { Construction, House } from "@lucide/svelte";

	let {
		featureName,
		messages,
		searchLabel = messages.header.search
	}: {
		featureName: string;
		messages: LocalizedMessages;
		searchLabel?: string;
	} = $props();
</script>

<div class="bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
	<div class="mx-auto flex h-dvh max-w-screen-sm flex-col">
		<div class="route-transition-shell min-h-0 flex flex-1 flex-col">
			<AppHeader {searchLabel} showSearchButton={false} />

			<main class="min-h-0 flex-1 overflow-y-auto px-6 py-6">
				<section
					aria-labelledby="work-in-progress-heading"
					class="flex min-h-full items-center"
				>
					<Card class="w-full rounded-xl px-6 py-6 shadow-sm">
						<div class="flex size-14 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200">
							<Construction class="size-8" strokeWidth={2.2} />
						</div>

						<p class="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
							{featureName}
						</p>

						<Heading id="work-in-progress-heading" as="h2" size="3xl" class="mt-3">
							{messages.workInProgress.heading}
						</Heading>

						<p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
							{messages.workInProgress.description(featureName)}
						</p>

						<p class="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
							{messages.workInProgress.homeHint}
						</p>

						<Button href="/" variant="secondary" size="lg" class="mt-8 w-full">
							<House class="size-5" strokeWidth={2.2} />
							{messages.workInProgress.openHome}
						</Button>
					</Card>
				</section>
			</main>
		</div>

		<AppBottomNav />
	</div>
</div>
