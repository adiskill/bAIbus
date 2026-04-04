	<script lang="ts">
		import { browser } from "$app/environment";
		import { onNavigate } from "$app/navigation";
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

		function isStationPath(pathname: string) {
			return pathname.startsWith("/stations/");
		}

		function getTransitionKind(
			fromPathname: string,
			toPathname: string,
			navigationType: OnNavigate["type"]
		): RouteTransitionKind {
			if (fromPathname === toPathname) {
				return "fade";
			}

			const fromStation = isStationPath(fromPathname);
			const toStation = isStationPath(toPathname);

			if (fromStation !== toStation) {
				return toStation ? "forward" : "back";
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
