import type { QueryClient } from '@tanstack/react-query';

export async function completeAuthenticationTransition({
  queryClient,
  router,
}: {
  queryClient: Pick<QueryClient, 'clear'>;
  router: { invalidate(): Promise<void> };
}): Promise<void> {
  // Private query data belongs to the authenticated actor. Removing only the session would let
  // another actor briefly observe cached data while their own queries refetch.
  queryClient.clear();
  await router.invalidate();
}
