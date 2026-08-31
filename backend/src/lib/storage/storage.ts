import type { S3Client } from 'bun';

export interface Storage {
  write(key: string, data: Blob): Promise<number>;
  file(key: string): Blob;
  exists(key: string): Promise<boolean>;
  size(key: string): Promise<number>;
  delete(key: string): Promise<void>;
}

// Collapses to `never` once `Bun.S3Client` stops satisfying `Storage`, which breaks the return
// type of `createLocalStorage` instead of letting the two drift apart unnoticed.
export type StorageClient = S3Client extends Storage ? Storage : never;
