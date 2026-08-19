import { join } from 'node:path';
import { env } from '#lib/env.ts';
import { LocalStorage } from '#lib/storage/local-storage.ts';
import type { StorageClient } from '#lib/storage/storage.ts';

const FILES_FOLDER_NAME = 'files';

export const storage: StorageClient = new LocalStorage(join(env.DATA_FOLDER, FILES_FOLDER_NAME));
