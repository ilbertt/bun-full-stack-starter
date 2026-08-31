import { createLogger } from '#lib/logger.ts';
import type { HealthRepositoryContract } from '#repositories/health.repository.ts';

export class HealthService {
  private readonly healthRepo: HealthRepositoryContract;
  private readonly logger = createLogger('HealthService');

  constructor(healthRepo: HealthRepositoryContract) {
    this.healthRepo = healthRepo;
  }

  async check(): Promise<{ status: 'ok'; uptime: number }> {
    this.logger.info('pinging the database');
    await this.healthRepo.ping();
    return { status: 'ok', uptime: process.uptime() };
  }
}

export type HealthServiceContract = Pick<HealthService, 'check'>;
