import { useSignOut } from '../../lib/hooks/use-sign-out';
import { Button } from '../ui/button';

export function SignOutButton() {
  const { mutate, isPending } = useSignOut();

  return (
    <Button type="button" onClick={() => mutate()} disabled={isPending} variant="outline" size="sm">
      {isPending ? 'Signing out…' : 'Sign out'}
    </Button>
  );
}
