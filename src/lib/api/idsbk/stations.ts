import { getCachedJson, setCachedJson } from "$lib/server/valkey";
import type { Coordinates, NearbyStation, Station } from "$lib/types/station";
import {
	IdbskApiError,
	createIdsbkDebugInfo,
	fetchIdsbkJson,
	type IdbskDebugInfo
} from "$lib/api/idsbk/http";

const BRATISLAVA_CITY_ID = 12;
const STATIONS_ENDPOINT = `https://api.idsbk.sk/mobile/v3/station/${BRATISLAVA_CITY_ID}/`;
const STATION_CACHE_KEY = `idsbk:stations:v1:${BRATISLAVA_CITY_ID}`;
const STATION_CACHE_TTL_SECONDS = 12 * 60 * 60;
const EARTH_RADIUS_METERS = 6_371_000;

type IdbskStationResponse = {
	stations?: IdbskStation[];
};

type IdbskStation = {
	station_id?: number;
	city?: string | null;
	name?: string | null;
	station_type?: number | null;
	gps?: {
		lat?: number | null;
		lon?: number | null;
	} | null;
};

function isFiniteCoordinate(value: unknown): value is number {
	return typeof value === "number" && Number.isFinite(value);
}

function normalizeStation(rawStation: IdbskStation): Station | null {
	if (
		typeof rawStation.station_id !== "number" ||
		typeof rawStation.name !== "string" ||
		typeof rawStation.city !== "string" ||
		!isFiniteCoordinate(rawStation.gps?.lat) ||
		!isFiniteCoordinate(rawStation.gps?.lon)
	) {
		return null;
	}

	return {
		id: rawStation.station_id,
		name: rawStation.name,
		city: rawStation.city,
		stationType: rawStation.station_type ?? null,
		latitude: rawStation.gps.lat,
		longitude: rawStation.gps.lon
	};
}

async function fetchStationsWithDebug(
	fetchFn: typeof fetch
): Promise<{ debug?: IdbskDebugInfo; stations: Station[] }> {
	const cachedStations = await getCachedJson<Station[]>(STATION_CACHE_KEY);

	if (cachedStations) {
		return {
			stations: cachedStations,
			debug: createIdsbkDebugInfo("hit")
		};
	}

	const { data, debug, ok, status } = await fetchIdsbkJson(fetchFn, STATIONS_ENDPOINT);
	const debugInfo = createIdsbkDebugInfo("miss", debug);

	if (!ok) {
		throw new IdbskApiError(`IDS BK station request failed with ${status}`, debugInfo);
	}

	const payload = data as IdbskStationResponse;

	if (!Array.isArray(payload.stations)) {
		throw new IdbskApiError(
			"IDS BK station response did not include a stations array",
			debugInfo
		);
	}

	const stations = payload.stations
		.map(normalizeStation)
		.filter((station): station is Station => station !== null);

	await setCachedJson(STATION_CACHE_KEY, stations, STATION_CACHE_TTL_SECONDS);

	return {
		stations,
		debug: debugInfo
	};
}

async function fetchStations(fetchFn: typeof fetch): Promise<Station[]> {
	const { stations } = await fetchStationsWithDebug(fetchFn);

	return stations;
}

export async function getStationById(fetchFn: typeof fetch, stationId: number) {
	const stations = await fetchStations(fetchFn);

	return stations.find((station) => station.id === stationId) ?? null;
}

export async function getStationByName(fetchFn: typeof fetch, stationName: string) {
	const stations = await fetchStations(fetchFn);
	const normalizedStationName = stationName.trim().toLocaleLowerCase("sk-SK");

	return (
		stations.find((station) => station.name.trim().toLocaleLowerCase("sk-SK") === normalizedStationName) ??
		null
	);
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

export async function getClosestStations(
	fetchFn: typeof fetch,
	origin: Coordinates,
	limit = 5
): Promise<NearbyStation[]> {
	const { stations } = await fetchStationsWithDebug(fetchFn);

	return stations
		.map((station) => ({
			...station,
			distanceMeters: calculateDistanceMeters(origin, station)
		}))
		.sort((left, right) => left.distanceMeters - right.distanceMeters)
		.slice(0, limit);
}

export async function getClosestStationsWithDebug(
	fetchFn: typeof fetch,
	origin: Coordinates,
	limit = 5
): Promise<{ debug?: IdbskDebugInfo; stations: NearbyStation[] }> {
	const { stations, debug } = await fetchStationsWithDebug(fetchFn);

	return {
		stations: stations
			.map((station) => ({
				...station,
				distanceMeters: calculateDistanceMeters(origin, station)
			}))
			.sort((left, right) => left.distanceMeters - right.distanceMeters)
			.slice(0, limit),
		debug
	};
}
