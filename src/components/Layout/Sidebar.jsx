import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, ShoppingBag, Package, Calendar,
  MessageCircle, FileStack, Mail, CheckSquare, FormInput, Tag,
  AlertCircle, Donut as Button, ChevronDown, Calendar as CalendarIcon
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import logo from '../../assets/duralit-logo.webp';

const pathById = (id) => {
  switch (id) {
    case 'dashboard': return '/';
    case 'productos': return '/productos';
    case 'compras': return '/compras';
    case 'ventas': return '/ventas';
    case 'predicciones': return '/predicciones';
    default: return '/';
  }
};

const Sidebar = () => {
  const { isDark } = useTheme();
  const { pathname } = useLocation();

  const menuItems = [
    { category: 'Dashboard', items: [{ id: 'dashboard', label: 'Comercial', icon: LayoutDashboard }] },
    { category: 'Distribución', items: [
      { id: 'productos', label: 'Productos', icon: Package },
      { id: 'compras', label: 'Compras', icon: FileText },
      { id: 'ventas', label: 'Ventas', icon: ShoppingBag },
      { id: 'predicciones', label: 'Predicciones', icon: Calendar }
    ] },
  ];

  const activeClasses = 'bg-red-400 text-white';
  const baseClasses = isDark
    ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900';

  return (
    <aside className={`w-64 h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} border-r ${isDark ? 'border-gray-800' : 'border-gray-200'} overflow-y-auto`}>
      <div className="px-4 pt-3 pb-1 flex justify-center">
        <img src={logo} alt="Duralit Logo" className="h-[6rem] w-auto object-contain" />
      </div>

      <nav className="px-4 pt-1 pb-4" aria-label="Sidebar">
        {menuItems.map((section, i) => (
          <div key={i} className="mb-6">
            <h3 className={`text-xs font-semibold tracking-wider mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {section.category}
            </h3>

            <ul className="space-y-1">
              {section.items.map((item) => {
                const to = pathById(item.id);
                const isActive = pathname === to || (to.startsWith('/uikit') && pathname.startsWith('/uikit') && item.id !== 'forms' && pathname.includes(item.id));
                return (
                  <li key={item.id}>
                    <NavLink
                      to={to}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${isActive ? activeClasses : baseClasses}`}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon size={18} />
                        <span>{item.label}</span>
                      </div>
                      {item.hasSubmenu && (
                        <ChevronDown size={16} className={isActive ? 'text-white' : 'text-gray-400'} />
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;