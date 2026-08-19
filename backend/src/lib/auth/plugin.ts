import { Elysia } from 'elysia';
import { auth } from '#lib/auth/better-auth.ts';
import { UnauthorizedError } from '#lib/errors.ts';

export const authPlugin = new Elysia({ name: 'auth' }).macro({
  auth: {
    async resolve({ request }) {
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session) {
        throw new UnauthorizedError();
      }
      return { user: session.user, session: session.session };
    },
  },
});
