<script lang="ts">
	import { browser } from "$app/environment";
	import { afterNavigate, disableScrollHandling } from "$app/navigation";
	import { page } from "$app/state";
	import BackButton from "$lib/components/back-button.svelte";
	import PageHeader from "$lib/components/page-header.svelte";
	import { createQuery } from "@tanstack/svelte-query";
	import { tick } from "svelte";

	import { fetchTripState } from "$lib/api/trip-state";
	import AppBottomNav from "$lib/components/app-bottom-nav.svelte";
	import { getRelativeArrivalDisplay } from "$lib/arrival-display";
	import { Heading } from "$lib/components/ui/heading";
	import { IconAction } from "$lib/components/ui/icon-action";
	import LessThanValue from "$lib/components/less-than-value.svelte";
	import LineNumber from "$lib/components/line-number.svelte";
	import { getI18n } from "$lib/i18n";
	import { getTripSegmentProgress, type TripSegmentProgress } from "$lib/trip-progress";
	import { MapPin } from "@lucide/svelte";

	import type { TripStop, TripState } from "$lib/types/trip";
	import type { PageData } from "./$types";

	const TRIP_STATE_REFRESH_MS = 10_000;
	const TRIP_STATE_CACHE_MS = 60_000;

	let { data }: { data: PageData } = $props();

	const i18n = $derived(getI18n(page.data.locale));

	type RenderedTripStop = TripStop & {
		status: "past" | "current" | "upcoming" | "final";
		primaryTime: string;
		secondaryTime: string | null;
		note: string | null;
		underMinuteNotePrefix: string | null;
		delayLabel: string | null;
	};

	function parseTimeOfDay(timeOfDay: string) {
		const match = /^(\d{2}):(\d{2})$/.exec(timeOfDay);

		if (!match) {
			return 0;
		}

		return Number.parseInt(match[1], 10) * 60 + Number.parseInt(match[2], 10);
	}

	function formatTimeOfDay(minutesOfDay: number) {
		const normalizedMinutes = ((minutesOfDay % 1440) + 1440) % 1440;
		const hours = Math.floor(normalizedMinutes / 60);
		const minutes = normalizedMinutes % 60;

		return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
	}

	function getDelayMinutes(delaySeconds: number) {
		return Math.round(delaySeconds / 60);
	}

	function getCurrentBratislavaSecondsOfDay(now = new Date()) {
		const formatter = new Intl.DateTimeFormat("en-CA", {
			timeZone: "Europe/Bratislava",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hourCycle: "h23",
			hour12: false
		});
		const parts = Object.fromEntries(
			formatter
				.formatToParts(now)
				.filter((part) => part.type !== "literal")
				.map((part) => [part.type, part.value])
		);

		return (
			Number.parseInt(parts.hour, 10) * 3600 +
			Number.parseInt(parts.minute, 10) * 60 +
			Number.parseInt(parts.second, 10) +
			now.getMilliseconds() / 1000
		);
	}

	function getPredictedDepartureSeconds(stop: TripStop, delaySeconds: number) {
		return parseTimeOfDay(stop.departureTime) * 60 + delaySeconds;
	}

	function getPredictedDepartureDisplayMinutes(stop: TripStop, delaySeconds: number) {
		return parseTimeOfDay(stop.departureTime) + getDelayMinutes(delaySeconds);
	}

	function getRemainingMsUntil(predictedDepartureSeconds: number, currentSecondsOfDay: number) {
		return Math.max(0, Math.round((predictedDepartureSeconds - currentSecondsOfDay) * 1000));
	}

	function getTimeBasedLastDepartedIndex(
		stops: TripStop[],
		delay: number,
		currentSecondsOfDay: number
	) {
		for (let index = stops.length - 1; index >= 0; index -= 1) {
			const predictedDepartureSeconds = getPredictedDepartureSeconds(
				stops[index],
				delay
			);

			if (predictedDepartureSeconds <= currentSecondsOfDay) {
				return index;
			}
		}

		return -1;
	}

	function getLastDepartedIndex(stops: TripStop[], state: TripState) {
		if (state.departedStationId !== null) {
			for (let index = stops.length - 1; index >= 0; index -= 1) {
				if (stops[index].id === state.departedStationId) {
					return index;
				}
			}
		}

		return getTimeBasedLastDepartedIndex(
			stops,
			state.delay,
			getCurrentBratislavaSecondsOfDay()
		);
	}

	function getSegmentStartIndex(
		stops: TripStop[],
		lastDepartedIndex: number,
		segmentProgress: TripSegmentProgress | null
	) {
		if (
			segmentProgress === null ||
			lastDepartedIndex < 0 ||
			lastDepartedIndex >= stops.length - 1
		) {
			return -1;
		}

		return lastDepartedIndex;
	}

	function getStopLineFillPercent(
		index: number,
		lastDepartedIndex: number,
		activeSegmentStartIndex: number,
		segmentProgress: TripSegmentProgress | null
	) {
		if (index < lastDepartedIndex) {
			return 100;
		}

		if (segmentProgress !== null && index === activeSegmentStartIndex) {
			return Math.round(segmentProgress * 100);
		}

		return 0;
	}

	function buildRenderedTripStops(stops: TripStop[], state: TripState): RenderedTripStop[] {
		const currentSecondsOfDay = getCurrentBratislavaSecondsOfDay();
		const lastDepartedIndex = getLastDepartedIndex(stops, state);
		const lastIndex = stops.length - 1;

		return stops.map((stop, index) => {
			const predictedDepartureSeconds = getPredictedDepartureSeconds(
				stop,
				state.delay
			);
			const predictedDisplayMinutes = getPredictedDepartureDisplayMinutes(
				stop,
				state.delay
			);
			const isPast = lastDepartedIndex >= 0 && index <= lastDepartedIndex;
			const isFinal = index === lastIndex;
			const isCurrent =
				!isFinal &&
				((lastDepartedIndex === -1 && index === 0) || index === lastDepartedIndex + 1);
			const status = isFinal
				? "final"
				: isPast
					? "past"
					: isCurrent
						? "current"
						: "upcoming";
			const predictedRemainingMs = getRemainingMsUntil(
				predictedDepartureSeconds,
				currentSecondsOfDay
			);
			const arrivalDisplay = getRelativeArrivalDisplay(predictedRemainingMs);
			const delayMinutes = getDelayMinutes(state.delay);
			const delayLabel =
				delayMinutes > 0 && !isPast && isCurrent
				? i18n.messages.trip.delayBadge(delayMinutes)
					: null;

			return {
				...stop,
				status,
				primaryTime: formatTimeOfDay(predictedDisplayMinutes),
				secondaryTime: delayMinutes > 0 && !isPast ? stop.departureTime : null,
				note:
					status === "past"
						? null
						: arrivalDisplay.kind === "now"
							? i18n.messages.trip.arrivingNow
							: arrivalDisplay.kind === "underMinute"
								? null
								: i18n.messages.trip.arrivingIn(arrivalDisplay.minutes),
				underMinuteNotePrefix:
					status !== "past" && arrivalDisplay.kind === "underMinute"
						? i18n.messages.trip.arrivingLessThanMinutePrefix
						: null,
				delayLabel
			};
		});
	}

	const tripStateQuery = createQuery<TripState, Error, TripState>(() => ({
		queryKey: ["trip-state", data.trip.id, page.data.locale],
		queryFn: ({ signal }) => fetchTripState(fetch, data.trip.id, { signal }),
		enabled: browser,
		initialData: {
			delay: data.trip.delay,
			departedStationId: data.trip.departedStationId,
			vehiclePosition: data.trip.vehiclePosition
		},
		staleTime: TRIP_STATE_REFRESH_MS,
		gcTime: TRIP_STATE_CACHE_MS,
		refetchInterval: TRIP_STATE_REFRESH_MS,
		retry: false
	}));

	const liveTripState = $derived(
		tripStateQuery.data ?? {
			delay: data.trip.delay,
			departedStationId: data.trip.departedStationId,
			vehiclePosition: data.trip.vehiclePosition
		}
	);
	const lastDepartedIndex = $derived(getLastDepartedIndex(data.trip.stops, liveTripState));
	const segmentProgress = $derived(
		getTripSegmentProgress(
			data.trip.stops,
			lastDepartedIndex,
			liveTripState.vehiclePosition
		)
	);
	const activeSegmentStartIndex = $derived(
		getSegmentStartIndex(
			data.trip.stops,
			lastDepartedIndex,
			segmentProgress
		)
	);
	const scrollTargetIndex = $derived(lastDepartedIndex);
	const tripStops = $derived(buildRenderedTripStops(data.trip.stops, liveTripState));

	let tripContentElement = $state<HTMLElement | null>(null);
	let autoScrolledTripId = $state<string | null>(null);

	function waitForNextPaint() {
		return new Promise<void>((resolve) => {
			requestAnimationFrame(() => resolve());
		});
	}

	async function scrollLastDepartedStopIntoView() {
		await tick();
		await waitForNextPaint();
		await waitForNextPaint();

		if (!tripContentElement) {
			return;
		}

		const targetElement = tripContentElement.querySelector<HTMLElement>(
			'[data-last-departed-stop="true"]'
		);

		if (!targetElement) {
			return;
		}

		const scrollMarginTop = Number.parseFloat(getComputedStyle(targetElement).scrollMarginTop);
		const targetTop = targetElement.getBoundingClientRect().top + window.scrollY;

		window.scrollTo({
			top: Math.max(
				0,
				targetTop - (Number.isFinite(scrollMarginTop) ? scrollMarginTop : 0)
			),
			behavior: "auto"
		});

		autoScrolledTripId = data.trip.id;
	}

	if (browser) {
		afterNavigate(() => {
			if (scrollTargetIndex < 0) {
				return;
			}

			autoScrolledTripId = null;
			disableScrollHandling();
			void scrollLastDepartedStopIntoView();
		});
	}

	$effect(() => {
		if (
			!browser ||
			!tripContentElement ||
			scrollTargetIndex < 0 ||
			autoScrolledTripId === data.trip.id
		) {
			return;
		}

		void scrollLastDepartedStopIntoView();
	});

	function isNextStation(index: number, totalStops: number, lastDepartedIndex: number) {
		if (totalStops === 0) {
			return false;
		}

		if (lastDepartedIndex < 0) {
			return index === 0;
		}

		return index === Math.min(lastDepartedIndex + 1, totalStops - 1);
	}

	function getStopDotClass(index: number, totalStops: number, lastDepartedIndex: number) {
		if (isNextStation(index, totalStops, lastDepartedIndex)) {
			return "size-3 bg-blue-600";
		}

		if (index === 0 || index === totalStops - 1) {
			return "size-3 bg-slate-800 dark:bg-slate-100";
		}

		return "size-3 bg-slate-300 dark:bg-slate-700";
	}

	function getStopTitleClass(stop: RenderedTripStop) {
		if (stop.status === "current" || stop.status === "final") {
			return "text-[1.55rem] leading-tight text-slate-800 dark:text-slate-50";
		}

		if (stop.status === "past") {
			return "text-lg leading-tight text-slate-400 dark:text-slate-500";
		}

		return "text-lg leading-tight text-slate-800 dark:text-slate-100";
	}

	function getStopNoteClass(stop: RenderedTripStop) {
		if (stop.status === "current") {
			return "text-blue-600 dark:text-blue-300";
		}

		if (stop.status === "past") {
			return "text-slate-400 dark:text-slate-500";
		}

		return "text-slate-600 dark:text-slate-300";
	}

	function getStopTimeClass(stop: RenderedTripStop) {
		return stop.status === "past"
			? "text-slate-400 dark:text-slate-500"
			: "text-slate-800 dark:text-slate-100";
	}
</script>

<svelte:head>
	<title>{data.trip.line} {data.trip.headsign} | bAIbus</title>
	<meta
		name="description"
		content={i18n.messages.trip.metaDescription(data.trip.line, data.trip.headsign)}
	/>
</svelte:head>

<div class="bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
	<div class="mx-auto min-h-dvh max-w-screen-sm overflow-x-hidden">
		<PageHeader>
			<div class="flex min-w-0 flex-1 items-center gap-4">
				<BackButton href={data.trip.backLink} aria-label={data.trip.backText} />

				<div class="flex min-w-0 items-center gap-4">
					<LineNumber
						line={data.trip.line}
					/>

					<div class="min-w-0">
						<Heading
							as="h1"
							id="trip-heading"
							class="truncate"
						>
							{data.trip.headsign}
						</Heading>
					</div>
				</div>
			</div>
			<IconAction
				href={data.trip.mapLink}
				target="_blank"
				rel="noreferrer"
				aria-label={i18n.messages.trip.openOnMap}
			>
				<MapPin class="size-5" strokeWidth={2.2} />
			</IconAction>
		</PageHeader>

		<main
			bind:this={tripContentElement}
			class="route-transition-shell mt-[var(--app-header-offset)] mb-[var(--app-bottom-nav-offset)] min-h-[var(--app-content-min-height)] pb-8"
		>
			<section aria-labelledby="trip-heading" class="px-6 pt-8">
				<div class="relative">
					{#each tripStops as stop, index}
						{@const lineFillPercent = getStopLineFillPercent(
							index,
							lastDepartedIndex,
							activeSegmentStartIndex,
							segmentProgress
						)}
						<div
							class="relative scroll-mt-24 pb-11 pl-11 last:pb-0"
							data-last-departed-stop={index === scrollTargetIndex ? "true" : undefined}
						>
						{#if index < tripStops.length - 1}
							<div
								class="absolute left-2 top-3 h-full w-1 -translate-x-1/2 rounded-full bg-slate-200 dark:bg-slate-800"
								aria-hidden="true"
							>
								{#if lineFillPercent > 0}
									<div
										class="absolute inset-x-0 top-0 rounded-full bg-blue-600"
										style={`height: ${lineFillPercent}%`}
									></div>
								{/if}
							</div>
						{/if}

						<div
							class="absolute left-0 top-1 flex size-4 items-center justify-center"
							aria-hidden="true"
						>
							<div
								class={`rounded-full ${getStopDotClass(index, tripStops.length, lastDepartedIndex)}`}
							></div>
						</div>

						<div class={`flex items-start justify-between gap-3 ${stop.status === "past" ? "opacity-70" : ""}`}>
							<div class="min-w-0 flex-1">
								<p class={`font-extrabold tracking-tight ${getStopTitleClass(stop)}`}>
									{stop.name}
								</p>

								{#if stop.note || stop.underMinuteNotePrefix || stop.delayLabel}
									<div class="mt-2 flex flex-wrap items-center gap-2">
										{#if stop.underMinuteNotePrefix}
											<p class={`text-base font-semibold ${getStopNoteClass(stop)}`}>
												{stop.underMinuteNotePrefix}
												<span class="ml-1 inline-flex items-center gap-[0.06em] align-middle">
													<LessThanValue />
													<span>{i18n.messages.trip.arrivingLessThanMinuteUnit}</span>
												</span>
											</p>
										{:else if stop.note}
											<p class={`text-base font-semibold ${getStopNoteClass(stop)}`}>
												{stop.note}
											</p>
										{/if}

										{#if stop.delayLabel}
											<span
												class="rounded-md bg-rose-100 px-2 py-1 text-sm font-bold text-rose-700 dark:bg-rose-500/15 dark:text-rose-200"
											>
												{stop.delayLabel}
											</span>
										{/if}
									</div>
								{/if}
							</div>

							<div class="min-w-16 shrink-0 text-right">
								<p class={`text-xl font-extrabold tracking-tight ${getStopTimeClass(stop)}`}>
									{stop.primaryTime}
								</p>

								{#if stop.secondaryTime}
									<p class="mt-1 text-sm font-medium text-slate-500 line-through dark:text-slate-400">
										{stop.secondaryTime}
									</p>
								{/if}
							</div>
							</div>
						</div>
					{/each}
				</div>
			</section>
		</main>

		<AppBottomNav />
	</div>
</div>
