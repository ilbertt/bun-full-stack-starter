import { type UseMutationResult, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { authClient } from '../auth';
import { completeAuthenticationTransition } from '../auth-transition';

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
      await completeAuthenticationTransition({ queryClient, router });
    },
  });
}
