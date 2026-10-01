import { type UseMutationResult, useMutation, useQueryClient } from '@tanstack/react-query';
import { filesQueryOptions } from '../../queries/files';
import { api } from '../api';
import { apiErrorMessage } from '../api-error';

type UploadFileVariables = {
  file: File;
  expire: boolean;
};

export function useUploadFile(): UseMutationResult<void, Error, UploadFileVariables> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, expire }: UploadFileVariables) => {
      const { error } = await api.api.files.post({ file, expire });
      if (error) {
        throw new Error(apiErrorMessage(error));
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: filesQueryOptions.queryKey });
    },
  });
}
