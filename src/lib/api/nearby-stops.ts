import type { Coordinates } from "$lib/types/station";

export type NearbyStopApiItem = {
	id: number;
	name: string;
	distance: number;
	type: number | null;
};

export async function fetchNearbyStops(
	fetchFn: typeof fetch,
	coordinates: Coordinates,
	signal?: AbortSignal
) {
	const response = await fetchFn("/api/nearby-stops", {
		method: "POST",
		headers: {
			"content-type": "application/json"
		},
		body: JSON.stringify(coordinates),
		signal
	});

	const data = (await response.json()) as NearbyStopApiItem[] | { message?: string };

	if (!response.ok) {
		throw new Error(
			(typeof data === "object" && !Array.isArray(data) && data.message) ||
				"Unable to load nearby stops right now."
		);
	}

	return Array.isArray(data) ? data : [];
}
