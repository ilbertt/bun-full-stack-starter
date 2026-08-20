import { Elysia, StatusMap } from 'elysia';
import { GetHealthResponseSchema } from '#routes/api/health/model.ts';
import { HealthServicePlugin, loggerPlugin } from '#services/plugins.ts';

export const HealthController = new Elysia()
  .use(loggerPlugin('healthController'))
  .use(HealthServicePlugin)
  .get(
    '/health',
    async ({ healthService, logger, status }) => {
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
