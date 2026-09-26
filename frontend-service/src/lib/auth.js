import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { clearSession, getUsername, SESSION_EVENT, saveSession } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(getUsername());

  // api.js clears the session when the server rejects the token; keep the UI in sync.
  useEffect(() => {
    const sync = () => setUsername(getUsername());
    window.addEventListener(SESSION_EVENT, sync);
    return () => window.removeEventListener(SESSION_EVENT, sync);
  }, []);

  const signIn = useCallback((session) => saveSession(session), []);
  const signOut = useCallback(() => clearSession(), []);

  return (
    <AuthContext.Provider value={{ username, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
