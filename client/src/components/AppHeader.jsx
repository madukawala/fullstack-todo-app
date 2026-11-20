import { useAuth } from '../context/AuthContext.jsx';
import { CheckIcon, LogoutIcon } from './Icons.jsx';

export default function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="brand">
          <span className="brand__logo">
            <CheckIcon size={16} strokeWidth={3} />
          </span>
          <span className="brand__name">Todo App</span>
        </div>

        {user && (
          <div className="app-header__user">
            <span className="app-header__email" title={user.email}>
              {user.email}
            </span>
            <button type="button" className="button button--ghost" onClick={() => logout()}>
              <LogoutIcon size={16} />
              <span>Log out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
