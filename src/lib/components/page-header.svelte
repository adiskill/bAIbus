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
	class={cn("sticky top-0 z-50 bg-slate-50/95 backdrop-blur-sm dark:bg-slate-950/95", className)}
	{...restProps}
>
	<div class={cn("flex items-center justify-between px-6 py-4", contentClass)}>
		{@render children?.()}
	</div>
</header>
