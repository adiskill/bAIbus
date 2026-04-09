import { json } from "@sveltejs/kit";

import type { RequestHandler } from "./$types";

import { withIdsbkDebugData, withIdsbkDebugError } from "$lib/api/dev-response";
import { getIdsbkDebugInfo } from "$lib/api/idsbk/http";
import { searchStationsWithDebug } from "$lib/api/idsbk/stations";
import { getMessages } from "$lib/i18n";

class BadRequestError extends Error {}

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 20;

function parseLimit(value: string | null) {
	if (value === null) {
		return DEFAULT_LIMIT;
	}

	const parsedLimit = Number.parseInt(value, 10);

	if (!Number.isFinite(parsedLimit) || parsedLimit < 1 || parsedLimit > MAX_LIMIT) {
		throw new BadRequestError(`Limit must be between 1 and ${MAX_LIMIT}.`);
	}

	return parsedLimit;
}

export const GET: RequestHandler = async ({ fetch, locals, url }) => {
	const messages = getMessages(locals.locale);
	const query = url.searchParams.get("query")?.trim() ?? "";

	if (!query) {
		return json(withIdsbkDebugData([], undefined));
	}

	try {
		const limit = parseLimit(url.searchParams.get("limit"));
		const { stations, debug } = await searchStationsWithDebug(fetch, query, limit);

		return json(
			withIdsbkDebugData(
				stations.map((station) => ({
					id: station.id,
					name: station.name,
					city: station.city,
					type: station.stationType
				})),
				debug
			)
		);
	} catch (error) {
		const message =
			error instanceof Error ? error.message : messages.errors.stationSearchLoad;

		return json(withIdsbkDebugError(message, getIdsbkDebugInfo(error)), {
			status: error instanceof BadRequestError ? 400 : 502
		});
	}
};
