import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useTheme } from "../../contexts/ThemeContext";
import { Listbox } from "@headlessui/react";
import { ChevronDown } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

const GrowthChart = ({
  title = "Crecimiento de ventas",
  labels = [],
  sales = [],
  year,
  years = [],
  onChangeYear,
}) => {
  const { isDark } = useTheme();

  const growth = useMemo(() => {
    const arr = Array(12).fill(0);
    for (let i = 0; i < sales.length; i++) {
      const cur = Number(sales[i] || 0);
      const prev = i === 0 ? 0 : Number(sales[i - 1] || 0);
      arr[i] = prev > 0 ? ((cur - prev) / prev) * 100 : 0;
    }
    return arr.map((v) => +v.toFixed(1));
  }, [sales]);

  const data = {
  labels: labels.length ? labels : ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"],
  datasets: [
    {
      type: "bar",
      label: "Ventas",
      data: sales.map((n) => Number(n || 0)),
      backgroundColor: "rgba(236, 72, 153, 0.7)",
      borderWidth: 0,
      yAxisID: "y",
      order: 1,
      categoryPercentage: 0.8,
      barPercentage: 0.8,
      borderSkipped: false,
    },
    {
      type: "line",
      label: "Crecimiento (%)",
      data: growth,
      borderColor: "#ef4444",
      backgroundColor: "#ef4444",
      borderWidth: 4,
      pointRadius: 0,
      pointHoverRadius: 5,
      stepped: true,
      yAxisID: "y1",
      order: 999,
      clip: false,
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  elements: {
    line: { z: 10 },
    point: { radius: 0 },
  },
  scales: {
    y: {
      position: "left",
      grid: { color: isDark ? "#374151" : "#f3f4f6" },
      ticks: { color: isDark ? "#9ca3af" : "#6b7280" },
    },
    y1: {
      position: "right",
      grid: { drawTicks: false, drawOnChartArea: false },
      ticks: {
        display: false,
      },
    },
    x: {
      grid: { color: isDark ? "#374151" : "#f3f4f6" },
      ticks: { color: isDark ? "#9ca3af" : "#6b7280" },
    },
  },
  plugins: {
    legend: {
      labels: {
        color: isDark ? "#e5e7eb" : "#374151",
        usePointStyle: true,
        padding: 16,
      },
    },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          const ds = ctx.dataset;
          if (ds.type === "bar") {
            const v = Number(ctx.parsed.y || 0).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
            return ` Ventas: ${v} Bs.`;
          }
          const v = Number(ctx.parsed.y || 0).toFixed(1);
          return ` Crecimiento: ${v}%`;
        },
      },
    },
  },
};

  return (
    <div className={`p-6 rounded-xl ${isDark ? "bg-gray-800" : "bg-white"} shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
          {title}
        </h3>

        <div className="relative w-56">
          <Listbox value={year} onChange={onChangeYear}>
            <Listbox.Button
              className={`relative w-full py-2 px-3 rounded-md text-sm text-left border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <span className="block truncate">Enero - Diciembre {year}</span>
              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <ChevronDown size={16} className={isDark ? "text-gray-300" : "text-gray-500"} />
              </span>
            </Listbox.Button>
            <Listbox.Options
              className={`absolute mt-1 max-h-60 w-full overflow-auto rounded-md shadow-lg z-50 border ${
                isDark ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-200"
              }`}
            >
              {years.map((y) => (
                <Listbox.Option
                  key={y}
                  value={y}
                  className={({ active }) =>
                    `cursor-pointer select-none py-2 px-4 ${
                      active ? (isDark ? "bg-gray-600" : "bg-gray-200") : ""
                    }`
                  }
                >
                  Enero - Diciembre {y}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Listbox>
        </div>
      </div>

      <div className="h-80">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default GrowthChart;