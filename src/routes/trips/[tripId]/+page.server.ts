import { error } from "@sveltejs/kit";

import { IdbskApiError } from "$lib/api/idsbk/http";
import { getTripDetail } from "$lib/api/trip-detail";
import { getMessages } from "$lib/i18n";

import type { PageServerLoad } from "./$types";

function getStationBackLink(pathname: string | null) {
	if (pathname === null || !pathname.startsWith("/stations/")) {
		return null;
	}

	return pathname;
}

export const load: PageServerLoad = async ({ fetch, locals, params, url }) => {
	const messages = getMessages(locals.locale);

	try {
		const trip = await getTripDetail(fetch, {
			tripId: params.tripId,
			locale: locals.locale
		});
		const stationBackLink = getStationBackLink(url.searchParams.get("from"));

		return {
			trip: stationBackLink
				? {
						...trip,
						backLink: stationBackLink,
						backText: messages.trip.backToStation
					}
				: trip
		};
	} catch (caughtError) {
		if (caughtError instanceof Error && caughtError.message === "Invalid trip ID") {
			error(404, messages.errors.tripNotFound);
		}

		if (caughtError instanceof IdbskApiError) {
			if (caughtError.message.includes(" 400") || caughtError.message.includes(" 404")) {
				error(404, messages.errors.tripNotFound);
			}

			error(502, messages.errors.tripLoad);
		}

		throw caughtError;
	}
};
