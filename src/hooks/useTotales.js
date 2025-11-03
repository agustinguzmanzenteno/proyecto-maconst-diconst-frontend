import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

export default function useTotales(desde, hasta) {
  const [data, setData] = useState({ total_compras: 0, total_ventas: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const qs = new URLSearchParams({
          ...(desde ? { desde: String(desde) } : {}),
          ...(hasta ? { hasta: String(hasta) } : {}),
        }).toString();

        const res = await apiFetch(`/api/reportes/totales?${qs}`);
        if (alive) setData(res);
      } catch (e) {
        if (alive) setError(e.message || 'Error cargando totales');
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [desde, hasta]);

  return { data, loading, error };
}