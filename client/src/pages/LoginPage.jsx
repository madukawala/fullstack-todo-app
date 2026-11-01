import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { hasErrors, validateLogin } from '@todo-app/shared';
import FormField from '../components/FormField.jsx';
import { AlertIcon, CheckIcon, EyeIcon, EyeOffIcon } from '../components/Icons.jsx';
import Spinner from '../components/Spinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (status === 'authenticated') {
    return <Navigate to={location.state?.from?.pathname || '/'} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    // Clear the message for a field as soon as the user starts fixing it.
    if (fieldErrors[name]) setFieldErrors((current) => ({ ...current, [name]: undefined }));
    if (formError) setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validateLogin(values);
    if (hasErrors(errors)) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      await login({ email: values.email.trim(), password: values.password });
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      setFieldErrors(err.details || {});
      setFormError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <motion.div
        className="card auth-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="auth-card__header">
          <span className="brand__logo brand__logo--large">
            <CheckIcon size={22} strokeWidth={3} />
          </span>
          <h1>Welcome back</h1>
          <p className="muted">Log in to see your todos.</p>
        </div>

        <AnimatePresence>
          {formError && (
            <motion.div
              className="alert alert--error"
              role="alert"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <AlertIcon size={16} />
              <span>{formError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          <FormField
            id="email"
            name="email"
            type="email"
            label="Email"
            autoComplete="email"
            placeholder="you@example.com"
            autoFocus
            value={values.email}
            error={fieldErrors.email}
            onChange={handleChange}
          />

          <div className="password-field">
            <FormField
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              autoComplete="current-password"
              placeholder="Your password"
              value={values.password}
              error={fieldErrors.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="icon-button password-field__toggle"
              onClick={() => setShowPassword((show) => !show)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            </button>
          </div>

          <button type="submit" className="button button--primary button--block" disabled={submitting}>
            {submitting ? <Spinner size={16} label="Logging in" /> : 'Log in'}
          </button>
        </form>

        {import.meta.env.DEV && (
          <p className="auth-card__hint">
            Default account: <code>admin@todo.app</code> / <code>Abc@123</code>
          </p>
        )}
      </motion.div>
    </main>
  );
}
