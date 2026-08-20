import { Elysia, StatusMap, t } from 'elysia';
import { authPlugin } from '#lib/auth/plugin.ts';
import { ErrorResponseSchema } from '#lib/errors.ts';
import { FileParamsSchema } from '#routes/api/files/model.ts';
import { FilesServicePlugin, loggerPlugin } from '#services/plugins.ts';

export const FilesFileIdController = new Elysia()
  .use(loggerPlugin('filesFileIdController'))
  .use(authPlugin)
  .use(FilesServicePlugin)
  .guard({
    auth: true,
    response: {
      [StatusMap.Unauthorized]: ErrorResponseSchema,
    },
  })
  .get(
    '/files/:fileId',
    async ({ params, user, filesService, set }) => {
      const { record, body } = await filesService.download({
        fileId: params.fileId,
        userId: user.id,
      });

      // The stored type is whatever the client declared, so it is never served inline:
      // `attachment` and `nosniff` stop an uploaded `text/html` executing on this origin.
      set.headers['content-type'] = record.contentType;
      set.headers['content-disposition'] =
        `attachment; filename*=UTF-8''${encodeURIComponent(record.name)}`;
      set.headers['x-content-type-options'] = 'nosniff';

      return body;
    },
    {
      detail: {
        tags: ['Files'],
        summary: 'Download a file',
        description:
          'Responds with the stored bytes as an attachment, range requests included. The body is the file itself, so no schema describes it.',
      },
      params: FileParamsSchema,
    },
  )
  .delete(
    '/files/:fileId',
    async ({ params, user, filesService, status }) => {
      await filesService.remove({ fileId: params.fileId, userId: user.id });
      return status(StatusMap['No Content'], undefined);
    },
    {
      detail: {
        tags: ['Files'],
        summary: 'Delete a file',
        description: 'Removes the metadata and the stored bytes.',
      },
      params: FileParamsSchema,
      response: {
        [StatusMap['No Content']]: t.Void(),
      },
    },
  );
