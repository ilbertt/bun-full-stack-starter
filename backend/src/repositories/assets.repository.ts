import { join, resolve } from 'node:path';
import { ensureDir } from '#lib/filesystem.ts';
import { Repository } from '#repositories/repository.ts';

/* Substituted at build time */
declare const PUBLIC_FRONTEND_DIR_NAME: string;
const PUBLIC_FRONTEND_DIR = resolve(process.cwd(), PUBLIC_FRONTEND_DIR_NAME);
const EMBEDDED_PREFIX = `${PUBLIC_FRONTEND_DIR_NAME}/`;

type StaticAssetsMap = Map<string, Blob>;

export class AssetsRepository extends Repository {
  private assets: StaticAssetsMap | null = null;

  list(): StaticAssetsMap {
    if (this.assets) {
      return this.assets;
    }
    return this.loadAssets();
  }

  private loadAssets(): StaticAssetsMap {
    // @ts-expect-error: Bun types are not updated
    if (Bun.isStandaloneExecutable) {
      this.assets = getEmbeddedAssets();
    } else {
      this.assets = getAssets();
    }

    return this.assets;
  }
}

function getEmbeddedAssets(): StaticAssetsMap {
  const assets: StaticAssetsMap = new Map();
  for (const file of Bun.embeddedFiles) {
    // @ts-expect-error: Bun types are not updated
    const path: string = file.name;
    const assetPath = `/${path.slice(EMBEDDED_PREFIX.length)}`;
    assets.set(assetPath, file);
  }
  return assets;
}

function getAssets(): StaticAssetsMap {
  ensureDir(PUBLIC_FRONTEND_DIR);

  const entries = new Bun.Glob('**/*').scanSync({ cwd: PUBLIC_FRONTEND_DIR, onlyFiles: true });

  const assets: StaticAssetsMap = new Map();
  for (const entry of entries) {
    const assetServePath = `/${entry}`;
    const assetFilePath = join(PUBLIC_FRONTEND_DIR, entry);
    const assetBlob = Bun.file(assetFilePath);
    assets.set(assetServePath, assetBlob);
  }
  return assets;
}
