import { join } from 'node:path';
import { SQL } from 'bun';
import { ensureDir } from '#lib/filesystem.ts';

const DATABASE_FILE_NAME = 'app.db';

export async function createSqliteDatabase({ dataFolder }: { dataFolder: string }): Promise<SQL> {
  ensureDir(dataFolder);
  const database = new SQL({
    adapter: 'sqlite',
    filename: join(dataFolder, DATABASE_FILE_NAME),
  });

  try {
    // SQLite defaults this off per connection, leaving every `on delete cascade` decorative.
    // The sqlite adapter holds a single connection, so once here covers every query.
    await database.unsafe('PRAGMA foreign_keys = ON');
    return database;
  } catch (error) {
    await database.close();
    throw error;
  }
}
