import { AnimatePresence, motion } from 'motion/react';

// Label + input + error message + optional character counter.
// Pass multiline to render a textarea instead of an input.
export default function FormField({
  id,
  label,
  error,
  maxLength,
  value = '',
  multiline = false,
  hideLabel = false,
  ...inputProps
}) {
  const Control = multiline ? 'textarea' : 'input';
  const errorId = `${id}-error`;
  const length = value.trim().length;
  // Only show the counter once people get close to the limit.
  const showCounter = maxLength && length > maxLength * 0.8;

  return (
    <div className={`field ${error ? 'field--invalid' : ''}`}>
      <label htmlFor={id} className={hideLabel ? 'visually-hidden' : 'field__label'}>
        {label}
      </label>
      <Control
        id={id}
        value={value}
        className="field__control"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      <div className="field__meta">
        <AnimatePresence initial={false}>
          {error && (
            <motion.p
              id={errorId}
              className="field__error"
              role="alert"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
        {showCounter && (
          <span className={`field__counter ${length > maxLength ? 'field__counter--over' : ''}`}>
            {length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
