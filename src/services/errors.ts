export type ServiceErrorCode =
  | 'UNAVAILABLE'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'PERMISSION_DENIED'
  | 'NETWORK_ERROR'
  | 'STORAGE_ERROR'
  | 'UNKNOWN';

export class ServiceError extends Error {
  public readonly code: ServiceErrorCode;
  public readonly cause?: Error;

  constructor(code: ServiceErrorCode, message: string, cause?: Error) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
    this.cause = cause;
  }

  static unavailable(message: string, cause?: Error): ServiceError {
    return new ServiceError('UNAVAILABLE', message, cause);
  }

  static notFound(message: string, cause?: Error): ServiceError {
    return new ServiceError('NOT_FOUND', message, cause);
  }

  static validation(message: string, cause?: Error): ServiceError {
    return new ServiceError('VALIDATION_ERROR', message, cause);
  }

  static permissionDenied(message: string, cause?: Error): ServiceError {
    return new ServiceError('PERMISSION_DENIED', message, cause);
  }

  static network(message: string, cause?: Error): ServiceError {
    return new ServiceError('NETWORK_ERROR', message, cause);
  }

  static storage(message: string, cause?: Error): ServiceError {
    return new ServiceError('STORAGE_ERROR', message, cause);
  }

  static unknown(message: string, cause?: Error): ServiceError {
    return new ServiceError('UNKNOWN', message, cause);
  }
}