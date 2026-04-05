import { getCachedJson, setCachedJson } from "$lib/server/valkey";
import {
	IdbskApiError,
	createIdsbkDebugInfo,
	fetchIdsbkJson,
	type IdbskDebugInfo
} from "$lib/api/idsbk/http";
import type { Locale } from "$lib/i18n";
import { getI18n } from "$lib/i18n";
import type { TripDetail, TripSegmentProgress, TripState } from "$lib/types/trip";

const BRATISLAVA_TIME_ZONE = "Europe/Bratislava";
const TRIP_CACHE_TTL_SECONDS = 10;
const EARTH_RADIUS_METERS = 6_371_000;

type IdbskTripResponse = {
	trip_id?: number;
	headsign?: string | null;
	short_name?: string | null;
	route_short_name?: string | null;
	stop_times?: IdbskTripStopTime[];
	trip_delay?: number | null;
	last_station?: string | null;
	last_station_id?: number | null;
};

type IdbskTripStopTime = {
	stop_id?: number;
	station_id?: number;
	stop_name?: string | null;
	stop_gps?: IdbskGpsPoint | null;
	seq?: number | null;
	arrival?: number | null;
	departure?: number | null;
};

type IdbskTripRealtimeResponse = {
	trip_id?: number;
	gps?: IdbskGpsPoint | null;
	delay?: number | null;
	last_station_id?: number | null;
};

type IdbskGpsPoint = {
	lat?: number | null;
	lon?: number | null;
};

type TripDetailRequest = {
	tripId: string;
	locale: Locale;
};

type TripSnapshotStation = {
	id: number;
	name: string;
	plannedDepartureMinutesOfDay: number;
	coordinates: Coordinates | null;
};

type TripSnapshot = {
	id: string;
	lineNumber: string;
	headsign: string;
	delaySeconds: number;
	stations: TripSnapshotStation[];
	reportedLastDepartedStationId: number | null;
};

type TripRealtime = {
	delaySeconds: number | null;
	lastDepartedStationId: number | null;
	vehicleCoordinates: Coordinates | null;
};

type Coordinates = {
	latitude: number;
	longitude: number;
};

function getNonEmptyValue(value?: string | null) {
	if (typeof value !== "string") {
		return null;
	}

	const trimmedValue = value.trim();

	return trimmedValue.length > 0 ? trimmedValue : null;
}

function isFiniteNumber(value: unknown): value is number {
	return typeof value === "number" && Number.isFinite(value);
}

function toRadians(value: number) {
	return (value * Math.PI) / 180;
}

function calculateDistanceMeters(origin: Coordinates, destination: Coordinates) {
	const latitudeDelta = toRadians(destination.latitude - origin.latitude);
	const longitudeDelta = toRadians(destination.longitude - origin.longitude);
	const originLatitude = toRadians(origin.latitude);
	const destinationLatitude = toRadians(destination.latitude);

	const haversine =
		Math.sin(latitudeDelta / 2) ** 2 +
		Math.cos(originLatitude) *
			Math.cos(destinationLatitude) *
			Math.sin(longitudeDelta / 2) ** 2;

	return Math.round(
		2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
	);
}

function parseTripId(tripId: string) {
	if (!/^\d+$/.test(tripId)) {
		return null;
	}

	return Number.parseInt(tripId, 10);
}

function getCurrentBratislavaTimeParts(now = new Date()) {
	const formatter = new Intl.DateTimeFormat("en-CA", {
		timeZone: BRATISLAVA_TIME_ZONE,
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

	return {
		hours: Number.parseInt(parts.hour, 10),
		minutes: Number.parseInt(parts.minute, 10),
		seconds: Number.parseInt(parts.second, 10)
	};
}

function getCurrentBratislavaSecondsOfDay(now = new Date()) {
	const parts = getCurrentBratislavaTimeParts(now);

	return parts.hours * 3600 + parts.minutes * 60 + parts.seconds;
}

function formatMinutesOfDay(minutesOfDay: number) {
	const normalizedMinutes = ((minutesOfDay % 1440) + 1440) % 1440;
	const hours = Math.floor(normalizedMinutes / 60);
	const minutes = normalizedMinutes % 60;

	return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getMapHref(headsign: string) {
	return `https://www.openstreetmap.org/search?query=${encodeURIComponent(`${headsign}, Bratislava`)}`;
}

function normalizeCoordinates(gps?: IdbskGpsPoint | null): Coordinates | null {
	if (!isFiniteNumber(gps?.lat) || !isFiniteNumber(gps?.lon)) {
		return null;
	}

	return {
		latitude: gps.lat,
		longitude: gps.lon
	};
}

function normalizeTripStation(stop: IdbskTripStopTime): TripSnapshotStation | null {
	if (
		!isFiniteNumber(stop.station_id) ||
		typeof stop.stop_name !== "string" ||
		stop.stop_name.trim().length === 0
	) {
		return null;
	}

	const plannedDepartureMinutesOfDay =
		typeof stop.departure === "number" && Number.isFinite(stop.departure)
			? stop.departure
			: typeof stop.arrival === "number" && Number.isFinite(stop.arrival)
				? stop.arrival
				: null;

	if (plannedDepartureMinutesOfDay === null) {
		return null;
	}

	return {
		id: stop.station_id,
		name: stop.stop_name.trim(),
		plannedDepartureMinutesOfDay,
		coordinates: normalizeCoordinates(stop.stop_gps)
	};
}

function getDerivedLastDepartedStationId(
	snapshot: Pick<TripSnapshot, "stations">,
	currentSecondsOfDay: number,
	delaySeconds: number
) {
	for (let index = snapshot.stations.length - 1; index >= 0; index -= 1) {
		const station = snapshot.stations[index];

		if (station.plannedDepartureMinutesOfDay * 60 + delaySeconds <= currentSecondsOfDay) {
			return station.id;
		}
	}

	return null;
}

function getLastMatchingStationIndex(stations: TripSnapshotStation[], stationId: number) {
	for (let index = stations.length - 1; index >= 0; index -= 1) {
		if (stations[index].id === stationId) {
			return index;
		}
	}

	return -1;
}

function getLastDepartedStationId(
	snapshot: TripSnapshot,
	currentSecondsOfDay: number,
	delaySeconds: number,
	realtimeLastDepartedStationId: number | null
) {
	if (realtimeLastDepartedStationId !== null) {
		return realtimeLastDepartedStationId;
	}

	if (snapshot.reportedLastDepartedStationId !== null) {
		return snapshot.reportedLastDepartedStationId;
	}

	return getDerivedLastDepartedStationId(snapshot, currentSecondsOfDay, delaySeconds);
}

function normalizeTripRealtime(
	payload: IdbskTripRealtimeResponse,
	tripId: number
): TripRealtime | null {
	if (payload.trip_id !== tripId) {
		return null;
	}

	return {
		delaySeconds: isFiniteNumber(payload.delay) ? payload.delay : null,
		lastDepartedStationId: isFiniteNumber(payload.last_station_id)
			? payload.last_station_id
			: null,
		vehicleCoordinates: normalizeCoordinates(payload.gps)
	};
}

function getSegmentProgress(
	stations: TripSnapshotStation[],
	lastDepartedStationId: number | null,
	vehicleCoordinates: Coordinates | null
): TripSegmentProgress | null {
	if (lastDepartedStationId === null || vehicleCoordinates === null) {
		return null;
	}

	const fromIndex = getLastMatchingStationIndex(stations, lastDepartedStationId);

	if (fromIndex < 0 || fromIndex >= stations.length - 1) {
		return null;
	}

	const fromStation = stations[fromIndex];
	const toStation = stations[fromIndex + 1];

	if (fromStation.coordinates === null || toStation.coordinates === null) {
		return null;
	}

	const distanceFromVehicleToFromStation = calculateDistanceMeters(
		vehicleCoordinates,
		fromStation.coordinates
	);
	const distanceFromVehicleToToStation = calculateDistanceMeters(
		vehicleCoordinates,
		toStation.coordinates
	);
	const totalDistance =
		distanceFromVehicleToFromStation + distanceFromVehicleToToStation;

	if (totalDistance <= 0) {
		return 0;
	}

	return Number((distanceFromVehicleToFromStation / totalDistance).toFixed(3));
}

function normalizeTripSnapshot(
	payload: IdbskTripResponse,
	tripId: number
) {
	const delaySeconds =
		typeof payload.trip_delay === "number" && Number.isFinite(payload.trip_delay)
			? payload.trip_delay
			: 0;
	const stations = (payload.stop_times ?? [])
		.slice()
		.sort((left, right) => (left.seq ?? Number.MAX_SAFE_INTEGER) - (right.seq ?? Number.MAX_SAFE_INTEGER))
		.map(normalizeTripStation)
		.filter((station): station is TripSnapshotStation => station !== null);

	if (stations.length === 0) {
		return null;
	}

	return {
		id: String(tripId),
		lineNumber:
			getNonEmptyValue(payload.route_short_name) ??
			getNonEmptyValue(payload.short_name) ??
			String(tripId),
		headsign:
			getNonEmptyValue(payload.last_station) ??
			getNonEmptyValue(payload.headsign) ??
			stations.at(-1)?.name ??
			String(tripId),
		delaySeconds,
		stations,
		reportedLastDepartedStationId: isFiniteNumber(payload.last_station_id)
			? payload.last_station_id
			: null
	} satisfies TripSnapshot;
}

async function fetchTripSnapshot(
	fetchFn: typeof fetch,
	tripId: number
): Promise<{ snapshot: TripSnapshot; debug?: IdbskDebugInfo }> {
	const endpoint = `https://api.idsbk.sk/mobile/v1/trip/${tripId}/`;
	const { data, debug, ok, status } = await fetchIdsbkJson(fetchFn, endpoint);
	const debugInfo = createIdsbkDebugInfo("miss", debug);

	if (!ok) {
		throw new IdbskApiError(`IDS BK trip request failed with ${status}`, debugInfo);
	}

	const snapshot = normalizeTripSnapshot(data as IdbskTripResponse, tripId);

	if (!snapshot) {
		throw new IdbskApiError("IDS BK trip response did not include valid stations", debugInfo);
	}

	return {
		snapshot,
		debug: debugInfo
	};
}

async function getTripSnapshotWithDebug(
	fetchFn: typeof fetch,
	tripId: number
) {
	const cacheKey = `idsbk:trip:v4:${tripId}`;
	const cachedSnapshot = await getCachedJson<TripSnapshot>(cacheKey);

	if (cachedSnapshot) {
		return {
			snapshot: cachedSnapshot,
			debug: createIdsbkDebugInfo("hit")
		};
	}

	const { snapshot, debug } = await fetchTripSnapshot(fetchFn, tripId);

	await setCachedJson(cacheKey, snapshot, TRIP_CACHE_TTL_SECONDS);

	return {
		snapshot,
		debug
	};
}

async function getOptionalTripRealtimeWithDebug(
	fetchFn: typeof fetch,
	tripId: number
): Promise<{ debug?: IdbskDebugInfo; realtime: TripRealtime | null }> {
	const endpoint = `https://api.idsbk.sk/mobile/v1/realtime/trip/${tripId}/`;
	const { data, debug, ok } = await fetchIdsbkJson(fetchFn, endpoint);
	const debugInfo = createIdsbkDebugInfo("miss", debug);

	if (!ok) {
		return {
			realtime: null,
			debug: debugInfo
		};
	}

	return {
		realtime: normalizeTripRealtime(data as IdbskTripRealtimeResponse, tripId),
		debug: debugInfo
	};
}

async function getTripRealtimeWithDebug(
	fetchFn: typeof fetch,
	tripId: number
): Promise<{ debug?: IdbskDebugInfo; realtime: TripRealtime }> {
	const endpoint = `https://api.idsbk.sk/mobile/v1/realtime/trip/${tripId}/`;
	const { data, debug, ok, status } = await fetchIdsbkJson(fetchFn, endpoint);
	const debugInfo = createIdsbkDebugInfo("miss", debug);

	if (!ok) {
		throw new IdbskApiError(`IDS BK realtime trip request failed with ${status}`, debugInfo);
	}

	const realtime = normalizeTripRealtime(data as IdbskTripRealtimeResponse, tripId);

	if (!realtime) {
		throw new IdbskApiError("IDS BK realtime trip response was invalid", debugInfo);
	}

	return {
		realtime,
		debug: debugInfo
	};
}

export async function getIdsbkTripDetail(
	fetchFn: typeof fetch,
	request: TripDetailRequest
): Promise<TripDetail> {
	const tripId = parseTripId(request.tripId);

	if (tripId === null) {
		throw new Error("Invalid trip ID");
	}

	const { snapshot } = await getTripSnapshotWithDebug(fetchFn, tripId);
	const { realtime } = await getOptionalTripRealtimeWithDebug(fetchFn, tripId);
	const i18n = getI18n(request.locale);
	const backHref = "/";
	const backLabel = i18n.messages.trip.backToHome;
	const delaySeconds = realtime?.delaySeconds ?? snapshot.delaySeconds;
	const lastDepartedStationId = getLastDepartedStationId(
		snapshot,
		getCurrentBratislavaSecondsOfDay(),
		delaySeconds,
		realtime?.lastDepartedStationId ?? null
	);

	return {
		id: snapshot.id,
		line: snapshot.lineNumber,
		headsign: snapshot.headsign,
		departedStationId: lastDepartedStationId,
		delay: delaySeconds,
		progress: getSegmentProgress(
			snapshot.stations,
			lastDepartedStationId,
			realtime?.vehicleCoordinates ?? null
		),
		backLink: backHref,
		backText: backLabel,
		mapLink: getMapHref(snapshot.headsign),
		stops: snapshot.stations.map((station) => ({
			id: station.id,
			name: station.name,
			departureTime: formatMinutesOfDay(station.plannedDepartureMinutesOfDay)
		}))
	};
}

export async function getIdsbkTripStateWithDebug(
	fetchFn: typeof fetch,
	tripIdParam: string
): Promise<{ state: TripState; debug?: IdbskDebugInfo }> {
	const tripId = parseTripId(tripIdParam);

	if (tripId === null) {
		throw new Error("Invalid trip ID");
	}

	const { realtime, debug } = await getTripRealtimeWithDebug(fetchFn, tripId);

	return {
		state: {
			delay: realtime.delaySeconds ?? 0,
			departedStationId: realtime.lastDepartedStationId,
			progress: null
		},
		debug
	};
}
