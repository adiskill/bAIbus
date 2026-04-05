import { error, json } from "@sveltejs/kit";

import { withIdsbkDebugData, withIdsbkDebugError } from "$lib/api/dev-response";
import { getIdsbkDebugInfo, IdbskApiError } from "$lib/api/idsbk/http";
import { getIdsbkTripStateWithDebug } from "$lib/api/idsbk/trips";
import { getMessages } from "$lib/i18n";
import { serializeTripStatePayload } from "$lib/types/trip";

import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ fetch, locals, params }) => {
	const messages = getMessages(locals.locale);

	try {
		const { state, debug } = await getIdsbkTripStateWithDebug(
			fetch,
			params.tripId
		);

		return json(withIdsbkDebugData(serializeTripStatePayload(state), debug), {
			headers: {
				"cache-control": "private, max-age=10"
			}
		});
	} catch (caughtError) {
		if (caughtError instanceof Error && caughtError.message === "Invalid trip ID") {
			throw error(404, messages.errors.tripNotFound);
		}

		if (caughtError instanceof IdbskApiError) {
			if (caughtError.message.includes(" 400") || caughtError.message.includes(" 404")) {
				throw error(404, messages.errors.tripNotFound);
			}
		}

		const message =
			caughtError instanceof Error ? caughtError.message : messages.errors.tripLoad;

		return json(withIdsbkDebugError(message, getIdsbkDebugInfo(caughtError)), {
			status: 502
		});
	}
};
