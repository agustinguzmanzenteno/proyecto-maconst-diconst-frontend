import React, { useEffect, useState, Fragment, useRef, useMemo } from 'react';
import { DollarSign, ShoppingCart, Edit, Trash2, Search, Plus, ChevronDown, Check, FileText } from 'lucide-react';
import { Listbox, Transition } from '@headlessui/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from '../contexts/ThemeContext';
import { apiFetch } from '../lib/api';
import CompraFormModal from '../components/Compras/CompraFormModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const MESES = [
  'ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO',
  'JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'
];

const Compras = () => {
  const { isDark } = useTheme();

  const [mes, setMes] = useState('');
  const [anio, setAnio] = useState('');
  const [idProducto, setIdProducto] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [ingresosTotales, setIngresosTotales] = useState(0);
  const [totalCompras, setTotalCompras] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [productos, setProductos] = useState([]);

  const [refreshKey, setRefreshKey] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editing, setEditing] = useState(null);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [compraToDelete, setCompraToDelete] = useState(null);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const fmtNum = (n) =>
    Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const fetchTotales = async () => {
    try {
      const res = await apiFetch('/api/compras/totales');
      setTotalCompras(res.totalCompras);
      setIngresosTotales(res.totalIngresos);
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar los totales');
    }
  };

  useEffect(() => {
    const fetchCompras = async () => {
      try {
        setLoading(true);
        setError('');

        const params = new URLSearchParams();
        if (mes) params.append('mes', mes);
        if (anio) params.append('anio', anio);
        if (idProducto) params.append('id_producto', idProducto);
        params.append('page', String(page));
        params.append('limit', String(limit));

        const res = await apiFetch(`/api/compras?${params.toString()}`);
        setItems(res.data);
        setTotal(res.total ?? 0);
      } catch (e) {
        console.error(e);
        setError('No se pudo cargar el listado de compras');
        setItems([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetchCompras();
    fetchTotales();
  }, [mes, anio, idProducto, page, limit, refreshKey]);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await apiFetch('/api/productos/all');
        setProductos(res.data);
      } catch (e) {
        console.error(e);
        setError('No se pudieron cargar los productos');
      }
    };
    fetchProductos();
  }, []);

  const onBuscar = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const openEdit = (v) => {
    setEditing(v);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDeleteConfirmation = (id) => {
    setCompraToDelete(id);
    setConfirmDialogOpen(true);
  };

  const deleteCompra = async (id) => {
    try {
      await apiFetch(`/api/compras/${id}`, { method: 'DELETE' });
      toast.success('Compra eliminada con éxito');
      setConfirmDialogOpen(false);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error(err?.message || 'Error al eliminar la compra');
    }
  };

  const handleSubmitModal = async (payload) => {
    try {
      if (modalMode === 'create') {
        await apiFetch('/api/compras', { method: 'POST', body: payload });
        toast.success('Compra creada con éxito');
      } else {
        await apiFetch(`/api/compras/${editing.id}`, { method: 'PUT', body: payload });
        toast.success('Compra actualizada con éxito');
      }
      setRefreshKey((k) => k + 1);
      setModalOpen(false);
    } catch (err) {
      toast.error(err?.message || 'Error al guardar la compra');
    }
  };

  const tableHeadClass = `px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`;

  const selectedMes = useMemo(() => (mes ? { label: mes } : null), [mes]);

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <ToastContainer position="top-right" autoClose={3000} theme={isDark ? 'dark' : 'light'} pauseOnHover />

      <div className="mb-6">
        <h1 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Compras</h1>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mt-2`}>Listado de compras</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm font-medium`}>Egresos Totales</p>
              <p className={`${isDark ? 'text-white' : 'text-gray-900'} text-2xl font-bold mt-2`}>
                {fmtNum(ingresosTotales)} Bs.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
              <DollarSign size={24} className="text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm font-medium`}>Compras Totales</p>
              <p className={`${isDark ? 'text-white' : 'text-gray-900'} text-2xl font-bold mt-2`}>
                {totalCompras.toLocaleString('en-US')}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
              <FileText size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      <form
        onSubmit={onBuscar}
        className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-6`}
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm`}>Mes</label>
            <Listbox
              value={selectedMes}
              onChange={(opt) => { setMes(opt ? opt.label : ''); setPage(1); }}
            >
              <div className="relative mt-1">
                <Listbox.Button
                  className={`relative w-full cursor-default rounded-lg border px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
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
                    className={`absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border shadow-lg focus:outline-none ${
                      isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
                    }`}
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
          </div>

          <div>
            <label className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm`}>Año</label>
            <input
              value={anio}
              onChange={(e) => { setAnio(e.target.value); setPage(1); }}
              type="number"
              min="1900"
              placeholder="Buscar por año..."
              className={`mt-1 w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-red-400 hover:bg-red-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <Search size={16} /> Buscar
            </button>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => { setMes(''); setAnio(''); setIdProducto(''); setPage(1); }}
              className={`w-full inline-flex items-center justify-center gap-2 font-medium py-2 px-4 rounded-lg transition-colors ${
                isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              Limpiar
            </button>
          </div>

          <div className="flex items-end justify-end">
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-red-400 hover:bg-red-500 text-white font-medium py-2 px-4 rounded-lg transition-colors w-full md:w-auto"
            >
              <Plus size={16} />
              Nuevo
            </button>
          </div>
        </div>
      </form>

      <div className={`rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Historial de Compras</h2>
        </div>

        {loading ? (
          <div className={`p-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Cargando…</div>
        ) : error ? (
          <div className="p-6 text-red-600 dark:text-red-400">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={tableHeadClass}>ID</th>
                    <th className={tableHeadClass}>Mes</th>
                    <th className={tableHeadClass}>Año</th>
                    <th className={tableHeadClass}>ID Producto</th>
                    <th className={tableHeadClass}>Cantidad</th>
                    <th className={tableHeadClass}>Precio Unit.</th>
                    <th className={tableHeadClass}>Precio Total</th>
                    <th className={tableHeadClass}>Acciones</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {items.map((c) => (
                    <tr key={c.id} className={`hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                      <td className={`px-6 py-3 text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{c.id}</td>
                      <td className={`px-6 py-3 text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{c.mes}</td>
                      <td className={`px-6 py-3 text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{c.anio}</td>
                      <td className={`px-6 py-3 text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{c.id_producto}</td>
                      <td className={`px-6 py-3 text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{c.cantidad}</td>
                      <td className={`px-6 py-3 text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{fmtNum(c.precio_unitario)} Bs.</td>
                      <td className={`px-6 py-3 text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{fmtNum(c.precio_total)} Bs.</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEdit(c)}
                            className={`p-1 rounded ${isDark ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteConfirmation(c.id)}
                            className={`p-1 rounded ${isDark ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-100 text-red-600'}`}
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {items.length === 0 && (
                    <tr>
                      <td colSpan="9" className="px-6 py-6 text-center text-gray-600">No se encontraron compras</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                Mostrando <span className="font-medium">{from}</span> – <span className="font-medium">{to}</span> de{' '}
                <span className="font-medium">{total.toLocaleString('es-BO')}</span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={limit}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                  className={`px-2 py-1 rounded border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  {[5,10,20,50,100].map(n => <option key={n} value={n}>{n} / pág</option>)}
                </select>

                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className={`px-3 py-1 rounded border text-sm ${page===1 ? 'opacity-50 cursor-not-allowed' : ''} ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  «
                </button>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`px-3 py-1 rounded border text-sm ${page===1 ? 'opacity-50 cursor-not-allowed' : ''} ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  ‹
                </button>
                <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm`}>
                  Página <strong>{page}</strong> de <strong>{totalPages}</strong>
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`px-3 py-1 rounded border text-sm ${page===totalPages ? 'opacity-50 cursor-not-allowed' : ''} ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  ›
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className={`px-3 py-1 rounded border text-sm ${page===totalPages ? 'opacity-50 cursor-not-allowed' : ''} ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  »
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <CompraFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        initialData={editing}
        onSubmit={handleSubmitModal}
        productos={productos}
        isDarkParent={isDark}
      />

      <ConfirmDialog
        open={confirmDialogOpen}
        title="Confirmar Eliminación"
        message="¿Estás seguro de que deseas eliminar esta compra?"
        onCancel={() => setConfirmDialogOpen(false)}
        onConfirm={() => deleteCompra(compraToDelete)}
        isDark={isDark}
      />
    </div>
  );
};

export default Compras;