import { error, json } from "@sveltejs/kit";

import { withIdsbkDebugData, withIdsbkDebugError } from "$lib/api/dev-response";
import { getLiveDepartureBoardWithDebug } from "$lib/api/idsbk/departures";
import { getIdsbkDebugInfo } from "$lib/api/idsbk/http";
import { getMessages } from "$lib/i18n";
import { serializeLiveDepartureBoard } from "$lib/types/departure";

import type { RequestHandler } from "./$types";

function parseStationId(stationId: string, invalidStationIdMessage: string) {
	if (!/^\d+$/.test(stationId)) {
		throw error(400, invalidStationIdMessage);
	}

	return Number.parseInt(stationId, 10);
}

export const GET: RequestHandler = async ({ fetch, locals, params }) => {
	const messages = getMessages(locals.locale);

	try {
		const stationId = parseStationId(params.stationId, messages.errors.invalidStationId);
		const { board, debug } = await getLiveDepartureBoardWithDebug(fetch, stationId);

		return json(withIdsbkDebugData(serializeLiveDepartureBoard(board), debug), {
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
				: messages.errors.liveDeparturesLoad;

		return json(withIdsbkDebugError(message, getIdsbkDebugInfo(caughtError)), {
			status: 502
		});
	}
};
