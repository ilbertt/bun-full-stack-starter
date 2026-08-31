import { join } from 'node:path';
import { LocalStorage } from '#lib/storage/local-storage.ts';
import type { StorageClient } from '#lib/storage/storage.ts';

const FILES_FOLDER_NAME = 'files';

export function createLocalStorage({ dataFolder }: { dataFolder: string }): StorageClient {
  return new LocalStorage(join(dataFolder, FILES_FOLDER_NAME));
}
