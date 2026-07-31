import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { SQL } from 'bun';
import { sql } from '#db/client.ts';
import { createLogger } from '#lib/logger.ts';

const logger = createLogger('migrate');

const MIGRATIONS_TABLE = '__migrations';
const MIGRATIONS_DIR = 'migrations';

// Migrations are placed next to the compiled binary by the build. In dev
// (running from source) the source dir exists on disk, so use it.
const sourceDir = join(dirname(fileURLToPath(import.meta.url)), MIGRATIONS_DIR);
const migrationsDir = existsSync(sourceDir)
  ? sourceDir
  : join(dirname(process.execPath), MIGRATIONS_DIR);

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
  return readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();
}

async function applyMigration({ db, file }: { db: SQL; file: string }): Promise<void> {
  const ddl = readFileSync(join(migrationsDir, file), 'utf8');

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
