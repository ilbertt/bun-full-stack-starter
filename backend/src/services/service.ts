import { createLogger } from '#lib/logger.ts';

export abstract class Service {
  protected readonly logger = createLogger(this.constructor.name);
}
