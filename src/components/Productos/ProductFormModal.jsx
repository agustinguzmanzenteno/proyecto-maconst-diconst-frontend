import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function ProductFormModal({
  open,
  onClose,
  onSubmit,
  initialData = {},
  mode = 'create',
}) {
  const { isDark } = useTheme();

  const [nombre, setNombre] = useState('');
  const [stock, setStock] = useState('');
  const [nombreError, setNombreError] = useState('');
  const [stockError, setStockError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setNombre(initialData?.nombre ?? '');
      setStock(
        initialData?.stock_cantidad !== undefined && initialData?.stock_cantidad !== null
          ? String(initialData.stock_cantidad)
          : ''
      );
      setNombreError('');
      setStockError('');
      setSaving(false);
    }
  }, [open, initialData]);

  const validate = () => {
    let hasError = false;

    if (!nombre.trim()) {
      setNombreError('El nombre es obligatorio.');
      hasError = true;
    } else {
      setNombreError('');
    }

    const s = Number(stock);
    if (stock === '' || !Number.isFinite(s)) {
      setStockError('El stock es obligatorio.');
      hasError = true;
    } else if (s < 0) {
      setStockError('El stock debe ser un número mayor o igual a 0.');
      hasError = true;
    } else {
      setStockError('');
    }

    return !hasError;
  };

  const handleBlur = (field) => {
    if (field === 'nombre') {
      if (!nombre.trim()) setNombreError('El nombre es obligatorio.');
      else setNombreError('');
    } else if (field === 'stock') {
      const s = Number(stock);
      if (stock === '' || !Number.isFinite(s)) setStockError('El stock es obligatorio.');
      else if (s < 0) setStockError('El stock debe ser un número mayor o igual a 0.');
      else setStockError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setSaving(true);
      await onSubmit({
        nombre: nombre.trim(),
        stock_cantidad: Number(stock),
      });
      onClose();
    } catch (err) {
      setNombreError(err?.message || 'No se pudo guardar el producto.');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={saving ? undefined : onClose}
      />
      <div className={`relative z-50 w-full max-w-md rounded-xl shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {mode === 'edit' ? 'Editar producto' : 'Nuevo producto'}
          </h3>
          <button
            className={`${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} p-1 rounded`}
            onClick={saving ? undefined : onClose}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Nombre <span className="text-gray-500">*</span>
            </label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onBlur={() => handleBlur('nombre')}
              required
              aria-invalid={Boolean(nombreError)}
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-gray-500 ${nombreError ? 'border-red-500' : ''} ${
                isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
              }`}
              placeholder="Ingrese el nombre del producto"
            />
            {nombreError && <p className="text-sm text-red-400 mt-1">{nombreError}</p>}
          </div>

          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Stock <span className="text-gray-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              onBlur={() => handleBlur('stock')}
              required
              aria-invalid={Boolean(stockError)}
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-gray-500 ${stockError ? 'border-red-500' : ''} ${
                isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
              }`}
              placeholder="Ingrese la cantidad en stock"
            />
            {stockError && <p className="text-sm text-red-400 mt-1">{stockError}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={saving ? undefined : onClose}
              className={`px-4 py-2 rounded border ${isDark ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded bg-red-400 hover:bg-red-500 text-white disabled:opacity-50"
            >
              {saving ? 'Guardando…' : (mode === 'edit' ? 'Guardar cambios' : 'Guardar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}