import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { clearSession, getProfile, getUsername, SESSION_EVENT, saveSession } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(getUsername());
  const [profile, setProfile] = useState(getProfile());

  // api.js clears the session when the server rejects the token; keep the UI in sync.
  useEffect(() => {
    const sync = () => {
      setUsername(getUsername());
      setProfile(getProfile());
    };
    window.addEventListener(SESSION_EVENT, sync);
    return () => window.removeEventListener(SESSION_EVENT, sync);
  }, []);

  const signIn = useCallback((session) => saveSession(session), []);
  const signOut = useCallback(() => clearSession(), []);

  return (
    <AuthContext.Provider value={{
      username,
      role: profile.role,
      isOrganizer: Boolean(username) && profile.role === 'ORGANIZER',
      fullName: profile.fullName,
      organizationName: profile.organizationName,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
