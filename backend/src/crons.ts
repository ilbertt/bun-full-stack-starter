import { sql } from '#db/client.ts';
import { env } from '#lib/env.ts';
import { createLogger } from '#lib/logger.ts';
import { filesService } from '#services/plugins.ts';

const logger = createLogger('crons');

const jobs = [
  {
    title: 'expire-files',
    schedule: '*/10 * * * *',
    run: async () => {
      logger.info('expire-files started');
      await filesService.expire();
      logger.info('expire-files completed');
    },
  },
];

export async function registerCrons(entrypoint: string): Promise<void> {
  for (const job of jobs) {
    if (env.NODE_ENV === 'production') {
      // Production targets nibrun, which registers the schedule and wakes the app for each run.
      await Bun.cron(entrypoint, job.schedule, job.title);
    } else {
      // Local development needs no OS job installed; use Bun's in-process scheduler.
      Bun.cron(job.schedule, () =>
        job.run().catch((error) => logger.error(`${job.title} failed`, error)),
      );
    }
  }
}

// Bun 1.4.2's compiled runtime does not call a scheduled() export. Its cron command
// passes these arguments to the entrypoint, so dispatch before starting HTTP.
export async function runCronJob(): Promise<boolean> {
  const job = jobs.find(({ title }) => process.argv.includes(`--cron-title=${title}`));
  if (!job) {
    return false;
  }

  try {
    await job.run();
  } finally {
    await sql.close();
  }
  return true;
}
