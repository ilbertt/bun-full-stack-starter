import { dirname, resolve, sep } from 'node:path';
import { BadRequestError } from '#lib/errors.ts';
import { ensureDir } from '#lib/filesystem.ts';
import type { Storage } from '#lib/storage/storage.ts';

export class LocalStorage implements Storage {
  private readonly root: string;

  constructor(root: string) {
    this.root = resolve(root);
    ensureDir(this.root);
  }

  // biome-ignore lint/complexity/useMaxParams: mirrors `Bun.S3Client.write`
  write(key: string, data: Blob): Promise<number> {
    const path = this.pathOf(key);
    ensureDir(dirname(path));
    return Bun.write(path, data);
  }

  file(key: string): Blob {
    return Bun.file(this.pathOf(key));
  }

  exists(key: string): Promise<boolean> {
    return Bun.file(this.pathOf(key)).exists();
  }

  size(key: string): Promise<number> {
    return Promise.resolve(Bun.file(this.pathOf(key)).size);
  }

  delete(key: string): Promise<void> {
    return Bun.file(this.pathOf(key)).delete();
  }

  private pathOf(key: string): string {
    const path = resolve(this.root, key);
    if (!path.startsWith(this.root + sep)) {
      throw new BadRequestError('Invalid storage key');
    }
    return path;
  }
}
