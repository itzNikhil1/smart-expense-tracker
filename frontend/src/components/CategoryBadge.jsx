import React from 'react';
import {
  Utensils,
  Plane,
  Receipt,
  ShoppingBag,
  HeartPulse,
  MoreHorizontal,
} from 'lucide-react';

export const CATEGORY_CONFIG = {
  Food: {
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    hex: '#f59e0b',
    icon: Utensils,
  },
  Travel: {
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    hex: '#3b82f6',
    icon: Plane,
  },
  Bills: {
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    hex: '#ef4444',
    icon: Receipt,
  },
  Shopping: {
    color: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
    hex: '#ec4899',
    icon: ShoppingBag,
  },
  Health: {
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    hex: '#10b981',
    icon: HeartPulse,
  },
  Other: {
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    hex: '#8b5cf6',
    icon: MoreHorizontal,
  },
};

const CategoryBadge = ({ category, size = 'md', showIcon = true }) => {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Other;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.color} ${sizeClasses[size] || sizeClasses.md}`}
    >
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{category}</span>
    </span>
  );
};

export default CategoryBadge;
