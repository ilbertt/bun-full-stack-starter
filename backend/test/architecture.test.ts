import { expect, test } from 'bun:test';
import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const BACKEND_SOURCE_DIRECTORY = resolve(import.meta.dir, '../src');
const ARCHITECTURE_DIRECTORIES = [
  'db',
  'domain',
  'lib',
  'repositories',
  'routes',
  'services',
] as const;

test('backend source uses only architecture directories at its root', async () => {
  const entries = await readdir(BACKEND_SOURCE_DIRECTORY, { withFileTypes: true });
  const directories = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  expect(directories).toEqual([...ARCHITECTURE_DIRECTORIES].sort());
});
