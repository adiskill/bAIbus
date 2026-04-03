<script lang="ts">
	import AppBottomNav from "$lib/components/app-bottom-nav.svelte";
	import AppHeader from "$lib/components/app-header.svelte";
	import { Card } from "$lib/components/ui/card";
	import { ChevronLeft, Clock3, MapPinned } from "@lucide/svelte";

	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.station.name} | AIBus</title>
	<meta
		name="description"
		content={`Station detail for ${data.station.name} in ${data.station.city}.`}
	/>
</svelte:head>

<div class="bg-slate-50 text-slate-800">
	<div class="mx-auto flex h-dvh max-w-screen-sm flex-col">
		<AppHeader searchLabel="Search stations" />

		<main class="min-h-0 flex-1 overflow-y-auto px-6 py-6">
			<a
				href="/"
				class="inline-flex items-center gap-2 text-sm font-semibold text-blue-700"
			>
				<ChevronLeft class="size-4" strokeWidth={2.4} />
				Back to home
			</a>

			<section aria-labelledby="station-heading" class="mt-4">
				<p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
					{data.station.city}
				</p>
				<h2
					id="station-heading"
					class="mt-2 text-3xl font-extrabold tracking-tight text-slate-900"
				>
					{data.station.name}
				</h2>
			</section>

			<div class="mt-6 space-y-3">
				<Card class="px-5 py-5">
					<div class="flex items-start gap-4">
						<div class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
							<Clock3 class="size-7 text-slate-500" strokeWidth={2.1} />
						</div>
						<div>
							<h3 class="text-xl font-bold tracking-tight text-slate-800">
								Departures
							</h3>
							<p class="mt-2 leading-7 text-slate-600">
								Live departure boards and platform details can be added on this station page next.
							</p>
						</div>
					</div>
				</Card>

				<Card class="px-5 py-5">
					<div class="flex items-start gap-4">
						<div class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
							<MapPinned class="size-7 text-slate-500" strokeWidth={2.1} />
						</div>
						<div>
							<h3 class="text-xl font-bold tracking-tight text-slate-800">
								Location
							</h3>
							<p class="mt-2 leading-7 text-slate-600">
								{data.station.latitude.toFixed(5)}, {data.station.longitude.toFixed(5)}
							</p>
						</div>
					</div>
				</Card>
			</div>
		</main>

		<AppBottomNav />
	</div>
</div>
