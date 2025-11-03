import React from 'react';
import { Moon, Sun, LogOut, Settings, User } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header
      className={`h-16 ${
        isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      } border-b px-6 flex items-center justify-between`}
    >
      <div className="flex items-center space-x-4">
        <h1
          className={`text-2xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}
        >
          Maconst-Diconst
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition-colors duration-200 ${
            isDark
              ? 'hover:bg-gray-800 text-gray-300'
              : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="flex items-center space-x-3">
          <div className={`text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <p className="text-sm font-medium">{user?.nombre_completo}</p>
            <p
              className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              {user?.nombre_usuario}
            </p>
          </div>

          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.nombre_completo || user.nombre_usuario}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 bg-red-400 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
          )}

          <button
            onClick={logout}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              isDark
                ? 'hover:bg-gray-800 text-gray-300'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Cerrar sesión"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;