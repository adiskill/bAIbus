import { dev } from "$app/environment";

import type { IdbskDebugInfo } from "$lib/api/idsbk/http";

type ApiDebugPayload = {
	idsbk: IdbskDebugInfo;
};

type DevDataResponse<T> = {
	data: T;
	debug: ApiDebugPayload;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

export function withIdsbkDebugData<T>(data: T, debug: IdbskDebugInfo | undefined) {
	if (!dev || !debug) {
		return data;
	}

	return {
		data,
		debug: {
			idsbk: debug
		}
	} satisfies DevDataResponse<T>;
}

export function withIdsbkDebugError(message: string, debug: IdbskDebugInfo | undefined) {
	if (!dev || !debug) {
		return { message };
	}

	return {
		message,
		debug: {
			idsbk: debug
		}
	};
}

export function unwrapDevData<T>(payload: unknown) {
	if (isRecord(payload) && "data" in payload) {
		return payload.data as T;
	}

	return payload as T;
}

export function getResponseMessage(payload: unknown) {
	if (isRecord(payload) && typeof payload.message === "string") {
		return payload.message;
	}

	return null;
}
