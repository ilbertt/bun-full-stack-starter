import type { Database } from '#db/client.ts';

export abstract class Repository {
  protected readonly sql: Database;

  constructor(sql: Database) {
    this.sql = sql;
  }
}
