import { type UseMutationResult, useMutation, useQueryClient } from '@tanstack/react-query';
import { filesQueryOptions } from '../../queries/files';
import { api } from '../api';

type UploadFileVariables = {
  file: File;
};

export function useUploadFile(): UseMutationResult<void, Error, UploadFileVariables> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file }: UploadFileVariables) => {
      const { error } = await api.api.files.post({ file });
      if (error) {
        throw new Error(error.value.message ?? `Upload failed with status ${error.status}`);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: filesQueryOptions.queryKey });
    },
  });
}
