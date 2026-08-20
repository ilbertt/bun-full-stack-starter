# bun-full-stack

A full-stack starter that runs on Bun end to end: an Elysia API and a React SPA in one repo,
sharing types across the wire. `bun run build` compiles the backend into a **single binary** with
the built frontend and the SQL migrations embedded — nothing to install on the target machine, no
`node_modules`, no asset folder to ship alongside it. The entrypoint is compiled to bytecode, so
the binary boots in about half the time it otherwise would, at the cost of ~20% more size.

## Stack

| Layer     | What                                                                              |
| --------- | --------------------------------------------------------------------------------- |
| Runtime   | Bun 1.4 (workspaces, single-file compiled binary)                                 |
| Backend   | Elysia                                                                            |
| Frontend  | React 19, TanStack Router (file-based, code-split) + TanStack Query, Tailwind 4    |
| API types | Eden Treaty — the client is typed from the server instance, not a schema           |
| API docs  | `@elysiajs/openapi` — a Scalar reference at `/openapi`, generated from the routes |
| Database  | SQLite through `Bun.SQL`, with migrations applied at startup                       |
| Auth      | better-auth, email + password                                                     |
| Codestyle | Biome (lint + format)                                                             |

## Getting started

```bash
bun install
cp backend/.env.example backend/.env
openssl rand -base64 32   # paste into BETTER_AUTH_SECRET in backend/.env
```

Then start both sides:

```bash
bun run dev
```

One terminal runs the backend on `:3000` and Vite on `:5173`, each line prefixed with the side
it came from. Ctrl-C — or anything else that kills the parent — takes both down instead of
leaving a port held by an orphan. `bun backend:dev` and `bun frontend:dev` still run them apart
if you'd rather have a terminal each.

Vite proxies `/api` to the backend, so the browser only ever talks to one origin — the same
arrangement as production, where the backend serves the frontend itself.

## Features

### Authentication

better-auth is mounted at `/api/auth` and stores its tables in the same SQLite database as
everything else. On the server, `authPlugin` (`backend/src/lib/auth/plugin.ts`) is an Elysia macro:
a controller opts a route in with `.guard({ auth: true })` and gets a resolved `user` and `session`
on its context, or a `401` before the handler runs. On the client, the session is loaded once in
the root route's `beforeLoad` and put into the router context, so a protected route is a
three-line `beforeLoad` that redirects to `/login` with a `redirect` search param.

### API reference

`/openapi` serves a [Scalar](https://scalar.com) reference, and `/openapi/json` the spec behind it.
Both are generated from the same TypeBox schemas the routes already validate with, so the document
cannot drift from the API. Protected routes carry the session cookie as their security scheme and
the `401` they answer with, while better-auth's own routes and the frontend's files are hidden — a
single catch-all entry and a list of hashed asset paths describe nothing worth reading.

### Serving the frontend

In production the same server hands out the SPA. Every built file is registered as its own route
whose handler *is* a ready-made `Response`, which keeps it on Bun's native static-route path —
Bun answers `If-None-Match` against those with a `304` on its own, so the shell (`no-cache`, and
therefore revalidated on every load) costs an empty response rather than a full one, and the
hashed files under `/assets` are `immutable` for a year. That path only survives while no global
lifecycle hook wraps the route, so the assets are registered ahead of the request logger and are
the one part of the server that isn't logged per request; anything that doesn't match a file and
doesn't look like an API call falls back to `index.html` so client-side routes resolve.

### File storage

Authenticated upload, list, download and delete, capped at 5 MB per file. Metadata lives in
SQLite; the bytes go to a `Storage` implementation and are streamed straight back off disk by Bun,
Range requests included. `Storage` (`backend/src/lib/storage/storage.ts`) is deliberately a
structural subset of `Bun.S3Client`, and a compile-time assertion keeps it that way — so moving to
real object storage is one line in `backend/src/lib/storage/client.ts`:

```ts
export const storage: StorageClient = new Bun.S3Client({ ... });
```

Every query is scoped by the owner's id, and downloads are forced to `attachment` with `nosniff`
so an uploaded `text/html` can never execute on the app's origin.

## Scripts

| Script                   | What it does                                                       |
| ------------------------ | ------------------------------------------------------------------ |
| `bun run dev`            | Both sides at once, in one terminal, killed together               |
| `bun backend:dev`        | Runs the backend on `:3000` (migrations first, then the server)    |
| `bun frontend:dev`       | Runs Vite on `:5173`, proxying `/api` to the backend               |
| `bun backend:build`      | Compiles the backend binary (needs a built frontend)               |
| `bun frontend:build`     | Builds the SPA into `frontend/dist`                                |
| `bun run build`          | Both of the above, in order — targets `bun-linux-x64` by default   |
| `bun run build:local`    | Same, compiled for the current machine                             |
| `bun check:types`        | `tsc -b` across both workspaces                                    |
| `bun check:codestyle`    | Biome lint + format check                                          |
| `bun check:all`          | Types and codestyle, in parallel                                   |
| `bun fix:codestyle`      | Biome with `--write`                                               |
| `bun backend <script>`   | Runs a script inside the backend workspace                         |
| `bun frontend <script>`  | Runs a script inside the frontend workspace                        |

## License

Public domain — see [LICENSE](./LICENSE).
