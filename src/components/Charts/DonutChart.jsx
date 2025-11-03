import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useTheme } from '../../contexts/ThemeContext';
ChartJS.register(ArcElement, Tooltip, Legend);

const money = (n) => {
  const num = Number(n) || 0;
  const hasDecimals = Math.floor(num) !== num;
  const opts = hasDecimals
    ? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    : { maximumFractionDigits: 0 };
  return `${num.toLocaleString('en-US', opts)} Bs.`;
};

const DonutChart = ({ title, data }) => {
  const { isDark } = useTheme();
  const amounts = data.amounts || [];

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.values,
        backgroundColor: data.colors,
        borderWidth: 0,
        cutout: '60%',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const i = ctx.dataIndex;
            const pct = ctx.parsed ?? 0;
            const amt = amounts[i] != null ? ` • ${money(amounts[i])}` : '';
            return `${ctx.label}: ${pct}%${amt}`;
          },
        },
      },
    },
  };

  return (
    <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>

      <div className="flex items-center space-x-6">
        <div className="w-48 h-48">
          <Doughnut data={chartData} options={options} />
        </div>

        <div className="space-y-3">
          {data.labels.map((label, i) => (
            <div key={label} className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: data.colors[i] }}
              />
              <div className="flex-1">
                <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {label}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {data.values[i]}%{amounts[i] != null ? ` - ${money(amounts[i])}` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DonutChart;