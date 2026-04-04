import { env } from "$env/dynamic/private";

import Redis from "ioredis";

const DEFAULT_KEY_PREFIX = "aibus";

let valkeyClient: Redis | null = null;

function getKeyPrefix() {
	return env.VALKEY_PREFIX?.trim() || DEFAULT_KEY_PREFIX;
}

function getValkeyUrl() {
	const value = env.VALKEY_URL?.trim();

	return value ? value : null;
}

function buildCacheKey(key: string) {
	return `${getKeyPrefix()}:${key}`;
}

function getClient() {
	const url = getValkeyUrl();

	if (!url) {
		return null;
	}

	if (!valkeyClient) {
		valkeyClient = new Redis(url, {
			maxRetriesPerRequest: 1
		});
		valkeyClient.on("error", (error) => {
			console.error("Valkey connection error", error);
		});
	}

	return valkeyClient;
}

function logCacheError(action: string, key: string, error: unknown) {
	console.error(`Valkey cache ${action} failed for ${key}`, error);
}

export async function getCachedJson<T>(key: string): Promise<T | null> {
	const client = getClient();

	if (!client) {
		return null;
	}

	try {
		const value = await client.get(buildCacheKey(key));

		return value ? (JSON.parse(value) as T) : null;
	} catch (error) {
		logCacheError("read", key, error);

		return null;
	}
}

export async function setCachedJson<T>(key: string, value: T, ttlSeconds: number) {
	const client = getClient();

	if (!client) {
		return;
	}

	try {
		await client.set(buildCacheKey(key), JSON.stringify(value), "EX", ttlSeconds);
	} catch (error) {
		logCacheError("write", key, error);
	}
}
