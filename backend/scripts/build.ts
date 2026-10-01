import { cp, rm } from 'node:fs/promises';
import {
  BACKEND_BINARY_FILE,
  BACKEND_BUILD_TARGET,
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

console.log(`🔨 Compiling binary for ${BACKEND_BUILD_TARGET ?? 'the host platform'}...`);
const buildResult = await Bun.build({
  entrypoints: [BACKEND_ENTRYPOINT],
  compile: {
    outfile: BACKEND_BINARY_FILE,
    // omitted entirely (not set to undefined) so Bun falls back to the host platform
    ...(BACKEND_BUILD_TARGET ? { target: BACKEND_BUILD_TARGET } : {}),
    assets: [FRONTEND_DIST_DST, DB_MIGRATIONS_DIR],
  },
  // Compiles the entrypoint to JSC bytecode so the binary skips parsing on every boot.
  // Bun 1.4 lifted this to ES modules; `format` has to be spelled out because `bytecode`
  // on its own still falls back to CommonJS, which top-level `await` cannot use.
  bytecode: true,
  format: 'esm',
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
