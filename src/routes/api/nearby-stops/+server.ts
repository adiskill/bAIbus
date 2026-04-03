import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

import { getClosestStations } from "$lib/api/idsbk/stations";

class BadRequestError extends Error {}

function parseCoordinateValue(value: FormDataEntryValue | unknown, name: string) {
	const parsed =
		typeof value === "number"
			? value
			: typeof value === "string"
				? Number.parseFloat(value)
				: Number.NaN;

	if (!Number.isFinite(parsed)) {
		throw new BadRequestError(`Invalid ${name} coordinate`);
	}

	return parsed;
}

function validateCoordinateRange(latitude: number, longitude: number) {
	if (latitude < -90 || latitude > 90) {
		throw new BadRequestError("Latitude must be between -90 and 90");
	}

	if (longitude < -180 || longitude > 180) {
		throw new BadRequestError("Longitude must be between -180 and 180");
	}
}

async function readCoordinates(request: Request) {
	const contentType = request.headers.get("content-type") ?? "";

	if (contentType.includes("application/json")) {
		const body = (await request.json()) as {
			latitude?: unknown;
			longitude?: unknown;
		};

		return {
			latitude: parseCoordinateValue(body.latitude, "latitude"),
			longitude: parseCoordinateValue(body.longitude, "longitude")
		};
	}

	const formData = await request.formData();

	return {
		latitude: parseCoordinateValue(formData.get("latitude"), "latitude"),
		longitude: parseCoordinateValue(formData.get("longitude"), "longitude")
	};
}

export const POST: RequestHandler = async ({ fetch, request }) => {
	try {
		const coordinates = await readCoordinates(request);
		validateCoordinateRange(coordinates.latitude, coordinates.longitude);
		const stations = await getClosestStations(fetch, coordinates);

		return json(
			stations.map((station) => ({
				id: station.id,
				name: station.name,
				distance: station.distanceMeters,
				type: station.stationType
			}))
		);
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Unable to load nearby stations";

		return json({ message }, { status: error instanceof BadRequestError ? 400 : 502 });
	}
};
