# bun-full-stack

A template to build on, not a library to depend on: clone it, rename it, delete what you don't
need. An Elysia API and a React SPA in one Bun workspace, compiled to a single binary that
carries the built frontend and the SQL migrations inside it.

## Backend

- **Controller → service → repository, and never skip a layer.** A controller holds no logic and
  no SQL; a service holds no SQL; a repository holds no business rules.
- `routes/` mirrors the served path — `GET /api/health` is `routes/api/health/controller.ts`.
  The `/api` prefix is applied once in `routes/api/controller.ts`, so children write bare paths.
  Schemas live beside the controller in `model.ts`.
- Imports use the `#*` subpath mapping (`#lib/env.ts`, `#services/plugins.ts`), with the `.ts`
  extension. The frontend uses relative paths — it has no mapping.
- Every route declares its `body`/`response` schemas. They are what validates the request *and*
  what generates `/openapi`, so an undeclared response is an undocumented one.
- A route needing a session opts in with `.guard({ auth: true })` and reads `user`/`session` off
  its context. Every query is scoped by the owner's id in the `WHERE` clause.
- Services are instantiated once in `services/plugins.ts` and handed to controllers through an
  Elysia `.decorate` plugin. Don't construct one inside a handler.
- A migration is the next-numbered file in `db/migrations/`. They run at startup, in order, once.
  Never edit one that has shipped.
- A timestamp is a `text` column holding an ISO-8601 string, `string` on the row and `t.Date()` in
  the schema — `file.createdAt` end to end. Never `t.String()` for a date, and never `datetime('now')`.

## Frontend

- The API client is `treaty<App>` in `lib/api.ts` — typed from the server instance, so a route
  that changes shape breaks the caller at compile time. There is no schema to regenerate.
- A resource gets a `queryOptions` object in `queries/`, and hooks in `lib/hooks/` consume it.
  Components call hooks, not `api` directly.
- A response type is derived from the client, never hand-written:
  `NonNullable<Awaited<ReturnType<typeof api.api.files.get>>['data']>[number]`. A `types.ts`
  mirroring the API is a second source of truth, and it drifts.
- Eden answers `{ data, error }`, where `error` is a `{ status, value }` object rather than an
  `Error`. Every caller throws `new Error(apiErrorMessage(error))`; a bare `throw error` hands
  React an object where it expects a message and renders `[object Object]`.
- Adding a route means adding a file under `routes/`; the plugin regenerates `routeTree.gen.ts`.

## Validation

After an implementation, run:

```bash
bun fix:codestyle && bun check:all
```

`fix:codestyle` writes what Biome can fix on its own, so `check:all` is left reporting only what
needs a decision. `bun run build` verifies the binary still compiles — worth it for anything
touching the build, the embedded assets, or `main.ts`.

None of that is verification. Types and lints pass on code whose data is the wrong shape at
runtime, so exercise the route you changed against a running server before calling the work done.

## Deploy the app

`bun run build` produces `backend/dist/app`, a single binary targeting **linux x64 (glibc)** with
the frontend and migrations inside it. It listens on `PORT` and expects the variables in
[backend/.env.example](./backend/.env.example).

Run it on [nibrun](https://nibrun.com): drop the binary, get an HTTPS URL and a disk that survives
every redeploy. `BASE_URL` can stay unset there — nibrun injects `NIBRUN_HOSTNAME` and
[env.ts](./backend/src/lib/env.ts) derives `https://<that hostname>` from it.
The [deploy-to-nibrun skill](https://github.com/ilbertt/nibrun/blob/main/skills/deploy-to-nibrun/SKILL.md)
has the commands, the guest contract and the tradeoffs:

```bash
npx skills add ilbertt/nibrun
```
