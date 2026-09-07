import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { SignOutButton } from '../components/auth/sign-out-button';
import { buttonVariants } from '../components/ui/button';
import { cn } from '../lib/class-names';
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
    <div className="min-h-dvh bg-background text-foreground">
      <header className="flex min-h-14 items-center gap-4 border-b bg-card px-4">
        <Link
          to="/"
          activeProps={{
            className: 'text-foreground',
          }}
          className="font-medium text-muted-foreground text-sm hover:text-foreground"
          activeOptions={{ exact: true }}
        >
          Home
        </Link>
        <Link
          to="/about"
          activeProps={{
            className: 'text-foreground',
          }}
          className="font-medium text-muted-foreground text-sm hover:text-foreground"
        >
          About
        </Link>
        {session && (
          <Link
            to="/files"
            activeProps={{
              className: 'text-foreground',
            }}
            className="font-medium text-muted-foreground text-sm hover:text-foreground"
          >
            Files
          </Link>
        )}
        {/* A plain anchor, not a `Link`: the docs page is rendered by the server, not the router. */}
        <a href={OPENAPI_PATH} className="text-muted-foreground text-sm hover:text-foreground">
          API docs
        </a>
        <div className="ml-auto flex items-center gap-3">
          {session ? (
            <>
              <span className="hidden text-muted-foreground text-sm sm:inline">
                {session.user.email}
              </span>
              <SignOutButton />
            </>
          ) : (
            <Link to="/login" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
              Login
            </Link>
          )}
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <TanStackRouterDevtools position="bottom-right" />
    </div>
  );
}
