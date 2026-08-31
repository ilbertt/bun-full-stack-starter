# bun-full-stack

[![Deploy on nibrun](https://nibrun.com/button.svg)](https://app.nibrun.com/deploy?name=bun-full-stack&port=3000)

A full-stack starter that runs on Bun end to end: an Elysia API and a React SPA in one repo,
sharing types across the wire. `bun run build` compiles it all into a **single binary** with the
built frontend and the SQL migrations embedded — nothing to install on the target machine.

## Getting started

### For agents

Read [AGENTS.md](./AGENTS.md) — the layering, the conventions each side holds to, and what to run
to check your work.

### For humans

```bash
bun install
cp backend/.env.example backend/.env
bun run dev
```

Nothing to fill in: the secret better-auth signs sessions with is generated into
`backend/data/.better-auth-secret` on first start and reused from there, so set
`BETTER_AUTH_SECRET` only when you want to pin your own.

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
- **Live updates over a websocket.** `/api/events` is an Elysia `.ws` route behind the same `auth`
  guard as everything else. Upload or delete a file and every other tab that user has open is told
  about it and patches its cache — no polling, no refetch. The panel on the Files page is the same
  socket with the lid off: say something and the server says it back to every tab you have open,
  next to the file events taking the same path. Both directions are schemas — a `t.Union` the
  server validates every message against, and the same union narrowed by a `switch` on the client,
  so a message that changes shape breaks the caller at compile time.
- **SQLite through `Bun.SQL`**, with migrations applied at startup, in order, once.
- **File storage.** Authenticated upload, list, download and delete. Metadata in SQLite, bytes
  streamed off disk by Bun with Range requests included. `Storage` is deliberately a structural
  subset of `Bun.S3Client` — and a compile-time assertion keeps it that way — so moving to real
  object storage is one line in `backend/src/lib/storage/client.ts`.
- **The server serves the SPA.** Every built file is registered as its own native static route, so
  Bun answers `If-None-Match` with a `304` on its own and the hashed assets are `immutable` for a
  year. Anything that matches no file and doesn't look like an API call falls back to `index.html`.

## Deploy the app

`bun run build` produces `backend/dist/app`. It listens on `PORT` and expects the variables in
[backend/.env.example](./backend/.env.example).

Run it on [nibrun](https://nibrun.com): drop the binary, get an HTTPS URL and a disk that survives
every redeploy. No Dockerfile, no YAML, nothing to install next to it. `BASE_URL` can stay unset
there — nibrun injects `NIBRUN_HOSTNAME`, and the app takes `https://<that hostname>` as its
public origin — the origin better-auth trusts and builds its URLs from. `BETTER_AUTH_SECRET` can
stay unset too: the generated one lands on that persistent disk, so it survives redeploys and
sessions stay valid across them.
