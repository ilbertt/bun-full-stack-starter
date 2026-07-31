import { cp, rm } from 'node:fs/promises';
import {
  BACKEND_BINARY_FILE,
  BACKEND_DIST_DIR,
  BACKEND_ENTRYPOINT,
  DB_MIGRATIONS_DIR,
  DB_MIGRATIONS_DIR_NAME,
  DB_MIGRATIONS_DIR_NAME_CONSTANT_NAME,
  FRONTEND_DIST_DST,
  FRONTEND_DIST_SRC,
  PUBLIC_FRONTEND_DIR_NAME,
  PUBLIC_FRONTEND_DIR_NAME_CONSTANT_NAME,
} from './shared/constants';

console.log('🧹 Cleaning dist dir...');
await rm(BACKEND_DIST_DIR, { recursive: true, force: true });

console.log('🧹 Cleaning public frontend dir...');
await rm(FRONTEND_DIST_DST, { recursive: true, force: true });

console.log('📄 Copying frontend assets...');
await cp(FRONTEND_DIST_SRC, FRONTEND_DIST_DST, { recursive: true });

console.log('🔨 Compiling binary...');
const buildResult = await Bun.build({
  entrypoints: [BACKEND_ENTRYPOINT],
  compile: {
    outfile: BACKEND_BINARY_FILE,
    // @ts-expect-error: assets is still not in the types
    assets: [FRONTEND_DIST_DST, DB_MIGRATIONS_DIR],
  },
  naming: {
    asset: '[dir]/[name].[ext]',
  },
  define: {
    // Update the dev script when updating these
    [PUBLIC_FRONTEND_DIR_NAME_CONSTANT_NAME]: JSON.stringify(PUBLIC_FRONTEND_DIR_NAME),
    [DB_MIGRATIONS_DIR_NAME_CONSTANT_NAME]: JSON.stringify(DB_MIGRATIONS_DIR_NAME),
  },
  minify: { whitespace: true, syntax: true },
  target: 'bun',
});

if (!buildResult.success) {
  console.error('❌ Build failed:', JSON.stringify(buildResult, null, 2));
  process.exit(1);
}

console.log('✅ Done');
