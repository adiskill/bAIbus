<script lang="ts" module>
	import { cn } from "$lib/utils.js";
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";

	type BackButtonBaseProps = {
		class?: string;
		href?: string;
		ref?: HTMLAnchorElement | HTMLButtonElement | null;
		type?: HTMLButtonAttributes["type"];
	};

	export type BackButtonProps = BackButtonBaseProps &
		Omit<HTMLAnchorAttributes, "class" | "href"> &
		Omit<HTMLButtonAttributes, "class" | "type">;
</script>

<script lang="ts">
	import { ChevronLeft } from "@lucide/svelte";

	let {
		class: className,
		ref = $bindable(null),
		href,
		type = "button",
		...restProps
	}: BackButtonProps = $props();

	const baseClass =
		"-ml-1 inline-flex size-10 shrink-0 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-slate-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/80 dark:focus-visible:ring-blue-400 dark:focus-visible:ring-offset-slate-950";
</script>

{#if href}
	<a bind:this={ref} class={cn(baseClass, className)} {href} {...restProps}>
		<ChevronLeft class="size-6" strokeWidth={2.4} />
	</a>
{:else}
	<button bind:this={ref} class={cn(baseClass, className)} {type} {...restProps}>
		<ChevronLeft class="size-6" strokeWidth={2.4} />
	</button>
{/if}
