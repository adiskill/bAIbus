import { error } from "@sveltejs/kit";

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

	return { station };
};
