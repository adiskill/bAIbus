<script lang="ts">
	import { BusFront, ChevronRight, MapPinned, SquareM, TramFront } from "@lucide/svelte";

	import { Card } from "$lib/components/ui/card";
	import type { StationMode } from "$lib/types/station";
	import { cn } from "$lib/utils";

	let {
		class: className,
		distance,
		href,
		name,
		mode
	}: {
		class?: string;
		distance?: string;
		href: string;
		name: string;
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
			iconClass: "text-slate-500",
			panelClass: "bg-slate-100"
		},
		tram: {
			icon: SquareM,
			iconClass: "text-slate-500",
			panelClass: "bg-slate-100"
		},
		rail: {
			icon: TramFront,
			iconClass: "text-slate-500",
			panelClass: "bg-slate-100"
		}
	};

	const fallbackMeta = {
		icon: MapPinned,
		iconClass: "text-slate-500",
		panelClass: "bg-slate-100"
	};

	function getModeMeta(mode?: StationMode) {
		return mode ? modeMeta[mode] : fallbackMeta;
	}
</script>

<a
	href={href}
	class="block rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
>
	<Card
		class={cn(
			"transition-colors active:bg-slate-100",
			className
		)}
	>
		{@const meta = getModeMeta(mode)}
		<div class="flex items-center justify-between gap-3">
			<div class="flex min-w-0 items-center gap-3">
				<div
					class={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${meta.panelClass}`}
				>
					<meta.icon class={`size-7 ${meta.iconClass}`} strokeWidth={2.1} />
				</div>
				<h3 class="truncate text-xl font-bold tracking-tight text-slate-800">
					{name}
				</h3>
			</div>

			<div class="flex shrink-0 items-center gap-3">
				{#if distance}
					<div class="text-sm font-extrabold tracking-wider text-slate-500">{distance}</div>
				{/if}
				<ChevronRight class="size-5 text-blue-600" strokeWidth={2.4} />
			</div>
		</div>
	</Card>
</a>
