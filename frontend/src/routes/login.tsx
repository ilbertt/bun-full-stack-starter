import { createFileRoute, redirect } from '@tanstack/react-router';
import { LoginForm } from '../components/auth/login-form';
import { internalAppPath } from '../lib/internal-app-path';
import { Route as IndexRoute } from './index';

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: internalAppPath(search.redirect),
  }),
  beforeLoad: ({ context, search }) => {
    if (context.session) {
      throw redirect({ href: search.redirect ?? IndexRoute.to });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <LoginForm />;
}
