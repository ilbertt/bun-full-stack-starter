import { Elysia, StatusMap } from 'elysia';
import { createLogger } from '#lib/logger.ts';
import { GetHealthResponseSchema } from '#routes/api/health/model.ts';
import type { HealthServiceContract } from '#services/health.service.ts';

export function createHealthController({
  healthService,
}: {
  healthService: HealthServiceContract;
}) {
  const logger = createLogger('healthController');
  return new Elysia().get(
    '/health',
    async ({ status }) => {
      logger.info('handling health check request');
      const result = await healthService.check();
      return status(StatusMap.OK, result);
    },
    {
      detail: {
        tags: ['Health'],
        summary: 'Check health',
        description: 'Pings the database and reports how long the server has been up.',
      },
      response: {
        [StatusMap.OK]: GetHealthResponseSchema,
      },
    },
  );
}
