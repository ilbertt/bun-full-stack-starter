const APP_ORIGIN = 'https://bun-full-stack.invalid';

/**
 * Accepts only paths within this application. Authentication redirects must never be able to
 * navigate to an absolute or protocol-relative URL supplied through the query string.
 */
export function internalAppPath(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) {
    return undefined;
  }

  try {
    const url = new URL(value, APP_ORIGIN);
    if (url.origin !== APP_ORIGIN) {
      return undefined;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return undefined;
  }
}
