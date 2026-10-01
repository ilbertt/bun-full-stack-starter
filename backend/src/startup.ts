import { runMigrations } from '#db/migrate.ts';
import { env } from '#lib/env.ts';
import { createLogger } from '#lib/logger.ts';
import { MAX_REQUEST_BODY_SIZE_BYTES } from '#lib/uploads.ts';

const logger = createLogger('startup');
const EXPIRATION_SCHEDULE = '* * * * *';
const EXPIRATION_JOB = 'expire-files';

export async function startup(entrypoint: string): Promise<void> {
  await runMigrations();

  // Import the services dynamically to let the migrations run first.
  const { filesService } = await import('#services/plugins.ts');

  // Bun 1.4.2's compiled runtime does not call a scheduled() export. Its cron command
  // passes these arguments to the entrypoint, so dispatch here before starting HTTP.
  if (process.argv.includes(`--cron-title=${EXPIRATION_JOB}`)) {
    const { sql } = await import('#db/client.ts');
    try {
      await filesService.expire();
    } finally {
      await sql.close();
    }
    return;
  }

  if (process.env.NIBRUN_HOSTNAME) {
    // nibrun accepts Bun's crontab registration and wakes the app for each scheduled run.
    await Bun.cron(entrypoint, EXPIRATION_SCHEDULE, EXPIRATION_JOB);
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
