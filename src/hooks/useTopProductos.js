import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

export default function useTopProductos(anio) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true); setError('');
        const qs = anio ? `?anio=${anio}` : '';
        const res = await apiFetch(`/api/reportes/top-productos${qs}`);
        if (alive) setData(res);
      } catch (e) {
        if (alive) setError(e.message || 'Error cargando Top productos');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [anio]);

  return { data, loading, error };
}