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

## Deploy the app

`bun run build` produces `backend/dist/app`, a single binary targeting **linux x64 (glibc)** with
the frontend and migrations inside it. It listens on `PORT` and expects the variables in
[backend/.env.example](./backend/.env.example).

Run it on [nibrun](https://nibrun.com): drop the binary, get an HTTPS URL and a disk that survives
every redeploy. The [deploy-to-nibrun skill](https://github.com/ilbertt/nibrun/blob/main/skills/deploy-to-nibrun/SKILL.md)
has the commands, the guest contract and the tradeoffs:

```bash
npx skills add ilbertt/nibrun
```
