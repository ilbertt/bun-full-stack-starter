import { resolve } from 'node:path';
import { ensureDir } from '#lib/filesystem.ts';

interface CustomProcessEnv {
  // Entries here must match the .env file
  readonly BASE_URL?: string;
  readonly DATA_FOLDER?: string;
  readonly BETTER_AUTH_SECRET: string;
}

function required(name: keyof CustomProcessEnv): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional({
  name,
  defaultValue,
}: {
  name: keyof CustomProcessEnv;
  defaultValue: string;
}): string {
  return process.env[name] || defaultValue;
}

type Env = {
  BASE_URL: URL;
  DATA_FOLDER: string;
  BETTER_AUTH_SECRET: string;
};

function loadEnv(): Env {
  const dataFolder = resolve(optional({ name: 'DATA_FOLDER', defaultValue: './data' }));
  ensureDir(dataFolder);

  return {
    BASE_URL: new URL(optional({ name: 'BASE_URL', defaultValue: 'http://localhost:3000' })),
    DATA_FOLDER: dataFolder,
    BETTER_AUTH_SECRET: required('BETTER_AUTH_SECRET'),
  };
}

export const env = loadEnv();
