import { EMAIL_PATTERN, PASSWORD_MAX, PASSWORD_MIN, TODO_DESCRIPTION_MAX, TODO_TITLE_MAX } from './constants.js';

// Each validator returns an object of { field: message }.
// An empty object means the input is valid.

export function validateTodo(input = {}, { partial = false } = {}) {
  const errors = {};
  const { title, description } = input;

  if (title !== undefined || !partial) {
    if (typeof title !== 'string' || title.trim() === '') {
      errors.title = 'Title is required.';
    } else if (title.trim().length > TODO_TITLE_MAX) {
      errors.title = `Title must be ${TODO_TITLE_MAX} characters or less.`;
    }
  }

  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      errors.description = 'Description must be text.';
    } else if (description.trim().length > TODO_DESCRIPTION_MAX) {
      errors.description = `Description must be ${TODO_DESCRIPTION_MAX} characters or less.`;
    }
  }

  return errors;
}

export function validateLogin(input = {}) {
  const errors = {};
  const { email, password } = input;

  if (typeof email !== 'string' || email.trim() === '') {
    errors.email = 'Email is required.';
  } else if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (typeof password !== 'string' || password === '') {
    errors.password = 'Password is required.';
  } else if (password.length < PASSWORD_MIN) {
    errors.password = `Password must be at least ${PASSWORD_MIN} characters.`;
  } else if (password.length > PASSWORD_MAX) {
    errors.password = `Password must be ${PASSWORD_MAX} characters or less.`;
  }

  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}
