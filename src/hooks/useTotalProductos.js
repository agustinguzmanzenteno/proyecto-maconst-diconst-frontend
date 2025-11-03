import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

export default function useTotalProductos() {
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true); setError('');
        const res = await apiFetch('/api/reportes/total-productos');
        if (alive) setTotal(res.total_productos ?? 0);
      } catch (e) {
        if (alive) setError(e.message || 'Error cargando total de productos');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return { total, loading, error };
}