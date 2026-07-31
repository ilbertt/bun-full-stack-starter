import type { SQL } from 'bun';

export abstract class Repository {
  protected readonly sql: SQL;

  constructor(sql: SQL) {
    this.sql = sql;
  }
}
