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

export const requestResponsePlugin = new Elysia({ name: 'request-response' })
  // Registering a route that answers with a ready-made Response runs the request
  // lifecycle against it once at startup, which isn't traffic worth logging.
  .state('started', false)
  .onStart(({ store }) => {
    store.started = true;
  })
  .derive(() => ({ requestStartedAt: performance.now() }))
  .onRequest(({ request, store }) => {
    if (!store.started) {
      return;
    }

    httpLogger.info(`→ ${formatRequest(request)}`);
  })
  .onAfterResponse(({ request, set, requestStartedAt }) => {
    const status = resolveStatus(set.status);
    const elapsed = formatElapsed(requestStartedAt);
    httpLogger.info(`← ${formatRequest(request)} ${status}${elapsed}`);
  })
  .as('global');
