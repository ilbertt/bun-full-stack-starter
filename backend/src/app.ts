import { openapi } from '@elysiajs/openapi';
import { Elysia } from 'elysia';
import { sessionSecuritySchemes } from '#lib/auth/better-auth.ts';
import { elysiaErrorHandler } from '#lib/errors.ts';
import { requestResponsePlugin } from '#lib/request-response.ts';
import { ApiController } from '#routes/api/controller.ts';
import { FrontendAssetsController, FrontendFallbackController } from '#routes/controller.ts';

// Pinned rather than left to the plugin's default: the frontend links to it and the dev
// server proxies it.
const OPENAPI_PATH = '/openapi';

export function createApp() {
  // The frontend's files go on first, ahead of every global hook — see the comment on the
  // controller itself for why the order matters.
  return new Elysia()
    .use(FrontendAssetsController)
    .onError(elysiaErrorHandler)
    .use(requestResponsePlugin)
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
    .use(ApiController)
    .use(FrontendFallbackController);
}
