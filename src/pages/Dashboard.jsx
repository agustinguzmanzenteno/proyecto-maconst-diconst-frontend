import React, { useMemo, useState } from 'react';
import { ShoppingBag, DollarSign, Users, Package, FileText } from 'lucide-react';
import StatsCard from '../components/Dashboard/StatsCard';
import DonutChart from '../components/Charts/DonutChart';
import LineChart from '../components/Charts/LineChart';
import GrowthChart from '../components/Charts/GrowthChart';
import useMensual from '../hooks/useMensual';
import useTotales from '../hooks/useTotales';
import useTotalProductos from '../hooks/useTotalProductos';
import useTopProductos from '../hooks/useTopProductos';
import { useTheme } from '../contexts/ThemeContext';

const buildYears = (from = 1992, to = 2025) => {
  const arr = [];
  for (let y = to; y >= from; y--) arr.push(y);
  return arr;
};

const formatCurrency = (n) => {
  const num = Number(n) || 0;
  const hasDecimals = Math.floor(num) !== num;
  const opts = hasDecimals
    ? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    : { maximumFractionDigits: 0 };

  return `${num.toLocaleString('en-US', opts)} Bs.`;
};

const calcTotals = (arr = []) => {
  const data = Array.isArray(arr) ? arr : [];
  const total = data.reduce((a, b) => a + (Number(b) || 0), 0);

  let lastIdx = data.length - 1;
  while (lastIdx >= 0 && !Number(data[lastIdx])) lastIdx--;
  const last = lastIdx >= 0 ? Number(data[lastIdx]) : 0;

  let prevIdx = lastIdx - 1;
  while (prevIdx >= 0 && !Number(data[prevIdx])) prevIdx--;
  const prev = prevIdx >= 0 ? Number(data[prevIdx]) : 0;

  let changePct = 0;
  if (prev > 0) changePct = ((last - prev) / prev) * 100;
  const trend = last >= prev ? 'up' : 'down';

  return { total, changePct, trend };
};

const money = (n) => {
  const num = Number(n) || 0;
  const hasDecimals = Math.floor(num) !== num;
  const opts = hasDecimals
    ? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    : { maximumFractionDigits: 0 };
  return `${num.toLocaleString('en-US', opts)} Bs.`;
};


const Dashboard = () => {
  const YEARS = useMemo(() => buildYears(1992, 2025), []);
  const [year, setYear] = useState(YEARS[0]);

  const { data: rep, loading, error } = useMensual(year);

  const GLOBAL_FROM = 1992;
  const GLOBAL_TO   = 2025;
  const { data: tot, loading: loadingTot } = useTotales(GLOBAL_FROM, GLOBAL_TO);

  const { total: totalProductos, loading: loadingTP } = useTotalProductos();
  const formatInt = (n) => (Number(n) || 0).toLocaleString('en-US');

  const utilidad = (tot?.total_ventas || 0) - (tot?.total_compras || 0);
const margen   = (tot?.total_ventas || 0) > 0
  ? (utilidad / tot.total_ventas) * 100
  : 0;

  const lineData = useMemo(() => {
    return {
      labels: rep.labels.length ? rep.labels : ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
      datasets: [
        { label: 'Ventas',  data: rep.ventas  || Array(12).fill(0), color: '#eab308' },
        { label: 'Compras', data: rep.compras || Array(12).fill(0), color: '#06b6d4' },
      ],
    };
  }, [rep]);
  const countryData = {
    labels: ['United States of America', 'China', 'Japan', 'Australia', 'India', 'Russian Federation'],
    values: [25, 20, 17, 15, 10, 8],
    colors: ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#f97316']
  };

const ventasStats  = useMemo(() => calcTotals(rep.ventas),  [rep.ventas]);
const comprasStats = useMemo(() => calcTotals(rep.compras), [rep.compras]);

  const revenueData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [
      {
        label: 'Ventas',
        data: [37, 35, 29, 27, 24, 18, 15, 12, 10, 8, 6, 5],
        color: '#eab308'
      },
      {
        label: 'Ingresos',
        data: [31, 32, 37, 38, 22, 28, 20, 18, 15, 12, 10, 8],
        color: '#06b6d4'
      },
      {
        label: 'Gastos',
        data: [21, 8, 11, 3, 19, 7, 6, 5, 4, 3, 2, 1],
        color: '#f87171'
      },
      {
        label: 'Clientes',
        data: [48, 32, 35, 21, 47, 29, 25, 22, 20, 18, 15, 12],
        color: '#3b82f6'
      }
    ]
  };

  const { isDark } = useTheme();

const { data: top, loading: loadingTop } = useTopProductos(null);

const donutColors = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6'];

const donutData = useMemo(() => {
  const labels  = top.map(p => p.nombre);
  const amounts = top.map(p => Number(p.total_bs) || 0);

  const grand = Number(tot?.total_ventas) || amounts.reduce((a,b)=>a+b,0);
  const values = grand > 0
    ? amounts.map(v => +(v / grand * 100).toFixed(2))
    : amounts.map(() => 0);

  return {
    labels,
    values,
    colors: donutColors,
    amounts,
  };
}, [top, tot?.total_ventas]);

const dotColors = ['bg-blue-500','bg-pink-500','bg-amber-500','bg-green-500','bg-violet-500'];

  return (
    <div className={`p-6 space-y-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Total Compras"
          value={loadingTot ? 'Cargando…' : formatCurrency(tot.total_compras)}
          change=""
          trend="up"
          icon={FileText}
          color="blue"
        />
        <StatsCard
          title="Total Ventas"
          value={loadingTot ? 'Cargando…' : formatCurrency(tot.total_ventas)}
          change=""
          trend="up"
          icon={ShoppingBag}
          color="orange"
        />
        <StatsCard
          title="Total Utilidad Bruta"
          value={loadingTot ? 'Cargando…' : formatCurrency(utilidad)}
          change={loadingTot ? '' : `${margen >= 0 ? '+' : ''}${margen.toFixed(1)}% margen`}
          trend={utilidad >= 0 ? 'up' : 'down'}
          icon={DollarSign}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonutChart title="Participación de ventas (Top Productos)"
          data={donutData}
        />

        <div className="relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <span className="text-sm text-gray-500 bg-white/70 dark:bg-gray-800/70 px-3 py-1 rounded">
                Cargando…
              </span>
            </div>
          )}
          {error && (
            <div className="p-4 mb-4 rounded bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200">
              {error}
            </div>
          )}
          <LineChart
            title="Ventas vs. Compras mensuales"
            data={lineData}
            year={year}
            years={YEARS}
            onChangeYear={setYear}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GrowthChart
            title="Crecimiento de ventas"
            labels={rep.labels || ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']}
            sales={rep.ventas || Array(12).fill(0)}
            year={year}
            years={YEARS}
            onChangeYear={setYear}
          />
        </div>

        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Top Productos más vendidos
          </h3>

          {loadingTop ? (
            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Cargando…</div>
          ) : top.length === 0 ? (
            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Sin datos.</div>
          ) : (
            <div className="space-y-4">
              {top.map((p, idx) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`w-3 h-3 rounded-full ${dotColors[idx % dotColors.length]}`} />
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {p.nombre}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {p.unidades.toLocaleString('en-US')} uds.
                    </span>
                    <span className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {money(p.total_bs)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;