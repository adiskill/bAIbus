import type { Coordinates } from "$lib/types/station";
import { getResponseMessage, unwrapDevData } from "$lib/api/dev-response";

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
	const payload = (await response.json()) as unknown;

	if (!response.ok) {
		throw new Error(
			getResponseMessage(payload) || "Unable to load nearby stops right now."
		);
	}

	const data = unwrapDevData<NearbyStopApiItem[]>(payload);

	return Array.isArray(data) ? data : [];
}
