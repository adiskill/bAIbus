# aibus

Svelte 5 starter project using SvelteKit, Tailwind CSS v4, and `shadcn-svelte`.

## Stack

- Svelte `5`
- SvelteKit `2`
- Tailwind CSS `4`
- `shadcn-svelte` with the `nova` preset

## Development

```sh
bun dev
```

Set the required environment variables in `.env`:

```sh
IDSBK_API_KEY=your-idsbk-api-key
IDSBK_SESSION=your-idsbk-session
VALKEY_URL=redis://localhost:6379
VALKEY_PREFIX=aibus
```

Open the app in a browser with:

```sh
bun run dev -- --open
```

## Checks

```sh
bun run check
bun run build
```

## Adding components

Use the `shadcn-svelte` CLI to install more UI components:

```sh
bunx shadcn-svelte@latest add button
```

## Docker

Build the image:

```sh
docker build -t aibus .
```

Run the container:

```sh
docker run --rm -p 3000:3000 aibus
```
