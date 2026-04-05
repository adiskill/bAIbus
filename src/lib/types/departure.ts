export type LiveDeparture = {
	id: number;
	line: string;
	destination: string;
	platform: string | null;
	routeType: number | null;
	remainingMs: number;
	minutesUntilDeparture: number;
	delayMinutes: number;
	isLive: boolean;
};

export type LiveDepartureBoard = LiveDeparture[];

export type LiveDepartureApiItem = {
	id: number;
	line: string;
	destination: string;
	platform: string | null;
	mode: number | null;
	remainingMs: number;
	minutes: number;
	delay: number;
	live: boolean;
};

export type LiveDepartureApiResponse = LiveDepartureApiItem[];

export type LiveDepartureBoardApiPayload = {
	departures: LiveDepartureApiResponse;
	fetchedAt: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

export function serializeLiveDepartureBoard(board: LiveDepartureBoard): LiveDepartureApiResponse {
	return board.map((departure) => ({
		id: departure.id,
		line: departure.line,
		destination: departure.destination,
		platform: departure.platform,
		mode: departure.routeType,
		remainingMs: departure.remainingMs,
		minutes: departure.minutesUntilDeparture,
		delay: departure.delayMinutes,
		live: departure.isLive
	}));
}

export function serializeLiveDepartureBoardPayload(
	board: LiveDepartureBoard,
	fetchedAt: string
): LiveDepartureBoardApiPayload {
	return {
		departures: serializeLiveDepartureBoard(board),
		fetchedAt
	};
}

export function parseLiveDepartureBoard(payload: unknown): LiveDepartureBoard {
	if (!Array.isArray(payload)) {
		throw new Error("Departure response payload is invalid");
	}

	return payload.map((entry) => {
		if (
			!isRecord(entry) ||
			typeof entry.id !== "number" ||
			typeof entry.line !== "string" ||
			typeof entry.destination !== "string" ||
			(entry.platform !== null && typeof entry.platform !== "string") ||
			(entry.mode !== null && typeof entry.mode !== "number") ||
			typeof entry.remainingMs !== "number" ||
			typeof entry.minutes !== "number" ||
			typeof entry.delay !== "number" ||
			typeof entry.live !== "boolean"
		) {
			throw new Error("Departure response payload is invalid");
		}

		return {
			id: entry.id,
			line: entry.line,
			destination: entry.destination,
			platform: entry.platform,
			routeType: entry.mode,
			remainingMs: entry.remainingMs,
			minutesUntilDeparture: entry.minutes,
			delayMinutes: entry.delay,
			isLive: entry.live
		};
	});
}

export function parseLiveDepartureBoardPayload(payload: unknown) {
	if (
		!isRecord(payload) ||
		typeof payload.fetchedAt !== "string" ||
		!Array.isArray(payload.departures)
	) {
		throw new Error("Departure response payload is invalid");
	}

	return {
		departures: parseLiveDepartureBoard(payload.departures),
		fetchedAt: payload.fetchedAt
	};
}
