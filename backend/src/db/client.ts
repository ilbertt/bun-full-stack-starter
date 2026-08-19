import { join } from 'node:path';
import { SQL } from 'bun';
import { env } from '#lib/env.ts';

const DATABASE_FILE_PATH = join(env.DATA_FOLDER, 'app.db');

export const sql = new SQL({
  adapter: 'sqlite',
  filename: DATABASE_FILE_PATH,
});

// SQLite defaults this off per connection, leaving every `on delete cascade` decorative.
// The sqlite adapter holds a single connection, so once here covers every query.
await sql.unsafe('PRAGMA foreign_keys = ON');
