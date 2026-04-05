<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type CardProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
</script>

<script lang="ts">
	let {
		class: className,
		ref = $bindable(null),
		children,
		...restProps
	}: CardProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="card"
	class={cn(
		"rounded-xl border border-slate-200 bg-white px-4 py-4 text-slate-800 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:shadow-black/20",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
