import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiFetch } from '../lib/api';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await apiFetch('/api/profile');
        setUser(me);
      } catch {
        setUser(null);
      } finally {
        setIsChecking(false);
      }
    })();
  }, []);

  const login = useCallback(async (username, password) => {
    setIsLoading(true);
    try {
      await apiFetch('/api/auth/login', {
        method: 'POST',
        body: { nombre_usuario: username, contrasenia: password },
      });
      const me = await apiFetch('/api/profile');
      setUser(me);
      return true;
    } catch {
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
    }
  }, []);

  const value = { user, login, logout, isLoading, isChecking };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};