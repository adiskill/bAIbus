<script lang="ts">
	import AppBottomNav from "$lib/components/app-bottom-nav.svelte";
	import AppHeader from "$lib/components/app-header.svelte";
	import { Card, CardList } from "$lib/components/ui/card";
	import { Clock3, TableProperties } from "@lucide/svelte";

	const timetableSections = [
		"Browse stops and lines",
		"Check the next scheduled departures",
		"Review full-day service patterns"
	];
</script>

<svelte:head>
	<title>Timetables | AIBus</title>
	<meta
		name="description"
		content="Transit timetables page for departures, schedules, and line lookup."
	/>
</svelte:head>

<div class="bg-slate-50 text-slate-800">
	<div class="mx-auto flex h-dvh max-w-screen-sm flex-col">
		<div class="route-transition-shell min-h-0 flex flex-1 flex-col">
			<AppHeader searchLabel="Search timetables" />

			<main class="min-h-0 flex-1 overflow-y-auto px-6 py-6">
				<section aria-labelledby="timetables-heading">
					<h2
						id="timetables-heading"
						class="text-lg font-extrabold tracking-tight text-slate-800"
					>
						Timetables
					</h2>

					<Card class="mt-8 px-5 py-5">
						<div class="flex items-start gap-4">
							<div class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
								<TableProperties class="size-7 text-slate-500" strokeWidth={2.1} />
							</div>
							<div>
								<h3 class="text-xl font-bold tracking-tight text-slate-800">
									Schedule lookup
								</h3>
								<p class="mt-2 leading-7 text-slate-600">
									This page is ready for line timetables, stop boards, and service-day specific
									schedules.
								</p>
							</div>
						</div>
					</Card>

					<CardList class="mt-8">
						{#each timetableSections as section}
							<Card>
								<div class="flex items-center gap-4">
									<div class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
										<Clock3 class="size-7 text-slate-500" strokeWidth={2.1} />
									</div>
									<p class="text-lg font-bold tracking-tight text-slate-800">
										{section}
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
