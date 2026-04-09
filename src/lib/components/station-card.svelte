<script lang="ts">
	import { BusFront, ChevronRight, MapPinned, SquareM, TramFront } from "@lucide/svelte";
	import type { HTMLAnchorAttributes } from "svelte/elements";

	import { PressableCard } from "$lib/components/ui/card";
	import { Heading } from "$lib/components/ui/heading";
	import type { StationMode } from "$lib/types/station";

	let {
		class: className,
		distance,
		href,
		name,
		onclick,
		mode
	}: {
		class?: string;
		distance?: string;
		href: string;
		name: string;
		onclick?: HTMLAnchorAttributes["onclick"];
		mode?: StationMode;
	} = $props();

	const modeMeta: Record<
		StationMode,
		{
			icon: typeof BusFront;
			iconClass: string;
			panelClass: string;
		}
	> = {
		bus: {
			icon: BusFront,
			iconClass: "text-slate-500 dark:text-slate-400",
			panelClass: "bg-slate-100 dark:bg-slate-800"
		},
		tram: {
			icon: SquareM,
			iconClass: "text-slate-500 dark:text-slate-400",
			panelClass: "bg-slate-100 dark:bg-slate-800"
		},
		rail: {
			icon: TramFront,
			iconClass: "text-slate-500 dark:text-slate-400",
			panelClass: "bg-slate-100 dark:bg-slate-800"
		}
	};

	const fallbackMeta = {
		icon: MapPinned,
		iconClass: "text-slate-500 dark:text-slate-400",
		panelClass: "bg-slate-100 dark:bg-slate-800"
	};

	function getModeMeta(mode?: StationMode) {
		return mode ? modeMeta[mode] : fallbackMeta;
	}
</script>

<PressableCard
	href={href}
	cardClass={className}
	contentClass="flex items-center justify-between gap-3"
	{onclick}
>
	{@const meta = getModeMeta(mode)}
	<div class="flex min-w-0 items-center gap-3">
		<div
			class={`flex size-12 shrink-0 items-center justify-center rounded-xl ${meta.panelClass}`}
		>
			<meta.icon class={`size-7 ${meta.iconClass}`} strokeWidth={2.1} />
		</div>
		<Heading as="h3" size="xl" class="truncate font-bold">
			{name}
		</Heading>
	</div>

	<div class="flex shrink-0 items-center gap-3">
		{#if distance}
			<div class="text-sm font-extrabold tracking-wider text-slate-500 dark:text-slate-400">{distance}</div>
		{/if}
		<ChevronRight class="size-5 text-slate-500 dark:text-slate-400" strokeWidth={2.4} />
	</div>
</PressableCard>
