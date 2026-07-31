import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { SQL } from 'bun';
import { sql } from '#db/client.ts';
import { createLogger } from '#lib/logger.ts';

/* Substituted at build time */
declare const DB_MIGRATIONS_DIR_NAME: string;

const logger = createLogger('migrate');

const MIGRATIONS_TABLE = '__migrations';
const MIGRATIONS_DIR = join(import.meta.dir, DB_MIGRATIONS_DIR_NAME);

async function ensureMigrationsTable(db: SQL): Promise<void> {
  await db.unsafe(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      name       text PRIMARY KEY,
      applied_at text NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

async function appliedMigrations(db: SQL): Promise<Set<string>> {
  const rows = (await db.unsafe(`SELECT name FROM ${MIGRATIONS_TABLE}`)) as Array<{
    name: string;
  }>;
  return new Set(rows.map((row) => row.name));
}

function migrationFiles(): string[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();
}

async function applyMigration({ db, file }: { db: SQL; file: string }): Promise<void> {
  const ddl = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');

  await db.begin(async (tx) => {
    await tx.unsafe(ddl);
    await tx.unsafe(`INSERT INTO ${MIGRATIONS_TABLE} (name) VALUES ($1)`, [file]);
  });

  logger.info(`applied: ${file}`);
}

// Migrations run once at startup, on the same client the app uses: SQLite is a
// single file, so a second connection would only add write-lock contention.
export async function runMigrations(): Promise<void> {
  await ensureMigrationsTable(sql);
  const applied = await appliedMigrations(sql);

  for (const file of migrationFiles()) {
    if (applied.has(file)) {
      continue;
    }

    await applyMigration({ db: sql, file });
  }
}
