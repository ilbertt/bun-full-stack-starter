# bun-full-stack

A full-stack starter that runs on Bun end to end: an Elysia API and a React SPA in one repo,
sharing types across the wire. `bun run build` compiles it all into a **single binary** with the
built frontend and the SQL migrations embedded — nothing to install on the target machine.

**Are you an AI agent?** Head over to
[the nibrun skill](https://github.com/ilbertt/nibrun/blob/main/skills/deploy-to-nibrun/SKILL.md) —
it is how you get what this builds onto a server, and what to weigh before you do.
[AGENTS.md](./AGENTS.md) is the map of the code itself.

**Are you a human?** Point your agent at the skill:

```bash
npx skills add ilbertt/nibrun
```

## Getting started

```bash
bun install
cp backend/.env.example backend/.env
openssl rand -base64 32   # paste into BETTER_AUTH_SECRET in backend/.env
bun run dev
```

The backend comes up on `:3000` and Vite on `:5173`, proxying `/api` to it — so the browser only
ever talks to one origin, the same arrangement as production, where the backend serves the
frontend itself.

## Features

- **One binary.** The frontend and the migrations are embedded, and the entrypoint is compiled to
  bytecode, so it boots in about half the time at the cost of ~20% more size. Targets linux x64 by
  default; `bun run build:local` compiles for the current machine.
- **Types across the wire.** The client is Eden Treaty's `treaty<App>`, typed from the server
  instance rather than a schema — a route that changes shape breaks the caller at compile time,
  and there is nothing to regenerate.
- **Auth.** better-auth, email and password, storing its tables in the same SQLite database as
  everything else. A route opts in with `.guard({ auth: true })` and gets a resolved `user` and
  `session` on its context, or a `401` before the handler runs.
- **An API reference that can't drift.** `/openapi` serves a [Scalar](https://scalar.com) page and
  `/openapi/json` the spec behind it, both generated from the same TypeBox schemas the routes
  already validate with.
- **SQLite through `Bun.SQL`**, with migrations applied at startup, in order, once.
- **File storage.** Authenticated upload, list, download and delete. Metadata in SQLite, bytes
  streamed off disk by Bun with Range requests included. `Storage` is deliberately a structural
  subset of `Bun.S3Client` — and a compile-time assertion keeps it that way — so moving to real
  object storage is one line in `backend/src/lib/storage/client.ts`.
- **The server serves the SPA.** Every built file is registered as its own native static route, so
  Bun answers `If-None-Match` with a `304` on its own and the hashed assets are `immutable` for a
  year. Anything that matches no file and doesn't look like an API call falls back to `index.html`.

## License

Public domain — see [LICENSE](./LICENSE).
