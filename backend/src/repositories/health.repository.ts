import { Repository } from '#repositories/repository.ts';

export class HealthRepository extends Repository {
  async ping(): Promise<void> {
    await this.sql`SELECT 1`;
  }
}
