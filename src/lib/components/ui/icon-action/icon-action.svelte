<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";

	export type IconActionProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes>;
</script>

<script lang="ts">
	let {
		class: className,
		ref = $bindable(null),
		href = undefined,
		type = "button",
		disabled,
		children,
		...restProps
	}: IconActionProps = $props();

	const baseClass =
		"flex size-10 items-center justify-center rounded-xl bg-slate-200/80 text-slate-700 transition-colors hover:bg-slate-300/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-700/80 dark:focus-visible:ring-blue-400 dark:focus-visible:ring-offset-slate-950";
</script>

{#if href}
	<a
		bind:this={ref}
		data-slot="icon-action"
		class={cn(baseClass, className)}
		href={disabled ? undefined : href}
		aria-disabled={disabled}
		role={disabled ? "link" : undefined}
		tabindex={disabled ? -1 : undefined}
		{...restProps}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		bind:this={ref}
		data-slot="icon-action"
		class={cn(baseClass, className)}
		{type}
		{disabled}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}
