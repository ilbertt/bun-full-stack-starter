import { Elysia } from 'elysia';
import { NotFoundError } from '#lib/errors.ts';
import { RoutePrefix } from '#lib/routes/prefixes.ts';
import type { AssetsServiceContract } from '#services/assets.service.ts';

// Every file the frontend build produced, one route each. Mounted ahead of the global
// lifecycle hooks on purpose: a route whose handler *is* a ready-made Response stays on
// Bun's native static-route path, and since Bun 1.4 that path answers `If-None-Match` with
// a 304 by itself. A global `derive`/`onAfterResponse` compiles the route into the dynamic
// pipeline instead, and the free revalidation goes with it — so these are registered before
// `requestResponsePlugin` and are the one part of the server that isn't request-logged.
export function createFrontendAssetsController({
  assetsService,
}: {
  assetsService: AssetsServiceContract;
}) {
  const controller = new Elysia();

  for (const [path, response] of assetsService.routes()) {
    // Hidden from the spec: the frontend is served by this server, but it is not API surface.
    controller.get(path, response, { detail: { hide: true } });
  }

  return controller;
}

// A mount, not a `*` route: a wildcard is greedy within its own method, so a `GET *` here
// swallows every GET a sibling controller binds to a wildcard of its own. A mount runs only
// once nothing else has matched, which is what a fallback means — so unlike the assets above
// this one has to come last.
export function createFrontendFallbackController({
  assetsService,
}: {
  assetsService: AssetsServiceContract;
}) {
  const controller = new Elysia();

  controller.mount((request) => {
    const { pathname } = new URL(request.url);
    const response = isClientRoutePath(pathname) ? assetsService.fallback(pathname) : null;
    if (!response) {
      throw new NotFoundError();
    }

    return response;
  });

  return controller;
}

function isClientRoutePath(pathname: string): boolean {
  return !pathname.startsWith(RoutePrefix.Api);
}
