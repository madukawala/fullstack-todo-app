import mongoose from 'mongoose';
import { hasErrors } from '@todo-app/shared';
import ApiError from '../utils/ApiError.js';

// Runs one of the shared validators against req.body.
export function validateBody(validator, options) {
  return (req, _res, next) => {
    const errors = validator(req.body ?? {}, options);
    if (hasErrors(errors)) {
      throw ApiError.badRequest('Please fix the highlighted fields.', errors);
    }
    next();
  };
}

export function validateObjectId(param = 'id') {
  return (req, _res, next) => {
    if (!mongoose.isValidObjectId(req.params[param])) {
      throw ApiError.notFound('That todo could not be found.');
    }
    next();
  };
}
