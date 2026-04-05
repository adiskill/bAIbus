<script lang="ts">
	import { cn } from "$lib/utils";

	const colorClasses = [
		"bg-rose-600 text-white",
		"bg-orange-500 text-white",
		"bg-emerald-600 text-white",
		"bg-blue-600 text-white",
	] as const;

	let {
		line,
		class: className
	}: {
		line: string;
		class?: string;
	} = $props();

	function getLineColorClass(line: string) {
		const normalizedLine = line.trim().toUpperCase();

		if (!normalizedLine) {
			return "bg-slate-700 text-white";
		}

		let hash = 0;

		for (const character of normalizedLine) {
			hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
		}

		return colorClasses[hash % colorClasses.length];
	}
</script>

<div
	class={cn(
		"flex h-11 min-w-11 shrink-0 items-center justify-center rounded-xl px-2 text-base font-extrabold leading-none tracking-tight whitespace-nowrap",
		getLineColorClass(line),
		className
	)}
>
	{line}
</div>
