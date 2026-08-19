# bun-full-stack

A full-stack starter that runs on Bun end to end: an Elysia API and a React SPA in one repo,
sharing types across the wire. `bun run build` compiles the backend into a **single binary** with
the built frontend and the SQL migrations embedded — nothing to install on the target machine, no
`node_modules`, no asset folder to ship alongside it.

## Stack

| Layer     | What                                                                              |
| --------- | --------------------------------------------------------------------------------- |
| Runtime   | Bun (workspaces, single-file compiled binary)                                     |
| Backend   | Elysia                                                                            |
| Frontend  | React 19, TanStack Router (file-based, code-split) + TanStack Query, Tailwind 4    |
| API types | Eden Treaty — the client is typed from the server instance, not a schema           |
| Database  | SQLite through `Bun.SQL`, with migrations applied at startup                       |
| Auth      | better-auth, email + password                                                     |
| Codestyle | Biome (lint + format)                                                             |

## Getting started

```bash
bun install
cp backend/.env.example backend/.env
openssl rand -base64 32   # paste into BETTER_AUTH_SECRET in backend/.env
```

Then run both sides in separate terminals:

```bash
bun backend:dev    # http://localhost:3000
bun frontend:dev   # http://localhost:5173
```

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
| `bun backend:dev`        | Runs the backend on `:3000` (migrations first, then the server)    |
| `bun frontend:dev`       | Runs Vite on `:5173`, proxying `/api` to the backend               |
| `bun backend:build`      | Compiles the backend binary (needs a built frontend)               |
| `bun frontend:build`     | Builds the SPA into `frontend/dist`                                |
| `bun run build`          | Both of the above, in order — targets `bun-linux-x64` by default   |
| `bun run build:local`    | Same, compiled for the current machine                             |
| `bun check:types`        | `tsc -b` across both workspaces                                    |
| `bun check:codestyle`    | Biome lint + format check                                          |
| `bun check:all`          | Types, then codestyle                                              |
| `bun fix:codestyle`      | Biome with `--write`                                               |
| `bun backend <script>`   | Runs a script inside the backend workspace                         |
| `bun frontend <script>`  | Runs a script inside the frontend workspace                        |

## License

Public domain — see [LICENSE](./LICENSE).
