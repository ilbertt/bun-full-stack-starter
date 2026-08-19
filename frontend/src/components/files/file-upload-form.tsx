import {
  MAX_UPLOAD_MEGABYTES,
  useFileUploadForm,
  validateFile,
} from '../../lib/hooks/use-file-upload-form';

const FILE_INPUT_ID = 'file';
const LABEL_CLASS_NAME = 'font-medium text-gray-600 text-sm dark:text-gray-400';
const INPUT_CLASS_NAME =
  'rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-2 file:py-1 file:font-medium file:text-gray-700 file:text-sm focus:border-gray-500 aria-invalid:border-red-500 dark:border-gray-700 dark:bg-gray-950 dark:file:bg-gray-800 dark:file:text-gray-200 dark:focus:border-gray-500';
const ERROR_CLASS_NAME = 'text-red-600 text-sm dark:text-red-400';

export function FileUploadForm() {
  const { api, inputRef, pending, error } = useFileUploadForm();

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        void api.handleSubmit();
      }}
    >
      <api.Field name="file" validators={{ onMount: validateFile, onChange: validateFile }}>
        {(field) => {
          // Only once something is picked: otherwise "choose a file" would greet an untouched
          // form, while still keeping the submit button disabled.
          const rejected = field.state.value !== undefined && field.state.meta.errors.length > 0;

          return (
            <>
              <label htmlFor={FILE_INPUT_ID} className={LABEL_CLASS_NAME}>
                Upload a file (max {MAX_UPLOAD_MEGABYTES} MB)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id={FILE_INPUT_ID}
                  ref={inputRef}
                  type="file"
                  onChange={(event) => field.handleChange(event.target.files?.[0])}
                  aria-invalid={rejected}
                  className={INPUT_CLASS_NAME}
                />
                <api.Subscribe selector={(state) => state.canSubmit}>
                  {(canSubmit) => (
                    <button
                      type="submit"
                      disabled={!canSubmit || pending}
                      className="rounded-md bg-gray-900 px-3 py-2 font-medium text-sm text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                    >
                      {pending ? 'Uploading…' : 'Upload'}
                    </button>
                  )}
                </api.Subscribe>
              </div>
              {rejected && (
                <p role="alert" className={ERROR_CLASS_NAME}>
                  {field.state.meta.errors[0]}
                </p>
              )}
            </>
          );
        }}
      </api.Field>

      {error && (
        <p role="alert" className={ERROR_CLASS_NAME}>
          {error.message}
        </p>
      )}
    </form>
  );
}
