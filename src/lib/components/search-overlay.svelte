<script lang="ts">
	import { browser } from "$app/environment";
	import { page } from "$app/state";
	import BackButton from "$lib/components/back-button.svelte";
	import { getI18n } from "$lib/i18n";
	import {
		loadSearchHistory,
		persistSearchHistory,
		recordSearchHistory,
		type SearchHistoryItem
	} from "$lib/search-history";
	import { portal } from "$lib/utils";
	import type {
		SearchOverlayConfig,
		SearchOverlayItem
	} from "../search-overlay.svelte.ts";
	import { Search } from "@lucide/svelte";
	import { cubicOut } from "svelte/easing";
	import { onMount, tick } from "svelte";
	import { fade, scale } from "svelte/transition";

	const i18n = $derived(getI18n(page.data.locale));
	const SEARCH_OVERLAY_HISTORY_KEY = "aibusSearchOverlay";

	let {
		config,
		open = $bindable(false),
		trigger = null
	}: {
		config: SearchOverlayConfig;
		open?: boolean;
		trigger?: HTMLButtonElement | null;
	} = $props();

	let inputElement = $state<HTMLInputElement | null>(null);
	let prefersReducedMotion = $state(false);
	let query = $state("");
	let recentSearches = $state<SearchHistoryItem[]>([]);
	let searchResults = $state<SearchOverlayItem[]>([]);
	let searchErrorMessage = $state<string | null>(null);
	let isSearching = $state(false);
	let currentTimestamp = $state(Date.now());

	const trimmedQuery = $derived(query.trim());
	const renderedRecentSearches = $derived.by((): SearchHistoryItem[] => recentSearches);
	const closeTransition = $derived(
		prefersReducedMotion
			? { duration: 1 }
			: { duration: 180, easing: cubicOut }
	);
	const panelTransition = $derived(
		prefersReducedMotion
			? { duration: 1, start: 1, opacity: 1 }
			: { duration: 240, start: 0.96, opacity: 0.18, easing: cubicOut }
	);

	onMount(() => {
		if (!browser) {
			return;
		}

		const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		const syncMotionPreference = () => {
			prefersReducedMotion = motionQuery.matches;
		};

		syncMotionPreference();
		motionQuery.addEventListener("change", syncMotionPreference);

		const handlePopstate = (event: PopStateEvent) => {
			if (isSearchOverlayHistoryState(event.state)) {
				if (!open) {
					open = true;
				}

				return;
			}

			if (open) {
				closeOverlayState();
			}
		};

		window.addEventListener("popstate", handlePopstate);

		if (isSearchOverlayHistoryState(window.history.state)) {
			open = true;
		}

		return () => {
			motionQuery.removeEventListener("change", syncMotionPreference);
			window.removeEventListener("popstate", handlePopstate);
		};
	});

	$effect(() => {
		if (!browser || !open) {
			return;
		}

		if (isSearchOverlayHistoryState(window.history.state)) {
			return;
		}

		const currentState =
			typeof window.history.state === "object" && window.history.state !== null
				? window.history.state
				: {};

		window.history.pushState(
			{
				...currentState,
				[SEARCH_OVERLAY_HISTORY_KEY]: true
			},
			"",
			window.location.href
		);
	});

	$effect(() => {
		if (!browser || !open) {
			return;
		}

		recentSearches = loadSearchHistory(config.scope);
		currentTimestamp = Date.now();
		query = "";
		searchResults = [];
		searchErrorMessage = null;

		const frameId = window.requestAnimationFrame(async () => {
			await tick();
			inputElement?.focus();
		});

		return () => {
			window.cancelAnimationFrame(frameId);
		};
	});

	$effect(() => {
		if (!browser || !open) {
			return;
		}

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		return () => {
			document.body.style.overflow = previousOverflow;
		};
	});

	$effect(() => {
		if (!browser || !open) {
			return;
		}

		const intervalId = window.setInterval(() => {
			currentTimestamp = Date.now();
		}, 60_000);

		const handleKeydown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				event.preventDefault();
				closeOverlay();
			}
		};

		window.addEventListener("keydown", handleKeydown);

		return () => {
			window.clearInterval(intervalId);
			window.removeEventListener("keydown", handleKeydown);
		};
	});

	$effect(() => {
		if (!browser || !open || !trimmedQuery) {
			searchResults = [];
			searchErrorMessage = null;
			isSearching = false;
			return;
		}

		const abortController = new AbortController();
		const timeoutId = window.setTimeout(async () => {
			isSearching = true;
			searchErrorMessage = null;

			try {
				searchResults = await config.search(trimmedQuery, {
					fetch,
					signal: abortController.signal
				});
			} catch (caughtError) {
				if (abortController.signal.aborted) {
					return;
				}

				searchResults = [];
				searchErrorMessage =
					caughtError instanceof Error
						? caughtError.message
						: config.emptyResultsLabel;
			} finally {
				if (!abortController.signal.aborted) {
					isSearching = false;
				}
			}
		}, 140);

		return () => {
			window.clearTimeout(timeoutId);
			abortController.abort();
			isSearching = false;
		};
	});

	function closeOverlayState() {
		open = false;
		trigger?.focus();
	}

	function closeOverlay() {
		if (browser && isSearchOverlayHistoryState(window.history.state)) {
			window.history.back();
			return;
		}

		closeOverlayState();
	}

	function handleSearchSubmit(event: SubmitEvent) {
		event.preventDefault();

		const firstResult = searchResults[0];

		if (!trimmedQuery || !firstResult) {
			return;
		}

		void handleResultSelect(firstResult);
	}

	function handleResultSelect(item: SearchOverlayItem) {
		recentSearches = recordSearchHistory(recentSearches, {
			label: item.label,
			query: item.query,
			href: item.href,
			description: item.description
		});
		persistSearchHistory(config.scope, recentSearches);
		currentTimestamp = Date.now();
	}

	async function handleRecentSearchClick(item: SearchHistoryItem) {
		if (item.href) {
			recentSearches = recordSearchHistory(recentSearches, item);
			persistSearchHistory(config.scope, recentSearches);
			currentTimestamp = Date.now();
			return;
		}

		query = item.query;
		currentTimestamp = Date.now();
		await tick();
		inputElement?.focus();
		inputElement?.select();
	}

	function isSearchOverlayHistoryState(state: unknown) {
		return (
			typeof state === "object" &&
			state !== null &&
			SEARCH_OVERLAY_HISTORY_KEY in state &&
			state[SEARCH_OVERLAY_HISTORY_KEY as keyof typeof state] === true
		);
	}
</script>

{#if open}
	<div class="fixed inset-0 z-[80]" use:portal>
		<button
			type="button"
			class="absolute inset-0 bg-slate-50 dark:bg-slate-950"
			transition:fade={closeTransition}
			aria-label={i18n.messages.searchOverlay.close}
			onclick={closeOverlay}
		></button>

		<div class="relative mx-auto flex h-dvh w-full max-w-screen-sm flex-col">
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="search-overlay-title"
				class="relative flex min-h-0 flex-1 flex-col overflow-hidden"
				transition:scale={panelTransition}
			>
				<div class="relative flex min-h-0 flex-1 flex-col px-4 py-4 sm:px-6 sm:py-5">
					<h2 id="search-overlay-title" class="sr-only">
						{i18n.messages.header.search}
					</h2>

					<form
						class="search-overlay-shell flex items-center gap-3 rounded-[1.35rem] border border-slate-200/80 bg-slate-200/90 px-4 py-4 shadow-sm shadow-slate-900/5 dark:border-slate-700/80 dark:bg-slate-800/90 dark:shadow-black/20"
						onsubmit={handleSearchSubmit}
					>
						<BackButton
							aria-label={i18n.messages.searchOverlay.back}
							class="text-slate-600 hover:bg-white/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/70 dark:hover:text-slate-50"
							onclick={closeOverlay}
						/>

						<input
							bind:this={inputElement}
							bind:value={query}
							type="search"
							placeholder={config.placeholder || i18n.messages.searchOverlay.placeholder}
							autocomplete="off"
							enterkeyhint="search"
							class="min-w-0 flex-1 border-none bg-transparent p-0 text-lg font-medium tracking-[-0.02em] text-slate-700 placeholder:text-slate-500 focus:outline-none focus:ring-0 dark:text-slate-100 dark:placeholder:text-slate-400"
						/>

						<button
							type="submit"
							aria-label={i18n.messages.header.search}
							class={`flex size-10 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-200 dark:focus-visible:ring-blue-400 dark:focus-visible:ring-offset-slate-800 ${
								query.trim().length > 0
									? "bg-white text-slate-900 shadow-sm hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-50 dark:hover:bg-slate-600"
									: "text-slate-500 hover:bg-white/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700/70 dark:hover:text-slate-50"
							}`}
						>
							<Search class="size-5" strokeWidth={2.2} />
						</button>
					</form>

					<section
						class="mt-6 min-h-0 flex-1 overflow-y-auto"
						aria-labelledby="recent-searches-heading"
					>
						<h3 id="recent-searches-heading" class="sr-only">
							{i18n.messages.searchOverlay.recentHeading}
						</h3>

						{#if trimmedQuery}
							{#if searchErrorMessage}
								<p class="px-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
									{searchErrorMessage}
								</p>
							{:else if isSearching}
								<p class="px-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
									{config.searchingLabel}
								</p>
							{:else if searchResults.length > 0}
								{@const ResultItemComponent = config.resultItemComponent}
								<div class="space-y-3">
									{#each searchResults as item (item.id)}
										<ResultItemComponent {item} onclick={() => handleResultSelect(item)} />
									{/each}
								</div>
							{:else}
								<p class="px-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
									{config.emptyResultsLabel}
								</p>
							{/if}
						{:else if renderedRecentSearches.length > 0}
							{@const HistoryItemComponent = config.historyItemComponent}
							<div class="space-y-3">
								{#each renderedRecentSearches as item, index (`${item.query}-${index}`)}
									<HistoryItemComponent {item} onclick={() => void handleRecentSearchClick(item)} />
								{/each}
							</div>
						{/if}
					</section>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	@media (prefers-reduced-motion: no-preference) {
		.search-overlay-shell {
			animation: search-shell-enter 240ms var(--page-transition-ease) both;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.search-overlay-shell {
			animation: none;
		}
	}

	@keyframes search-shell-enter {
		from {
			opacity: 0;
			transform: translateY(-0.5rem);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
