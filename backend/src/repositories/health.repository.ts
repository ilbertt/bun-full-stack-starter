import type { SQL } from 'bun';

export interface HealthRepositoryContract {
  ping(): Promise<void>;
}

export class HealthRepository implements HealthRepositoryContract {
  private readonly sql: SQL;

  constructor(sql: SQL) {
    this.sql = sql;
  }

  async ping(): Promise<void> {
    await this.sql`SELECT 1`;
  }
}
