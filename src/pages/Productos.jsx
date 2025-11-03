import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { Package, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import useProductos from '../hooks/useProductos';
import useProductosStats from '../hooks/useProductosStats';
import ProductFormModal from '../components/Productos/ProductFormModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { apiFetch } from '../lib/api';

const STOCK_BAJO_UMBRAL = 20;

const Productos = () => {
  const { isDark } = useTheme();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const [refreshKey, setRefreshKey] = useState(0);

  const { items, total, loading, error } = useProductos({ page, limit, q: search, refreshKey });

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const stats = useProductosStats(STOCK_BAJO_UMBRAL, refreshKey);
  const totalProducts = stats.loading ? 0 : stats.total;
  const conStockTotal = stats.loading ? 0 : stats.con_stock;
  const lowStockTotal = stats.loading ? 0 : stats.low_stock;

  const tableHeadClass = `px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`;
  const kpiCardClass = `p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`;

  const onChangeSearch = (e) => {
    setSearch(e.target.value.trimStart());
    setPage(1);
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editing, setEditing] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setModalMode('edit');
    setModalOpen(true);
  };

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const createProduct = async (payload) => {
    try {
      const res = await apiFetch('/api/productos', {
        method: 'POST',
        body: payload,
      });
      toast.success('Producto creado con éxito');
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error('Error al crear el producto');
    }
  };

  const updateProduct = async (id, payload) => {
    try {
      const res = await apiFetch(`/api/productos/${id}`, {
        method: 'PUT',
        body: payload,
      });
      toast.success('Producto actualizado con éxito');
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error('Error al actualizar el producto');
    }
  };

  const deleteProduct = async (id) => {
    try {
      await apiFetch(`/api/productos/${id}`, { method: 'DELETE' });
      toast.success('Producto eliminado con éxito');
      setConfirmDialogOpen(false);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error('Error al eliminar el producto');
    }
  };

  const handleSubmitModal = async (payload) => {
    if (modalMode === 'create') {
      await createProduct(payload);
    } else {
      await updateProduct(editing.id, payload);
    }
  };

  const handleDeleteConfirmation = (id) => {
    setProductToDelete(id);
    setConfirmDialogOpen(true);
  };

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="mb-6">
        <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Productos</h1>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mt-2`}>Administrar Productos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className={kpiCardClass}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm font-medium`}>Total Productos</p>
              <p className={`${isDark ? 'text-white' : 'text-gray-900'} text-2xl font-bold mt-2`}>
                {stats.loading ? '—' : totalProducts.toLocaleString('en-US')}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
              <Package size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className={kpiCardClass}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm font-medium`}>Con stock</p>
              <p className={`${isDark ? 'text-white' : 'text-gray-900'} text-2xl font-bold mt-2`}>
                {stats.loading ? '—' : conStockTotal.toLocaleString('en-US')}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
              <Package size={24} className="text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className={kpiCardClass}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm font-medium`}>
                Stock bajo (&lt; {STOCK_BAJO_UMBRAL})
              </p>
              <p className={`${isDark ? 'text-white' : 'text-gray-900'} text-2xl font-bold mt-2`}>
                {stats.loading ? '—' : lowStockTotal.toLocaleString('en-US')}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900">
              <Package size={24} className="text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-6`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          <div className="w-full md:max-w-md order-2 md:order-1">
            <div className="relative">
              <Search
                size={16}
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              />
              <input
                value={search}
                onChange={onChangeSearch}
                placeholder="Buscar por nombre..."
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 bg-red-400 hover:bg-red-500 text-white font-medium py-2 px-4 rounded-lg transition-colors order-1 md:order-2 self-start md:self-auto"
            onClick={openCreate}
          >
            <Plus size={16} />
            <span>Nuevo</span>
          </button>
          
        </div>
      </div>


      <div className={`rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Lista de Productos</h2>
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
                    <th className={tableHeadClass}>Nombre</th>
                    <th className={tableHeadClass}>Stock</th>
                    <th className={tableHeadClass}>Acciones</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {items.map((p) => (
                    <tr key={p.id} className={`hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                      <td className={`px-6 py-3 text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{p.id}</td>
                      <td className={`px-6 py-3 text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{p.nombre}</td>
                      <td className={`px-6 py-3 text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        <span className={Number(p.stock_cantidad) > 0 ? 'text-green-500' : 'text-red-500'}>
                          {Number(p.stock_cantidad).toLocaleString('en-US')} unidades
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            className={`p-1 rounded ${isDark ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                            onClick={() => openEdit(p)}
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className={`p-1 rounded ${isDark ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-100 text-red-600'}`}
                            onClick={() => handleDeleteConfirmation(p.id)} // Mostrar ConfirmDialog
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
                      <td colSpan="4" className={`px-6 py-6 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        No se encontraron productos
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                Mostrando <span className="font-medium">{from}</span> – <span className="font-medium">{to}</span> de{' '}
                <span className="font-medium">{total.toLocaleString('en-US')}</span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={limit}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                  className={`px-2 py-1 rounded border text-sm ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {[5,10,20,50].map(n => <option key={n} value={n}>{n} / pág</option>)}
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

      <ConfirmDialog
        open={confirmDialogOpen}
        title="Confirmar Eliminación"
        message="¿Estás seguro de que deseas eliminar este producto?"
        onCancel={() => setConfirmDialogOpen(false)} // Cerrar el ConfirmDialog
        onConfirm={() => deleteProduct(productToDelete)} // Eliminar producto
        isDark={isDark}
      />

      <ProductFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        initialData={editing}
        onSubmit={handleSubmitModal}
      />
    </div>
  );
};

export default Productos;