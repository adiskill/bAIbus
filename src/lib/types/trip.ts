export type TripStop = {
	id: number;
	name: string;
	departureTime: string;
	position: TripVehiclePosition | null;
};

export type TripVehiclePosition = {
	latitude: number;
	longitude: number;
};

export type TripDetail = {
	id: string;
	line: string;
	headsign: string;
	departedStationId: number | null;
	delay: number;
	vehiclePosition: TripVehiclePosition | null;
	backLink: string;
	backText: string;
	mapLink: string;
	stops: TripStop[];
};

export type TripState = {
	delay: number;
	departedStationId: number | null;
	vehiclePosition: TripVehiclePosition | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

export function serializeTripStatePayload(state: TripState) {
	return {
		delay: state.delay,
		departedStationId: state.departedStationId,
		vehiclePosition: state.vehiclePosition
	};
}

export function parseTripStatePayload(payload: unknown): TripState {
	if (
		!isRecord(payload) ||
		typeof payload.delay !== "number" ||
		(payload.departedStationId !== null &&
			typeof payload.departedStationId !== "number") ||
		!isTripVehiclePosition(payload.vehiclePosition)
	) {
		throw new Error("Trip state response payload is invalid");
	}

	return {
		delay: payload.delay,
		departedStationId: payload.departedStationId,
		vehiclePosition: payload.vehiclePosition
	};
}

function isTripVehiclePosition(
	value: unknown
): value is TripVehiclePosition | null {
	if (value === null) {
		return true;
	}

	if (!isRecord(value)) {
		return false;
	}

	return (
		typeof value.latitude === "number" &&
		Number.isFinite(value.latitude) &&
		typeof value.longitude === "number" &&
		Number.isFinite(value.longitude)
	);
}
