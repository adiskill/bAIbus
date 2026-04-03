<script lang="ts">
	import { page } from "$app/state";
	import { House, List, Navigation } from "@lucide/svelte";

	const navItems = [
		{ label: "Home", icon: House, href: "/" },
		{ label: "Navigation", icon: Navigation, href: "/navigation" },
		{ label: "Timetables", icon: List, href: "/timetables" }
	] as const;

	function isCurrentPath(href: string) {
		return page.url.pathname === href;
	}
</script>

<nav class="sticky bottom-0 z-50 mt-auto bg-slate-50/95 backdrop-blur-sm">
	<div
		class="grid grid-cols-3 items-end gap-2 rounded-t-3xl bg-white px-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-5 shadow-lg shadow-slate-900/5"
	>
		{#each navItems as item}
			<a
				href={item.href}
				class={`flex min-h-16 flex-col items-center justify-center rounded-2xl px-3 py-2 transition-colors ${
					isCurrentPath(item.href) ? "bg-blue-100 text-slate-900" : "text-slate-500"
				}`}
				aria-current={isCurrentPath(item.href) ? "page" : undefined}
				aria-label={item.label}
			>
				<item.icon
					class={`size-5 ${
						isCurrentPath(item.href) ? "fill-current text-slate-900" : "text-slate-500"
					}`}
					strokeWidth={2.15}
				/>
				<span
					class={`mt-2 text-xs font-semibold uppercase tracking-widest ${
						isCurrentPath(item.href) ? "text-slate-900" : "text-slate-600"
					}`}
				>
					{item.label}
				</span>
			</a>
		{/each}
	</div>
</nav>
