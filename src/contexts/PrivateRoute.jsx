import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function PrivateRoute({ children }) {
  const { user, isChecking } = useAuth();
  if (isChecking) return null;
  return user ? children : <Navigate to="/login" replace />;
}