import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/about')({
  component: AboutComponent,
});

function AboutComponent() {
  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <h1 className="font-semibold text-2xl tracking-tight">About</h1>
      <p className="mt-2 text-muted-foreground">
        An Elysia API and React SPA compiled into one Bun binary.
      </p>
    </div>
  );
}
