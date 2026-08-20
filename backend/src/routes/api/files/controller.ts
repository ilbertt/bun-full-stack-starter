import { Elysia, StatusMap } from 'elysia';
import { authPlugin } from '#lib/auth/plugin.ts';
import { ErrorResponseSchema } from '#lib/errors.ts';
import { MAX_UPLOAD_SIZE_MEGABYTES } from '#lib/uploads.ts';
import type { FileRecord } from '#repositories/files.repository.ts';
import {
  FileSchema,
  ListFilesResponseSchema,
  UploadFileBodySchema,
} from '#routes/api/files/model.ts';
import { FilesServicePlugin, loggerPlugin } from '#services/plugins.ts';

function toFileResponse(record: FileRecord) {
  return {
    id: record.id,
    name: record.name,
    size: record.size,
    contentType: record.contentType,
    createdAt: new Date(record.createdAt),
  };
}

export const FilesController = new Elysia()
  .use(loggerPlugin('filesController'))
  .use(authPlugin)
  .use(FilesServicePlugin)
  .guard({
    auth: true,
    response: {
      [StatusMap.Unauthorized]: ErrorResponseSchema,
    },
  })
  .post(
    '/files',
    async ({ body, user, filesService, logger, status }) => {
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
    async ({ user, filesService, status }) => {
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
