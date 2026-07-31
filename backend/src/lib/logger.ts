const RESET = '\x1b[0m';
const LABEL_WIDTH = 5;

const LEVEL_STYLES: Record<string, string> = {
  debug: '\x1b[36m', // cyan
  info: '\x1b[32m', // green
  warn: '\x1b[33m', // yellow
  error: '\x1b[31m', // red
};

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// biome-ignore lint/complexity/useMaxParams: enable casting args inline
function write(level: LogLevel, prefix: string, ...args: unknown[]): void {
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
      write('debug', prefix, ...args);
    },
    info(...args: unknown[]) {
      write('info', prefix, ...args);
    },
    warn(...args: unknown[]) {
      write('warn', prefix, ...args);
    },
    error(...args: unknown[]) {
      write('error', prefix, ...args);
    },
  };
}
