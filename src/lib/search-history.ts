import { browser } from "$app/environment";

export type SearchHistoryItem = {
	label: string;
	query: string;
	href?: string;
	description?: string;
};

const SEARCH_HISTORY_STORAGE_KEY_PREFIX = "search-history";
const SEARCH_HISTORY_LIMIT = 5;

function getSearchHistoryStorageKey(scope: string) {
	return `${SEARCH_HISTORY_STORAGE_KEY_PREFIX}:${scope}`;
}

function isSearchHistoryItem(value: unknown): value is SearchHistoryItem {
	return (
		typeof value === "object" &&
		value !== null &&
		"label" in value &&
		typeof value.label === "string" &&
		"query" in value &&
		typeof value.query === "string" &&
		(!("href" in value) ||
			value.href === undefined ||
			typeof value.href === "string") &&
		(!("description" in value) ||
			value.description === undefined ||
			typeof value.description === "string")
	);
}

function normalizeSearchHistoryItem(value: unknown): SearchHistoryItem | null {
	if (!isSearchHistoryItem(value)) {
		return null;
	}

	const label = value.label.trim();
	const query = value.query.trim();

	if (!label || !query) {
		return null;
	}

	return {
		label,
		query,
		href: value.href?.trim() || undefined,
		description: value.description?.trim() || undefined
	};
}

export function loadSearchHistory(scope = "default") {
	if (!browser) {
		return [];
	}

	try {
		const storedValue = localStorage.getItem(getSearchHistoryStorageKey(scope));

		if (!storedValue) {
			return [];
		}

		const parsedValue = JSON.parse(storedValue);

		if (!Array.isArray(parsedValue)) {
			return [];
		}

		return parsedValue
			.map(normalizeSearchHistoryItem)
			.filter((item): item is SearchHistoryItem => item !== null)
			.slice(0, SEARCH_HISTORY_LIMIT);
	} catch {
		return [];
	}
}

export function persistSearchHistory(scope = "default", items: SearchHistoryItem[]) {
	if (!browser) {
		return;
	}

	try {
		localStorage.setItem(
			getSearchHistoryStorageKey(scope),
			JSON.stringify(
				items.slice(0, SEARCH_HISTORY_LIMIT).map(
					({ label, query, href, description }) => ({
						label,
						query,
						href,
						description
					})
				)
			)
		);
	} catch (e) {
		console.error(e);
		// Ignore storage failures so search UI can still open on restricted browsers.
	}
}

export function recordSearchHistory(
	items: SearchHistoryItem[],
	item: SearchHistoryItem
) {
	const normalizedItem = normalizeSearchHistoryItem(item);

	if (!normalizedItem) {
		return items;
	}

	const normalizedQuery = normalizedItem.query.toLocaleLowerCase("sk-SK");

	return [
		normalizedItem,
		...items.filter(
			(existingItem) =>
				existingItem.query.trim().toLocaleLowerCase("sk-SK") !== normalizedQuery
		)
	].slice(0, SEARCH_HISTORY_LIMIT);
}
