import { type ReactFormExtendedApi, useForm } from '@tanstack/react-form';
import { type RefObject, useRef } from 'react';
import { formatBytes } from '../format-bytes';
import { useUploadFile } from './use-upload-file';

const BYTES_IN_A_MEGABYTE = 1_048_576;

export const MAX_UPLOAD_MEGABYTES = 5;

const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_MEGABYTES * BYTES_IN_A_MEGABYTE;

export type FileUploadFormValues = {
  file: File | undefined;
};

export type FileUploadFormApi = ReactFormExtendedApi<
  FileUploadFormValues,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined
>;

export type FileUploadFormState = {
  api: FileUploadFormApi;
  inputRef: RefObject<HTMLInputElement | null>;
  pending: boolean;
  error: Error | null;
};

const UNTOUCHED: FileUploadFormValues = {
  file: undefined,
};

// The server is authoritative, but Bun refuses an over-sized body at the socket before any
// handler runs, so without this the browser only ever sees an opaque network failure.
export function validateFile({ value }: { value: File | undefined }): string | undefined {
  if (value === undefined) {
    return 'Choose a file to upload.';
  }
  return value.size > MAX_UPLOAD_SIZE_BYTES
    ? `${value.name} is ${formatBytes(value.size)}, over the ${MAX_UPLOAD_MEGABYTES} MB limit.`
    : undefined;
}

export function useFileUploadForm(): FileUploadFormState {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadFile = useUploadFile();

  const api: FileUploadFormApi = useForm({
    defaultValues: UNTOUCHED,
    onSubmit: ({ value, formApi }) => {
      if (value.file === undefined) {
        return;
      }

      uploadFile.mutate(
        { file: value.file },
        {
          onSuccess: () => {
            formApi.reset();
            // `reset` restores the default value without re-running the mount validator, which
            // would leave the button enabled over an empty field.
            void formApi.validateAllFields('mount');
            // The input holds the picked file outside React, so resetting the form alone
            // would leave the previous filename sitting next to an empty field.
            if (inputRef.current) {
              inputRef.current.value = '';
            }
          },
        },
      );
    },
  });

  return {
    api,
    inputRef,
    pending: uploadFile.isPending,
    error: uploadFile.error,
  };
}
