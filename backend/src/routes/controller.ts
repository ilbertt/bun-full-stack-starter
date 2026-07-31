import { Elysia } from 'elysia';
import { NotFoundError } from '#lib/errors.ts';
import { RoutePrefix } from '#lib/routes/prefixes.ts';
import { AssetsServicePlugin, assetsService } from '#services/plugins.ts';

function createRootController() {
  const controller = new Elysia().use(AssetsServicePlugin);

  // A route per file, each answering with a ready-made Response. They're built
  // before there's a context to read the service from.
  for (const [path, response] of assetsService.routes()) {
    controller.get(path, response);
  }

  controller.get('*', ({ path, assetsService }) => {
    const response = isClientRoutePath(path) ? assetsService.fallback(path) : null;
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

export const RootController = createRootController();
