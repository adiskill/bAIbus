<script lang="ts">
	import { Button } from "$lib/components/ui/button";
</script>

<svelte:head>
	<title>aibus</title>
	<meta
		name="description"
		content="Svelte 5, SvelteKit, Tailwind CSS v4, and shadcn-svelte starter project."
	/>
</svelte:head>

<div
	class="min-h-screen bg-[radial-gradient(circle_at_top,_color-mix(in_oklab,var(--color-primary)_10%,transparent),transparent_35%),linear-gradient(180deg,var(--color-background),color-mix(in_oklab,var(--color-muted)_45%,var(--color-background)))]"
>
	<section class="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16 sm:px-10">
		<div class="grid w-full gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,420px)] lg:items-end">
			<div class="space-y-6">
				<p class="text-sm uppercase tracking-[0.35em] text-muted-foreground">
					Svelte 5 • SvelteKit • Tailwind v4 • shadcn-svelte
				</p>
				<h1 class="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
					Project initialized with the full UI baseline.
				</h1>
				<p class="max-w-2xl text-lg leading-8 text-muted-foreground">
					The app is scaffolded, Tailwind is wired through Vite, and shadcn-svelte is set
					up with the `nova` preset and a starter `Button` component.
				</p>
				<div class="flex flex-wrap gap-3">
					<Button href="https://svelte.dev/docs/kit">Open SvelteKit docs</Button>
					<Button href="https://www.shadcn-svelte.com/docs" variant="outline">
						Open shadcn-svelte docs
					</Button>
				</div>
			</div>

			<div class="rounded-[calc(var(--radius-4xl)+2px)] border border-border/70 bg-card/85 p-5 shadow-[0_24px_80px_-32px_color-mix(in_oklab,var(--color-foreground)_18%,transparent)] backdrop-blur">
				<div class="rounded-3xl border border-border/60 bg-background/90 p-5">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm font-medium text-foreground">Starter stack</p>
							<p class="text-sm text-muted-foreground">Ready for routes, components, and API work</p>
						</div>
						<div class="size-3 rounded-full bg-emerald-500"></div>
					</div>

					<div class="mt-6 space-y-3 text-sm">
						<div class="flex items-center justify-between rounded-2xl bg-muted/70 px-4 py-3">
							<span class="text-muted-foreground">Framework</span>
							<span class="font-medium">SvelteKit 2</span>
						</div>
						<div class="flex items-center justify-between rounded-2xl bg-muted/70 px-4 py-3">
							<span class="text-muted-foreground">UI runtime</span>
							<span class="font-medium">Svelte 5</span>
						</div>
						<div class="flex items-center justify-between rounded-2xl bg-muted/70 px-4 py-3">
							<span class="text-muted-foreground">Styling</span>
							<span class="font-medium">Tailwind CSS v4</span>
						</div>
						<div class="flex items-center justify-between rounded-2xl bg-muted/70 px-4 py-3">
							<span class="text-muted-foreground">Components</span>
							<span class="font-medium">shadcn-svelte</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</div>
