import { Route } from '../../routes/__root';
import type { Session } from '../auth';

export function useSession(): Session | null {
  const { session } = Route.useRouteContext();
  return session;
}
