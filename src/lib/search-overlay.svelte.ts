import type { Component } from "svelte";
import type { HTMLAnchorAttributes } from "svelte/elements";

import type { SearchHistoryItem } from "$lib/search-history";

export type SearchOverlayItem = {
	id: string;
	label: string;
	query: string;
	href: string;
	description?: string;
};

export type SearchOverlayConfig = {
	scope: string;
	placeholder: string;
	searchingLabel: string;
	emptyResultsLabel: string;
	search: (
		query: string,
		options: {
			fetch: typeof globalThis.fetch;
			signal: AbortSignal;
		}
	) => Promise<SearchOverlayItem[]>;
	resultItemComponent: Component<{
		item: SearchOverlayItem;
		onclick?: HTMLAnchorAttributes["onclick"];
	}>;
	historyItemComponent: Component<{
		item: SearchHistoryItem;
		onclick?: HTMLAnchorAttributes["onclick"];
	}>;
};
