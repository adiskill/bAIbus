import { getResponseMessage, unwrapDevData } from "$lib/api/dev-response";
import {
	parseLiveDepartureBoardPayload,
	type LiveDepartureBoard
} from "$lib/types/departure";

type StationDeparturesError = {
	message?: string;
};

export type StationDeparturesResponse = {
	departures: LiveDepartureBoard;
	fetchedAt: string;
};

type FetchStationDeparturesOptions = {
	limit?: number;
	signal?: AbortSignal;
};

export async function fetchStationDepartures(
	fetchFn: typeof fetch,
	stationId: number,
	options: FetchStationDeparturesOptions = {}
) {
	const searchParams = new URLSearchParams();

	if (typeof options.limit === "number" && Number.isFinite(options.limit)) {
		searchParams.set("limit", `${Math.trunc(options.limit)}`);
	}

	const query = searchParams.size > 0 ? `?${searchParams.toString()}` : "";
	const response = await fetchFn(`/api/stations/${stationId}/departures${query}`, {
		cache: "no-store",
		signal: options.signal
	});
	const payload = (await response.json()) as unknown;

	if (!response.ok) {
		throw new Error(
			getResponseMessage(payload) || "Unable to load live departures right now."
		);
	}

	const data = unwrapDevData(payload);

	return parseLiveDepartureBoardPayload(data) satisfies StationDeparturesResponse;
}
