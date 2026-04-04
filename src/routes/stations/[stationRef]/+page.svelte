<script lang="ts">
	import { Bookmark, ChevronLeft, MapPin } from "@lucide/svelte";
	import { onMount } from "svelte";

	import { fetchStationDepartures } from "$lib/api/station-departures";
	import AppBottomNav from "$lib/components/app-bottom-nav.svelte";
	import { IconAction } from "$lib/components/ui/icon-action";
	import { Card, CardList } from "$lib/components/ui/card";
	import {
		isFavoriteStationId,
		loadFavoriteStations,
		persistFavoriteStations,
		toggleFavoriteStation,
		type FavoriteStation
	} from "$lib/station-favorites";
	import type { LiveDeparture } from "$lib/types/departure";

	import type { PageData } from "./$types";

	const REFRESH_INTERVAL_MS = 20_000;
	const fetchedAtFormatter = new Intl.DateTimeFormat("sk-SK", {
		timeZone: "Europe/Bratislava",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit"
	});

	let { data }: { data: PageData } = $props();
	let favoriteStations = $state<FavoriteStation[]>([]);
	let departureBoard = $state<PageData["departureBoard"]>(null);
	let departureErrorMessage = $state<string | null>(null);
	let isRefreshingDepartures = $state(false);
	let activeRefreshController = $state<AbortController | null>(null);

	let stationMapHref = $derived(
		`https://www.openstreetmap.org/?mlat=${data.station.latitude}&mlon=${data.station.longitude}#map=18/${data.station.latitude}/${data.station.longitude}`
	);
	let isFavorite = $derived(isFavoriteStationId(favoriteStations, data.station.id));
	let departures = $derived(departureBoard?.departures ?? []);
	let lastFetchedAt = $derived(
		departureBoard ? fetchedAtFormatter.format(new Date(departureBoard.fetchedAt)) : null
	);

	$effect(() => {
		departureBoard = data.departureBoard;
		departureErrorMessage = data.departureError;
	});

	function getLineBadgeClass(routeType: number | null) {
		if (routeType === 0) {
			return "bg-rose-600 text-white";
		}

		if (routeType === 3) {
			return "bg-blue-600 text-white";
		}

		if (routeType === 50) {
			return "bg-emerald-600 text-white";
		}

		return "bg-slate-700 text-white";
	}

	function getStatusClass(departure: LiveDeparture) {
		if (departure.delayMinutes > 0) {
			return "text-amber-600";
		}

		if (departure.delayMinutes < 0) {
			return "text-sky-600";
		}

		if (departure.isLive) {
			return "text-emerald-600";
		}

		return "text-slate-500";
	}

	async function refreshDepartures() {
		if (isRefreshingDepartures) {
			return;
		}

		const refreshController = new AbortController();
		activeRefreshController?.abort();
		activeRefreshController = refreshController;
		isRefreshingDepartures = true;

		try {
			departureBoard = await fetchStationDepartures(fetch, data.station.id, refreshController.signal);
			departureErrorMessage = null;
		} catch (caughtError) {
			if (refreshController.signal.aborted) {
				return;
			}

			departureErrorMessage =
				caughtError instanceof Error
					? caughtError.message
					: "Unable to refresh live departures right now.";
		} finally {
			if (activeRefreshController === refreshController) {
				activeRefreshController = null;
			}

			isRefreshingDepartures = false;
		}
	}

	function handleFavoriteToggle() {
		const nextFavoriteStations = toggleFavoriteStation(favoriteStations, {
			id: data.station.id,
			name: data.station.name,
			type: data.station.stationType
		});

		favoriteStations = nextFavoriteStations;
		persistFavoriteStations(nextFavoriteStations);
	}

	onMount(() => {
		favoriteStations = loadFavoriteStations();
		persistFavoriteStations(favoriteStations);

		const refreshTimer = window.setInterval(() => {
			void refreshDepartures();
		}, REFRESH_INTERVAL_MS);

		return () => {
			window.clearInterval(refreshTimer);
			activeRefreshController?.abort();
		};
	});
</script>

<svelte:head>
	<title>{data.station.name} | AIBus</title>
	<meta
		name="description"
		content={`Station detail for ${data.station.name} in ${data.station.city}.`}
	/>
</svelte:head>

<div class="bg-slate-50 text-slate-800">
	<div class="mx-auto flex h-dvh max-w-screen-sm flex-col overflow-x-hidden">
		<div class="route-transition-shell min-h-0 flex flex-1 flex-col overflow-x-hidden">
			<main class="min-h-0 flex-1 overflow-y-auto pb-8">
				<section
					aria-labelledby="station-heading"
					class="sticky top-0 z-20 bg-slate-50/95 px-6 pb-4 backdrop-blur-sm"
					style:padding-top={"calc(env(safe-area-inset-top) + 1rem)"}
				>
					<div class="flex items-start justify-between gap-4">
						<div class="min-w-0 flex-1">
							<div class="flex min-w-0 items-center gap-3">
								<a
									href="/"
									class="-ml-1 inline-flex size-10 shrink-0 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-slate-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
									aria-label="Back to home"
								>
									<ChevronLeft class="size-6" strokeWidth={2.4} />
								</a>

								<h1
									id="station-heading"
									class="min-w-0 truncate text-2xl font-extrabold tracking-tight text-slate-800"
								>
									{data.station.name}
								</h1>
							</div>
						</div>

						<div class="flex shrink-0 items-center gap-2">
							<IconAction
								aria-label={isFavorite ? "Remove station from favourites" : "Add station to favourites"}
								aria-pressed={isFavorite}
								onclick={handleFavoriteToggle}
							>
								<Bookmark
									class="size-5"
									strokeWidth={2.2}
									fill={isFavorite ? "currentColor" : "none"}
								/>
							</IconAction>
							<IconAction
								href={stationMapHref}
								target="_blank"
								rel="noreferrer"
								aria-label="Open station on map"
							>
								<MapPin class="size-5" strokeWidth={2.2} />
							</IconAction>
						</div>
					</div>
				</section>

				<section aria-labelledby="upcoming-heading" class="mt-6 px-6">
					<div class="flex items-center justify-between gap-4">
						<h2
							id="upcoming-heading"
							class="text-xs font-extrabold uppercase tracking-widest text-slate-500"
						>
							Upcoming Departures
						</h2>
						<div class="text-right">
							<p class="text-xs font-extrabold uppercase tracking-widest text-slate-500">
								{isRefreshingDepartures ? "Refreshing" : "Live IDS BK"}
							</p>
							<p class="mt-1 text-sm font-medium text-slate-500">
								{#if lastFetchedAt}
									Updated {lastFetchedAt}
								{:else}
									Waiting for data
								{/if}
							</p>
						</div>
					</div>

					<CardList class="mt-6">
						{#if departures.length === 0}
							<Card>
								<p class="text-sm font-semibold text-slate-600">
									{departureErrorMessage ??
										"No live departures are available for this station right now."}
								</p>
							</Card>
						{:else}
							{#each departures as departure}
								<Card>
									<div class="flex items-center justify-between gap-3">
										<div
											class="flex min-w-0 flex-1 items-center gap-3"
										>
											<div
												class={`flex h-11 min-w-11 shrink-0 items-center justify-center rounded-2xl px-2 text-base font-extrabold tracking-tight ${getLineBadgeClass(departure.routeType)}`}
											>
												{departure.line}
											</div>

											<div class="min-w-0 flex-1">
												<p class="min-w-0 truncate text-base font-bold tracking-tight text-slate-800">
													{departure.destination}
												</p>
												<div
													class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold uppercase tracking-widest text-slate-500"
												>
													{#if departure.platform}
														<span>{departure.platform}</span>
													{/if}
													<span>{departure.predictedDeparture}</span>
													{#if departure.delayMinutes !== 0}
														<span>Sched. {departure.scheduledDeparture}</span>
													{/if}
												</div>
											</div>
										</div>

										<div class="shrink-0 text-right">
											{#if departure.minutesUntilDeparture === 0}
												<p class="text-3xl font-extrabold tracking-tight text-blue-600">Now</p>
											{:else}
												<p class="text-3xl font-extrabold tracking-tight text-slate-800">
													{departure.minutesUntilDeparture}<span
														class="ml-1 text-sm font-medium"
													>
														min
													</span>
												</p>
											{/if}
											<p
												class={`-mt-1 text-xs font-extrabold uppercase tracking-wider ${getStatusClass(departure)}`}
											>
												{departure.statusLabel}
											</p>
										</div>
									</div>
								</Card>
							{/each}
						{/if}
					</CardList>

					<div class="mt-6 rounded-3xl bg-slate-100/80 px-4 py-4 text-sm text-slate-600">
						{#if lastFetchedAt}
							<p class="font-semibold text-slate-700">Last updated at {lastFetchedAt}.</p>
						{:else}
							<p class="font-semibold text-slate-700">Live departures are waiting for data.</p>
						{/if}
						<p class="mt-1">Departures refresh every 20 seconds.</p>
						{#if departureErrorMessage && departures.length > 0}
							<p class="mt-2 text-amber-700">{departureErrorMessage}</p>
						{/if}
					</div>
				</section>
			</main>
		</div>

		<AppBottomNav />
	</div>
</div>
