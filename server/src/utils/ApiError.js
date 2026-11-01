// An error we throw on purpose. The error handler turns it into a clean JSON response.
export default class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }

  static badRequest(message, details) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = 'Please log in to continue.') {
    return new ApiError(401, message);
  }

  static notFound(message = 'The requested item could not be found.') {
    return new ApiError(404, message);
  }
}
