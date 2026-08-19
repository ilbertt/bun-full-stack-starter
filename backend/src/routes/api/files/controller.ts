import { Elysia, StatusMap } from 'elysia';
import { authPlugin } from '#lib/auth/plugin.ts';
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
  .guard({ auth: true })
  .post(
    '/files',
    async ({ body, user, filesService, logger, status }) => {
      logger.info(`uploading ${body.file.name}`);
      const record = await filesService.upload({ userId: user.id, file: body.file });
      return status(StatusMap.Created, toFileResponse(record));
    },
    {
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
      response: {
        [StatusMap.OK]: ListFilesResponseSchema,
      },
    },
  );
