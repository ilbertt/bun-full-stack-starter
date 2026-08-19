import { type ReactFormExtendedApi, useForm } from '@tanstack/react-form';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Route as IndexRoute } from '../../routes/index';
import { Route as LoginRoute } from '../../routes/login';
import { useSignIn } from './use-sign-in';
import { useSignUp } from './use-sign-up';

const MIN_PASSWORD_LENGTH = 8;

export type LoginFormValues = {
  name: string;
  email: string;
  password: string;
};

export type LoginFormApi = ReactFormExtendedApi<
  LoginFormValues,
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

export type LoginFormState = {
  api: LoginFormApi;
  isSigningUp: boolean;
  setIsSigningUp: (isSigningUp: boolean) => void;
  pending: boolean;
  error: Error | null;
};

const UNTOUCHED: LoginFormValues = {
  name: '',
  email: '',
  password: '',
};

export function validateName({ value }: { value: string }): string | undefined {
  return value.trim().length > 0 ? undefined : 'Tell us what to call you.';
}

export function validateEmail({ value }: { value: string }): string | undefined {
  return value.includes('@') ? undefined : 'That does not look like an email address.';
}

export function validatePassword({ value }: { value: string }): string | undefined {
  return value.length >= MIN_PASSWORD_LENGTH
    ? undefined
    : `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
}

export function useLoginForm(): LoginFormState {
  const navigate = useNavigate();
  const search = LoginRoute.useSearch();
  const [isSigningUp, setIsSigningUp] = useState(false);
  const signIn = useSignIn();
  const signUp = useSignUp();
  const mutation = isSigningUp ? signUp : signIn;

  const api: LoginFormApi = useForm({
    defaultValues: UNTOUCHED,
    // `mutate` with a callback rather than `mutateAsync`: a rejected submit would leave
    // `handleSubmit` rejecting into nothing, and the mutation already carries the error.
    onSubmit: ({ value }) => {
      const onSuccess = async () => {
        await navigate({ href: search.redirect ?? IndexRoute.to });
      };

      if (isSigningUp) {
        signUp.mutate(
          { name: value.name.trim(), email: value.email, password: value.password },
          { onSuccess },
        );
        return;
      }
      signIn.mutate({ email: value.email, password: value.password }, { onSuccess });
    },
  });

  return {
    api,
    isSigningUp,
    setIsSigningUp,
    pending: mutation.isPending,
    error: mutation.error,
  };
}
