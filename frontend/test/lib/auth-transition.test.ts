import { expect, test } from 'bun:test';
import { QueryClient } from '@tanstack/react-query';
import { completeAuthenticationTransition } from '../../src/lib/auth-transition';

test('authentication transitions discard every actor-scoped query before reloading routes', async () => {
  const queryClient = new QueryClient();
  queryClient.setQueryData(['session'], { user: { id: 'previous-user' } });
  queryClient.setQueryData(['files'], [{ id: 'private-file' }]);

  let invalidations = 0;
  await completeAuthenticationTransition({
    queryClient,
    router: {
      invalidate() {
        invalidations += 1;
        expect(queryClient.getQueryData(['session'])).toBeUndefined();
        expect(queryClient.getQueryData(['files'])).toBeUndefined();
        return Promise.resolve();
      },
    },
  });

  expect(invalidations).toBe(1);
});
