import { useEffect, useRef } from 'react';
import { TODO_DESCRIPTION_MAX, TODO_TITLE_MAX } from '@todo-app/shared';
import { useTodoForm } from '../hooks/useTodoForm.js';
import FormField from './FormField.jsx';

// Inline form shown in place of a todo while editing it.
// Enter in the title saves, Ctrl/Cmd + Enter saves from the description, Escape cancels.
export default function TodoEditForm({ todo, onSave, onCancel }) {
  const form = useTodoForm({ title: todo.title, description: todo.description || '' });
  const titleRef = useRef(null);

  useEffect(() => {
    titleRef.current?.focus();
    titleRef.current?.select();
  }, []);

  const save = () => {
    const values = form.submit();
    if (!values) return;

    const unchanged = values.title === todo.title && values.description === (todo.description || '');
    if (unchanged) {
      onCancel();
      return;
    }
    onSave(values);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onCancel();
    } else if (event.key === 'Enter' && (event.target.name === 'title' || event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      save();
    }
  };

  return (
    <form
      className="todo-edit"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
      onKeyDown={handleKeyDown}
      noValidate
    >
      <FormField
        id={`edit-title-${todo._id}`}
        name="title"
        label="Title"
        hideLabel
        ref={titleRef}
        autoComplete="off"
        value={form.values.title}
        error={form.errors.title}
        maxLength={TODO_TITLE_MAX}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
      />
      <FormField
        id={`edit-description-${todo._id}`}
        name="description"
        label="Description"
        hideLabel
        placeholder="Description (optional)"
        multiline
        rows={2}
        value={form.values.description}
        error={form.errors.description}
        maxLength={TODO_DESCRIPTION_MAX}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
      />
      <div className="todo-edit__actions">
        <span className="hint">Enter to save, Esc to cancel</span>
        <button type="button" className="button button--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="button button--primary">
          Save
        </button>
      </div>
    </form>
  );
}
