import { queryOptions } from '@tanstack/react-query';
import { api } from '../lib/api';

export type FileSummary = NonNullable<
  Awaited<ReturnType<typeof api.api.files.get>>['data']
>[number];

export const filesQueryOptions = queryOptions({
  queryKey: ['files'],
  queryFn: async () => {
    const { data, error } = await api.api.files.get();
    if (error) {
      throw error;
    }
    return data;
  },
});
