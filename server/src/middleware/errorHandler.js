import mongoose from 'mongoose';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';

export function notFound(req, _res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} does not exist.`));
}

// Every error ends up here. The client always gets { message, details? } back,
// and we never leak stack traces or raw database errors to the browser.
export function errorHandler(err, _req, res, _next) {
  let status = 500;
  let message = 'Something went wrong on our side. Please try again.';
  let details;

  if (err instanceof ApiError) {
    ({ status, message, details } = err);
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    message = 'Please fix the highlighted fields.';
    details = Object.fromEntries(Object.entries(err.errors).map(([field, error]) => [field, error.message]));
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'The request body is not valid JSON.';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'The request body is too large.';
  }

  if (status >= 500 && !env.isTest) {
    console.error(err);
  }

  res.status(status).json(details ? { message, details } : { message });
}
