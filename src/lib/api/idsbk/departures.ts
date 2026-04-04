import { env } from "$env/dynamic/private";

import { getCachedJson, setCachedJson } from "$lib/server/valkey";
import type { LiveDeparture, LiveDepartureBoard } from "$lib/types/departure";

const DEPARTURE_CACHE_TTL_SECONDS = 20;
const BRATISLAVA_TIME_ZONE = "Europe/Bratislava";

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
	time: string;
	minutesOfDay: number;
};

function getRequiredEnv(name: "IDSBK_API_KEY" | "IDSBK_SESSION") {
	const value = env[name];

	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}

	return value;
}

function getCurrentBratislavaRequestWindow(now = new Date()): TimetableRequestWindow {
	const formatter = new Intl.DateTimeFormat("en-CA", {
		timeZone: BRATISLAVA_TIME_ZONE,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
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

	return {
		date: `${parts.year}${parts.month}${parts.day}`,
		time: `${parts.hour}${parts.minute}`,
		minutesOfDay: hours * 60 + minutes
	};
}

function hhmmToMinutes(value: number) {
	const hours = Math.floor(value / 100);
	const minutes = value % 100;

	return hours * 60 + minutes;
}

function minutesToHhmm(value: number) {
	const normalizedMinutes = ((value % 1_440) + 1_440) % 1_440;
	const hours = Math.floor(normalizedMinutes / 60);
	const minutes = normalizedMinutes % 60;

	return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

function getDelayMinutes(delaySeconds: number | null | undefined) {
	if (typeof delaySeconds !== "number" || !Number.isFinite(delaySeconds)) {
		return 0;
	}

	return Math.round(delaySeconds / 60);
}

function getStatusLabel(delayMinutes: number, isLive: boolean) {
	if (!isLive) {
		return "Scheduled";
	}

	if (delayMinutes > 0) {
		return `+${delayMinutes} min`;
	}

	if (delayMinutes < 0) {
		return `${delayMinutes} min`;
	}

	return "Live";
}

function normalizeDeparture(
	entry: IdbskTimetableEntry,
	requestWindow: TimetableRequestWindow
): LiveDeparture | null {
	if (
		typeof entry.trip_id !== "number" ||
		typeof entry.route_short_name !== "string" ||
		typeof entry.trip_headsign !== "string" ||
		typeof entry.departure !== "number"
	) {
		return null;
	}

	const delayMinutes = getDelayMinutes(entry.trip_delay);
	const scheduledDepartureMinutes = hhmmToMinutes(entry.departure);
	const predictedDepartureMinutes = scheduledDepartureMinutes + delayMinutes;
	const isLive = typeof entry.trip_delay === "number" && Number.isFinite(entry.trip_delay);

	return {
		tripId: entry.trip_id,
		line: entry.route_short_name,
		destination: entry.trip_headsign,
		platform: entry.stop_code ? `Stop ${entry.stop_code}` : null,
		routeType: typeof entry.route_type === "number" ? entry.route_type : null,
		scheduledDeparture: minutesToHhmm(scheduledDepartureMinutes),
		predictedDeparture: minutesToHhmm(predictedDepartureMinutes),
		minutesUntilDeparture: Math.max(0, predictedDepartureMinutes - requestWindow.minutesOfDay),
		delayMinutes,
		isLive,
		statusLabel: getStatusLabel(delayMinutes, isLive)
	};
}

async function fetchDepartureBoard(
	fetchFn: typeof fetch,
	stationId: number,
	limit: number
): Promise<LiveDepartureBoard> {
	const requestWindow = getCurrentBratislavaRequestWindow();
	const response = await fetchFn(
		`https://api.idsbk.sk/mobile/v3/station/${stationId}/timetable/${requestWindow.date}/${requestWindow.time}/${limit}/`,
		{
			headers: {
				"X-API-Key": getRequiredEnv("IDSBK_API_KEY"),
				"X-Session": getRequiredEnv("IDSBK_SESSION")
			}
		}
	);

	if (!response.ok) {
		throw new Error(`IDS BK departure request failed with ${response.status}`);
	}

	const data = (await response.json()) as IdbskTimetableResponse;

	if (!Array.isArray(data.current)) {
		throw new Error("IDS BK timetable response did not include a current array");
	}

	const departures = data.current
		.map((entry) => normalizeDeparture(entry, requestWindow))
		.filter((departure): departure is LiveDeparture => departure !== null)
		.sort((left, right) => {
			if (left.minutesUntilDeparture !== right.minutesUntilDeparture) {
				return left.minutesUntilDeparture - right.minutesUntilDeparture;
			}

			return left.line.localeCompare(right.line, "sk-SK", { numeric: true });
		})
		.slice(0, limit);

	return {
		stationId,
		departures,
		fetchedAt: new Date().toISOString(),
		requestedDate: requestWindow.date,
		requestedTime: requestWindow.time
	};
}

export async function getLiveDepartureBoard(fetchFn: typeof fetch, stationId: number, limit = 8) {
	const cacheKey = `idsbk:departures:v1:${stationId}:${limit}`;
	const cachedBoard = await getCachedJson<LiveDepartureBoard>(cacheKey);

	if (cachedBoard) {
		return cachedBoard;
	}

	const board = await fetchDepartureBoard(fetchFn, stationId, limit);

	await setCachedJson(cacheKey, board, DEPARTURE_CACHE_TTL_SECONDS);

	return board;
}
