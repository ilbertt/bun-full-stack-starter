import { appendFile, rename } from 'node:fs/promises';
import { join } from 'node:path';
import { $ } from 'bun';
import { BACKEND_BINARY_FILE, BACKEND_BUILD_TARGET, BACKEND_DIST_DIR } from './shared/constants';

const TAG_PREFIX = 'v';

if (!BACKEND_BUILD_TARGET) {
  console.error('❌ A host build carries no platform in its name, so it is not releasable.');
  process.exit(1);
}

/**
 * CalVer `YYYY.M.D-N` with no leading zeros — `v2026.9.9-1`. Dates rather than semver because
 * what reaches a template reaches it as whatever landed since the last cut, and asking whether
 * that was a feature or a fix has no answer worth the argument.
 *
 * The `-N` is a same-day counter and is on every tag, the day's first included: one shape for
 * every release, and a re-cut is then the same operation as the first cut rather than a special
 * case that has to notice the bare tag already taken.
 */
const now = new Date();
const today = `${now.getUTCFullYear()}.${now.getUTCMonth() + 1}.${now.getUTCDate()}`;
const tags = (await $`git tag --list`.text()).split('\n').filter(Boolean);
const cutToday = tags.filter((tag) => tag.startsWith(`${TAG_PREFIX}${today}-`)).length;
const tag = `${TAG_PREFIX}${today}-${cutToday + 1}`;

// The build target names a Bun runtime; the asset names the platform it runs on.
const assetFile = join(BACKEND_DIST_DIR, `app-${BACKEND_BUILD_TARGET.replace(/^bun-/, '')}`);
await rename(BACKEND_BINARY_FILE, assetFile);

const githubOutput = process.env.GITHUB_OUTPUT;
if (githubOutput) {
  await appendFile(githubOutput, `tag=${tag}\nasset=${assetFile}\n`);
}

console.log(`🏷️  ${tag}`);
console.log(`📦 ${assetFile}`);
