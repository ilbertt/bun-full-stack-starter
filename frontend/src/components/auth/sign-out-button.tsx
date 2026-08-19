import { useSignOut } from '../../lib/hooks/use-sign-out';

export function SignOutButton() {
  const { mutate, isPending } = useSignOut();

  return (
    <button
      type="button"
      onClick={() => mutate()}
      disabled={isPending}
      className="rounded border border-gray-300 px-2 py-1 text-gray-700 text-sm hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
    >
      {isPending ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
