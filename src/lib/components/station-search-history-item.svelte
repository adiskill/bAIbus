<script lang="ts">
	import { ChevronRight, History } from "@lucide/svelte";
	import type { HTMLAnchorAttributes } from "svelte/elements";

	import type { SearchHistoryItem } from "$lib/search-history";
	import { PressableCard } from "$lib/components/ui/card";
	import { Heading } from "$lib/components/ui/heading";

	let {
		item,
		onclick
	}: {
		item: SearchHistoryItem;
		onclick?: HTMLAnchorAttributes["onclick"];
	} = $props();
</script>

<PressableCard href={item.href} contentClass="flex items-center justify-between gap-3" {onclick}>
	<div class="flex min-w-0 items-center gap-3">
		<div
			class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800"
		>
			<History class="size-6" strokeWidth={2} />
		</div>
		<Heading as="h3" size="xl" class="truncate font-bold">
			{item.label}
		</Heading>
	</div>

	<div class="flex shrink-0 items-center gap-3">
		<ChevronRight class="size-5 text-slate-500 dark:text-slate-400" strokeWidth={2.4} />
	</div>
</PressableCard>
