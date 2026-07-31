import { Elysia } from 'elysia';
import { RoutePrefix } from '#lib/routes/prefixes.ts';
import { HealthController } from '#routes/api/health/controller.ts';

// The `/api` prefix is applied here, so child controllers keep bare path strings.
export const ApiController = new Elysia({ prefix: RoutePrefix.Api }).use(HealthController);
