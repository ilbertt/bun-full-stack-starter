import { createFileRoute, redirect } from '@tanstack/react-router';
import { FileUploadForm } from '../components/files/file-upload-form';
import { FilesList } from '../components/files/files-list';
import { useLiveEvents } from '../lib/hooks/use-live-events';

export const Route = createFileRoute('/files')({
  beforeLoad: ({ context, location }) => {
    if (!context.session) {
      throw redirect({ to: '/login', search: { redirect: location.href } });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  // Open for as long as this page is. Anything uploaded or deleted elsewhere shows up below
  // without a refetch — open a second tab and watch.
  const { connected } = useLiveEvents();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-lg">Files</h3>
        <span
          className="flex items-center gap-1.5 text-gray-500 text-xs dark:text-gray-400"
          title={connected ? 'Subscribed to live updates' : 'Reconnecting…'}
        >
          <span
            className={`size-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`}
            aria-hidden
          />
          {connected ? 'Live' : 'Offline'}
        </span>
      </div>
      <FileUploadForm />
      <FilesList />
    </div>
  );
}
