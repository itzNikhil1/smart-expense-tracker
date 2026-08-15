import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  colorScheme = 'brand',
}) => {
  const colorMap = {
    brand: {
      border: 'hover:border-red-500/40',
      iconBg: 'bg-red-500/10 text-red-400 border-red-500/20',
      glow: 'group-hover:opacity-100 bg-red-500/5',
    },
    emerald: {
      border: 'hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      glow: 'group-hover:opacity-100 bg-emerald-500/5',
    },
    blue: {
      border: 'hover:border-blue-500/40',
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      glow: 'group-hover:opacity-100 bg-blue-500/5',
    },
    amber: {
      border: 'hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      glow: 'group-hover:opacity-100 bg-amber-500/5',
    },
  };

  const scheme = colorMap[colorScheme] || colorMap.brand;

  return (
    <div className={`glass-card p-5 relative overflow-hidden group ${scheme.border}`}>
      {/* Background ambient glow on hover */}
      <div className={`absolute inset-0 opacity-0 transition-opacity duration-500 pointer-events-none ${scheme.glow}`} />

      <div className="flex items-center justify-between mb-3 relative z-10">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${scheme.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="relative z-10">
        <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mb-1">
          {value}
        </div>

        <div className="flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 font-semibold ${
                trend === 'up'
                  ? 'text-red-400'
                  : trend === 'down'
                  ? 'text-emerald-400'
                  : 'text-slate-400'
              }`}
            >
              {trend === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
              {trend === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
              {trend === 'neutral' && <Minus className="w-3.5 h-3.5" />}
              {trendValue}
            </span>
          )}
          {subtitle && <span className="text-slate-400">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
