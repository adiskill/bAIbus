<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type CardListProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
</script>

<script lang="ts">
	let {
		class: className,
		ref = $bindable(null),
		children,
		...restProps
	}: CardListProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="card-list"
	class={cn("space-y-2", className)}
	{...restProps}
>
	{@render children?.()}
</div>
