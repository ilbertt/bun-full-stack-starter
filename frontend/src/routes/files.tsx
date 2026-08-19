import { createFileRoute, redirect } from '@tanstack/react-router';
import { FileUploadForm } from '../components/files/file-upload-form';
import { FilesList } from '../components/files/files-list';

export const Route = createFileRoute('/files')({
  beforeLoad: ({ context, location }) => {
    if (!context.session) {
      throw redirect({ to: '/login', search: { redirect: location.href } });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4">
      <h3 className="font-semibold text-lg">Files</h3>
      <FileUploadForm />
      <FilesList />
    </div>
  );
}
