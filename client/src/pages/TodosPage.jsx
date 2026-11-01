import { useState } from 'react';
import { motion } from 'motion/react';
import AppHeader from '../components/AppHeader.jsx';
import Spinner from '../components/Spinner.jsx';
import TodoFilters from '../components/TodoFilters.jsx';
import TodoForm from '../components/TodoForm.jsx';
import TodoList, { TodoListError, TodoListSkeleton } from '../components/TodoList.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTodosQuery } from '../hooks/useTodos.js';
import { FILTERS } from '../utils/filters.js';

export default function TodosPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const { data: todos = [], isPending, isError, error, refetch, isFetching } = useTodosQuery();

  const doneCount = todos.filter((todo) => todo.done).length;
  const counts = { all: todos.length, active: todos.length - doneCount, completed: doneCount };
  const visibleTodos = todos.filter(FILTERS[filter].test);
  const progress = todos.length ? Math.round((doneCount / todos.length) * 100) : 0;

  let content;
  if (isPending) {
    content = <TodoListSkeleton />;
  } else if (isError) {
    content = <TodoListError message={error.message} onRetry={() => refetch()} isRetrying={isFetching} />;
  } else {
    content = <TodoList todos={visibleTodos} filter={filter} />;
  }

  return (
    <>
      <AppHeader />
      <main className="page">
        <section className="page__intro">
          <div>
            <h1>Hi {user?.name || 'there'}</h1>
            <p className="muted">
              {todos.length === 0
                ? 'Your list is empty. Add something below.'
                : `${counts.active} open, ${doneCount} done.`}
            </p>
          </div>
          {isFetching && !isPending && <Spinner size={16} label="Syncing" />}
        </section>

        {todos.length > 0 && (
          <div className="progress" aria-label={`${progress}% complete`}>
            <motion.div
              className="progress__bar"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
          </div>
        )}

        <TodoForm />

        {!isPending && !isError && <TodoFilters value={filter} onChange={setFilter} counts={counts} />}

        {content}
      </main>
    </>
  );
}
