import { type UseMutationResult, useMutation, useQueryClient } from '@tanstack/react-query';
import { filesQueryOptions } from '../../queries/files';
import { api } from '../api';

type DeleteFileVariables = {
  fileId: string;
};

export function useDeleteFile(): UseMutationResult<void, Error, DeleteFileVariables> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileId }: DeleteFileVariables) => {
      const { error } = await api.api.files({ fileId }).delete();
      if (error) {
        throw new Error(error.value.message ?? `Delete failed with status ${error.status}`);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: filesQueryOptions.queryKey });
    },
  });
}
