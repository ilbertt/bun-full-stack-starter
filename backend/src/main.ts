import { runMigrations } from '#db/migrate.ts';
import { env } from '#lib/env.ts';
import { createLogger } from '#lib/logger.ts';
import { MAX_REQUEST_BODY_SIZE_BYTES } from '#lib/uploads.ts';

await runMigrations();

// Import the services dynamically to let the migrations run first.
const { filesService } = await import('#services/plugins.ts');

const logger = createLogger('main');
const EXPIRATION_SCHEDULE = '* * * * *';
const EXPIRATION_JOB = 'expire-files';

// OS-level Bun.cron launches this same binary with these arguments. A standalone binary
// receives them as application arguments, so dispatch before starting the HTTP server.
if (process.argv.includes(`--cron-title=${EXPIRATION_JOB}`)) {
  await filesService.expire();
  const { sql } = await import('#db/client.ts');
  await sql.close();
} else {
  if (process.env.NIBRUN_HOSTNAME) {
    // nibrun accepts Bun's crontab registration and wakes the app for each scheduled run.
    await Bun.cron(import.meta.path, EXPIRATION_SCHEDULE, EXPIRATION_JOB);
  } else {
    // Local development needs no OS job installed; use Bun's in-process scheduler.
    Bun.cron(EXPIRATION_SCHEDULE, () =>
      filesService.expire().catch((error) => logger.error('file expiration failed', error)),
    );
  }

  const { createApp } = await import('#app.ts');
  const { server } = createApp().listen({
    port: env.PORT,
    hostname: '0.0.0.0',
    maxRequestBodySize: MAX_REQUEST_BODY_SIZE_BYTES,
  });

  logger.info(`listening on ${server!.url.origin}`);
}
