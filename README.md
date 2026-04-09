# bAIbbs

`bAIbus` is an improved UX frontend for Bratislava public transportation.

It is a mobile-first web app focused on faster trip planning, stop and line lookup, departure boards, and clearer service information for people using public transport in Bratislava. The app is built to present IDS BK transit data in a simpler, more reliable interface for everyday commuting.

## Development

Install dependencies:

```sh
bun install
```

Create your local environment file:

```sh
cp .env.example .env
```

Required variables in `.env`:

```sh
IDSBK_API_KEY=your-idsbk-api-key
IDSBK_SESSION=your-idsbk-session
VALKEY_URL=redis://localhost:6379
VALKEY_PREFIX=bAIbus
```

Start the development server:

```sh
bun dev
```

Open the app in a browser:

```sh
bun run dev -- --open
```

Run project checks:

```sh
bun run check
bun run build
```

## Docker Compose Installation

Example Compose file: [`docker-compose.example.yml`](./docker-compose.example.yml)

Make sure `.env` contains at least:

```sh
IDSBK_API_KEY=your-idsbk-api-key
IDSBK_SESSION=your-idsbk-session
```
