export class ErrorWithHttpStatus extends Error {
  /** HTTP status code. */
  status: number;

  /** extra fields given on error object. */
  payload: object;

  code: string;

  message: string;

  constructor(status: number, message: string, payload: object = {}, code?: string) {
    super(message);
    this.status = status;
    this.message = message;
    this.code = code ?? this.constructor.name;
    this.payload = payload;
  }
}

export class ValidationError extends ErrorWithHttpStatus {
  constructor(message = 'invalid request', payload = {}) {
    super(400, message, payload);
  }
}

export class NotFoundError extends ErrorWithHttpStatus {
  constructor(message = 'not found', payload = {}) {
    super(404, message, payload);
  }
}

export class AuthError extends ErrorWithHttpStatus {
  constructor(message = 'check auth', payload = {}) {
    super(401, message, payload);
  }
}
