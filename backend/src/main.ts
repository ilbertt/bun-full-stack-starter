import { runMigrations } from '#db/migrate.ts';
import { env } from '#lib/env.ts';
import { createLogger } from '#lib/logger.ts';
import { MAX_REQUEST_BODY_SIZE_BYTES } from '#lib/uploads.ts';

await runMigrations();

// Cron jobs import services, so load them only after migrations have run.
const { registerCrons, runCronJob } = await import('#crons.ts');
if (!(await runCronJob())) {
  await registerCrons(import.meta.path);

  const { createApp } = await import('#app.ts');
  const { server } = createApp().listen({
    port: env.PORT,
    hostname: '0.0.0.0',
    maxRequestBodySize: MAX_REQUEST_BODY_SIZE_BYTES,
  });

  createLogger('main').info(`listening on ${server!.url.origin}`);
}
