import {
  useLoginForm,
  validateEmail,
  validateName,
  validatePassword,
} from '../../lib/hooks/use-login-form';

const FIELD_CLASS_NAME = 'flex flex-col gap-1';
const LABEL_CLASS_NAME = 'font-medium text-gray-600 text-sm dark:text-gray-400';
const INPUT_CLASS_NAME =
  'rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500 aria-invalid:border-red-500 dark:border-gray-700 dark:bg-gray-950 dark:focus:border-gray-500';
const ERROR_CLASS_NAME = 'text-red-600 text-sm dark:text-red-400';
const TAB_CLASS_NAME = 'flex-1 rounded px-3 py-1.5 font-medium text-sm';
const ACTIVE_TAB_CLASS_NAME =
  'bg-white text-gray-950 shadow-sm dark:bg-gray-800 dark:text-gray-100';
const INACTIVE_TAB_CLASS_NAME = 'text-gray-500 dark:text-gray-400';

export function LoginForm() {
  const { api, isSigningUp, setIsSigningUp, pending, error } = useLoginForm();

  return (
    <div className="flex justify-center p-8">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6 flex gap-1 rounded-md bg-gray-100 p-1 dark:bg-gray-950">
          <button
            type="button"
            onClick={() => setIsSigningUp(false)}
            className={`${TAB_CLASS_NAME} ${isSigningUp ? INACTIVE_TAB_CLASS_NAME : ACTIVE_TAB_CLASS_NAME}`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setIsSigningUp(true)}
            className={`${TAB_CLASS_NAME} ${isSigningUp ? ACTIVE_TAB_CLASS_NAME : INACTIVE_TAB_CLASS_NAME}`}
          >
            Sign up
          </button>
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void api.handleSubmit();
          }}
        >
          {isSigningUp && (
            <api.Field name="name" validators={{ onChange: validateName }}>
              {(field) => (
                <div className={FIELD_CLASS_NAME}>
                  <label htmlFor={field.name} className={LABEL_CLASS_NAME}>
                    Name
                  </label>
                  <input
                    id={field.name}
                    type="text"
                    autoComplete="name"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={field.state.meta.errors.length > 0}
                    className={INPUT_CLASS_NAME}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className={ERROR_CLASS_NAME}>{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </api.Field>
          )}

          <api.Field name="email" validators={{ onChange: validateEmail }}>
            {(field) => (
              <div className={FIELD_CLASS_NAME}>
                <label htmlFor={field.name} className={LABEL_CLASS_NAME}>
                  Email
                </label>
                <input
                  id={field.name}
                  type="email"
                  autoComplete="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={field.state.meta.errors.length > 0}
                  className={INPUT_CLASS_NAME}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className={ERROR_CLASS_NAME}>{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </api.Field>

          <api.Field name="password" validators={{ onChange: validatePassword }}>
            {(field) => (
              <div className={FIELD_CLASS_NAME}>
                <label htmlFor={field.name} className={LABEL_CLASS_NAME}>
                  Password
                </label>
                <input
                  id={field.name}
                  type="password"
                  autoComplete={isSigningUp ? 'new-password' : 'current-password'}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={field.state.meta.errors.length > 0}
                  className={INPUT_CLASS_NAME}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className={ERROR_CLASS_NAME}>{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </api.Field>

          {error && (
            <p role="alert" className={ERROR_CLASS_NAME}>
              {error.message}
            </p>
          )}

          <api.Subscribe selector={(state) => state.canSubmit}>
            {(canSubmit) => (
              <button
                type="submit"
                disabled={!canSubmit || pending}
                className="rounded-md bg-gray-900 px-3 py-2 font-medium text-sm text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
              >
                {isSigningUp ? 'Create account' : 'Sign in'}
              </button>
            )}
          </api.Subscribe>
        </form>
      </div>
    </div>
  );
}
