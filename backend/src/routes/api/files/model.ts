import { t } from 'elysia';
import { MAX_UPLOAD_SIZE } from '#lib/uploads.ts';

export const FileSchema = t.Object({
  id: t.String(),
  name: t.String(),
  size: t.Number(),
  contentType: t.String(),
  // `t.Date()` rather than the `t.String()` the column holds: Eden revives a date-shaped string
  // into a `Date` whatever the schema says, so `t.String()` promises one the client never gets.
  createdAt: t.Date(),
});

// `t.Object` rather than `t.Form`, whose static type is a branded `FormData` the frontend could
// only build by importing Elysia. This types as `{ file: File }` on both ends.
export const UploadFileBodySchema = t.Object({
  file: t.File({ maxSize: MAX_UPLOAD_SIZE }),
});

export const FileParamsSchema = t.Object({
  fileId: t.String(),
});

export const ListFilesResponseSchema = t.Array(FileSchema);
