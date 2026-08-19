import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { type FileSummary, filesQueryOptions } from '../../queries/files';

export function useFiles(): UseQueryResult<FileSummary[], Error> {
  return useQuery(filesQueryOptions);
}
