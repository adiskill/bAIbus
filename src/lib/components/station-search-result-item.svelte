<script lang="ts">
	import type { HTMLAnchorAttributes } from "svelte/elements";
	import type { SearchOverlayItem } from "../search-overlay.svelte.ts";
	import StationCard from "./station-card.svelte";

	let {
		item,
		onclick
	}: {
		item: SearchOverlayItem;
		onclick?: HTMLAnchorAttributes["onclick"];
	} = $props();
</script>

<StationCard name={item.label} href={item.href} {onclick} />
