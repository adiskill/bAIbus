<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";
	import { type VariantProps, tv } from "tailwind-variants";

	export const buttonVariants = tv({
		base: "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-transparent text-sm font-medium transition-colors outline-none select-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-blue-300 active:translate-y-px",
		variants: {
			variant: {
				default: "bg-slate-700 text-white hover:bg-slate-800",
				outline: "border-slate-200 bg-white text-slate-800 hover:bg-slate-100",
				secondary: "bg-blue-100 text-blue-900 hover:bg-blue-200",
				ghost: "text-slate-700 hover:bg-slate-100",
				destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-300",
				link: "text-blue-600 underline-offset-4 hover:underline",
			},
			size: {
				default: "h-9 gap-2 px-4 py-2",
				xs: "h-7 gap-1 rounded-md px-2 text-xs",
				sm: "h-8 gap-1 rounded-md px-3 text-sm",
				lg: "h-10 gap-2 px-6 text-base",
				icon: "size-8",
				"icon-xs": "size-6 rounded-md",
				"icon-sm": "size-7 rounded-md",
				"icon-lg": "size-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	});

	export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
	export type ButtonSize = VariantProps<typeof buttonVariants>["size"];

	export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			variant?: ButtonVariant;
			size?: ButtonSize;
		};
</script>

<script lang="ts">
	let {
		class: className,
		variant = "default",
		size = "default",
		ref = $bindable(null),
		href = undefined,
		type = "button",
		disabled,
		children,
		...restProps
	}: ButtonProps = $props();
</script>

{#if href}
	<a
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
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
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		{type}
		{disabled}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}
