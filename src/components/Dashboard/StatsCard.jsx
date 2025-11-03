import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const StatsCard = ({ title, value, change, trend, icon: Icon, color }) => {
  const { isDark } = useTheme();

  return (
    <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg hover:shadow-xl transition-shadow duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          <div className="flex items-center mt-2">
            {trend === 'up' ? (
              <TrendingUp size={16} className="text-green-500 mr-1" />
            ) : (
              <TrendingDown size={16} className="text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${
              trend === 'up' ? 'text-green-500' : 'text-red-500'
            }`}>
              {change}
            </span>
          </div>
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon size={24} className={`text-${color}-600`} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;