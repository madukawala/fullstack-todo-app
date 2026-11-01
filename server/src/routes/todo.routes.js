import { Router } from 'express';
import { validateTodo } from '@todo-app/shared';
import { createTodo, deleteTodo, listTodos, toggleTodoDone, updateTodo } from '../controllers/todo.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, validateObjectId } from '../middleware/validate.js';

const router = Router();

router.use(requireAuth);

router.get('/', listTodos);
router.post('/', validateBody(validateTodo), createTodo);
router.put('/:id', validateObjectId(), validateBody(validateTodo, { partial: true }), updateTodo);
router.patch('/:id/done', validateObjectId(), toggleTodoDone);
router.delete('/:id', validateObjectId(), deleteTodo);

export default router;
