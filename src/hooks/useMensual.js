import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

export default function useMensual(anio) {
  const [data, setData] = useState({ labels: [], compras: [], ventas: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!anio) return;
      setLoading(true);
      setError('');
      try {
        const res = await apiFetch(`/api/reportes/mensual?anio=${anio}`);
        if (alive) setData(res);
      } catch (e) {
        if (alive) setError(e.message || 'Error cargando reporte');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [anio]);

  return { data, loading, error };
}