import { Elysia, StatusMap } from 'elysia';
import { createLogger } from '#lib/logger.ts';

const httpLogger = createLogger('http');

function formatRequest(request: Request): string {
  return `${request.method} ${new URL(request.url).pathname}`;
}

function resolveStatus(status: number | keyof StatusMap | undefined): number {
  return typeof status === 'string' ? StatusMap[status] : (status ?? StatusMap.OK);
}

function formatElapsed(startedAt: number | undefined): string {
  return startedAt === undefined ? '' : ` (${Math.round(performance.now() - startedAt)}ms)`;
}

export function createRequestResponsePlugin() {
  // Registering a route that answers with a ready-made Response runs the request
  // lifecycle against it once at startup, which isn't traffic worth logging.
  return new Elysia({ name: 'request-response' })
    .state('started', false)
    .onStart(({ store }) => {
      store.started = true;
    })
    .derive(() => ({ requestStartedAt: performance.now() }))
    .onRequest(({ store }) => {
      if (!store.started) {
        return;
      }
    })
    .onAfterResponse(({ request, set, requestStartedAt }) => {
      const status = resolveStatus(set.status);
      const elapsed = formatElapsed(requestStartedAt);
      const response = `${formatRequest(request)} ${status}${elapsed}`;

      let logger = httpLogger.info;
      if (status >= StatusMap['Bad Request']) {
        logger = httpLogger.error;
      }
      logger(response);
    })
    .as('global');
}
