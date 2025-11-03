import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

export default function useProductosStats(umbral = 20, refreshKey) {
  const [data, setData] = useState({ total: 0, con_stock: 0, low_stock: 0, umbral });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    setData({ total: 0, con_stock: 0, low_stock: 0, umbral });

    (async () => {
      try {
        const u = Number.isFinite(umbral) ? umbral : 20;
        const res = await apiFetch(`/api/productos/stats?umbral=${u}`);
        if (!alive) return;
        setData({
          total: res.total ?? 0,
          con_stock: res.con_stock ?? 0,
          low_stock: res.low_stock ?? 0,
          umbral: res.umbral ?? u,
        });
      } catch (e) {
        if (!alive) return;
        setError('No se pudieron cargar las estadísticas.');
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [umbral, refreshKey]);

  return { ...data, loading, error };
}