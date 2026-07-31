import { useQuery } from '@tanstack/react-query';
import { healthQueryOptions } from '../queries/health';

export function HealthStatus() {
  const { data, isError } = useQuery(healthQueryOptions);

  let color = 'bg-gray-400';
  let label = 'checking…';
  if (isError) {
    color = 'bg-red-500';
    label = 'unreachable';
  } else if (data) {
    color = 'bg-green-500';
    label = `${data.status} · up ${Math.round(data.uptime)}s`;
  }

  return (
    <span className="flex items-center gap-2 text-gray-500 text-sm dark:text-gray-400">
      <span className={`size-2 rounded-full ${color}`} />
      API {label}
    </span>
  );
}
