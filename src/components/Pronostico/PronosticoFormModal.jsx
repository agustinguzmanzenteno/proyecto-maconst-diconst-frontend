import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const FRECUENCIA_DEF = 'MS';
const REGS_DEF = ['covid_dummy', 'evento2009'];

export default function PronosticoFormModal({
  open,
  mode = 'create',
  initialData = null,
  onClose,
  onSubmit,
}) {
  const { isDark } = useTheme();

  const [nombre, setNombre] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [notas, setNotas] = useState('');

  const [nombreError, setNombreError] = useState('');
  const [desdeError, setDesdeError] = useState('');
  const [hastaError, setHastaError] = useState('');
  const [notasError, setNotasError] = useState('');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (mode === 'create') {
      setNombre('');
      setDesde('');
      setHasta('');
      setNotas('');
    } else if (mode === 'regenerate' && initialData) {
      setNombre(initialData.nombre || '');
      setDesde(initialData.desde ? initialData.desde.slice(0, 10) : '');
      setHasta(initialData.hasta ? initialData.hasta.slice(0, 10) : '');
      setNotas(initialData.notas || '');
    }

    setNombreError('');
    setDesdeError('');
    setHastaError('');
    setNotasError('');
    setSaving(false);
  }, [open, mode, initialData]);

  if (!open) return null;

  const validateNombre = () => {
    const v = nombre.trim();
    if (!v) {
      setNombreError('El nombre es obligatorio.');
      return false;
    }
    if (v.length < 3) {
      setNombreError('El nombre debe tener al menos 3 caracteres.');
      return false;
    }
    setNombreError('');
    return true;
  };

  const validateFechas = () => {
    let ok = true;

    if (!desde) {
      setDesdeError('La fecha "Desde" es obligatoria.');
      ok = false;
    } else {
      setDesdeError('');
    }

    if (!hasta) {
      setHastaError('La fecha "Hasta" es obligatoria.');
      ok = false;
    } else {
      setHastaError('');
    }

    if (ok && desde && hasta) {
      const d1 = new Date(desde);
      const d2 = new Date(hasta);
      if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) {
        if (Number.isNaN(d1.getTime())) setDesdeError('Fecha inválida.');
        if (Number.isNaN(d2.getTime())) setHastaError('Fecha inválida.');
        ok = false;
      } else if (d1 > d2) {
        setDesdeError('Debe ser anterior o igual a "Hasta".');
        setHastaError('Debe ser posterior o igual a "Desde".');
        ok = false;
      } else {
        setDesdeError('');
        setHastaError('');
      }
    }

    return ok;
  };

  const validateNotas = () => {
    if (notas && notas.length > 500) {
      setNotasError('Máximo 500 caracteres.');
      return false;
    }
    setNotasError('');
    return true;
  };

  const validate = () => {
    const a = validateNombre();
    const b = validateFechas();
    const c = validateNotas();
    return a && b && c;
  };

  const handleBlur = (field) => {
    if (field === 'nombre') validateNombre();
    if (field === 'desde' || field === 'hasta') validateFechas();
    if (field === 'notas') validateNotas();
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);

      if (mode === 'create') {
        await onSubmit({
          nombre: nombre.trim(),
          notas: notas.trim(),
          frecuencia: FRECUENCIA_DEF,
          regresores: REGS_DEF,
          desde,
          hasta,
        });
      } else {
        const regenerar = {
          frecuencia: FRECUENCIA_DEF,
          regresores: REGS_DEF,
          desde,
          hasta,
        };
        await onSubmit({
          nombre: nombre.trim(),
          notas: notas.trim(),
          regenerar,
        });
      }

      onClose();
    } catch (err) {
      setNombreError(err?.message || 'No se pudo guardar el pronóstico.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={saving ? undefined : onClose}
      />
      <div
        className={`relative z-50 w-full max-w-2xl rounded-2xl shadow-2xl p-6 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {mode === 'create' ? 'Nueva predicción' : 'Editar predicción'}
          </h3>
          <button
            className={`${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} p-1 rounded`}
            onClick={saving ? undefined : onClose}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4" noValidate>
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
              placeholder="Ingrese el nombre del pronóstico"
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                nombreError ? 'border-red-500' : ''
              } ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
            />
            {nombreError && <p className="text-sm text-red-400 mt-1">{nombreError}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Desde <span className="text-gray-500">*</span>
              </label>
              <input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                onBlur={() => handleBlur('desde')}
                required
                aria-invalid={Boolean(desdeError)}
                className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                  desdeError ? 'border-red-500' : ''
                } ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
              />
              {desdeError && <p className="text-sm text-red-400 mt-1">{desdeError}</p>}
            </div>

            <div>
              <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Hasta <span className="text-gray-500">*</span>
              </label>
              <input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                onBlur={() => handleBlur('hasta')}
                required
                aria-invalid={Boolean(hastaError)}
                className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                  hastaError ? 'border-red-500' : ''
                } ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
              />
              {hastaError && <p className="text-sm text-red-400 mt-1">{hastaError}</p>}
            </div>
          </div>

          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Notas
            </label>
            <textarea
              rows={3}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              onBlur={() => handleBlur('notas')}
              aria-invalid={Boolean(notasError)}
              placeholder="Ingrese notas (máx. 500 caracteres)"
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                notasError ? 'border-red-500' : ''
              } ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
            />
            <div className={`flex justify-between text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <span>{notas.length}/500</span>
            </div>
            {notasError && <p className="text-sm text-red-400 mt-1">{notasError}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={saving ? undefined : onClose}
              className={`px-4 py-2 rounded border ${
                isDark ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded bg-red-400 hover:bg-red-500 text-white disabled:opacity-50"
            >
              {saving ? 'Guardando…' : (mode === 'create' ? 'Guardar' : 'Guardar cambios')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
