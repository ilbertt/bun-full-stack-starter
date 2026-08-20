import { Elysia } from 'elysia';
import { AUTH_ROUTE_PATH, auth } from '#lib/auth/better-auth.ts';

// better-auth reads the request body itself, so Elysia must not consume it first.
export const AuthController = new Elysia().all(
  `${AUTH_ROUTE_PATH}/*`,
  ({ request }) => auth.handler(request),
  // Hidden from the spec: one catch-all entry describes none of the routes behind it, and
  // better-auth documents its own.
  { parse: 'none', detail: { hide: true } },
);
