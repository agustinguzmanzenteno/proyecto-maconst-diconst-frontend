import React, { useState } from 'react';
import { Save, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useParams } from 'react-router-dom';

function FormLayout() {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', country: '', birthDate: '', bio: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="flex items-center space-x-3 mb-6">
          <User className="text-blue-600" size={24} />
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Información del Usuario
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Nombre</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white':'bg-white border-gray-300 text-gray-900'}`} placeholder="Juan" />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Apellido</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white':'bg-white border-gray-300 text-gray-900'}`} placeholder="Pérez" />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Mail size={16} className="inline mr-2" /> Email
            </label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white':'bg-white border-gray-300 text-gray-900'}`} placeholder="juan@ejemplo.com" />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Phone size={16} className="inline mr-2" /> Teléfono
            </label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white':'bg-white border-gray-300 text-gray-900'}`} placeholder="+34 123 456 789" />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <MapPin size={16} className="inline mr-2" /> Dirección
            </label>
            <input type="text" name="address" value={formData.address} onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white':'bg-white border-gray-300 text-gray-900'}`} placeholder="Calle Principal 123" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Ciudad</label>
              <input type="text" name="city" value={formData.city} onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white':'bg-white border-gray-300 text-gray-900'}`} placeholder="Madrid" />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>País</label>
              <select name="country" value={formData.country} onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white':'bg-white border-gray-300 text-gray-900'}`}>
                <option value="">Seleccionar país</option>
                <option value="es">España</option>
                <option value="mx">México</option>
                <option value="ar">Argentina</option>
                <option value="co">Colombia</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Calendar size={16} className="inline mr-2" /> Fecha de Nacimiento
            </label>
            <input type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white':'bg-white border-gray-300 text-gray-900'}`} />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Biografía</label>
            <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white':'bg-white border-gray-300 text-gray-900'}`} placeholder="Cuéntanos algo sobre ti..." />
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
            <Save size={16} /><span>Guardar Usuario</span>
          </button>
        </form>
      </div>

      <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h2 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Vista Previa</h2>
      </div>
    </div>
  );
}

function InputsDemo() {
  const { isDark } = useTheme();
  return (
    <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg space-y-4`}>
      <input className={`w-full px-3 py-2 border rounded-lg ${isDark?'bg-gray-700 border-gray-600 text-white':'bg-white border-gray-300'}`} placeholder="Input básico" />
      <input className={`w-full px-3 py-2 border rounded-lg ${isDark?'bg-gray-700 border-gray-600 text-white':'bg-white border-gray-300'}`} disabled placeholder="Deshabilitado" />
    </div>
  );
}

function FloatLabelDemo() {
  const { isDark } = useTheme();
  return (
    <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <div className="relative mt-4">
        <input id="name" className={`peer w-full px-3 py-3 border rounded-lg ${isDark?'bg-gray-700 border-gray-600 text-white':'bg-white border-gray-300'}`} placeholder=" " />
        <label htmlFor="name" className="absolute left-3 -top-2 bg-inherit px-1 text-xs text-blue-500 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm transition-all">
          Nombre
        </label>
      </div>
    </div>
  );
}

function InvalidStateDemo() {
  const { isDark } = useTheme();
  return (
    <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg space-y-2`}>
      <input className={`w-full px-3 py-2 border rounded-lg border-red-500 ${isDark?'bg-gray-700 text-white':'bg-white text-gray-900'}`} defaultValue="valor inválido" />
      <p className="text-sm text-red-400">El campo es obligatorio.</p>
    </div>
  );
}

function ButtonsDemo() {
  return (
    <div className="flex flex-wrap gap-3">
      <button className="px-4 py-2 rounded-lg bg-blue-600 text-white">Primary</button>
      <button className="px-4 py-2 rounded-lg bg-gray-700 text-white">Secondary</button>
      <button className="px-4 py-2 rounded-lg border border-gray-400">Outline</button>
    </div>
  );
}

const Forms = () => {
  const { isDark } = useTheme();
  const { section } = useParams();

  const titleMap = {
    'formlayout': 'Form Layout',
    'input': 'Input',
    'floatlabel': 'Float Label',
    'invalid-state': 'Invalid State',
    'button': 'Button',
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {titleMap[section] ?? 'UI Kit'}
        </h1>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Gestiona la información de usuarios y productos
        </p>
      </div>

      {!section || section === 'formlayout' ? <FormLayout /> : null}
      {section === 'input' && <InputsDemo />}
      {section === 'floatlabel' && <FloatLabelDemo />}
      {section === 'invalid-state' && <InvalidStateDemo />}
      {section === 'button' && <ButtonsDemo />}
    </div>
  );
};

export default Forms;