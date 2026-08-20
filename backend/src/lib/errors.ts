import { type ErrorHandler, StatusMap, t } from 'elysia';
import { createLogger } from '#lib/logger.ts';

const errorLogger = createLogger();

/** The body `elysiaErrorHandler` sends for every error it catches. */
export const ErrorResponseSchema = t.Object({ error: t.String() });

export class AppError extends Error {
  readonly statusCode: number;

  constructor({ statusCode, message }: { statusCode: number; message: string }) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request') {
    super({ statusCode: StatusMap['Bad Request'], message });
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super({ statusCode: StatusMap.Unauthorized, message });
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super({ statusCode: StatusMap.Forbidden, message });
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found') {
    super({ statusCode: StatusMap['Not Found'], message });
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super({ statusCode: StatusMap.Conflict, message });
    this.name = 'ConflictError';
  }
}

type ErrorHandlerOptions = Parameters<ErrorHandler>[0];
type ErrorHandlerResult = ReturnType<ErrorHandler>;

export function elysiaErrorHandler({
  error,
  code,
  status,
}: ErrorHandlerOptions): ErrorHandlerResult {
  if (error instanceof AppError) {
    if (error.statusCode >= StatusMap['Internal Server Error']) {
      errorLogger.error(code, error);
    }
    return status(error.statusCode, { error: error.message });
  }
  if (code === 'VALIDATION') {
    return status(StatusMap['Bad Request'], { error: 'Validation error', details: error.message });
  }
  if (code === 'NOT_FOUND') {
    return status(StatusMap['Not Found'], { error: 'Not Found' });
  }
  errorLogger.error(code, error);
  return status(StatusMap['Internal Server Error'], { error: 'Internal server error' });
}
