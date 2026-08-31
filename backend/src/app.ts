import { openapi } from '@elysiajs/openapi';
import { Elysia } from 'elysia';
import { type Auth, sessionSecuritySchemes } from '#lib/auth/better-auth.ts';
import { elysiaErrorHandler } from '#lib/errors.ts';
import { createRequestResponsePlugin } from '#lib/request-response.ts';
import { createApiController } from '#routes/api/controller.ts';
import {
  createFrontendAssetsController,
  createFrontendFallbackController,
} from '#routes/controller.ts';
import type { AssetsServiceContract } from '#services/assets.service.ts';
import type { EventsServiceContract } from '#services/events.service.ts';
import type { FilesServiceContract } from '#services/files.service.ts';
import type { HealthServiceContract } from '#services/health.service.ts';

// Pinned rather than left to the plugin's default: the frontend links to it and the dev
// server proxies it.
const OPENAPI_PATH = '/openapi';

export function createApp({
  auth,
  assetsService,
  eventsService,
  filesService,
  healthService,
}: {
  auth: Auth;
  assetsService: AssetsServiceContract;
  eventsService: EventsServiceContract;
  filesService: FilesServiceContract;
  healthService: HealthServiceContract;
}) {
  // The frontend's files go on first, ahead of every global hook — see the comment on the
  // controller itself for why the order matters.
  return new Elysia()
    .use(createFrontendAssetsController({ assetsService }))
    .onError(elysiaErrorHandler)
    .use(createRequestResponsePlugin())
    .use(
      openapi({
        path: OPENAPI_PATH,
        documentation: {
          info: {
            title: 'bun-full-stack API',
            description: 'Everything this server answers, next to the frontend it also serves.',
            version: '1.0.0',
          },
          tags: [
            {
              name: 'Events',
              // The only place the socket is described here: a websocket is not an operation, so
              // the route's own `detail` reaches the spec but no docs renderer draws it.
              description:
                'A websocket at `/api/events`, upgraded with the session cookie. It pushes ' +
                '`file.uploaded` and `file.deleted` to every tab the signed-in user has open, ' +
                'and answers `{ "type": "ping" }` with `{ "type": "pong" }`.',
            },
            {
              name: 'Files',
              description: 'Upload, list, download and delete the signed-in user’s files.',
            },
            {
              name: 'Health',
              description: 'Liveness of the server and its database.',
            },
          ],
          components: {
            securitySchemes: sessionSecuritySchemes,
          },
        },
      }),
    )
    .use(createApiController({ auth, eventsService, filesService, healthService }))
    .use(createFrontendFallbackController({ assetsService }));
}
