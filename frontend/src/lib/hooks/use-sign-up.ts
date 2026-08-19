import { type UseMutationResult, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { sessionQueryOptions } from '../../queries/session';
import { authClient } from '../auth';

type SignUpVariables = {
  name: string;
  email: string;
  password: string;
};

export function useSignUp(): UseMutationResult<void, Error, SignUpVariables> {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ name, email, password }: SignUpVariables) => {
      const { error } = await authClient.signUp.email({ name, email, password });
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
