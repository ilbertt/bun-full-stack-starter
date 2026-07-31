import { join } from 'node:path';

const BACKEND_DIR = join(import.meta.dir, '..', '..');
export const BACKEND_DIST_DIR = join(BACKEND_DIR, 'dist');
export const BACKEND_BINARY_FILE = join(BACKEND_DIST_DIR, 'app');
export const BACKEND_ENTRYPOINT = 'src/main.ts';

export const DB_MIGRATIONS_DIR_NAME = 'migrations';
export const DB_MIGRATIONS_DIR_NAME_CONSTANT_NAME = 'DB_MIGRATIONS_DIR_NAME';
export const DB_MIGRATIONS_DIR = join(BACKEND_DIR, 'src/db', DB_MIGRATIONS_DIR_NAME);

/**
 * Relative to the backend root
 */
export const PUBLIC_FRONTEND_DIR_NAME = 'public';
export const PUBLIC_FRONTEND_DIR_NAME_CONSTANT_NAME = 'PUBLIC_FRONTEND_DIR_NAME';
export const FRONTEND_DIST_SRC = join(BACKEND_DIR, '..', 'frontend', 'dist');
export const FRONTEND_DIST_DST = join(BACKEND_DIR, PUBLIC_FRONTEND_DIR_NAME);
