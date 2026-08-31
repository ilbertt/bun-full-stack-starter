import { randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ensureDir } from '#lib/filesystem.ts';
import { createLogger } from '#lib/logger.ts';

const SECRET_BYTES = 32;
const SECRET_FILE_NAME = '.better-auth-secret';
const SECRET_FILE_MODE = 0o600;

const logger = createLogger('auth-secret');

function hasCode({ error, code }: { error: unknown; code: string }): boolean {
  return error instanceof Error && (error as NodeJS.ErrnoException).code === code;
}

function readStoredSecret(path: string): string | undefined {
  let stored: string;
  try {
    stored = readFileSync(path, 'utf8').trim();
  } catch (error) {
    if (hasCode({ error, code: 'ENOENT' })) {
      return undefined;
    }
    throw error;
  }
  if (!stored) {
    throw new Error(
      `Auth secret file ${path} is empty. Delete it to have a new secret generated, or set BETTER_AUTH_SECRET.`,
    );
  }
  return stored;
}

// The generated secret goes in the data folder rather than the `.env` file because that is the
// directory a deploy target persists across redeploys, so it survives a restart and the sessions
// signed with it stay valid.
export function loadAuthSecret({
  dataFolder,
  environmentSecret,
}: {
  dataFolder: string;
  environmentSecret: string | undefined;
}): string {
  if (environmentSecret) {
    return environmentSecret;
  }

  ensureDir(dataFolder);
  const path = join(dataFolder, SECRET_FILE_NAME);

  const stored = readStoredSecret(path);
  if (stored !== undefined) {
    logger.info(`using the auth secret stored in ${path}`);
    return stored;
  }

  const generated = randomBytes(SECRET_BYTES).toString('base64');
  try {
    // `wx` fails rather than truncates, so two processes starting at once can't each write a
    // secret and leave the loser signing sessions with one that is no longer on disk.
    writeFileSync(path, generated, { encoding: 'utf8', flag: 'wx', mode: SECRET_FILE_MODE });
  } catch (error) {
    if (!hasCode({ error, code: 'EEXIST' })) {
      throw error;
    }
    const raced = readStoredSecret(path);
    if (raced === undefined) {
      throw error;
    }
    return raced;
  }

  logger.info(
    `no BETTER_AUTH_SECRET set: generated one and stored it in ${path}. Set BETTER_AUTH_SECRET to use your own.`,
  );
  return generated;
}
