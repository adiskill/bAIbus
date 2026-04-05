<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAnchorAttributes } from "svelte/elements";

	export type PressableCardProps = WithElementRef<HTMLAnchorAttributes, HTMLAnchorElement> & {
		cardClass?: string;
		contentClass?: string;
	};
</script>

<script lang="ts">
	import Card from "./card.svelte";

	let {
		cardClass,
		class: className,
		contentClass,
		children,
		href,
		ref = $bindable(null),
		...restProps
	}: PressableCardProps = $props();
</script>

<a
	bind:this={ref}
	data-slot="pressable-card"
	class={cn(
		"group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-blue-400 dark:focus-visible:ring-offset-slate-950",
		className
	)}
	{href}
	{...restProps}
>
	<Card
		class={cn(
			"transition-colors group-hover:bg-slate-50 group-active:bg-slate-100 dark:group-hover:bg-slate-800/80 dark:group-active:bg-slate-800",
			cardClass
		)}
	>
		{#if contentClass}
			<div class={contentClass}>
				{@render children?.()}
			</div>
		{:else}
			{@render children?.()}
		{/if}
	</Card>
</a>
