# AGENTS

## Project Purpose

`aibus` is a mobile-first web app for Bratislava public transport.

The product focus is:

- fast trip planning
- departure boards
- stop and line lookup
- service status visibility
- simple, reliable mobile UX for people on the move

Data should come from the public IDS BK API where possible.

## Current Stack

- Svelte 5
- SvelteKit 2
- Tailwind CSS 4
- `shadcn-svelte`
- Bun for package management and local scripts
- Docker support for production builds

## Product Priorities

When making product or implementation decisions, prioritize in this order:

1. Mobile usability in real transit conditions
2. Fast load times and responsive interactions
3. Clear and minimal UI
4. Correct public transport data handling
5. Progressive enhancement for larger screens

Assume users are often:

- using one hand
- outdoors
- in a hurry
- on unstable mobile data

## UX Direction

- Design mobile first; desktop is a secondary enhancement.
- Keep critical actions reachable without long scrolling.
- Prefer large tap targets and high-contrast states.
- Show the most useful transit facts first:
  stop name, line, destination, departure time, delay, platform
- Avoid clutter, decorative chrome, and deep navigation.
- Treat empty, loading, offline, and degraded API states as first-class UI cases.

## Data and API Rules

- Use the public IDS BK API as the source of truth for transit data.
- Do not hardcode endpoint shapes, field names, or transport business rules without verifying them first.
- When integrating with the API, isolate all fetch and transform logic behind dedicated server-side modules.
- Normalize API responses into app-specific domain types before they reach UI components.
- Prefer server endpoints or server `load` functions for API access when secrets, rate limits, caching, or CORS may matter.
- Be explicit about timezone-sensitive behavior; default to Bratislava local time unless requirements say otherwise.
- Expect disruptions in upstream data and implement graceful fallbacks.

## Engineering Conventions

- Keep presentational components separate from transport data logic.
- Prefer TypeScript types for all external data boundaries.
- Add small, composable utilities instead of large shared abstraction layers.
- Keep route files thin when logic can live in `$lib`.
- Avoid introducing global state until there is a clear need.
- Do not introduce custom Tailwind utility classes; prefer standard Tailwind utilities, `shadcn-svelte` patterns, and component props or variants for reuse.
- Preserve the existing SvelteKit and shadcn-svelte patterns already in the repo.

## Performance Expectations

- Optimize for quick first paint on mobile networks.
- Avoid unnecessary client-side fetching if the data can be rendered on the server.
- Cache carefully where freshness allows it.
- Keep bundle growth under control; do not add heavy dependencies without strong justification.

## Quality Bar

Before finishing meaningful work:

- run `bun run check`
- run `bun run build`
- verify mobile layout behavior for the touched screens

## Commands

```sh
bun dev
bun run check
bun run build
docker build -t aibus .
```

## Near-Term Architecture Guidance

As the app grows, prefer this shape:

- `src/lib/api/` for IDS BK API clients and response mapping
- `src/lib/types/` for transport domain types
- `src/lib/components/` for reusable UI
- `src/routes/` for page composition and route-level data loading

## Notes for Future Agents

- Treat this as a real commuter tool, not a demo app.
- Make practical choices that improve reliability and clarity.
- If API behavior is unclear, verify it before encoding assumptions into the app.
