import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { SignOutButton } from '../components/auth/sign-out-button';
import { sessionQueryOptions } from '../queries/session';

// Where the backend serves the API reference, outside the router's route tree.
const OPENAPI_PATH = '/openapi';

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(sessionQueryOptions);
    return { session };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { session } = Route.useRouteContext();

  return (
    <>
      <div className="flex items-center gap-2 p-2 text-lg">
        <Link
          to="/"
          activeProps={{
            className: 'font-bold',
          }}
          activeOptions={{ exact: true }}
        >
          Home
        </Link>{' '}
        <Link
          to="/about"
          activeProps={{
            className: 'font-bold',
          }}
        >
          About
        </Link>
        {session && (
          <Link
            to="/files"
            activeProps={{
              className: 'font-bold',
            }}
          >
            Files
          </Link>
        )}
        {/* A plain anchor, not a `Link`: the docs page is rendered by the server, not the router. */}
        <a href={OPENAPI_PATH} className="text-gray-500 text-sm hover:underline dark:text-gray-400">
          API docs
        </a>
        <div className="ml-auto flex items-center gap-3 text-base">
          {session ? (
            <>
              <span className="text-gray-500 text-sm dark:text-gray-400">{session.user.email}</span>
              <SignOutButton />
            </>
          ) : (
            <Link
              to="/login"
              activeProps={{
                className: 'font-bold',
              }}
            >
              Login
            </Link>
          )}
        </div>
      </div>
      <hr />
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
