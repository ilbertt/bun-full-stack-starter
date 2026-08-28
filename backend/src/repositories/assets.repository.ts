import { getPublicAssets } from '#lib/assets.ts';

type StaticAssetsMap = Map<string, Blob>;

export class AssetsRepository {
  private assets: StaticAssetsMap | null = null;

  list(): StaticAssetsMap {
    if (this.assets) {
      return this.assets;
    }
    return this.loadAssets();
  }

  private loadAssets(): StaticAssetsMap {
    const assets: StaticAssetsMap = new Map();
    for (const [path, file] of getPublicAssets()) {
      assets.set(`/${path}`, file);
    }

    this.assets = assets;
    return assets;
  }
}
