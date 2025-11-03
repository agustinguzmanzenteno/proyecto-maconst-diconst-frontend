import React, { useEffect, useMemo, useState, Fragment, useRef } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';
import { Listbox, Transition } from '@headlessui/react';
import { useTheme } from '../../contexts/ThemeContext';

const MESES = [
  'ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO',
  'JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'
];

function normalizaMes(raw) {
  if (raw == null) return '';
  const s = String(raw).trim().toUpperCase();
  const n = Number(s);
  if (Number.isFinite(n) && n >= 1 && n <= 12) return MESES[n - 1];
  const idx = MESES.indexOf(s);
  return idx >= 0 ? MESES[idx] : '';
}

export default function CompraFormModal({
  open,
  onClose,
  onSubmit,
  initialData = {},
  mode = 'create',
  productos = [],
  isDarkParent,
}) {
  const themeCtx = useTheme();
  const isDark = isDarkParent ?? themeCtx?.isDark ?? false;

  const [mes, setMes] = useState('');
  const [anio, setAnio] = useState('');
  const [idProducto, setIdProducto] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precioUnitario, setPrecioUnitario] = useState('');

  const [mesError, setMesError] = useState('');
  const [anioError, setAnioError] = useState('');
  const [productoError, setProductoError] = useState('');
  const [cantidadError, setCantidadError] = useState('');
  const [precioError, setPrecioError] = useState('');

  const [saving, setSaving] = useState(false);

  const mesBtnRef = useRef(null);
  const prodBtnRef = useRef(null);
  const [mesDropUp, setMesDropUp] = useState(false);
  const [prodDropUp, setProdDropUp] = useState(false);
  const decideDropDirection = (btnEl, setDropUp) => {
    const rect = btnEl?.getBoundingClientRect?.();
    const spaceBelow = window.innerHeight - (rect?.bottom ?? 0);
    const desired = Math.min(window.innerHeight * 0.4, 320);
    setDropUp(spaceBelow < desired + 16);
  };

  useEffect(() => {
    if (open) {
      setMes(normalizaMes(initialData?.mes));
      setAnio(
        initialData?.anio !== undefined && initialData?.anio !== null
          ? String(initialData.anio)
          : ''
      );
      setIdProducto(
        initialData?.id_producto !== undefined && initialData?.id_producto !== null
          ? String(initialData.id_producto)
          : ''
      );
      setCantidad(
        initialData?.cantidad !== undefined && initialData?.cantidad !== null
          ? String(initialData.cantidad)
          : ''
      );
      setPrecioUnitario(
        initialData?.precio_unitario !== undefined && initialData?.precio_unitario !== null
          ? String(initialData.precio_unitario)
          : ''
      );

      setMesError('');
      setAnioError('');
      setProductoError('');
      setCantidadError('');
      setPrecioError('');
      setSaving(false);
    }
  }, [open, initialData]);

  const productoOptions = useMemo(() => (Array.isArray(productos) ? productos : []), [productos]);
  const selectedProduct = useMemo(
    () => productoOptions.find(p => String(p.id) === String(idProducto)) || null,
    [productoOptions, idProducto]
  );

  const selectedMes = useMemo(
    () => (mes ? { label: mes } : null),
    [mes]
  );

  const validateMes = () => {
    if (!mes) { setMesError('El mes es obligatorio.'); return false; }
    setMesError(''); return true;
  };
  const validateAnio = () => {
    const n = Number(anio);
    if (anio === '' || !Number.isFinite(n)) { setAnioError('El año es obligatorio.'); return false; }
    if (n < 1990) { setAnioError('El año debe ser mayor o igual a 1990.'); return false; }
    setAnioError(''); return true;
  };
  const validateProducto = () => {
    if (!idProducto) { setProductoError('Selecciona un producto.'); return false; }
    setProductoError(''); return true;
  };
  const validateCantidad = () => {
    const n = Number(cantidad);
    if (cantidad === '' || !Number.isFinite(n)) { setCantidadError('La cantidad es obligatoria.'); return false; }
    if (n < 1) { setCantidadError('La cantidad debe ser un número mayor o igual a 1.'); return false; }
    setCantidadError(''); return true;
  };
  const validatePrecio = () => {
    const n = Number(precioUnitario);
    if (precioUnitario === '' || !Number.isFinite(n)) { setPrecioError('El precio unitario es obligatorio.'); return false; }
    if (n <= 0) { setPrecioError('El precio unitario debe ser mayor a 0.'); return false; }
    setPrecioError(''); return true;
  };
  const validateAll = () =>
    [validateMes(), validateAnio(), validateProducto(), validateCantidad(), validatePrecio()].every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    try {
      setSaving(true);
      await onSubmit({
        mes,
        anio: Number(anio),
        id_producto: Number(idProducto),
        cantidad: Number(cantidad),
        precio_unitario: Number(precioUnitario),
      });
      onClose();
    } catch (err) {
      setPrecioError(err?.message || 'Error al guardar la venta');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={saving ? undefined : onClose} />
      <div className={`relative z-50 w-full max-w-md rounded-xl shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {mode === 'edit' ? 'Editar Compra' : 'Nueva Compra'}
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
              Mes <span className="text-gray-500">*</span>
            </label>

            <Listbox
              value={selectedMes}
              onChange={(opt) => {
                setMes(opt ? opt.label : '');
                if (opt && mesError) setMesError('');
              }}
            >
              <div className="relative">
                <Listbox.Button
                  ref={mesBtnRef}
                  onClick={() => decideDropDirection(mesBtnRef.current, setMesDropUp)}
                  onBlur={validateMes}
                  aria-invalid={Boolean(mesError)}
                  className={`relative w-full cursor-default rounded-lg border px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                    mesError ? 'border-gray-500' : isDark ? 'border-gray-600' : 'border-gray-300'
                  } ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                >
                  <span className="block truncate">
                    {selectedMes ? selectedMes.label : '— Selecciona —'}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                    <ChevronDown size={18} className={isDark ? 'text-gray-300' : 'text-gray-500'} />
                  </span>
                </Listbox.Button>

                <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                  <Listbox.Options
                    className={[
                      'absolute z-50 w-full overflow-auto rounded-lg border shadow-lg focus:outline-none',
                      isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900',
                      mesDropUp ? 'bottom-full mb-1' : 'top-full mt-1',
                      'max-h-[40vh]',
                    ].join(' ')}
                  >
                    {MESES.map((label) => (
                      <Listbox.Option
                        key={label}
                        value={{ label }}
                        className={({ active }) =>
                          `relative cursor-pointer select-none px-3 py-2 text-sm ${
                            active ? (isDark ? 'bg-gray-700' : 'bg-gray-100') : ''
                          }`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                              {label}
                            </span>
                            {selected ? (
                              <span className="absolute inset-y-0 right-3 flex items-center">
                                <Check size={16} />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>

            {mesError && <p className="text-sm text-red-400 mt-1">{mesError}</p>}
          </div>

          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Año <span className="text-gray-500">*</span>
            </label>
            <input
              type="number"
              min="1900"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              onBlur={validateAnio}
              required
              aria-invalid={Boolean(anioError)}
              placeholder="Ingrese el año"
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                anioError ? 'border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'
              } ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
            />
            {anioError && <p className="text-sm text-red-400 mt-1">{anioError}</p>}
          </div>

          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Producto <span className="text-gray-500">*</span>
            </label>

            <Listbox
              value={selectedProduct}
              onChange={(p) => {
                setIdProducto(p ? String(p.id) : '');
                if (p && productoError) setProductoError('');
              }}
            >
              <div className="relative">
                <Listbox.Button
                  ref={prodBtnRef}
                  onClick={() => decideDropDirection(prodBtnRef.current, setProdDropUp)}
                  className={`relative w-full cursor-default rounded-lg border px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                    productoError ? 'border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'
                  } ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                  onBlur={validateProducto}
                  aria-invalid={Boolean(productoError)}
                >
                  <span className="block truncate">
                    {selectedProduct ? `${selectedProduct.nombre}` : '— Selecciona —'}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                    <ChevronDown size={18} className={isDark ? 'text-gray-300' : 'text-gray-500'} />
                  </span>
                </Listbox.Button>

                <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                  <Listbox.Options
                    className={[
                      'absolute z-50 w-full overflow-auto rounded-lg border shadow-lg focus:outline-none',
                      isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900',
                      prodDropUp ? 'bottom-full mb-1' : 'top-full mt-1',
                      'max-h-[40vh]',
                    ].join(' ')}
                  >
                    {productoOptions.length === 0 && (
                      <div className={`px-3 py-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>No hay productos</div>
                    )}
                    {productoOptions.map((p) => (
                      <Listbox.Option
                        key={p.id}
                        value={p}
                        className={({ active }) =>
                          `relative cursor-pointer select-none px-3 py-2 text-sm ${active ? (isDark ? 'bg-gray-700' : 'bg-gray-100') : ''}`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                              {p.nombre}
                            </span>
                            {selected ? (
                              <span className="absolute inset-y-0 right-3 flex items-center">
                                <Check size={16} />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>

            {productoError && <p className="text-sm text-red-400 mt-1">{productoError}</p>}
          </div>

          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Cantidad <span className="text-gray-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              onBlur={validateCantidad}
              required
              aria-invalid={Boolean(cantidadError)}
              placeholder="Ingrese la cantidad"
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                cantidadError ? 'border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'
              } ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
            />
            {cantidadError && <p className="text-sm text-red-400 mt-1">{cantidadError}</p>}
          </div>

          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Precio Unitario <span className="text-gray-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={precioUnitario}
              onChange={(e) => setPrecioUnitario(e.target.value)}
              onBlur={validatePrecio}
              required
              aria-invalid={Boolean(precioError)}
              placeholder="Ingrese el precio unitario"
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                precioError ? 'border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'
              } ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
            />
            {precioError && <p className="text-sm text-red-400 mt-1">{precioError}</p>}
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
              {saving ? 'Guardando…' : (mode === 'edit' ? 'Guardar cambios' : 'Guardar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}