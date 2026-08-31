import { cn } from '../../lib/class-names';
import { formatBytes } from '../../lib/format-bytes';
import { useDeleteFile } from '../../lib/hooks/use-delete-file';
import { useFiles } from '../../lib/hooks/use-files';
import { Button, buttonVariants } from '../ui/button';
import { Card, CardContent } from '../ui/card';

export function FilesList() {
  const { data: files, isPending, error } = useFiles();
  const deleteFile = useDeleteFile();

  if (isPending) {
    return <p className="text-muted-foreground text-sm">Loading files…</p>;
  }

  if (error) {
    return (
      <p role="alert" className="text-destructive text-sm">
        {error.message}
      </p>
    );
  }

  if (files.length === 0) {
    return (
      <Card className="border-dashed text-center shadow-none">
        <CardContent>
          <p className="font-medium text-sm">No files yet</p>
          <p className="text-muted-foreground text-sm">Anything you upload shows up here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <ul className="divide-y overflow-hidden rounded-xl border">
        {files.map((file) => (
          <li key={file.id} className="flex items-center gap-4 p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-sm">{file.name}</p>
              <p className="text-muted-foreground text-xs">
                {formatBytes(file.size)} · {file.contentType || 'unknown type'} ·{' '}
                {file.createdAt.toLocaleString()}
              </p>
            </div>
            {/* An anchor, not the Eden client, which reads unrecognised content types with
                `.text()` and would corrupt anything binary. */}
            <a
              href={`/api/files/${file.id}`}
              download={file.name}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
            >
              Download
            </a>
            <Button
              type="button"
              onClick={() => deleteFile.mutate({ fileId: file.id })}
              disabled={deleteFile.isPending && deleteFile.variables.fileId === file.id}
              variant="outline"
              size="sm"
            >
              Delete
            </Button>
          </li>
        ))}
      </ul>

      {deleteFile.error && (
        <p role="alert" className="text-destructive text-sm">
          {deleteFile.error.message}
        </p>
      )}
    </>
  );
}
