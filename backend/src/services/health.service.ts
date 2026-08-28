import type { HealthRepository } from '#repositories/health.repository.ts';
import { Service } from '#services/service.ts';

export class HealthService extends Service {
  private readonly healthRepo: HealthRepository;

  constructor(healthRepo: HealthRepository) {
    super();
    this.healthRepo = healthRepo;
  }

  async check(): Promise<{ status: 'ok'; uptime: number }> {
    this.logger.info('pinging the database');
    await this.healthRepo.ping();
    return { status: 'ok', uptime: process.uptime() };
  }
}

export type HealthServiceContract = Pick<HealthService, 'check'>;
