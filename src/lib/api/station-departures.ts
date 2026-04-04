import { parseLiveDepartureBoard, type LiveDepartureApiResponse, type LiveDepartureBoard } from "$lib/types/departure";
import { getResponseMessage, unwrapDevData } from "$lib/api/dev-response";

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
	const payload = (await response.json()) as unknown;

	if (!response.ok) {
		throw new Error(
			getResponseMessage(payload) || "Unable to load live departures right now."
		);
	}

	const data = unwrapDevData<LiveDepartureApiResponse>(payload);

	return parseLiveDepartureBoard(data);
}
