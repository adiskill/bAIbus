import { env } from "$env/dynamic/private";

import { getCachedJson, setCachedJson } from "$lib/server/valkey";
import type { Coordinates, NearbyStation, Station } from "$lib/types/station";

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

function getRequiredEnv(name: "IDSBK_API_KEY" | "IDSBK_SESSION") {
	const value = env[name];

	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}

	return value;
}

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

async function fetchStations(fetchFn: typeof fetch): Promise<Station[]> {
	const cachedStations = await getCachedJson<Station[]>(STATION_CACHE_KEY);

	if (cachedStations) {
		return cachedStations;
	}

	const response = await fetchFn(STATIONS_ENDPOINT, {
		headers: {
			"X-API-Key": getRequiredEnv("IDSBK_API_KEY"),
			"X-Session": getRequiredEnv("IDSBK_SESSION")
		}
	});

	if (!response.ok) {
		throw new Error(`IDS BK station request failed with ${response.status}`);
	}

	const data = (await response.json()) as IdbskStationResponse;

	if (!Array.isArray(data.stations)) {
		throw new Error("IDS BK station response did not include a stations array");
	}

	const stations = data.stations
		.map(normalizeStation)
		.filter((station): station is Station => station !== null);

	await setCachedJson(STATION_CACHE_KEY, stations, STATION_CACHE_TTL_SECONDS);

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
	const stations = await fetchStations(fetchFn);

	return stations
		.map((station) => ({
			...station,
			distanceMeters: calculateDistanceMeters(origin, station)
		}))
		.sort((left, right) => left.distanceMeters - right.distanceMeters)
		.slice(0, limit);
}
