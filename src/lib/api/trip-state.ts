import { getResponseMessage, unwrapDevData } from "$lib/api/dev-response";
import { parseTripStatePayload, type TripState } from "$lib/types/trip";

type TripStateError = {
	message?: string;
};

type FetchTripStateOptions = {
	signal?: AbortSignal;
};

export async function fetchTripState(
	fetchFn: typeof fetch,
	tripId: string,
	options: FetchTripStateOptions = {}
): Promise<TripState> {
	const response = await fetchFn(`/api/trips/${tripId}/state`, {
		signal: options.signal
	});
	const payload = (await response.json()) as unknown;

	if (!response.ok) {
		throw new Error(getResponseMessage(payload) || "Unable to load trip details right now.");
	}

	const data = unwrapDevData(payload);

	return parseTripStatePayload(data);
}
