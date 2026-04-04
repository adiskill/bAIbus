import { browser } from "$app/environment";

import type { Station } from "$lib/types/station";

export type FavoriteStation = Pick<Station, "id" | "name"> & {
	type: Station["stationType"];
};

const FAVORITE_STATIONS_STORAGE_KEY = "favorite-stops";

function isFavoriteStation(value: unknown): value is FavoriteStation {
	return (
		typeof value === "object" &&
		value !== null &&
		"id" in value &&
		typeof value.id === "number" &&
		"name" in value &&
		typeof value.name === "string" &&
		"type" in value &&
		(typeof value.type === "number" || value.type === null)
	);
}

function normalizeFavoriteStation(value: unknown): FavoriteStation | null {
	if (isFavoriteStation(value)) {
		return value;
	}

	if (
		typeof value === "object" &&
		value !== null &&
		"id" in value &&
		typeof value.id === "number" &&
		"name" in value &&
		typeof value.name === "string"
	) {
		return {
			id: value.id,
			name: value.name,
			type:
				"type" in value && (typeof value.type === "number" || value.type === null)
					? value.type
					: null
		};
	}

	return null;
}

export function loadFavoriteStations() {
	if (!browser) {
		return [];
	}

	try {
		const storedValue = localStorage.getItem(FAVORITE_STATIONS_STORAGE_KEY);

		if (!storedValue) {
			return [];
		}

		const parsedValue = JSON.parse(storedValue);

		if (!Array.isArray(parsedValue)) {
			return [];
		}

		return parsedValue
			.map(normalizeFavoriteStation)
			.filter((station): station is FavoriteStation => station !== null);
	} catch {
		return [];
	}
}

export function persistFavoriteStations(stations: FavoriteStation[]) {
	if (!browser) {
		return;
	}

	try {
		localStorage.setItem(
			FAVORITE_STATIONS_STORAGE_KEY,
			JSON.stringify(stations.map(({ id, name, type }) => ({ id, name, type })))
		);
	} catch {
		// Ignore storage write failures so the UI can still respond on restricted browsers.
	}
}

export function isFavoriteStationId(stations: FavoriteStation[], stationId: number) {
	return stations.some((station) => station.id === stationId);
}

export function toggleFavoriteStation(
	stations: FavoriteStation[],
	station: FavoriteStation
) {
	return isFavoriteStationId(stations, station.id)
		? stations.filter((favoriteStation) => favoriteStation.id !== station.id)
		: [...stations, station];
}
