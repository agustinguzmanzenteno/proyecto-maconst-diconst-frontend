import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Edit, Trash2, Search, RefreshCw, LineChart as LineIcon } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from '../contexts/ThemeContext';
import { apiMongoFetch as apiFetch, extractMongoId } from '../lib/apiMongo';
import PronosticoFormModal from '../components/Pronostico/PronosticoFormModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import LineChart from '../components/Charts/LineChart';

const fmtDate = (v) => (v ? new Date(v).toISOString().slice(0, 10) : '—');
const MESES_CORTOS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function buildChartData(doc, year) {
  const yhat = new Array(12).fill(null);
  const low  = new Array(12).fill(null);
  const up   = new Array(12).fill(null);

  (doc?.predicciones || []).forEach(pt => {
    const d = new Date(pt.fecha);
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth();
    if (y === year) {
      yhat[m] = pt.pronostico ?? null;
      low[m]  = pt.limite_inferior ?? null;
      up[m]   = pt.limite_superior ?? null;
    }
  });

  return {
    labels: MESES_CORTOS,
    datasets: [
      { label: 'Predicción', data: yhat, color: '#2563eb', spanGaps: true },
      { label: 'Límite inferior', data: low, color: '#16a34a', spanGaps: true },
      { label: 'Límite superior', data: up, color: '#ef4444', spanGaps: true },
    ],
  };
}

const Pronosticos = () => {
  const { isDark } = useTheme();

  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [current, setCurrent] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const [graphDoc, setGraphDoc] = useState(null);
  const [graphYear, setGraphYear] = useState(null);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const slice = useMemo(() => {
    const start = (page - 1) * limit;
    return items.slice(start, start + limit);
  }, [items, page, limit]);

  const fetchList = async () => {
    try {
      setLoading(true);
      setErr('');
      const params = new URLSearchParams();
      if (desde) params.append('desde', desde);
      if (hasta) params.append('hasta', hasta);
      const data = await apiFetch(`/api/predecir?${params.toString()}`);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setErr('No se pudo cargar el listado de predicciones');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  const openCreate = () => {
    setCurrent(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const openEdit = (doc) => {
    setCurrent(doc);
    setModalMode('regenerate');
    setModalOpen(true);
  };

const onSubmitModal = async (payload) => {
  try {
    if (modalMode === 'create') {
      await apiFetch('/api/predecir', { method: 'POST', body: payload, noThrow: true });
      toast.success('Predicción creada exitosamente');
    } else if (modalMode === 'regenerate') {
      const safeId = extractMongoId(current?._id);
      if (!/^[a-fA-F0-9]{24}$/.test(safeId)) {
        console.warn('ID de predicción con formato raro:', safeId);
      }

      const body = {
        nombre: payload.nombre,
        notas: payload.notas,
        regenerar: {
          frecuencia: payload?.regenerar?.frecuencia ?? 'MS',
          regresores: Array.isArray(payload?.regenerar?.regresores) ? payload.regenerar.regresores : [],
          desde: payload?.regenerar?.desde,
          hasta: payload?.regenerar?.hasta,
          ...(Number.isFinite(payload?.regenerar?.periodos) ? { periodos: payload.regenerar.periodos } : {})
        }
      };

      await apiFetch(`/api/predecir/${encodeURIComponent(safeId)}`, { method: 'PUT', body, noThrow: true });
      toast.success('Predicción actualizada exitosamente');
    }
  } catch (e) {
    console.warn('Actualizar/crear predicción (ignorado):', e);
  } finally {
    setModalOpen(false);
    await fetchList();
    if (graphDoc) setGraphDoc(null);
  }
};

const onDelete = async () => {
  try {
    const id = extractMongoId(toDelete);
    await apiFetch(`/api/predecir/${encodeURIComponent(id)}`, { method: 'DELETE', noThrow: true });

    toast.success('Predicción eliminada');
  } catch (e) {
    console.warn('Eliminar predicción (ignorado):', e);
  } finally {
    setConfirmOpen(false);
    setToDelete(null);
    await fetchList();
    if (graphDoc && extractMongoId(graphDoc._id) === toDelete) closeGraph();
  }
};

  const askDelete = (id) => { setToDelete(id); setConfirmOpen(true); };

  const openGraph = (doc) => {
    setGraphDoc(doc);
    const years = Array.from(
      new Set((doc.predicciones || []).map(pt => new Date(pt.fecha).getUTCFullYear()))
    ).sort((a,b) => a - b);
    setGraphYear(years[0] || new Date().getUTCFullYear());
  };

  const closeGraph = () => { setGraphDoc(null); setGraphYear(null); };

  const yearsForDoc = useMemo(() => {
    if (!graphDoc) return [];
    return Array.from(
      new Set((graphDoc.predicciones || []).map(pt => new Date(pt.fecha).getUTCFullYear()))
    ).sort((a,b) => a - b);
  }, [graphDoc]);

  const tableHeadClass = `px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`;

  const chartData = useMemo(() => {
    if (!graphDoc || !graphYear) return null;
    return buildChartData(graphDoc, Number(graphYear));
  }, [graphDoc, graphYear]);

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <ToastContainer position="top-right" autoClose={3000} theme={isDark ? 'dark' : 'light'} pauseOnHover />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Predicciones</h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mt-2`}>Administrar predicciones</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-red-400 hover:bg-red-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <Plus size={16} /> Nuevo
        </button>
      </div>

      <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <form
          onSubmit={(e) => { e.preventDefault(); setPage(1); fetchList(); }}
          className="grid grid-cols-1 md:grid-cols-5 gap-3"
        >
          <div>
            <label className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm`}>Creado desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              style={{ colorScheme: isDark ? 'dark' : 'light' }} 
              className={`mt-1 w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            />
          </div>
          <div>
            <label className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm`}>Creado hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              style={{ colorScheme: isDark ? 'dark' : 'light' }}
              className={`mt-1 w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            />
          </div>

          <div className="flex items-end">
            <button type="submit" className="w-full inline-flex items-center justify-center gap-2 bg-red-400 hover:bg-red-500 text-white font-medium py-2 px-4 rounded-lg">
              <Search size={16} /> Buscar
            </button>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => { setDesde(''); setHasta(''); setPage(1); fetchList(); }}
              className={`w-full inline-flex items-center justify-center gap-2 font-medium py-2 px-4 rounded-lg ${
                isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              Limpiar
            </button>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={fetchList}
              className={`w-full inline-flex items-center justify-center gap-2 font-medium py-2 px-4 rounded-lg ${
                isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              <RefreshCw size={16} /> Refrescar
            </button>
          </div>
        </form>
      </div>

      <div className={`rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Lista de Predicciones</h2>
        </div>

        {loading ? (
          <div className={`p-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Cargando…</div>
        ) : err ? (
          <div className="p-6 text-red-600 dark:text-red-400">{err}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={tableHeadClass}>Nombre</th>
                    <th className={tableHeadClass}>Frecuencia</th>
                    <th className={tableHeadClass}>Períodos</th>
                    <th className={tableHeadClass}>Desde</th>
                    <th className={tableHeadClass}>Hasta</th>
                    <th className={tableHeadClass}>Creado</th>
                    <th className={tableHeadClass}>Acciones</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {slice.map((p) => (
                    <tr key={p._id} className={`hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                      <td className={`px-6 py-3 text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{p.nombre || '—'}</td>
                      <td className={`px-6 py-3 text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{p.frecuencia}</td>
                      <td className={`px-6 py-3 text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{p.periodos ?? '—'}</td>
                      <td className={`px-6 py-3 text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{fmtDate(p.desde)}</td>
                      <td className={`px-6 py-3 text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{fmtDate(p.hasta)}</td>
                      <td className={`px-6 py-3 text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{fmtDate(p.creadoEn)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {/* Único botón de editar */}
                          <button
                            onClick={() => openEdit(p)}
                            className={`p-1 rounded ${isDark ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                            title="Editar pronóstico"
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            onClick={() => graphDoc?._id === p._id ? closeGraph() : openGraph(p)}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded ${
                              isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                            }`}
                            title={graphDoc?._id === p._id ? 'Ocultar gráfico' : 'Ver gráfico'}
                          >
                            <LineIcon size={16} />
                            {graphDoc?._id === p._id ? 'Ocultar' : 'Ver gráfico'}
                          </button>

                          <button
                            onClick={() => askDelete(p._id)}
                            className={`p-1 rounded ${isDark ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-100 text-red-600'}`}
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {slice.length === 0 && (
                    <tr>
                      <td colSpan="8" className="px-6 py-6 text-center text-gray-600">No se encontraron pronósticos</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                Mostrando <span className="font-medium">{total}</span> registros
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={limit}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                  className={`px-2 py-1 rounded border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  {[5,10,20,50,100].map(n => <option key={n} value={n}>{n} / pág</option>)}
                </select>
                <button onClick={() => setPage(1)} disabled={page===1}
                  className={`px-3 py-1 rounded border text-sm ${page===1?'opacity-50 cursor-not-allowed':''} ${isDark ? 'bg-gray-700 border-gray-600 text-white':'bg-white border-gray-300 text-gray-900'}`}>«</button>
                <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                  className={`px-3 py-1 rounded border text-sm ${page===1?'opacity-50 cursor-not-allowed':''} ${isDark ? 'bg-gray-700 border-gray-600 text-white':'bg-white border-gray-300 text-gray-900'}`}>‹</button>
                <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm`}>
                  Página <strong>{page}</strong> de <strong>{totalPages}</strong>
                </span>
                <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                  className={`px-3 py-1 rounded border text-sm ${page===totalPages?'opacity-50 cursor-not-allowed':''} ${isDark ? 'bg-gray-700 border-gray-600 text-white':'bg-white border-gray-300 text-gray-900'}`}>›</button>
                <button onClick={() => setPage(totalPages)} disabled={page===totalPages}
                  className={`px-3 py-1 rounded border text-sm ${page===totalPages?'opacity-50 cursor-not-allowed':''} ${isDark ? 'bg-gray-700 border-gray-600 text-white':'bg-white border-gray-300 text-gray-900'}`}>»</button>
              </div>
            </div>
          </>
        )}
      </div>

      {graphDoc && chartData && (
        <div className="mt-6 relative">

          <LineChart
            title={`${graphDoc.nombre || 'Pronóstico'}`}
            data={chartData}
            year={graphYear}
            years={yearsForDoc}
            onChangeYear={setGraphYear}
          />
        </div>
      )}

      <PronosticoFormModal
        open={modalOpen}
        mode={modalMode}
        initialData={current}
        onClose={() => setModalOpen(false)}
        onSubmit={onSubmitModal}
        isDarkParent={isDark}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Confirmar Eliminación"
        message="¿Deseas eliminar esta predicción?"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={onDelete}
        isDark={isDark}
      />
    </div>
  );
};

export default Pronosticos;