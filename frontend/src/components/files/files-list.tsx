import { formatBytes } from '../../lib/format-bytes';
import { useDeleteFile } from '../../lib/hooks/use-delete-file';
import { useFiles } from '../../lib/hooks/use-files';

const MESSAGE_CLASS_NAME = 'text-gray-500 text-sm dark:text-gray-400';
const ERROR_CLASS_NAME = 'text-red-600 text-sm dark:text-red-400';
const META_CLASS_NAME = 'text-gray-500 text-xs dark:text-gray-400';
const ACTION_CLASS_NAME =
  'rounded border border-gray-300 px-2 py-1 text-gray-700 text-sm hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800';

export function FilesList() {
  const { data: files, isPending, error } = useFiles();
  const deleteFile = useDeleteFile();

  if (isPending) {
    return <p className={MESSAGE_CLASS_NAME}>Loading files…</p>;
  }

  if (error) {
    return (
      <p role="alert" className={ERROR_CLASS_NAME}>
        {error.message}
      </p>
    );
  }

  if (files.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 border-dashed p-8 text-center dark:border-gray-800">
        <p className="font-medium text-gray-700 text-sm dark:text-gray-300">No files yet</p>
        <p className={MESSAGE_CLASS_NAME}>Anything you upload shows up here.</p>
      </div>
    );
  }

  return (
    <>
      <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
        {files.map((file) => (
          <li key={file.id} className="flex items-center gap-4 p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-sm">{file.name}</p>
              <p className={META_CLASS_NAME}>
                {formatBytes(file.size)} · {file.contentType || 'unknown type'} ·{' '}
                {file.createdAt.toLocaleString()}
              </p>
            </div>
            {/* An anchor, not the Eden client, which reads unrecognised content types with
                `.text()` and would corrupt anything binary. */}
            <a href={`/api/files/${file.id}`} download={file.name} className={ACTION_CLASS_NAME}>
              Download
            </a>
            <button
              type="button"
              onClick={() => deleteFile.mutate({ fileId: file.id })}
              disabled={deleteFile.isPending && deleteFile.variables.fileId === file.id}
              className={ACTION_CLASS_NAME}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {deleteFile.error && (
        <p role="alert" className={ERROR_CLASS_NAME}>
          {deleteFile.error.message}
        </p>
      )}
    </>
  );
}
