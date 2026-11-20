import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useDeleteTodo, useToggleTodo, useUpdateTodo } from '../hooks/useTodos.js';
import { formatRelativeTime } from '../utils/date.js';
import { CheckIcon, PencilIcon, TrashIcon } from './Icons.jsx';
import TodoEditForm from './TodoEditForm.jsx';

// The ref is passed down so AnimatePresence (popLayout mode) can measure the item on exit.
export default function TodoItem({ todo, ref }) {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const toggleTodo = useToggleTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  // A todo that hasn't been saved yet has no real id, so actions on it are disabled.
  const locked = Boolean(todo.isPending);

  const handleSave = (values) => {
    updateTodo.mutate({ id: todo._id, ...values });
    setIsEditing(false);
  };

  const className = ['todo', todo.done && 'todo--done', locked && 'todo--pending'].filter(Boolean).join(' ');

  return (
    <motion.li
      ref={ref}
      layout
      className={className}
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
    >
      {isEditing ? (
        <TodoEditForm todo={todo} onSave={handleSave} onCancel={() => setIsEditing(false)} />
      ) : (
        <>
          <label className="todo__check">
            <input
              type="checkbox"
              checked={todo.done}
              disabled={locked}
              onChange={() => toggleTodo.mutate({ id: todo._id, done: !todo.done })}
              aria-label={todo.done ? `Mark "${todo.title}" as not done` : `Mark "${todo.title}" as done`}
            />
            <span className="todo__checkbox" aria-hidden="true">
              <CheckIcon size={14} strokeWidth={3} />
            </span>
          </label>

          <div className="todo__body">
            <p className="todo__title">{todo.title}</p>
            {todo.description && <p className="todo__description">{todo.description}</p>}
            <p className="todo__meta">
              {locked
                ? 'Saving...'
                : `${todo.done ? 'Completed' : 'Added'} ${formatRelativeTime(todo.done ? todo.updatedAt : todo.createdAt)}`}
            </p>
          </div>

          <div className="todo__actions">
            <AnimatePresence mode="wait" initial={false}>
              {confirmingDelete ? (
                <motion.div
                  key="confirm"
                  className="todo__confirm"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.12 }}
                >
                  <span>Delete?</span>
                  <button
                    type="button"
                    className="button button--danger button--small"
                    onClick={() => deleteTodo.mutate({ id: todo._id })}
                    autoFocus
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className="button button--ghost button--small"
                    onClick={() => setConfirmingDelete(false)}
                  >
                    No
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="buttons"
                  className="todo__buttons"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                >
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => setIsEditing(true)}
                    disabled={locked}
                    aria-label={`Edit "${todo.title}"`}
                    title="Edit"
                  >
                    <PencilIcon size={16} />
                  </button>
                  <button
                    type="button"
                    className="icon-button icon-button--danger"
                    onClick={() => setConfirmingDelete(true)}
                    disabled={locked}
                    aria-label={`Delete "${todo.title}"`}
                    title="Delete"
                  >
                    <TrashIcon size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </motion.li>
  );
}
