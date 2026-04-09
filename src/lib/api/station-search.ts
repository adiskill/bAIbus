import { getResponseMessage, unwrapDevData } from "$lib/api/dev-response";

export type StationSearchApiItem = {
	id: number;
	name: string;
	city: string;
	type: number | null;
};

export async function fetchStationSearchResults(
	fetchFn: typeof fetch,
	query: string,
	signal?: AbortSignal
) {
	const searchParams = new URLSearchParams({
		query
	});
	const response = await fetchFn(`/api/stations/search?${searchParams.toString()}`, {
		signal
	});
	const payload = (await response.json()) as unknown;

	if (!response.ok) {
		throw new Error(getResponseMessage(payload) || "Unable to load stations right now.");
	}

	const data = unwrapDevData<StationSearchApiItem[]>(payload);

	return Array.isArray(data) ? data : [];
}
