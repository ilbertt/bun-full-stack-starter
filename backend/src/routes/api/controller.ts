import { Elysia } from 'elysia';
import type { Auth } from '#lib/auth/better-auth.ts';
import { RoutePrefix } from '#lib/routes/prefixes.ts';
import { createAuthController } from '#routes/api/auth/controller.ts';
import { createEventsController } from '#routes/api/events/controller.ts';
import { createFilesFileIdController } from '#routes/api/files/[fileId]/controller.ts';
import { createFilesController } from '#routes/api/files/controller.ts';
import { createHealthController } from '#routes/api/health/controller.ts';
import type { EventsServiceContract } from '#services/events.service.ts';
import type { FilesServiceContract } from '#services/files.service.ts';
import type { HealthServiceContract } from '#services/health.service.ts';

// The `/api` prefix is applied here, so child controllers keep bare path strings.
export function createApiController({
  auth,
  eventsService,
  filesService,
  healthService,
}: {
  auth: Auth;
  eventsService: EventsServiceContract;
  filesService: FilesServiceContract;
  healthService: HealthServiceContract;
}) {
  return new Elysia({ prefix: RoutePrefix.Api })
    .use(createAuthController({ auth }))
    .use(createEventsController({ auth, eventsService }))
    .use(createFilesController({ auth, filesService }))
    .use(createFilesFileIdController({ auth, filesService }))
    .use(createHealthController({ healthService }));
}
