import {
  useLoginForm,
  validateEmail,
  validateName,
  validatePassword,
} from '../../lib/hooks/use-login-form';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

export function LoginForm() {
  const { api, isSigningUp, setIsSigningUp, pending, error } = useLoginForm();

  return (
    <div className="flex justify-center p-8">
      <Card className="w-full max-w-sm">
        <CardContent className="grid gap-6">
          <Tabs
            value={isSigningUp ? 'sign-up' : 'sign-in'}
            onValueChange={(value) => setIsSigningUp(value === 'sign-up')}
          >
            <TabsList className="w-full">
              <TabsTrigger value="sign-in">Sign in</TabsTrigger>
              <TabsTrigger value="sign-up">Sign up</TabsTrigger>
            </TabsList>
          </Tabs>

          <form
            className="grid gap-5"
            onSubmit={(event) => {
              event.preventDefault();
              void api.handleSubmit();
            }}
          >
            <FieldGroup>
              {isSigningUp && (
                <api.Field name="name" validators={{ onChange: validateName }}>
                  {(field) => (
                    <Field data-invalid={field.state.meta.errors.length > 0}>
                      <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
                        autoComplete="name"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        aria-invalid={field.state.meta.errors.length > 0}
                      />
                      <FieldError>{field.state.meta.errors[0]}</FieldError>
                    </Field>
                  )}
                </api.Field>
              )}

              <api.Field name="email" validators={{ onChange: validateEmail }}>
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      autoComplete="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={field.state.meta.errors.length > 0}
                    />
                    <FieldError>{field.state.meta.errors[0]}</FieldError>
                  </Field>
                )}
              </api.Field>

              <api.Field name="password" validators={{ onChange: validatePassword }}>
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      autoComplete={isSigningUp ? 'new-password' : 'current-password'}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={field.state.meta.errors.length > 0}
                    />
                    <FieldError>{field.state.meta.errors[0]}</FieldError>
                  </Field>
                )}
              </api.Field>

              {error && <FieldError>{error.message}</FieldError>}
            </FieldGroup>

            <api.Subscribe selector={(state) => state.canSubmit}>
              {(canSubmit) => (
                <Button type="submit" disabled={!canSubmit || pending} size="lg">
                  {isSigningUp ? 'Create account' : 'Sign in'}
                </Button>
              )}
            </api.Subscribe>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
