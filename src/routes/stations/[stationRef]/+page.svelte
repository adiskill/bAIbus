<script lang="ts">
	import { page } from "$app/state";
	import { Bookmark, MapPin } from "@lucide/svelte";
	import { onMount } from "svelte";

	import { getRelativeArrivalDisplay } from "$lib/arrival-display";
	import { fetchStationDepartures } from "$lib/api/station-departures";
	import AppBottomNav from "$lib/components/app-bottom-nav.svelte";
	import BackButton from "$lib/components/back-button.svelte";
	import LessThanValue from "$lib/components/less-than-value.svelte";
	import LineNumber from "$lib/components/line-number.svelte";
	import PageHeader from "$lib/components/page-header.svelte";
	import { Button } from "$lib/components/ui/button";
	import { Heading } from "$lib/components/ui/heading";
	import { IconAction } from "$lib/components/ui/icon-action";
	import { Card, CardList, PressableCard } from "$lib/components/ui/card";
	import { getI18n } from "$lib/i18n";
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
	const INITIAL_DEPARTURE_LIMIT = 20;
	const DEPARTURE_BATCH_SIZE = 20;
	const MAX_DEPARTURE_LIMIT = 100;
	const i18n = $derived(getI18n(page.data.locale));

	let { data }: { data: PageData } = $props();
	let favoriteStations = $state<FavoriteStation[]>([]);
	let departureBoard = $state<PageData["departureBoard"]>(null);
	let departureErrorMessage = $state<string | null>(null);
	let loadMoreErrorMessage = $state<string | null>(null);
	let isRefreshingDepartures = $state(false);
	let isLoadingMoreDepartures = $state(false);
	let activeRefreshController = $state<AbortController | null>(null);
	let lastUpdatedAt = $state<Date | null>(null);
	let currentTimestamp = $state(Date.now());
	let departureLimit = $state(INITIAL_DEPARTURE_LIMIT);
	let canLoadMoreDepartures = $state(false);
	let loadMoreSentinel = $state<HTMLDivElement | null>(null);

	let stationMapHref = $derived(
		`https://www.openstreetmap.org/?mlat=${data.station.latitude}&mlon=${data.station.longitude}#map=18/${data.station.latitude}/${data.station.longitude}`
	);
	let isFavorite = $derived(isFavoriteStationId(favoriteStations, data.station.id));
	let departures = $derived.by(() => {
		const elapsedMs = lastUpdatedAt
			? Math.max(0, currentTimestamp - lastUpdatedAt.getTime())
			: 0;

		return (departureBoard ?? []).filter((departure) => departure.remainingMs - elapsedMs > 0);
	});
	let relativeLastUpdatedAt = $derived.by(() => {
		if (!lastUpdatedAt) {
			return null;
		}

		const elapsedSeconds = Math.max(
			0,
			Math.floor((currentTimestamp - lastUpdatedAt.getTime()) / 1000)
		);

		if (elapsedSeconds < 60) {
			return `${elapsedSeconds}s`;
		}

		const elapsedMinutes = Math.floor(elapsedSeconds / 60);

		if (elapsedMinutes < 60) {
			return `${elapsedMinutes}m`;
		}

		const elapsedHours = Math.floor(elapsedMinutes / 60);

		if (elapsedHours < 24) {
			return `${elapsedHours}h`;
		}

		return `${Math.floor(elapsedHours / 24)}d`;
	});

	$effect(() => {
		departureBoard = data.departureBoard;
		departureErrorMessage = data.departureError;
		loadMoreErrorMessage = null;
		departureLimit = INITIAL_DEPARTURE_LIMIT;
		canLoadMoreDepartures =
			(data.departureBoard?.length ?? 0) >= INITIAL_DEPARTURE_LIMIT;
		currentTimestamp = Date.now();
		lastUpdatedAt = data.departureFetchedAt ? new Date(data.departureFetchedAt) : null;
	});

	$effect(() => {
		if (
			!loadMoreSentinel ||
			departures.length === 0 ||
			!canLoadMoreDepartures ||
			isLoadingMoreDepartures ||
			isRefreshingDepartures ||
			loadMoreErrorMessage
		) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					void loadMoreDepartures();
				}
			},
			{
				rootMargin: "0px 0px 240px 0px"
			}
		);

		observer.observe(loadMoreSentinel);

		return () => {
			observer.disconnect();
		};
	});

	function getStatusClass(departure: LiveDeparture) {
		if (departure.delayMinutes > 0) {
			return "text-rose-600 dark:text-rose-400";
		}

		if (departure.isLive) {
			return "text-emerald-600 dark:text-emerald-400";
		}

		return "text-slate-500 dark:text-slate-400";
	}

	function getStatusLabel(departure: LiveDeparture) {
		if (!departure.isLive || departure.delayMinutes <= 0) {
			return null;
		}

		return `+${departure.delayMinutes} ${i18n.messages.station.minuteUnit}`;
	}

	function getTripHref(departure: LiveDeparture) {
		const searchParams = new URLSearchParams({
			from: page.url.pathname
		});

		return `/trips/${departure.id}?${searchParams.toString()}`;
	}

	function getRemainingDepartureMs(departure: LiveDeparture) {
		const elapsedMs = lastUpdatedAt
			? Math.max(0, currentTimestamp - lastUpdatedAt.getTime())
			: 0;

		return Math.max(0, departure.remainingMs - elapsedMs);
	}

	function getDepartureArrivalDisplay(departure: LiveDeparture) {
		return getRelativeArrivalDisplay(getRemainingDepartureMs(departure));
	}

	function getDepartureArrivalMinutes(departure: LiveDeparture) {
		const arrivalDisplay = getDepartureArrivalDisplay(departure);

		return arrivalDisplay.kind === "minutes" ? arrivalDisplay.minutes : 0;
	}

	async function refreshDepartures() {
		if (isRefreshingDepartures || isLoadingMoreDepartures) {
			return;
		}

		const refreshController = new AbortController();
		activeRefreshController?.abort();
		activeRefreshController = refreshController;
		isRefreshingDepartures = true;

		try {
			const refreshedDepartures = await fetchStationDepartures(
				fetch,
				data.station.id,
				{
					limit: departureLimit,
					signal: refreshController.signal
				}
			);

			departureBoard = refreshedDepartures.departures;
			departureErrorMessage = null;
			loadMoreErrorMessage = null;
			canLoadMoreDepartures =
				refreshedDepartures.departures.length >= departureLimit &&
				departureLimit < MAX_DEPARTURE_LIMIT;
			currentTimestamp = Date.now();
			lastUpdatedAt = new Date(refreshedDepartures.fetchedAt);
		} catch (caughtError) {
			if (refreshController.signal.aborted) {
				return;
			}

			departureErrorMessage =
				caughtError instanceof Error
					? caughtError.message
					: i18n.messages.station.refreshError;
		} finally {
			if (activeRefreshController === refreshController) {
				activeRefreshController = null;
			}

			isRefreshingDepartures = false;
		}
	}

	async function loadMoreDepartures() {
		if (
			isLoadingMoreDepartures ||
			isRefreshingDepartures ||
			!canLoadMoreDepartures
		) {
			return;
		}

		const nextLimit = Math.min(departureLimit + DEPARTURE_BATCH_SIZE, MAX_DEPARTURE_LIMIT);

		if (nextLimit === departureLimit) {
			canLoadMoreDepartures = false;
			return;
		}

		isLoadingMoreDepartures = true;
		loadMoreErrorMessage = null;

		try {
			const expandedDepartures = await fetchStationDepartures(fetch, data.station.id, {
				limit: nextLimit
			});

			departureBoard = expandedDepartures.departures;
			departureErrorMessage = null;
			departureLimit = nextLimit;
			canLoadMoreDepartures =
				expandedDepartures.departures.length >= nextLimit &&
				nextLimit < MAX_DEPARTURE_LIMIT;
			currentTimestamp = Date.now();
			lastUpdatedAt = new Date(expandedDepartures.fetchedAt);
		} catch (caughtError) {
			loadMoreErrorMessage =
				caughtError instanceof Error
					? caughtError.message
					: i18n.messages.station.loadMoreError;
		} finally {
			isLoadingMoreDepartures = false;
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
		currentTimestamp = Date.now();

		const refreshTimer = window.setInterval(() => {
			void refreshDepartures();
		}, REFRESH_INTERVAL_MS);
		const relativeTimeTimer = window.setInterval(() => {
			currentTimestamp = Date.now();
		}, 1_000);

		return () => {
			window.clearInterval(refreshTimer);
			window.clearInterval(relativeTimeTimer);
			activeRefreshController?.abort();
		};
	});
</script>

<svelte:head>
	<title>{data.station.name} | bAIbus</title>
	<meta
		name="description"
		content={i18n.messages.station.metaDescription(data.station.name, data.station.city)}
	/>
</svelte:head>

<div class="bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
	<div class="mx-auto min-h-dvh max-w-screen-sm overflow-x-hidden">
		<PageHeader>
			<div class="min-w-0 flex-1">
				<div class="flex min-w-0 items-center gap-3">
					<BackButton
						href="/"
						aria-label={i18n.messages.station.backToHome}
					/>

					<Heading
						as="h1"
						id="station-heading"
						class="min-w-0 truncate"
					>
						{data.station.name}
					</Heading>
				</div>
			</div>

			<div class="flex shrink-0 items-center gap-2">
				<IconAction
					aria-label={isFavorite
						? i18n.messages.station.removeFavorite
						: i18n.messages.station.addFavorite}
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
					aria-label={i18n.messages.station.openOnMap}
				>
					<MapPin class="size-5" strokeWidth={2.2} />
				</IconAction>
			</div>
		</PageHeader>

		<main class="route-transition-shell mt-[var(--app-header-offset)] mb-[var(--app-bottom-nav-offset)] min-h-[var(--app-content-min-height)] px-6 pt-6 pb-8">
			<section aria-labelledby="upcoming-heading">
				<div class="flex items-center justify-between gap-4">
					<Heading
						id="upcoming-heading"
						size="xs"
						class="uppercase tracking-widest text-slate-500 dark:text-slate-400"
					>
						{i18n.messages.station.upcomingHeading}
					</Heading>
					<div class="text-right">
						<p class="text-sm font-medium text-slate-500 dark:text-slate-400">
							{#if isRefreshingDepartures}
								{i18n.messages.station.refreshing}
							{:else if relativeLastUpdatedAt}
								{relativeLastUpdatedAt === "0s"
									? i18n.messages.station.updatedNow
									: i18n.messages.station.updatedAt(relativeLastUpdatedAt)}
							{:else}
								{i18n.messages.station.waitingForData}
							{/if}
						</p>
					</div>
				</div>

				<CardList class="mt-6">
					{#if departures.length === 0}
						<Card>
							<p class="text-sm font-semibold text-slate-600 dark:text-slate-300">
								{departureErrorMessage ??
									i18n.messages.station.noLiveDepartures}
							</p>
						</Card>
					{:else}
						{#each departures as departure}
							<PressableCard
								href={getTripHref(departure)}
								cardClass="overflow-hidden p-0"
								contentClass="flex items-center justify-between gap-3 px-4 py-4"
								aria-label={i18n.messages.station.openTripDetails(
									departure.line,
									departure.destination
								)}
							>
								<div
									class="flex min-w-0 flex-1 items-center gap-3"
								>
									<LineNumber
										line={departure.line}
									/>

									<div class="min-w-0 flex-1">
										<Heading
											as="p"
											size="base"
											class="min-w-0 truncate font-bold"
										>
											{departure.destination}
										</Heading>
										<div
											class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400"
										>
											{#if departure.platform}
												<span>{i18n.messages.station.platformLabel(departure.platform)}</span>
											{/if}
										</div>
									</div>
								</div>

								<div class="shrink-0 text-right">
									{#if getDepartureArrivalDisplay(departure).kind === "now"}
										<p class="text-3xl font-extrabold tracking-tight text-blue-600">
											{i18n.messages.station.now}
										</p>
									{:else if getDepartureArrivalDisplay(departure).kind === "underMinute"}
										<p class="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
											<LessThanValue /><span
												class="ml-1 text-sm font-medium"
											>
												{i18n.messages.station.minuteUnit}
											</span>
										</p>
									{:else}
										<p class="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
											{getDepartureArrivalMinutes(departure)}<span
												class="ml-1 text-sm font-medium"
											>
												{i18n.messages.station.minuteUnit}
											</span>
										</p>
									{/if}
									{#if getStatusLabel(departure)}
										<p
											class={`-mt-1 text-xs font-extrabold uppercase tracking-wider ${getStatusClass(departure)}`}
										>
											{getStatusLabel(departure)}
										</p>
									{/if}
								</div>
							</PressableCard>
						{/each}

						{#if isLoadingMoreDepartures || loadMoreErrorMessage}
							<Card aria-live="polite">
								<div class="flex items-center justify-between gap-3">
									<p class="text-sm font-semibold text-slate-600 dark:text-slate-300">
										{loadMoreErrorMessage ??
											i18n.messages.station.loadingMore}
									</p>
									{#if loadMoreErrorMessage}
										<Button
											size="sm"
											variant="outline"
											onclick={() => void loadMoreDepartures()}
										>
											{i18n.messages.station.retryLoadMore}
										</Button>
									{/if}
								</div>
							</Card>
						{/if}
					{/if}
				</CardList>

				{#if departures.length > 0 && canLoadMoreDepartures}
					<div bind:this={loadMoreSentinel} class="h-1" aria-hidden="true"></div>
				{/if}
			</section>
		</main>

		<AppBottomNav />
	</div>
</div>
