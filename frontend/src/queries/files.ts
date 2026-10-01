import { queryOptions } from '@tanstack/react-query';
import { api } from '../lib/api';
import { apiErrorMessage } from '../lib/api-error';

export type FileSummary = NonNullable<
  Awaited<ReturnType<typeof api.api.files.get>>['data']
>[number];

export const filesQueryOptions = queryOptions({
  queryKey: ['files'],
  // A nibrun cron runs in a separate process, so its deletions do not reach this app's sockets.
  refetchInterval: 60_000,
  queryFn: async () => {
    const { data, error } = await api.api.files.get();
    if (error) {
      throw new Error(apiErrorMessage(error));
    }
    return data;
  },
});
