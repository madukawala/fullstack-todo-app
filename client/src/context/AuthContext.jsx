import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth.js';
import { setUnauthorizedHandler, tokenStorage } from '../api/client.js';

const AuthContext = createContext(null);

// status is one of: 'checking' (validating a saved token), 'authenticated', 'guest'
export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(() => (tokenStorage.get() ? 'checking' : 'guest'));
  // Mirrors status so the 401 handler can read the latest value without re-subscribing.
  const statusRef = useRef(status);

  const logout = useCallback(
    (reason) => {
      // Several requests can fail with 401 at the same time. Only react to the first one.
      if (statusRef.current === 'guest') return;
      statusRef.current = 'guest';

      tokenStorage.clear();
      queryClient.clear();
      setUser(null);
      setStatus('guest');
      if (reason) toast.error(reason, { id: 'session' });
    },
    [queryClient],
  );

  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, [logout]);

  // On first load, check that a saved token is still valid.
  useEffect(() => {
    if (status !== 'checking') return;
    const controller = new AbortController();

    authApi
      .me(controller.signal)
      .then(({ user: currentUser }) => {
        statusRef.current = 'authenticated';
        setUser(currentUser);
        setStatus('authenticated');
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        // A 401 is already handled by the unauthorized handler. Anything else
        // (e.g. server down) also sends the user to the login page.
        statusRef.current = 'guest';
        tokenStorage.clear();
        setStatus('guest');
      });

    return () => controller.abort();
  }, [status]);

  const login = useCallback(async (credentials) => {
    const { token, user: loggedInUser } = await authApi.login(credentials);
    tokenStorage.set(token);
    statusRef.current = 'authenticated';
    setUser(loggedInUser);
    setStatus('authenticated');
    return loggedInUser;
  }, []);

  const value = useMemo(() => ({ user, status, login, logout }), [user, status, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>.');
  return context;
}
