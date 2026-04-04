<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
	import { Search } from "@lucide/svelte";

	let { searchLabel = "Search" }: { searchLabel?: string } = $props();
</script>

<header class="sticky top-0 z-50 bg-slate-50/95 backdrop-blur-sm">
	<div
		class="flex items-center justify-between px-6 pb-4"
		style:padding-top={"calc(env(safe-area-inset-top) + 1rem)"}
	>
		<div class="flex items-center gap-4">
			<img src={favicon} alt="AIBus" class="size-8 rounded-md object-contain" />
			<h1 class="text-3xl font-extrabold tracking-tight text-slate-800">
				AIBus
			</h1>
		</div>
		<button
			type="button"
			class="flex size-10 items-center justify-center rounded-full text-slate-500"
			aria-label={searchLabel}
		>
			<Search class="size-7" strokeWidth={2.2} />
		</button>
	</div>
</header>
