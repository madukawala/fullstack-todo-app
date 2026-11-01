import Todo from '../models/Todo.js';
import ApiError from '../utils/ApiError.js';

// All queries are scoped to req.user, so one user can never read or change another user's todos.
async function findOwnTodo(req) {
  const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });
  if (!todo) {
    throw ApiError.notFound('That todo could not be found. It may have been deleted.');
  }
  return todo;
}

export async function listTodos(req, res) {
  const todos = await Todo.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(todos);
}

export async function createTodo(req, res) {
  const todo = await Todo.create({
    title: req.body.title,
    description: req.body.description ?? '',
    user: req.user._id,
  });
  res.status(201).json(todo);
}

export async function updateTodo(req, res) {
  const todo = await findOwnTodo(req);
  const { title, description } = req.body;

  if (title !== undefined) todo.title = title;
  if (description !== undefined) todo.description = description ?? '';

  await todo.save();
  res.json(todo);
}

// Toggles the done flag. The client may also send { done: true|false } to set it
// directly, which keeps things predictable when the same request is retried.
export async function toggleTodoDone(req, res) {
  const todo = await findOwnTodo(req);
  const requested = req.body?.done;

  if (requested !== undefined && typeof requested !== 'boolean') {
    throw ApiError.badRequest('Please fix the highlighted fields.', { done: 'Done must be true or false.' });
  }

  todo.done = typeof requested === 'boolean' ? requested : !todo.done;
  await todo.save();
  res.json(todo);
}

export async function deleteTodo(req, res) {
  const todo = await findOwnTodo(req);
  await todo.deleteOne();
  res.status(204).end();
}
