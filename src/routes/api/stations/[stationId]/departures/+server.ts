import { error, json } from "@sveltejs/kit";

import { getLiveDepartureBoard } from "$lib/api/idsbk/departures";

import type { RequestHandler } from "./$types";

function parseStationId(stationId: string) {
	if (!/^\d+$/.test(stationId)) {
		throw error(400, "Invalid station ID");
	}

	return Number.parseInt(stationId, 10);
}

export const GET: RequestHandler = async ({ fetch, params }) => {
	try {
		const stationId = parseStationId(params.stationId);
		const board = await getLiveDepartureBoard(fetch, stationId);

		return json(board, {
			headers: {
				"cache-control": "private, max-age=20"
			}
		});
	} catch (caughtError) {
		if (caughtError && typeof caughtError === "object" && "status" in caughtError) {
			throw caughtError;
		}

		const message =
			caughtError instanceof Error
				? caughtError.message
				: "Unable to load live departures right now.";

		return json({ message }, { status: 502 });
	}
};
