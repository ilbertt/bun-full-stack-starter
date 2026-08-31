import { Elysia, StatusMap } from 'elysia';
import type { Auth } from '#lib/auth/better-auth.ts';
import { createAuthPlugin } from '#lib/auth/plugin.ts';
import { ErrorResponseSchema } from '#lib/errors.ts';
import { createLogger } from '#lib/logger.ts';
import { MAX_UPLOAD_SIZE_MEGABYTES } from '#lib/uploads.ts';
import {
  FileSchema,
  ListFilesResponseSchema,
  toFileResponse,
  UploadFileBodySchema,
} from '#routes/api/files/model.ts';
import type { FilesServiceContract } from '#services/files.service.ts';

export function createFilesController({
  auth,
  filesService,
}: {
  auth: Auth;
  filesService: FilesServiceContract;
}) {
  const logger = createLogger('filesController');
  return new Elysia()
    .use(createAuthPlugin({ auth }))
    .guard({
      auth: true,
      response: {
        [StatusMap.Unauthorized]: ErrorResponseSchema,
      },
    })
    .post(
      '/files',
      async ({ body, user, status }) => {
        logger.info(`uploading ${body.file.name}`);
        const record = await filesService.upload({ userId: user.id, file: body.file });
        return status(StatusMap.Created, toFileResponse(record));
      },
      {
        detail: {
          tags: ['Files'],
          summary: 'Upload a file',
          description: `Stores a file of up to ${MAX_UPLOAD_SIZE_MEGABYTES} MB and returns its metadata.`,
        },
        // The one content type this accepts, and the one the docs page then offers: without it
        // the spec advertises JSON and urlencoded too, which the handler would reject.
        parse: 'multipart/form-data',
        body: UploadFileBodySchema,
        response: {
          [StatusMap.Created]: FileSchema,
        },
      },
    )
    .get(
      '/files',
      async ({ user, status }) => {
        const files = await filesService.list({ userId: user.id });
        return status(StatusMap.OK, files.map(toFileResponse));
      },
      {
        detail: {
          tags: ['Files'],
          summary: 'List files',
          description: 'Returns the metadata of every file owned by the signed-in user.',
        },
        response: {
          [StatusMap.OK]: ListFilesResponseSchema,
        },
      },
    );
}
