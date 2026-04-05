export type TripStop = {
	id: number;
	name: string;
	departureTime: string;
};

export type TripSegmentProgress = number;

export type TripDetail = {
	id: string;
	line: string;
	headsign: string;
	departedStationId: number | null;
	delay: number;
	progress: TripSegmentProgress | null;
	backLink: string;
	backText: string;
	mapLink: string;
	stops: TripStop[];
};

export type TripState = {
	delay: number;
	departedStationId: number | null;
	progress: TripSegmentProgress | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

export function serializeTripStatePayload(state: TripState) {
	return {
		delay: state.delay,
		departedStationId: state.departedStationId,
		progress: state.progress
	};
}

export function parseTripStatePayload(payload: unknown): TripState {
	if (
		!isRecord(payload) ||
		typeof payload.delay !== "number" ||
		(payload.departedStationId !== null &&
			typeof payload.departedStationId !== "number") ||
		!isTripSegmentProgress(payload.progress)
	) {
		throw new Error("Trip state response payload is invalid");
	}

	return {
		delay: payload.delay,
		departedStationId: payload.departedStationId,
		progress: payload.progress
	};
}

function isTripSegmentProgress(
	value: unknown
): value is TripSegmentProgress | null {
	if (value === null) {
		return true;
	}

	if (typeof value !== "number") {
		return false;
	}

	return Number.isFinite(value) && value >= 0 && value <= 1;
}
