import { Elysia } from 'elysia';
import { auth, SESSION_SECURITY_SCHEME } from '#lib/auth/better-auth.ts';
import { UnauthorizedError } from '#lib/errors.ts';

export const authPlugin = new Elysia({ name: 'auth' }).macro({
  auth: {
    // Documents the lock on every route that opts in. The 401 it answers with cannot live
    // here too: a macro's `response` reaches the client types but not the spec, so the
    // controllers declare it on their `guard`.
    detail: { security: [{ [SESSION_SECURITY_SCHEME]: [] }] },
    async resolve({ request }) {
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session) {
        throw new UnauthorizedError();
      }
      return { user: session.user, session: session.session };
    },
  },
});
