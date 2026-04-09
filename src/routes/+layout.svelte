	<script lang="ts">
		import { page } from "$app/state";
		import { browser } from "$app/environment";
		import { afterNavigate, disableScrollHandling, onNavigate } from "$app/navigation";
		import { QueryClientProvider } from "@tanstack/svelte-query";

		import { createAppQueryClient } from "$lib/query/client";
		import favicon from "$lib/assets/favicon.svg";
		import "./layout.css";

		import type { OnNavigate } from "@sveltejs/kit";

		type RouteTransitionKind = "forward" | "back" | "fade";
		type ViewTransitionHandle = {
			finished: Promise<void>;
			ready: Promise<void>;
			updateCallbackDone: Promise<void>;
			skipTransition: () => void;
		};
		type ViewTransitionCapableDocument = Document & {
			startViewTransition?: (
				updateCallback: () => Promise<void> | void
			) => ViewTransitionHandle;
		};

		const topLevelPathOrder = new Map([
			["/", 0],
			["/navigation", 1],
			["/timetables", 2]
		]);

		let { children } = $props();
		const queryClient = createAppQueryClient();

		$effect(() => {
			if (!browser) {
				return;
			}

			document.documentElement.lang = page.data.locale;
		});

		function isDetailPath(pathname: string) {
			return pathname.startsWith("/stations/") || pathname.startsWith("/trips/");
		}

		function isTripDetailPath(pathname: string) {
			return pathname.startsWith("/trips/");
		}

		function getDetailTransitionKind(
			fromPathname: string,
			toPathname: string
		): RouteTransitionKind | null {
			const fromStationDetail = fromPathname.startsWith("/stations/");
			const toStationDetail = toPathname.startsWith("/stations/");
			const fromTripDetail = fromPathname.startsWith("/trips/");
			const toTripDetail = toPathname.startsWith("/trips/");

			if (fromStationDetail && toTripDetail) {
				return "forward";
			}

			if (fromTripDetail && toStationDetail) {
				return "back";
			}

			return null;
		}

		function getTransitionKind(
			fromPathname: string,
			toPathname: string,
			navigationType: OnNavigate["type"]
		): RouteTransitionKind {
			if (fromPathname === toPathname) {
				return "fade";
			}

			const fromDetail = isDetailPath(fromPathname);
			const toDetail = isDetailPath(toPathname);

			if (fromDetail !== toDetail) {
				return toDetail ? "forward" : "back";
			}

			const detailTransitionKind = getDetailTransitionKind(fromPathname, toPathname);

			if (detailTransitionKind) {
				return detailTransitionKind;
			}

			const fromIndex = topLevelPathOrder.get(fromPathname);
			const toIndex = topLevelPathOrder.get(toPathname);

			if (fromIndex !== undefined && toIndex !== undefined) {
				const movesForward = toIndex > fromIndex;

				if (fromIndex === toIndex) {
					return "fade";
				}

				if (navigationType === "popstate") {
					return movesForward ? "back" : "forward";
				}

				return movesForward ? "forward" : "back";
			}

			return navigationType === "popstate" ? "back" : "forward";
		}

		function getViewTransitionDocument() {
			if (!browser || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
				return null;
			}

			const transitionDocument = document as ViewTransitionCapableDocument;

			return typeof transitionDocument.startViewTransition === "function"
				? transitionDocument
				: null;
		}

		if (browser) {
			afterNavigate(({ to }) => {
				const toPathname = to?.url.pathname;

				if (!toPathname || isTripDetailPath(toPathname)) {
					return;
				}

				disableScrollHandling();
				window.scrollTo({ top: 0, left: 0, behavior: "auto" });
			});

			onNavigate((navigation) => {
				const transitionDocument = getViewTransitionDocument();
				const fromPathname = navigation.from?.url.pathname;
				const toPathname = navigation.to?.url.pathname;

				if (!transitionDocument || !fromPathname || !toPathname) {
					return;
				}

				document.documentElement.dataset.routeTransition = getTransitionKind(
					fromPathname,
					toPathname,
					navigation.type
				);

				return new Promise<void>((resolve) => {
					transitionDocument.startViewTransition?.(async () => {
						resolve();

						try {
							await navigation.complete;
						} catch {
							document.documentElement.dataset.routeTransition = "fade";
						}
					});
				});
			});
		}
	</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<QueryClientProvider client={queryClient}>
	{@render children()}
</QueryClientProvider>
