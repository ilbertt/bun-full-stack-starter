import { Elysia } from 'elysia';
import { elysiaErrorHandler } from '#lib/errors.ts';
import { requestResponsePlugin } from '#lib/request-response.ts';

export function createApp() {
  return new Elysia().onError(elysiaErrorHandler).use(requestResponsePlugin);
}
