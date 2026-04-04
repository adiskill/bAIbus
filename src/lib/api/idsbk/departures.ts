import { getCachedJson, setCachedJson } from "$lib/server/valkey";
import type { LiveDeparture, LiveDepartureBoard } from "$lib/types/departure";
import {
	IdbskApiError,
	createIdsbkDebugInfo,
	fetchIdsbkJson,
	type IdbskDebugInfo
} from "$lib/api/idsbk/http";

const DEPARTURE_CACHE_TTL_SECONDS = 20;
const BRATISLAVA_TIME_ZONE = "Europe/Bratislava";

type CachedLiveDeparture = Omit<LiveDeparture, "minutesUntilDeparture"> & {
	remainingMs: number;
};

type CachedDepartureBoard = {
	cachedAtMs: number;
	board: CachedLiveDeparture[];
};

type IdbskTimetableResponse = {
	current?: IdbskTimetableEntry[];
};

type IdbskTimetableEntry = {
	trip_id?: number;
	trip_headsign?: string | null;
	route_short_name?: string | null;
	route_type?: number | null;
	departure?: number | null;
	stop_code?: string | null;
	trip_delay?: number | null;
};

type TimetableRequestWindow = {
	date: string;
	timeParam: string;
	minutesOfDay: number;
	exactSecondsOfDay: number;
	nowMs: number;
};

function isFiniteNumber(value: unknown): value is number {
	return typeof value === "number" && Number.isFinite(value);
}

function getCurrentBratislavaRequestWindow(now = new Date()): TimetableRequestWindow {
	const formatter = new Intl.DateTimeFormat("en-CA", {
		timeZone: BRATISLAVA_TIME_ZONE,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hourCycle: "h23",
		hour12: false
	});

	const parts = Object.fromEntries(
		formatter
			.formatToParts(now)
			.filter((part) => part.type !== "literal")
			.map((part) => [part.type, part.value])
	);
	const hours = Number.parseInt(parts.hour, 10);
	const minutes = Number.parseInt(parts.minute, 10);
	const seconds = Number.parseInt(parts.second, 10);

	return {
		date: `${parts.year}${parts.month}${parts.day}`,
		timeParam: `${hours * 60 + minutes}`,
		minutesOfDay: hours * 60 + minutes,
		exactSecondsOfDay:
			hours * 3600 + minutes * 60 + seconds + now.getMilliseconds() / 1000,
		nowMs: now.getTime()
	};
}

function getDelaySeconds(delaySeconds: number | null | undefined) {
	if (typeof delaySeconds !== "number" || !Number.isFinite(delaySeconds)) {
		return 0;
	}

	return delaySeconds;
}

function getDelayMinutes(delaySeconds: number) {
	return Math.round(delaySeconds / 60);
}

function getMinutesUntilDeparture(remainingMs: number) {
	return Math.max(0, Math.floor(remainingMs / 60_000));
}

function toLiveDeparture(departure: CachedLiveDeparture, elapsedMs = 0): LiveDeparture | null {
	const remainingMs = departure.remainingMs - elapsedMs;

	if (remainingMs <= 0) {
		return null;
	}

	return {
		id: departure.id,
		line: departure.line,
		destination: departure.destination,
		platform: departure.platform,
		routeType: departure.routeType,
		minutesUntilDeparture: getMinutesUntilDeparture(remainingMs),
		delayMinutes: departure.delayMinutes,
		isLive: departure.isLive
	};
}

function sortLiveDepartures(board: LiveDepartureBoard) {
	return board.sort((left, right) => {
		if (left.minutesUntilDeparture !== right.minutesUntilDeparture) {
			return left.minutesUntilDeparture - right.minutesUntilDeparture;
		}

		return left.line.localeCompare(right.line, "sk-SK", { numeric: true });
	});
}

function ageCachedDepartureBoard(
	cachedBoard: CachedDepartureBoard,
	limit: number,
	nowMs = Date.now()
): LiveDepartureBoard {
	const elapsedMs = Math.max(0, nowMs - cachedBoard.cachedAtMs);

	return sortLiveDepartures(
		cachedBoard.board
			.map((departure) => toLiveDeparture(departure, elapsedMs))
			.filter((departure): departure is LiveDeparture => departure !== null)
	).slice(0, limit);
}

function normalizeDeparture(
	entry: IdbskTimetableEntry,
	requestWindow: TimetableRequestWindow
): CachedLiveDeparture | null {
	if (
		!isFiniteNumber(entry.trip_id) ||
		typeof entry.route_short_name !== "string" ||
		typeof entry.trip_headsign !== "string" ||
		!isFiniteNumber(entry.departure)
	) {
		return null;
	}

	const delaySeconds = getDelaySeconds(entry.trip_delay);
	const scheduledDepartureSeconds = entry.departure * 60;
	const predictedDepartureSeconds = scheduledDepartureSeconds + delaySeconds;
	const remainingMs = Math.round(
		(predictedDepartureSeconds - requestWindow.exactSecondsOfDay) * 1000
	);
	const delayMinutes = getDelayMinutes(delaySeconds);
	const isLive = typeof entry.trip_delay === "number" && Number.isFinite(entry.trip_delay);

	if (remainingMs <= 0) {
		return null;
	}

	return {
		id: entry.trip_id,
		line: entry.route_short_name,
		destination: entry.trip_headsign,
		platform: entry.stop_code ? entry.stop_code : null,
		routeType: typeof entry.route_type === "number" ? entry.route_type : null,
		delayMinutes,
		isLive,
		remainingMs
	};
}

async function fetchDepartureBoard(
	fetchFn: typeof fetch,
	stationId: number,
	limit: number
): Promise<{ board: LiveDepartureBoard; cacheValue: CachedDepartureBoard; debug?: IdbskDebugInfo }> {
	const requestWindow = getCurrentBratislavaRequestWindow();
	const endpoint = `https://api.idsbk.sk/mobile/v3/station/${stationId}/timetable/${requestWindow.date}/${requestWindow.timeParam}/8/`;
	const { data, debug, ok, status } = await fetchIdsbkJson(fetchFn, endpoint);
	const debugInfo = createIdsbkDebugInfo("miss", debug);

	if (!ok) {
		throw new IdbskApiError(`IDS BK departure request failed with ${status}`, debugInfo);
	}

	const payload = data as IdbskTimetableResponse;

	if (!Array.isArray(payload.current)) {
		throw new IdbskApiError(
			"IDS BK timetable response did not include a current array",
			debugInfo
		);
	}

	const cachedBoard = payload.current
		.map((entry) => normalizeDeparture(entry, requestWindow))
		.filter((departure): departure is CachedLiveDeparture => departure !== null)
		.sort((left, right) => {
			if (left.remainingMs !== right.remainingMs) {
				return left.remainingMs - right.remainingMs;
			}

			return left.line.localeCompare(right.line, "sk-SK", { numeric: true });
		});

	return {
		board: ageCachedDepartureBoard(
			{
				cachedAtMs: requestWindow.nowMs,
				board: cachedBoard
			},
			limit,
			requestWindow.nowMs
		),
		cacheValue: {
			cachedAtMs: requestWindow.nowMs,
			board: cachedBoard
		},
		debug: debugInfo
	};
}

export async function getLiveDepartureBoard(fetchFn: typeof fetch, stationId: number, limit = 20) {
	const { board } = await getLiveDepartureBoardWithDebug(fetchFn, stationId, limit);

	return board;
}

export async function getLiveDepartureBoardWithDebug(
	fetchFn: typeof fetch,
	stationId: number,
	limit = 20
) {
	const cacheKey = `idsbk:departures:v4:${stationId}`;
	const cachedBoard = await getCachedJson<CachedDepartureBoard>(cacheKey);

	if (cachedBoard) {
		return {
			board: ageCachedDepartureBoard(cachedBoard, limit),
			debug: createIdsbkDebugInfo("hit")
		};
	}

	const { board, cacheValue, debug } = await fetchDepartureBoard(fetchFn, stationId, limit);

	await setCachedJson(cacheKey, cacheValue, DEPARTURE_CACHE_TTL_SECONDS);

	return {
		board,
		debug
	};
}
