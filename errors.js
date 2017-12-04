/**
 * This custom Error type makes it easier to create Error
 */
class AppError extends Error {
  constructor(statusCode = 500, message = 'Something happened') {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    Error.captureStackTrace(this, AppError);
  }
}

module.exports = {
  AppError
};
