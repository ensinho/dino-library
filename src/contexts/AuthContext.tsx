import React, { createContext, useContext, useEffect, useState } from 'react';
import config from '@/lib/config';
import { listenToAuthChanges, type AuthUser } from '@/services/firebaseAuthService';

interface AuthState {
  user: AuthUser | null;
  /** False until Firebase has reported the initial session. */
  ready: boolean;
}

const AuthContext = createContext<AuthState>({ user: null, ready: false });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, ready: false });

  useEffect(() => {
    if (!config.firebase) {
      setState({ user: null, ready: true });
      return;
    }
    try {
      return listenToAuthChanges((user) => setState({ user, ready: true }));
    } catch (error) {
      // Missing/invalid Firebase config must not leave the app on a blank loader.
      console.error('Auth unavailable:', error);
      setState({ user: null, ready: true });
    }
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
