import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <h1 className="font-semibold text-2xl tracking-tight">Welcome home</h1>
      <p className="mt-2 text-muted-foreground">A Bun application, ready to build on.</p>
    </div>
  );
}
