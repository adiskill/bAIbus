import type { LiveDepartureBoard } from "$lib/types/departure";

type StationDeparturesError = {
	message?: string;
};

export async function fetchStationDepartures(
	fetchFn: typeof fetch,
	stationId: number,
	signal?: AbortSignal
) {
	const response = await fetchFn(`/api/stations/${stationId}/departures`, {
		cache: "no-store",
		signal
	});
	const data = (await response.json()) as LiveDepartureBoard | StationDeparturesError;

	if (!response.ok) {
		throw new Error(
			(typeof data === "object" && data !== null && "message" in data && data.message) ||
				"Unable to load live departures right now."
		);
	}

	return data as LiveDepartureBoard;
}
