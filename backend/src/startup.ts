import { runMigrations } from '#db/migrate.ts';
import { env } from '#lib/env.ts';
import { createLogger } from '#lib/logger.ts';
import { MAX_REQUEST_BODY_SIZE_BYTES } from '#lib/uploads.ts';

const logger = createLogger('startup');

export async function startup(entrypoint: string): Promise<void> {
  await runMigrations();

  // Cron jobs import services, so load them only after migrations have run.
  const { registerCrons, runCronJob } = await import('#crons.ts');
  if (await runCronJob()) {
    return;
  }

  await registerCrons(entrypoint);

  const { createApp } = await import('#app.ts');
  const { server } = createApp().listen({
    port: env.PORT,
    hostname: '0.0.0.0',
    maxRequestBodySize: MAX_REQUEST_BODY_SIZE_BYTES,
  });

  logger.info(`listening on ${server!.url.origin}`);
}
