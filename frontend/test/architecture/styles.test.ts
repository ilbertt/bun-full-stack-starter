import { expect, test } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const SOURCE_ROOT = join(import.meta.dir, '../../src');

function stylesheetPaths(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return stylesheetPaths(path);
    }
    return entry.name.endsWith('.css') ? [relative(SOURCE_ROOT, path)] : [];
  });
}

test('application styling stays in utilities and the canonical shadcn theme', () => {
  const theme = readFileSync(join(SOURCE_ROOT, 'styles/shadcn-theme.css'), 'utf8');

  expect(stylesheetPaths(SOURCE_ROOT).sort()).toEqual(['styles.css', 'styles/shadcn-theme.css']);
  expect(readFileSync(join(SOURCE_ROOT, 'styles.css'), 'utf8')).toBe(
    '@import "tailwindcss";\n@import "./styles/shadcn-theme.css";\n',
  );
  expect(theme.startsWith('/* Canonical shadcn neutral theme.')).toBe(true);
  expect(
    [...theme.matchAll(/^[ \t]*([^@\s][^{\r\n]*)[ \t]*\{$/gm)].map((match) => match[1]?.trim()),
  ).toEqual([':root', '.dark', '*', 'body']);
});
