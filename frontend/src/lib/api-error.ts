// Two shapes arrive here: `{ error }` from the backend's own error handler, and Elysia's
// validation shape when a schema rejects a request before any handler runs.
type ApiErrorValue = { error: string } | { message?: string };

export function apiErrorMessage({
  value,
  status,
}: {
  value: ApiErrorValue;
  status: number;
}): string {
  if ('error' in value) {
    return value.error;
  }
  return value.message ?? `Request failed with status ${status}`;
}
