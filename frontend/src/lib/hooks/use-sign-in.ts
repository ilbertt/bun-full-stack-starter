import { type UseMutationResult, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { authClient } from '../auth';
import { completeAuthenticationTransition } from '../auth-transition';

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
      await completeAuthenticationTransition({ queryClient, router });
    },
  });
}
