import { useState, useEffect, useCallback } from 'react';
import { subscribeToAuthState, signIn, signOutUser } from '../services/authService';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async (email, password) => {
    await signIn(email, password);
  }, []);

  const logout = useCallback(async () => {
    await signOutUser();
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    authLoading,
    login,
    logout,
  };
}
