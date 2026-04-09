<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import type { SearchOverlayConfig } from "../search-overlay.svelte.ts";

	export type SearchButtonProps = WithElementRef<HTMLButtonAttributes, HTMLButtonElement> & {
		active?: boolean;
		iconClass?: string;
		overlayConfig?: SearchOverlayConfig;
	};
</script>

<script lang="ts">
	import { Search } from "@lucide/svelte";
	import SearchOverlay from "$lib/components/search-overlay.svelte";

	let {
		class: className,
		ref = $bindable(null),
		active = false,
		iconClass = "size-5",
		overlayConfig,
		onclick,
		"aria-expanded": ariaExpanded,
		"aria-haspopup": ariaHasPopup,
		type = "button",
		...restProps
	}: SearchButtonProps = $props();
	let isOverlayOpen = $state(false);

	const baseClass =
		"flex size-10 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-blue-400 dark:focus-visible:ring-offset-slate-950";

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		onclick?.(event);

		if (event.defaultPrevented || !overlayConfig) {
			return;
		}

		isOverlayOpen = true;
	}
</script>

<button
	bind:this={ref}
	aria-expanded={overlayConfig ? isOverlayOpen : ariaExpanded}
	aria-haspopup={overlayConfig ? "dialog" : ariaHasPopup}
	class={cn(
		baseClass,
		active
			? "bg-white text-slate-900 shadow-sm hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-50 dark:hover:bg-slate-600"
			: "text-slate-500 hover:bg-white/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700/70 dark:hover:text-slate-50",
		className
	)}
	onclick={handleClick}
	{type}
	{...restProps}
>
	<Search class={iconClass} strokeWidth={2.2} />
</button>

{#if overlayConfig}
	<SearchOverlay bind:open={isOverlayOpen} config={overlayConfig} trigger={ref} />
{/if}
