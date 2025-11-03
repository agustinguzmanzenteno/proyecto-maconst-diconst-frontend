import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';

import Dashboard from './pages/Dashboard';
import Compras from './pages/Compras';
import Ventas from './pages/Ventas';
import Productos from './pages/Productos';
import Pronosticos from './pages/Pronosticos';
import LoginForm from './components/Auth/LoginForm';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function RequireAuth() {
  const { user, isChecking } = useAuth();

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Verificando sesión...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function Shell() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginForm />} />

            <Route element={<RequireAuth />}>
              <Route element={<Shell />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/compras" element={<Compras />} />
                <Route path="/ventas" element={<Ventas />} />
                <Route path="/productos" element={<Productos />} />
                <Route path="/predicciones" element={<Pronosticos />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}