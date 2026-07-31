import { bunSqlAdapter } from '@ilbertt/better-auth-bun-sql';
import { betterAuth } from 'better-auth';
import { sql } from '#db/client.ts';
import { env } from '#lib/env.ts';

const BETTER_AUTH_TABLES_PREFIX = 'auth_';
const BETTER_AUTH_API_BASE_PATH = '/api/auth';

export const auth = betterAuth({
  database: bunSqlAdapter({ sql, tablesPrefix: BETTER_AUTH_TABLES_PREFIX }),
  baseURL: env.BASE_URL.href,
  trustedOrigins: [env.BASE_URL.origin],
  basePath: BETTER_AUTH_API_BASE_PATH,
  secret: env.BETTER_AUTH_SECRET,
});
