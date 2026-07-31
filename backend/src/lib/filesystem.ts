import { mkdirSync } from 'node:fs';

export function ensureDir(dir: string): void {
  mkdirSync(dir, { recursive: true });
}
