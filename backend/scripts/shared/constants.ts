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

/**
 * The app is deployed on linux x64 (glibc), so builds target it by default:
 * `bun run build` then produces the same artifact on every machine instead of
 * one that silently depends on whoever ran it.
 *
 * Override with BUILD_TARGET to pick any other Bun compile target, e.g.
 * `bun-linux-x64-musl` (Alpine) or `bun-linux-x64-baseline` (CPUs without
 * AVX2). Use `host` to compile for the current machine — see `build:local`.
 *
 * Cross-compiling downloads a *released* Bun for the target platform, so while
 * we are on the 1.4.0 canary this fails off-linux: it looks for a v1.4.0 that
 * is not published yet. Until 1.4.0 ships, cross-compile from macOS by pinning
 * a released runtime:
 *
 *     BUILD_TARGET=bun-v1.3.14-linux-x64 bun run build
 *
 * CI is unaffected — it runs on linux x64, where target === host and Bun uses
 * its own executable instead of downloading one.
 */
export const DEFAULT_BUILD_TARGET = 'bun-linux-x64';

const buildTarget = process.env.BUILD_TARGET || DEFAULT_BUILD_TARGET;

/**
 * `undefined` means "let Bun pick the host platform".
 */
export const BACKEND_BUILD_TARGET =
  buildTarget === 'host' ? undefined : (buildTarget as Bun.Build.CompileTarget);
