import { runMigrations } from '#db/migrate.ts';
import { env } from '#lib/env.ts';
import { createLogger } from '#lib/logger.ts';
import { MAX_REQUEST_BODY_SIZE_BYTES } from '#lib/uploads.ts';

await runMigrations();

// Import the app dynamically to let the migrations run first.
const { createApp } = await import('#app.ts');

const logger = createLogger('main');

const { server } = createApp().listen({
  port: env.PORT,
  hostname: '0.0.0.0',
  maxRequestBodySize: MAX_REQUEST_BODY_SIZE_BYTES,
});

logger.info(`listening on ${server!.url.origin}`);
