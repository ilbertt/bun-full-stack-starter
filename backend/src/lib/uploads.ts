import { extname } from 'node:path';

const BYTES_IN_A_MEGABYTE = 1_048_576;
export const MAX_UPLOAD_SIZE_MEGABYTES = 5;
const MULTIPART_OVERHEAD_MEGABYTES = 1;

export const MAX_UPLOAD_SIZE = `${MAX_UPLOAD_SIZE_MEGABYTES}m` as const;

export const MAX_REQUEST_BODY_SIZE_BYTES =
  (MAX_UPLOAD_SIZE_MEGABYTES + MULTIPART_OVERHEAD_MEGABYTES) * BYTES_IN_A_MEGABYTE;

// A stored object is named after its id, so the extension is all that tells an exported data
// folder apart from a pile of unopenable blobs. The name is client-supplied: anything but a
// plain alphanumeric suffix is dropped rather than spliced into a storage key.
const STORAGE_EXTENSION_PATTERN = /^\.[A-Za-z0-9]{1,16}$/;

export function storageExtension(fileName: string): string {
  const extension = extname(fileName);
  return STORAGE_EXTENSION_PATTERN.test(extension) ? extension.toLowerCase() : '';
}
