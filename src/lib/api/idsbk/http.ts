import { dev } from "$app/environment";
import { env } from "$env/dynamic/private";

export type IdbskRequestDebugEntry = {
	endpoint: string;
	status: number;
	response: unknown;
};

export type IdbskDebugInfo = {
	cache: "hit" | "miss";
	requests: IdbskRequestDebugEntry[];
};

type IdbskFetchResult = {
	data: unknown;
	debug: IdbskRequestDebugEntry | null;
	ok: boolean;
	status: number;
};

export class IdbskApiError extends Error {
	constructor(
		message: string,
		readonly debug?: IdbskDebugInfo
	) {
		super(message);
		this.name = "IdsbkApiError";
	}
}

function getRequiredEnv(name: "IDSBK_API_KEY" | "IDSBK_SESSION") {
	const value = env[name];

	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}

	return value;
}

function parseJsonOrText(body: string) {
	if (!body) {
		return null;
	}

	try {
		return JSON.parse(body) as unknown;
	} catch {
		return body;
	}
}

export function createIdsbkDebugInfo(
	cache: IdbskDebugInfo["cache"],
	request?: IdbskRequestDebugEntry | null
) {
	if (!dev) {
		return undefined;
	}

	return {
		cache,
		requests: request ? [request] : []
	} satisfies IdbskDebugInfo;
}

export function getIdsbkDebugInfo(error: unknown) {
	return error instanceof IdbskApiError ? error.debug : undefined;
}

export async function fetchIdsbkJson(
	fetchFn: typeof fetch,
	endpoint: string
): Promise<IdbskFetchResult> {
	const response = await fetchFn(endpoint, {
		headers: {
			"X-API-Key": getRequiredEnv("IDSBK_API_KEY"),
			"X-Session": getRequiredEnv("IDSBK_SESSION")
		}
	});
	const body = await response.text();
	const data = parseJsonOrText(body);
	const debug = dev
		? ({
				endpoint,
				status: response.status,
				response: data
			} satisfies IdbskRequestDebugEntry)
		: null;

	if (debug) {
		console.debug("[idsbk] upstream response", debug);
	}

	return {
		data,
		debug,
		ok: response.ok,
		status: response.status
	};
}
