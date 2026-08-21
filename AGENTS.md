# bun-full-stack

A template to build on, not a library to depend on: clone it, rename it, delete what you don't
need. An Elysia API and a React SPA in one Bun workspace, compiled to a single binary that
carries the built frontend and the SQL migrations inside it.

[README.md](./README.md) says what each piece does and why. This file says where things go.

## Layout

```
backend/src/
  main.ts          migrations, then the server
  app.ts           the Elysia instance; every plugin's order is deliberate
  types.ts         `App` — the type the frontend's client is generated from
  routes/          one folder per URL path: controller.ts + model.ts
  services/        business logic; plugins.ts wires the graph once
  repositories/    SQL and object storage; nothing else touches either
  db/migrations/   NNNN_name.sql, applied at startup
  lib/             everything else, grouped by concern
frontend/src/
  routes/          file-based, code-split — routeTree.gen.ts is generated, never edited
  components/      grouped by domain (auth/, files/)
  queries/         `queryOptions` objects, one per resource
  lib/hooks/       one hook per file, wrapping a query or mutation
```

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

## Frontend

- The API client is `treaty<App>` in `lib/api.ts` — typed from the server instance, so a route
  that changes shape breaks the caller at compile time. There is no schema to regenerate.
- A resource gets a `queryOptions` object in `queries/`, and hooks in `lib/hooks/` consume it.
  Components call hooks, not `api` directly.
- Adding a route means adding a file under `routes/`; the plugin regenerates `routeTree.gen.ts`.

## Validation

After an implementation, run:

```bash
bun check:all
```

`bun fix:codestyle` writes what Biome can fix on its own. `bun run build` verifies the binary
still compiles — worth it for anything touching the build, the embedded assets, or `main.ts`.

## Deploying

`bun run build` produces `backend/dist/app`, a single binary targeting **linux x64 (glibc)** with
the frontend and migrations inside it. Nothing needs to be installed next to it.

It expects `BETTER_AUTH_SECRET` in the environment, listens on `PORT` (default `3000`), and keeps
its SQLite file and uploads under `DATA_FOLDER` (default `./data`) — so the only persistent state
is one directory. Set `BASE_URL` to the origin it is actually served on.

That shape runs anywhere a Linux binary does. On [nibrun](https://nibrun.com) the defaults line up
without being told: the guest sets `PORT`, and `./data` resolves to the volume that survives a
redeploy — leaving `BETTER_AUTH_SECRET` and `BASE_URL` as the only two variables to set. Install
the skill for the commands, the guest contract, and the tradeoffs:

```bash
npx skills add ilbertt/nibrun
```
