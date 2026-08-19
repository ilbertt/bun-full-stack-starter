import { type UseMutationResult, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { sessionQueryOptions } from '../../queries/session';
import { authClient } from '../auth';

type SignInVariables = {
  email: string;
  password: string;
};

export function useSignIn(): UseMutationResult<void, Error, SignInVariables> {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ email, password }: SignInVariables) => {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: async () => {
      // Dropped, not invalidated: `beforeLoad` reads this through `ensureQueryData`, which
      // serves a cached entry regardless of staleness and would return the previous user.
      queryClient.removeQueries({ queryKey: sessionQueryOptions.queryKey });
      await router.invalidate();
    },
  });
}
