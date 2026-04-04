import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

import { withIdsbkDebugData, withIdsbkDebugError } from "$lib/api/dev-response";
import { getIdsbkDebugInfo } from "$lib/api/idsbk/http";
import { getClosestStationsWithDebug } from "$lib/api/idsbk/stations";
import { getMessages } from "$lib/i18n";

class BadRequestError extends Error {}

function parseCoordinateValue(
	value: FormDataEntryValue | unknown,
	errorMessage: string
) {
	const parsed =
		typeof value === "number"
			? value
			: typeof value === "string"
				? Number.parseFloat(value)
				: Number.NaN;

	if (!Number.isFinite(parsed)) {
		throw new BadRequestError(errorMessage);
	}

	return parsed;
}

function validateCoordinateRange(
	latitude: number,
	longitude: number,
	messages: ReturnType<typeof getMessages>["errors"]
) {
	if (latitude < -90 || latitude > 90) {
		throw new BadRequestError(messages.latitudeRange);
	}

	if (longitude < -180 || longitude > 180) {
		throw new BadRequestError(messages.longitudeRange);
	}
}

async function readCoordinates(
	request: Request,
	messages: ReturnType<typeof getMessages>["errors"]
) {
	const contentType = request.headers.get("content-type") ?? "";

	if (contentType.includes("application/json")) {
		const body = (await request.json()) as {
			latitude?: unknown;
			longitude?: unknown;
		};

		return {
			latitude: parseCoordinateValue(body.latitude, messages.invalidLatitudeCoordinate),
			longitude: parseCoordinateValue(body.longitude, messages.invalidLongitudeCoordinate)
		};
	}

	const formData = await request.formData();

	return {
		latitude: parseCoordinateValue(formData.get("latitude"), messages.invalidLatitudeCoordinate),
		longitude: parseCoordinateValue(
			formData.get("longitude"),
			messages.invalidLongitudeCoordinate
		)
	};
}

export const POST: RequestHandler = async ({ fetch, locals, request }) => {
	const messages = getMessages(locals.locale);

	try {
		const coordinates = await readCoordinates(request, messages.errors);
		validateCoordinateRange(coordinates.latitude, coordinates.longitude, messages.errors);
		const { stations, debug } = await getClosestStationsWithDebug(fetch, coordinates);

		return json(
			withIdsbkDebugData(
				stations.map((station) => ({
					id: station.id,
					name: station.name,
					distance: station.distanceMeters,
					type: station.stationType
				})),
				debug
			)
		);
	} catch (error) {
		const message =
			error instanceof Error ? error.message : messages.errors.nearbyStationsLoad;

		return json(withIdsbkDebugError(message, getIdsbkDebugInfo(error)), {
			status: error instanceof BadRequestError ? 400 : 502
		});
	}
};
