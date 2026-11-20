import { AnimatePresence, motion } from 'motion/react';
import { AlertIcon } from './Icons.jsx';
import TodoItem from './TodoItem.jsx';

const EMPTY_MESSAGES = {
  all: { title: 'Nothing here yet', text: 'Add your first todo using the form above.' },
  active: { title: 'All caught up', text: 'You have no open todos. Nice work.' },
  completed: { title: 'No completed todos', text: 'Tick a todo off and it will show up here.' },
};

export function TodoListSkeleton() {
  return (
    <ul className="todo-list" aria-busy="true" aria-label="Loading todos">
      {[0, 1, 2].map((key) => (
        <li key={key} className="todo todo--skeleton">
          <span className="skeleton skeleton--box" />
          <div className="todo__body">
            <span className="skeleton skeleton--line" />
            <span className="skeleton skeleton--line skeleton--short" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function TodoListError({ message, onRetry, isRetrying }) {
  return (
    <div className="state state--error" role="alert">
      <AlertIcon size={28} />
      <p className="state__title">We couldn't load your todos</p>
      <p className="state__text">{message}</p>
      <button type="button" className="button button--primary" onClick={onRetry} disabled={isRetrying}>
        {isRetrying ? 'Trying again...' : 'Try again'}
      </button>
    </div>
  );
}

export default function TodoList({ todos, filter }) {
  if (todos.length === 0) {
    const { title, text } = EMPTY_MESSAGES[filter];
    return (
      <motion.div className="state" key={filter} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <p className="state__title">{title}</p>
        <p className="state__text">{text}</p>
      </motion.div>
    );
  }

  return (
    <ul className="todo-list">
      <AnimatePresence initial={false} mode="popLayout">
        {todos.map((todo) => (
          <TodoItem key={todo._id} todo={todo} />
        ))}
      </AnimatePresence>
    </ul>
  );
}
