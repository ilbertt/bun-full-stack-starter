import { Elysia } from 'elysia';
import { sql } from '#db/client.ts';
import { createLogger } from '#lib/logger.ts';
import { storage } from '#lib/storage/client.ts';
import { AssetsRepository } from '#repositories/assets.repository.ts';
import { FilesRepository } from '#repositories/files.repository.ts';
import { HealthRepository } from '#repositories/health.repository.ts';
import { AssetsService } from '#services/assets.service.ts';
import { FilesService } from '#services/files.service.ts';
import { HealthService } from '#services/health.service.ts';

const assetsRepository = new AssetsRepository(sql);
const filesRepository = new FilesRepository(sql);
const healthRepository = new HealthRepository(sql);

const assetsService = new AssetsService(assetsRepository);
const filesService = new FilesService({ filesRepo: filesRepository, storage });
const healthService = new HealthService(healthRepository);

export function loggerPlugin(name: string) {
  const logger = createLogger(name);
  return new Elysia({ name: `logger.${name}` }).derive({ as: 'scoped' }, () => ({ logger }));
}

export const AssetsServicePlugin = new Elysia({ name: 'service.assets' }).decorate(
  'assetsService',
  assetsService,
);

export const FilesServicePlugin = new Elysia({ name: 'service.files' }).decorate(
  'filesService',
  filesService,
);

export const HealthServicePlugin = new Elysia({ name: 'service.health' }).decorate(
  'healthService',
  healthService,
);
