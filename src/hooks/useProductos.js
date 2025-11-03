import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

/**
 * useProductos: trae productos con paginación y búsqueda.
 * @param {object} params
 *  - page: número de página (1-based)
 *  - limit: items por página
 *  - q: término de búsqueda (opcional)
 *  - refreshKey: clave para forzar el re-fetch (actualizada después de CRUD)
 */
export default function useProductos({ page = 1, limit = 10, q = '', refreshKey }) {
  const [items, setItems]   = useState([]);
  const [total, setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));
        if (q) params.set('q', q);

        const res = await apiFetch(`/api/productos?${params.toString()}`);
        const data = Array.isArray(res) ? res : res?.data || [];
        if (!cancelled) {
          setItems(data);
          setTotal(res?.total ?? data.length);
        }
      } catch (e) {
        if (!cancelled) setError('No se pudo cargar la lista de productos.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [page, limit, q, refreshKey]);

  return { items, total, loading, error };
}