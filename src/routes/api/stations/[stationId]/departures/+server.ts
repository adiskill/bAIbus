import { error, json } from "@sveltejs/kit";

import { withIdsbkDebugData, withIdsbkDebugError } from "$lib/api/dev-response";
import { getLiveDepartureBoardWithDebug } from "$lib/api/idsbk/departures";
import { getIdsbkDebugInfo } from "$lib/api/idsbk/http";
import { getMessages } from "$lib/i18n";
import { serializeLiveDepartureBoardPayload } from "$lib/types/departure";

import type { RequestHandler } from "./$types";

const DEFAULT_DEPARTURE_LIMIT = 20;
const MAX_DEPARTURE_LIMIT = 100;

function parseStationId(stationId: string, invalidStationIdMessage: string) {
	if (!/^\d+$/.test(stationId)) {
		throw error(400, invalidStationIdMessage);
	}

	return Number.parseInt(stationId, 10);
}

function parseDepartureLimit(limitParam: string | null) {
	if (limitParam === null) {
		return DEFAULT_DEPARTURE_LIMIT;
	}

	if (!/^\d+$/.test(limitParam)) {
		throw error(400, "Invalid departure limit");
	}

	const limit = Number.parseInt(limitParam, 10);

	return Math.min(Math.max(limit, DEFAULT_DEPARTURE_LIMIT), MAX_DEPARTURE_LIMIT);
}

export const GET: RequestHandler = async ({ fetch, locals, params, url }) => {
	const messages = getMessages(locals.locale);

	try {
		const stationId = parseStationId(params.stationId, messages.errors.invalidStationId);
		const limit = parseDepartureLimit(url.searchParams.get("limit"));
		const { board, debug } = await getLiveDepartureBoardWithDebug(fetch, stationId, limit);
		const fetchedAt = new Date().toISOString();

		return json(withIdsbkDebugData(serializeLiveDepartureBoardPayload(board, fetchedAt), debug), {
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
