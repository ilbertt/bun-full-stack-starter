import { type UseMutationResult, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { sessionQueryOptions } from '../../queries/session';
import { authClient } from '../auth';

export function useSignOut(): UseMutationResult<void, Error, void> {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const { error } = await authClient.signOut();
      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: sessionQueryOptions.queryKey });
      await router.invalidate();
    },
  });
}
