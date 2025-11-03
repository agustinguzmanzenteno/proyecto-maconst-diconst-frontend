import React, { useEffect, useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import maconstLogin from '../../assets/maconst-login.png';

const LoginForm = () => {
  const { login, isLoading, user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [touched, setTouched] = useState({ username: false, password: false });
  const isUsernameValid = formData.username.trim().length > 0;
  const isPasswordValid = formData.password.trim().length > 0;
  const isFormValid = isUsernameValid && isPasswordValid;

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const inputClass = (invalid) => {
    const base =
      'w-full pl-12 pr-4 py-4 border-2 rounded-lg focus:outline-none transition-colors';
    const themeOK = isDark
      ? 'bg-gray-800 text-white placeholder-gray-400 border-gray-700 focus:ring-2 focus:ring-gray-500'
      : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300 focus:ring-2 focus:ring-gray-500';
    const themeErr = isDark
      ? 'bg-gray-800 text-white placeholder-gray-400 border-red-500 focus:ring-2 focus:ring-red-500'
      : 'bg-white text-gray-900 placeholder-gray-500 border-red-500 focus:ring-2 focus:ring-red-500';
    return `${base} ${invalid ? themeErr : themeOK}`;
  };

  const iconClass = isDark ? 'text-gray-400' : 'text-gray-500';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isFormValid) {
      setTouched({ username: true, password: true });
      setError('Completa usuario y contraseña.');
      return;
    }

    const ok = await login(formData.username, formData.password);
    if (!ok) {
      setError('Credenciales inválidas.');
      return;
    }
    navigate('/', { replace: true });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const markTouched = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  return (
    <div className="min-h-screen flex">
      <div
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative"
        style={{
          backgroundImage: `url(${maconstLogin})`,
        }}
      ></div>

      <div
        className={`w-full lg:w-1/2 flex items-center justify-center px-6 py-12 ${
          isDark ? 'bg-gray-900' : 'bg-gray-50'
        }`}
      >
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-400 to-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <span className={`${isDark ? 'text-white' : 'text-gray-900'} text-2xl font-bold`}>
                  Inicio de Sesión
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="min-h-[92px]">
              <div className="relative">
                <Mail size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 ${iconClass}`} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  onBlur={markTouched}
                  placeholder="Ingrese el usuario"
                  autoComplete="username"
                  aria-invalid={touched.username && !isUsernameValid}
                  aria-describedby="user-error"
                  className={inputClass(touched.username && !isUsernameValid)}
                />
              </div>
              <div className="mt-1 h-5">
                {touched.username && !isUsernameValid && (
                  <p id="user-error" className="text-sm text-red-500">
                    El campo es obligatorio.
                  </p>
                )}
              </div>
            </div>

            <div className="min-h-[92px]">
              <div className="relative">
                <Lock size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 ${iconClass}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={markTouched}
                  placeholder="Ingrese la contraseña"
                  autoComplete="current-password"
                  aria-invalid={touched.password && !isPasswordValid}
                  aria-describedby="pass-error"
                  className={`pr-12 ${inputClass(touched.password && !isPasswordValid)}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                    isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'
                  }`}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="mt-1 h-5">
                {touched.password && !isPasswordValid && (
                  <p id="pass-error" className="text-sm text-red-500">
                    El campo es obligatorio.
                  </p>
                )}
              </div>
            </div>

            {error && (
              <div
                className={`rounded-lg p-3 mt-2 border ${
                  isDark
                    ? 'bg-red-900/40 border-red-700 text-red-200'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                <p className="text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className={`w-full mt-2 py-3.5 px-4 font-medium rounded-lg transition-all duration-200 ${
                isLoading || !isFormValid
                  ? 'opacity-50 cursor-not-allowed ' +
                    (isDark ? 'bg-red-400 text-white' : 'bg-red-400 text-white')
                  : 'hover:shadow-lg ' +
                    (isDark ? 'bg-red-400 hover:bg-red-500 text-white' : 'bg-red-400 hover:bg-red-500 text-white')
              }`}
            >
              {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className={`text-center pt-8 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className={`flex items-center justify-center gap-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-red-400 to-red-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">M</span>
                </div>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>Maconst-Diconst</span>
              </div>

              <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>|</span>

              <span>
                Copyright &copy; {new Date().getFullYear()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;