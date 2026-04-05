<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type HeadingTag = "div" | "h1" | "h2" | "h3" | "p" | "span";
	export type HeadingSize = "xs" | "base" | "lg" | "xl" | "2xl" | "3xl";
	export type HeadingProps = WithElementRef<HTMLAttributes<HTMLElement>, HTMLElement> & {
		as?: HeadingTag;
		size?: HeadingSize;
	};
</script>

<script lang="ts">
	const sizeClasses: Record<HeadingSize, string> = {
		xs: "text-xs",
		base: "text-base",
		lg: "text-lg",
		xl: "text-xl",
		"2xl": "text-2xl",
		"3xl": "text-3xl"
	};

	let {
		as = "h2",
		size = "2xl",
		class: className,
		ref = $bindable(null),
		children,
		...restProps
	}: HeadingProps = $props();
</script>

<svelte:element
	this={as}
	bind:this={ref}
	data-slot="heading"
	class={cn(
		"font-extrabold tracking-tight text-slate-800 dark:text-slate-100",
		sizeClasses[size],
		className
	)}
	{...restProps}
>
	{@render children?.()}
</svelte:element>
