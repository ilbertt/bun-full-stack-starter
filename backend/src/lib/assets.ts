import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { BunFile } from 'bun';

/* Substituted at build time */
declare const PUBLIC_FRONTEND_DIR_NAME: string;
declare const DB_MIGRATIONS_DIR_NAME: string;

// Where each tree sits when running from source. A compiled binary carries its own
// copy and reads that instead.
const PUBLIC_FRONTEND_DIR = resolve(process.cwd(), PUBLIC_FRONTEND_DIR_NAME);
const DB_MIGRATIONS_DIR = resolve(import.meta.dir, '..', 'db', DB_MIGRATIONS_DIR_NAME);

/** Keyed by the path of the file relative to the folder it came from. */
export type AssetFiles = Map<string, Blob>;

export function getPublicAssets(): AssetFiles {
  return readAssets({ folderName: PUBLIC_FRONTEND_DIR_NAME, folder: PUBLIC_FRONTEND_DIR });
}

export function getMigrations(): AssetFiles {
  return readAssets({ folderName: DB_MIGRATIONS_DIR_NAME, folder: DB_MIGRATIONS_DIR });
}

// Bun 1.4 ships `isStandaloneExecutable` as a released API, so where the assets live is
// something the runtime answers rather than something to infer from a non-empty embed —
// and reading it doesn't materialize every embedded file as a Blob just to count them.
function readAssets({ folderName, folder }: { folderName: string; folder: string }): AssetFiles {
  return Bun.isStandaloneExecutable ? readEmbeddedFolder(folderName) : readFolder(folder);
}

// `--asset <folder>` embeds a tree under its basename, which each file keeps as
// the start of its name. Everything is embedded flat, so the name is the filter.
function readEmbeddedFolder(folderName: string): AssetFiles {
  const prefix = `${folderName}/`;

  const files: AssetFiles = new Map();
  // Declared as `Blob`, but each entry is the `BunFile` that carries the embedded path.
  for (const file of Bun.embeddedFiles as readonly BunFile[]) {
    const path = file.name;
    if (path?.startsWith(prefix)) {
      files.set(path.slice(prefix.length), file);
    }
  }
  return sortedByPath(files);
}

function readFolder(folder: string): AssetFiles {
  if (!existsSync(folder)) {
    return new Map();
  }

  const files: AssetFiles = new Map();
  for (const entry of new Bun.Glob('**/*').scanSync({ cwd: folder, onlyFiles: true })) {
    const filePath = join(folder, entry);
    // Read eagerly, like the embedded files: a static route can't stream a lazy
    // BunFile, it needs the body in memory.
    const fileType = Bun.file(filePath).type;
    files.set(entry, new Blob([readFileSync(filePath)], { type: fileType }));
  }
  return sortedByPath(files);
}

// Migrations run in name order, and neither source promises one.
function sortedByPath(files: AssetFiles): AssetFiles {
  const sorted: AssetFiles = new Map();
  for (const path of [...files.keys()].sort()) {
    sorted.set(path, files.get(path)!);
  }
  return sorted;
}
