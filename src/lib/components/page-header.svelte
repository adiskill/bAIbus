<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type PageHeaderProps = WithElementRef<HTMLAttributes<HTMLElement>, HTMLElement> & {
		contentClass?: string;
	};
</script>

<script lang="ts">
	let {
		class: className,
		contentClass,
		ref = $bindable(null),
		children,
		...restProps
	}: PageHeaderProps = $props();
</script>

<header
	bind:this={ref}
	class={cn(
		"app-fixed-header fixed top-0 left-1/2 z-50 w-full max-w-screen-sm -translate-x-1/2 isolate overflow-hidden border-b border-slate-200/70 bg-slate-50/80 backdrop-blur-2xl backdrop-saturate-150 dark:border-slate-800/70 dark:bg-slate-950/70 dark:backdrop-brightness-75",
		className
	)}
	{...restProps}
>
	<div
		class={cn("flex items-center justify-between px-6 pb-4", contentClass)}
		style:padding-top={"calc(env(safe-area-inset-top) + 1rem)"}
	>
		{@render children?.()}
	</div>
</header>
