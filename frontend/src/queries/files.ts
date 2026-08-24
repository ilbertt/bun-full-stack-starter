import { queryOptions } from '@tanstack/react-query';
import { api } from '../lib/api';
import { apiErrorMessage } from '../lib/api-error';

export type FileSummary = NonNullable<
  Awaited<ReturnType<typeof api.api.files.get>>['data']
>[number];

export const filesQueryOptions = queryOptions({
  queryKey: ['files'],
  queryFn: async () => {
    const { data, error } = await api.api.files.get();
    if (error) {
      throw new Error(apiErrorMessage(error));
    }
    return data;
  },
});
