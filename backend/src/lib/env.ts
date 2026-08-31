import { resolve } from 'node:path';
import { loadAuthSecret } from '#lib/auth/auth-secret.ts';
import { ensureDir } from '#lib/filesystem.ts';

interface CustomProcessEnv {
  // Entries here must match the .env file
  readonly PORT?: string;
  readonly BASE_URL?: string;
  readonly DATA_FOLDER?: string;
  // Optional: generated into the data folder on first start when it isn't set
  readonly BETTER_AUTH_SECRET?: string;
  // Injected by the host, never written to the .env file
  readonly NIBRUN_HOSTNAME?: string;
}

const DEFAULT_PORT = '3000';
const LOCAL_BASE_URL = `http://localhost:${DEFAULT_PORT}`;

// nibrun injects `NIBRUN_HOSTNAME` as the bare `<slug>.nibrun.app` the app is served on, always
// over HTTPS, so a deployed binary knows its own public origin without anyone setting `BASE_URL`.
// An explicit `BASE_URL` still wins — it is what a custom domain is configured with.
function defaultBaseUrl(): string {
  const nibrunHostname = process.env.NIBRUN_HOSTNAME;
  return nibrunHostname ? `https://${nibrunHostname}` : LOCAL_BASE_URL;
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
  PORT: number;
  BASE_URL: URL;
  DATA_FOLDER: string;
  BETTER_AUTH_SECRET: string;
};

function loadEnv(): Env {
  const dataFolder = resolve(optional({ name: 'DATA_FOLDER', defaultValue: './data' }));
  ensureDir(dataFolder);

  return {
    PORT: Number(optional({ name: 'PORT', defaultValue: DEFAULT_PORT })),
    BASE_URL: new URL(optional({ name: 'BASE_URL', defaultValue: defaultBaseUrl() })),
    DATA_FOLDER: dataFolder,
    BETTER_AUTH_SECRET: loadAuthSecret({
      dataFolder,
      environmentSecret: process.env.BETTER_AUTH_SECRET,
    }),
  };
}

export const env = loadEnv();
