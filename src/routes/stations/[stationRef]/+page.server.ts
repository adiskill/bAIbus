import { error } from "@sveltejs/kit";

import { getLiveDepartureBoard } from "$lib/api/idsbk/departures";
import { getStationById, getStationByName } from "$lib/api/idsbk/stations";

import type { PageServerLoad } from "./$types";

function parseStationId(stationRef: string) {
	if (!/^\d+$/.test(stationRef)) {
		return null;
	}

	return Number.parseInt(stationRef, 10);
}

export const load: PageServerLoad = async ({ fetch, params }) => {
	const stationId = parseStationId(params.stationRef);
	const station =
		stationId === null
			? await getStationByName(fetch, params.stationRef)
			: await getStationById(fetch, stationId);

	if (!station) {
		error(404, "Station not found");
	}

	let departureBoard = null;
	let departureError: string | null = null;

	try {
		departureBoard = await getLiveDepartureBoard(fetch, station.id);
	} catch (caughtError) {
		departureError =
			caughtError instanceof Error
				? caughtError.message
				: "Unable to load live departures right now.";
	}

	return {
		station,
		departureBoard,
		departureError
	};
};
