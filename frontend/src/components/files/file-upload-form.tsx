import {
  MAX_UPLOAD_MEGABYTES,
  useFileUploadForm,
  validateFile,
} from '../../lib/hooks/use-file-upload-form';
import { Button } from '../ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';

const FILE_INPUT_ID = 'file';

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
            <Field data-invalid={rejected}>
              <FieldLabel htmlFor={FILE_INPUT_ID}>Upload a file</FieldLabel>
              <FieldDescription>Maximum size: {MAX_UPLOAD_MEGABYTES} MB.</FieldDescription>
              <div className="flex items-center gap-3">
                <Input
                  id={FILE_INPUT_ID}
                  ref={inputRef}
                  type="file"
                  onChange={(event) => field.handleChange(event.target.files?.[0])}
                  aria-invalid={rejected}
                />
                <api.Subscribe selector={(state) => state.canSubmit}>
                  {(canSubmit) => (
                    <Button type="submit" disabled={!canSubmit || pending}>
                      {pending ? 'Uploading…' : 'Upload'}
                    </Button>
                  )}
                </api.Subscribe>
              </div>
              {rejected && <FieldError>{field.state.meta.errors[0]}</FieldError>}
            </Field>
          );
        }}
      </api.Field>

      {error && <FieldError>{error.message}</FieldError>}
    </form>
  );
}
