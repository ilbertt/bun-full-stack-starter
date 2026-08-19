const RESET = '\x1b[0m';
const LABEL_WIDTH = 5;

const LEVEL_STYLES: Record<string, string> = {
  debug: '\x1b[36m', // cyan
  info: '\x1b[32m', // green
  warn: '\x1b[33m', // yellow
  error: '\x1b[31m', // red
};

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function write({
  level,
  prefix,
  args,
}: {
  level: LogLevel;
  prefix: string;
  args: unknown[];
}): void {
  const ts = new Date().toISOString();
  const style = LEVEL_STYLES[level] ?? '';
  const tag = `${style}${level.toUpperCase().padEnd(LABEL_WIDTH)}${RESET}`;
  const out = level === 'error' ? console.error : console.log;
  const head = prefix ? `${ts} ${tag} [${prefix}]` : `${ts} ${tag}`;
  out(head, ...args);
}

export function createLogger(prefix = '') {
  return {
    debug(...args: unknown[]) {
      write({ level: 'debug', prefix, args });
    },
    info(...args: unknown[]) {
      write({ level: 'info', prefix, args });
    },
    warn(...args: unknown[]) {
      write({ level: 'warn', prefix, args });
    },
    error(...args: unknown[]) {
      write({ level: 'error', prefix, args });
    },
  };
}
