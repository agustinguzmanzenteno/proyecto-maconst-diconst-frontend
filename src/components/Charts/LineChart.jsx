import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend,
} from "chart.js";
import { useTheme } from "../../contexts/ThemeContext";
import { Listbox } from "@headlessui/react";
import { ChevronDown } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LineChart = ({ title, data, year, years, onChangeYear }) => {
  const { isDark } = useTheme();

  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map(d => ({
      label: d.label,
      data: d.data,
      borderColor: d.color,
      backgroundColor: d.color,
      borderWidth: 2,
      fill: false,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 6,
    })),
  };

  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { color: isDark ? "#e5e7eb" : "#374151", usePointStyle: true, padding: 20 },
      },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { grid: { color: isDark ? "#374151" : "#f3f4f6" }, ticks: { color: isDark ? "#9ca3af" : "#6b7280" }},
      y: { grid: { color: isDark ? "#374151" : "#f3f4f6" }, ticks: { color: isDark ? "#9ca3af" : "#6b7280" }},
    },
    interaction: { mode: "nearest", axis: "x", intersect: false },
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
              className={`relative w-full py-2 px-3 rounded-md text-sm text-left border focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <span className="block truncate">Enero - Diciembre {year}</span>
              {/* Icono */}
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
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default LineChart;