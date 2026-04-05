import { error } from "@sveltejs/kit";

import { getLiveDepartureBoard } from "$lib/api/idsbk/departures";
import { getStationById, getStationByName } from "$lib/api/idsbk/stations";
import { getMessages } from "$lib/i18n";

import type { PageServerLoad } from "./$types";

function parseStationId(stationRef: string) {
	if (!/^\d+$/.test(stationRef)) {
		return null;
	}

	return Number.parseInt(stationRef, 10);
}

export const load: PageServerLoad = async ({ fetch, locals, params }) => {
	const messages = getMessages(locals.locale);
	const stationId = parseStationId(params.stationRef);
	const station =
		stationId === null
			? await getStationByName(fetch, params.stationRef)
			: await getStationById(fetch, stationId);

	if (!station) {
		error(404, messages.errors.stationNotFound);
	}

	let departureBoard = null;
	let departureError: string | null = null;
	let departureFetchedAt: string | null = null;

	try {
		departureBoard = await getLiveDepartureBoard(fetch, station.id);
		departureFetchedAt = new Date().toISOString();
	} catch (caughtError) {
		departureError =
			caughtError instanceof Error
				? caughtError.message
				: messages.errors.liveDeparturesLoad;
	}

	return {
		station,
		departureBoard,
		departureError,
		departureFetchedAt
	};
};
