import {
  BACKEND_ENTRYPOINT,
  DB_MIGRATIONS_DIR_NAME,
  DB_MIGRATIONS_DIR_NAME_CONSTANT_NAME,
  PUBLIC_FRONTEND_DIR_NAME,
  PUBLIC_FRONTEND_DIR_NAME_CONSTANT_NAME,
} from './shared/constants';

const proc = Bun.spawn(
  [
    'bun',
    'run',
    // Ties the server's lifetime to this wrapper: Ctrl-C or a killed parent takes the
    // server down with it instead of leaving :3000 held by an orphan.
    '--no-orphans',
    '--define',
    `${PUBLIC_FRONTEND_DIR_NAME_CONSTANT_NAME}="${PUBLIC_FRONTEND_DIR_NAME}"`,
    '--define',
    `${DB_MIGRATIONS_DIR_NAME_CONSTANT_NAME}="${DB_MIGRATIONS_DIR_NAME}"`,
    BACKEND_ENTRYPOINT,
  ],
  // stdio is inherited so the child keeps the terminal (TTY) and its output stays colored
  { stdio: ['inherit', 'inherit', 'inherit'] },
);

process.exit(await proc.exited);
