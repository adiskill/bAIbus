<script module lang="ts">
	let previousActiveIndex: number | null = null;
</script>

<script lang="ts">
	import { page } from "$app/state";
	import { House, List, Navigation } from "@lucide/svelte";
	import { onMount } from "svelte";
	import { getI18n } from "$lib/i18n";

	const i18n = $derived(getI18n(page.data.locale));
	const navItems = $derived([
		{ label: i18n.messages.nav.home, icon: House, href: "/" },
		{ label: i18n.messages.nav.navigation, icon: Navigation, href: "/navigation" },
		{ label: i18n.messages.nav.timetables, icon: List, href: "/timetables" }
	] as const);

	function isCurrentPath(pathname: string, href: string) {
		if (href === "/") {
			return pathname === "/" || pathname.startsWith("/stations/");
		}

		return pathname === href;
	}

	function getCurrentIndex(pathname: string) {
		const index = navItems.findIndex((item) => isCurrentPath(pathname, item.href));
		return index === -1 ? 0 : index;
	}

	const initialCurrentIndex = getCurrentIndex(page.url.pathname);
	let currentIndex = $derived(getCurrentIndex(page.url.pathname));
	const startingIndex = previousActiveIndex;
	let indicatorIndex = $state(startingIndex ?? initialCurrentIndex);
	let indicatorReady = $state(false);

	$effect(() => {
		previousActiveIndex = currentIndex;
	});

	onMount(() => {
		if (
			startingIndex === null ||
			startingIndex === currentIndex ||
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		) {
			indicatorIndex = currentIndex;
			return;
		}

		const frameId = requestAnimationFrame(() => {
			indicatorReady = true;
			indicatorIndex = currentIndex;
		});

		return () => cancelAnimationFrame(frameId);
	});
</script>

<nav class="sticky bottom-0 z-50 mt-auto bg-slate-50/95 backdrop-blur-sm">
	<div
		class="rounded-t-3xl bg-white px-6 pt-5 shadow-lg shadow-slate-900/5"
		style:padding-bottom={"calc(env(safe-area-inset-bottom) + 1.5rem)"}
	>
		<div
			class="bottom-nav-grid relative grid grid-cols-3 items-end gap-2"
			style={`--nav-gap: 0.5rem; --nav-item-count: ${navItems.length}; --nav-index: ${indicatorIndex};`}
		>
			<span
				class={`nav-active-indicator pointer-events-none absolute inset-y-0 left-0 rounded-2xl bg-blue-100 ${
					indicatorReady ? "nav-active-indicator-ready" : ""
				}`}
				aria-hidden="true"
			></span>

			{#each navItems as item}
				{@const current = isCurrentPath(page.url.pathname, item.href)}
				<a
					href={item.href}
					class={`nav-item-link relative z-10 flex min-h-16 flex-col items-center justify-center rounded-2xl px-3 py-2 ${
						current ? "text-slate-900" : "text-slate-500"
					}`}
					aria-current={current ? "page" : undefined}
					aria-label={item.label}
				>
					<item.icon
						class={`nav-item-icon size-5 ${
							current ? "fill-current text-slate-900" : "text-slate-500"
						}`}
						strokeWidth={2.15}
					/>
					<span
						class={`nav-item-label mt-2 text-xs font-semibold uppercase tracking-widest ${
							current ? "text-slate-900" : "text-slate-600"
						}`}
					>
						{item.label}
					</span>
				</a>
			{/each}
		</div>
	</div>
</nav>

<style>
	.bottom-nav-grid {
		--nav-gap: 0.5rem;
		--nav-item-count: 3;
		--nav-index: 0;
	}

	.nav-item-link,
	.nav-item-icon,
	.nav-item-label {
		transition-duration: var(--page-transition-duration);
		transition-property: color, fill, stroke;
		transition-timing-function: var(--page-transition-ease);
	}

	.nav-active-indicator {
		width: calc((100% - (var(--nav-gap) * (var(--nav-item-count) - 1))) / var(--nav-item-count));
		transform: translateX(calc(var(--nav-index) * (100% + var(--nav-gap))));
	}

	@media (prefers-reduced-motion: no-preference) {
		.nav-active-indicator-ready {
			transition: transform var(--page-transition-duration) var(--page-transition-ease);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.nav-item-link,
		.nav-item-icon,
		.nav-item-label,
		.nav-active-indicator {
			transition: none;
		}
	}
</style>
