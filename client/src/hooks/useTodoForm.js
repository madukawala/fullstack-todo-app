import { useState } from 'react';
import { hasErrors, validateTodo } from '@todo-app/shared';

const EMPTY = { title: '', description: '' };

// Form state for both the "add" form and the inline edit form.
// Errors are only shown for a field after the user has left it or tried to submit,
// so we don't shout at people while they're still typing.
export function useTodoForm(initialValues = EMPTY) {
  const [values, setValues] = useState({ ...EMPTY, ...initialValues });
  const [touched, setTouched] = useState({});

  const errors = validateTodo(values);
  const visibleErrors = Object.fromEntries(Object.entries(errors).filter(([field]) => touched[field]));

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  // Leaving an empty field is not an error yet (people often click around),
  // the "required" message shows up on submit instead.
  const handleBlur = (event) => {
    const { name, value } = event.target;
    if (value.trim() === '') return;
    setTouched((current) => ({ ...current, [name]: true }));
  };

  // Returns the cleaned values when valid, or null after marking every field as touched.
  const submit = () => {
    if (hasErrors(errors)) {
      setTouched({ title: true, description: true });
      return null;
    }
    return { title: values.title.trim(), description: values.description.trim() };
  };

  const reset = () => {
    setValues({ ...EMPTY, ...initialValues });
    setTouched({});
  };

  return { values, errors: visibleErrors, handleChange, handleBlur, submit, reset };
}
