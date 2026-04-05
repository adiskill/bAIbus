	<script lang="ts">
	import { page } from "$app/state";
	import { browser } from "$app/environment";
	import { createQuery } from "@tanstack/svelte-query";
	import { onMount } from "svelte";

	import { fetchNearbyStops, type NearbyStopApiItem } from "$lib/api/nearby-stops";
	import AppBottomNav from "$lib/components/app-bottom-nav.svelte";
	import AppHeader from "$lib/components/app-header.svelte";
	import StationCard from "$lib/components/station-card.svelte";
	import { Card, CardList } from "$lib/components/ui/card";
	import { Heading } from "$lib/components/ui/heading";
	import { getI18n } from "$lib/i18n";
	import {
		loadFavoriteStations,
		persistFavoriteStations,
		type FavoriteStation
	} from "$lib/station-favorites";

	type NearbyStop = {
		id: number;
		name: string;
		distance: string;
	};

	const LOCATION_CACHE_MS = 60_000;
	const NEARBY_STOPS_CACHE_MS = 60_000;
	const i18n = $derived(getI18n(page.data.locale));
	const kilometerFormatter = $derived(
		new Intl.NumberFormat(i18n.intlLocale, {
			minimumFractionDigits: 1,
			maximumFractionDigits: 1
		})
	);

	let favoriteStops = $state<FavoriteStation[]>([]);
	let locationRequestPhase = $state<"finding" | "retrying">("finding");
	let locationRequestMessage = $derived(
		locationRequestPhase === "retrying"
			? i18n.messages.home.retryingLocation
			: i18n.messages.home.findingStops
	);

	function formatDistance(distanceMeters: number) {
		if (distanceMeters < 1000) {
			return `${Math.round(distanceMeters)} m`;
		}

		return `${kilometerFormatter.format(distanceMeters / 1000)} km`;
	}

	function getStationHref(station: Pick<FavoriteStation, "id">) {
		return `/stations/${station.id}`;
	}

	function mapStationToNearbyStop(station: NearbyStopApiItem): NearbyStop {
		return {
			id: station.id,
			name: station.name,
			distance: formatDistance(station.distance)
		};
	}

	function getCurrentPosition(options: PositionOptions) {
		return new Promise<GeolocationPosition>((resolve, reject) => {
			navigator.geolocation.getCurrentPosition(resolve, reject, options);
		});
	}

	async function getUserPosition() {
		try {
			locationRequestPhase = "finding";

			return await getCurrentPosition({
				enableHighAccuracy: false,
				timeout: 8000,
				maximumAge: LOCATION_CACHE_MS
			});
		} catch (error) {
			if (
				error instanceof GeolocationPositionError &&
				(error.code === error.POSITION_UNAVAILABLE || error.code === error.TIMEOUT)
			) {
				locationRequestPhase = "retrying";

				return getCurrentPosition({
					enableHighAccuracy: true,
					timeout: 20000,
					maximumAge: 0
				});
			}

			throw error;
		}
	}

	async function getGeolocationPermissionState() {
		if (!("permissions" in navigator) || typeof navigator.permissions.query !== "function") {
			return null;
		}

		try {
			const status = await navigator.permissions.query({ name: "geolocation" });
			return status.state;
		} catch {
			return null;
		}
	}

	function getLocationErrorMessage(error: GeolocationPositionError) {
		if (error.code === error.PERMISSION_DENIED) {
			return i18n.messages.home.locationPermissionDenied;
		}

		if (error.code === error.POSITION_UNAVAILABLE) {
			return i18n.messages.home.locationPositionUnavailable;
		}

		if (error.code === error.TIMEOUT) {
			return i18n.messages.home.locationTimeout;
		}

		return i18n.messages.home.locationUnavailable;
	}

	function getLocationSupportErrorMessage() {
		if (!navigator.geolocation) {
			return i18n.messages.home.locationNotAvailable;
		}

		if (!window.isSecureContext) {
			return i18n.messages.home.locationRequiresSecureContext;
		}

		return null;
	}

	async function getCachedUserPosition() {
		const supportErrorMessage = getLocationSupportErrorMessage();

		if (supportErrorMessage) {
			throw new Error(supportErrorMessage);
		}

		const permissionState = await getGeolocationPermissionState();

		if (permissionState === "denied") {
			throw new Error(i18n.messages.home.locationBlocked);
		}

		return getUserPosition();
	}

	const locationQuery = createQuery(() => ({
		queryKey: ["location"],
		queryFn: getCachedUserPosition,
		enabled: browser,
		staleTime: LOCATION_CACHE_MS,
		gcTime: LOCATION_CACHE_MS,
		retry: false
	}));

	const nearbyStopsQuery = createQuery<NearbyStopApiItem[], Error, NearbyStop[]>(() => {
		const position = locationQuery.data;

		return {
			queryKey: [
				"nearby-stops",
				position?.coords.latitude ?? null,
				position?.coords.longitude ?? null
			],
			queryFn: ({ signal }) =>
				fetchNearbyStops(
					fetch,
					{
						latitude: position!.coords.latitude,
						longitude: position!.coords.longitude
					},
					signal
				),
			enabled: browser && position !== undefined,
			select: (stations) => stations.map(mapStationToNearbyStop),
			staleTime: NEARBY_STOPS_CACHE_MS,
			gcTime: NEARBY_STOPS_CACHE_MS,
			retry: false
		};
	});

	let nearbyStops = $derived(nearbyStopsQuery.data ?? []);

	let nearbyStopsStatus = $derived.by((): "loading" | "ready" | "error" => {
		if (locationQuery.isError || nearbyStopsQuery.isError) {
			return "error";
		}

		if (nearbyStopsQuery.data !== undefined) {
			return "ready";
		}

		return "loading";
	});

	let nearbyStopsMessage = $derived.by(() => {
		if (locationQuery.isError) {
			const error = locationQuery.error;

			return error instanceof GeolocationPositionError
				? getLocationErrorMessage(error)
				: error instanceof Error
					? error.message
					: i18n.messages.home.locationUnavailable;
		}

		if (nearbyStopsQuery.isError) {
			const error = nearbyStopsQuery.error;
			return error instanceof Error
				? error.message
				: i18n.messages.home.nearbyStopsLoadError;
		}

		if (locationQuery.isPending) {
			return locationRequestMessage;
		}

		if (nearbyStopsQuery.isPending) {
			return i18n.messages.home.loadingNearbyStops;
		}

		return locationRequestMessage;
	});

	onMount(() => {
		favoriteStops = loadFavoriteStations();
		persistFavoriteStations(favoriteStops);
	});
</script>

<svelte:head>
	<title>{i18n.messages.home.title} | AIBus</title>
	<meta
		name="description"
		content={i18n.messages.home.metaDescription}
	/>
</svelte:head>

<div class="bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
	<div class="mx-auto flex h-dvh max-w-screen-sm flex-col">
		<div class="route-transition-shell min-h-0 flex flex-1 flex-col">
			<AppHeader searchLabel={i18n.messages.header.search} />

			<main class="min-h-0 flex-1 overflow-y-auto px-6 py-6">
				<section aria-labelledby="nearby-heading">
					<Heading id="nearby-heading">
						{i18n.messages.home.nearbyHeading}
					</Heading>

					<CardList class="mt-4">
						{#if nearbyStopsStatus === "loading"}
							<Card>
								<p class="text-sm font-semibold text-slate-600 dark:text-slate-300">{nearbyStopsMessage}</p>
							</Card>
						{:else if nearbyStopsStatus === "error"}
							<Card>
								<p class="text-sm font-semibold text-slate-600 dark:text-slate-300">{nearbyStopsMessage}</p>
							</Card>
						{:else if nearbyStops.length === 0}
							<Card>
								<p class="text-sm font-semibold text-slate-600 dark:text-slate-300">
									{i18n.messages.home.noNearbyStops}
								</p>
							</Card>
						{:else}
							{#each nearbyStops as stop}
								<StationCard
									href={getStationHref(stop)}
									name={stop.name}
									distance={stop.distance}
								/>
							{/each}
						{/if}
					</CardList>
				</section>

				{#if favoriteStops.length > 0}
					<section aria-labelledby="favorites-heading" class="mt-8">
						<Heading id="favorites-heading">
							{i18n.messages.home.favoritesHeading}
						</Heading>

						<CardList class="mt-4">
							{#each favoriteStops as favorite}
								<StationCard
									href={getStationHref(favorite)}
									name={favorite.name}
								/>
							{/each}
						</CardList>
					</section>
				{/if}
			</main>
		</div>

		<AppBottomNav />
	</div>
</div>
