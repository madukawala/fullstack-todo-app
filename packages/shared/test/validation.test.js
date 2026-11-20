import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TODO_TITLE_MAX, hasErrors, validateLogin, validateTodo } from '../src/index.js';

describe('validateTodo', () => {
  it('requires a title', () => {
    assert.equal(validateTodo({ title: '   ' }).title, 'Title is required.');
    assert.equal(validateTodo({}).title, 'Title is required.');
  });

  it('rejects a title that is too long', () => {
    const errors = validateTodo({ title: 'a'.repeat(TODO_TITLE_MAX + 1) });
    assert.match(errors.title, /characters or less/);
  });

  it('accepts a valid todo with no description', () => {
    assert.equal(hasErrors(validateTodo({ title: 'Buy milk' })), false);
  });

  it('skips the title check on partial updates when title is not sent', () => {
    assert.equal(hasErrors(validateTodo({ description: 'x' }, { partial: true })), false);
  });
});

describe('validateLogin', () => {
  it('checks email format and password presence', () => {
    const errors = validateLogin({ email: 'not-an-email', password: '' });
    assert.equal(errors.email, 'Please enter a valid email address.');
    assert.equal(errors.password, 'Password is required.');
  });

  it('accepts the default admin credentials', () => {
    assert.equal(hasErrors(validateLogin({ email: 'admin@todo.app', password: 'Abc@123' })), false);
  });
});
