import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { TODO_DESCRIPTION_MAX, TODO_TITLE_MAX } from '@todo-app/shared';
import { useTodoForm } from '../hooks/useTodoForm.js';
import { useCreateTodo } from '../hooks/useTodos.js';
import FormField from './FormField.jsx';
import { PlusIcon } from './Icons.jsx';

export default function TodoForm() {
  const form = useTodoForm();
  const createTodo = useCreateTodo();
  const titleRef = useRef(null);
  const [showDescription, setShowDescription] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const values = form.submit();
    if (!values) {
      titleRef.current?.focus();
      return;
    }

    // The item shows up in the list right away; the request runs in the background.
    createTodo.mutate({ ...values, tempId: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` });
    form.reset();
    setShowDescription(false);
    titleRef.current?.focus();
  };

  return (
    <form
      className="card todo-form"
      onSubmit={handleSubmit}
      // Ctrl/Cmd + Enter submits from the description box too.
      onKeyDown={(event) => {
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) handleSubmit(event);
      }}
      noValidate
    >
      <div className="todo-form__row">
        <FormField
          id="new-todo-title"
          name="title"
          label="What needs to be done?"
          hideLabel
          placeholder="What needs to be done?"
          autoComplete="off"
          ref={titleRef}
          value={form.values.title}
          error={form.errors.title}
          maxLength={TODO_TITLE_MAX}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          onFocus={() => setShowDescription(true)}
        />
        <button type="submit" className="button button--primary todo-form__submit">
          <PlusIcon size={16} />
          <span>Add</span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {(showDescription || form.values.description) && (
          <motion.div
            className="todo-form__extra"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <FormField
              id="new-todo-description"
              name="description"
              label="Description (optional)"
              placeholder="Add some details..."
              multiline
              rows={2}
              value={form.values.description}
              error={form.errors.description}
              maxLength={TODO_DESCRIPTION_MAX}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
