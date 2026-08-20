import { bunSqlAdapter } from '@ilbertt/better-auth-bun-sql';
import { betterAuth } from 'better-auth';
import type { OpenAPIV3 } from 'openapi-types';
import { sql } from '#db/client.ts';
import { env } from '#lib/env.ts';
import { RoutePrefix } from '#lib/routes/prefixes.ts';

export const AUTH_ROUTE_PATH = '/auth';

const BETTER_AUTH_TABLES_PREFIX = 'auth_';
const BETTER_AUTH_API_BASE_PATH = `${RoutePrefix.Api}${AUTH_ROUTE_PATH}`;

export const auth = betterAuth({
  database: bunSqlAdapter({ sql, tablesPrefix: BETTER_AUTH_TABLES_PREFIX }),
  // The origin, never the href: better-auth drops `basePath` entirely when the base URL already
  // carries a path, so a `BASE_URL` with one would silently move every auth route. Its origin is
  // trusted automatically, which is why no `trustedOrigins` is needed.
  baseURL: env.BASE_URL.origin,
  basePath: BETTER_AUTH_API_BASE_PATH,
  secret: env.BETTER_AUTH_SECRET,
  emailAndPassword: { enabled: true },
});

export const SESSION_SECURITY_SCHEME = 'betterAuthSession';

export const sessionSecuritySchemes = {
  [SESSION_SECURITY_SCHEME]: {
    type: 'apiKey',
    in: 'cookie',
    // better-auth's default cookie name. The docs page sends whatever is named here, so a
    // renamed cookie has to be renamed here too or "Authorize" silently authorizes nothing.
    name: 'better-auth.session_token',
    description: 'Session cookie set by signing in.',
  },
} satisfies Record<string, OpenAPIV3.SecuritySchemeObject>;
