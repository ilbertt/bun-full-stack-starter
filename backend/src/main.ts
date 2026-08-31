import { createApp } from '#app.ts';
import { createSqliteDatabase } from '#db/client.ts';
import { runMigrations } from '#db/migrate.ts';
import { createAuth } from '#lib/auth/better-auth.ts';
import { loadEnv } from '#lib/env.ts';
import { createLogger } from '#lib/logger.ts';
import { createLocalStorage } from '#lib/storage/client.ts';
import { MAX_REQUEST_BODY_SIZE_BYTES } from '#lib/uploads.ts';
import { AssetsRepository } from '#repositories/assets.repository.ts';
import { FilesRepository } from '#repositories/files.repository.ts';
import { HealthRepository } from '#repositories/health.repository.ts';
import { AssetsService } from '#services/assets.service.ts';
import { EventsService } from '#services/events.service.ts';
import { FilesService } from '#services/files.service.ts';
import { HealthService } from '#services/health.service.ts';

const env = loadEnv();
const database = await createSqliteDatabase({ dataFolder: env.DATA_FOLDER });

try {
  await runMigrations({ db: database });

  const storage = createLocalStorage({ dataFolder: env.DATA_FOLDER });
  const eventsService = new EventsService();
  const assetsService = new AssetsService(new AssetsRepository());
  const filesService = new FilesService({
    filesRepo: new FilesRepository(database),
    storage,
    events: eventsService,
  });
  const healthService = new HealthService(new HealthRepository(database));
  const auth = createAuth({
    database,
    baseUrl: env.BASE_URL,
    secret: env.BETTER_AUTH_SECRET,
  });

  const app = createApp({
    auth,
    assetsService,
    eventsService,
    filesService,
    healthService,
  }).onStop(async () => {
    await database.close();
  });
  const { server } = app.listen({
    port: env.PORT,
    hostname: '0.0.0.0',
    maxRequestBodySize: MAX_REQUEST_BODY_SIZE_BYTES,
  });

  createLogger('main').info(`listening on ${server!.url.origin}`);
} catch (error) {
  await database.close();
  throw error;
}
