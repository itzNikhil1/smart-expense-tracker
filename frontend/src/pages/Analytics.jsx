import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCurrency } from '../context/CurrencyContext';
import CategoryBadge, { CATEGORY_CONFIG } from '../components/CategoryBadge';
import {
  PieChart as PieIcon,
  TrendingUp,
  DollarSign,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Loader2,
  BarChart3,
  Percent,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts';

const Analytics = () => {
  const { currency, formatAmount } = useCurrency();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState('allTime'); // 'allTime' | 'currentMonth'

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/summary');
        if (res.data.success) {
          setAnalyticsData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const askAiAboutAnalytics = () => {
    navigate('/chat', {
      state: {
        initialPrompt:
          'Can you analyze my monthly spending trend and category breakdown, and tell me where I am overspending?',
        timestamp: Date.now(),
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
        <p className="text-sm font-medium text-slate-400">
          Running MongoDB Aggregation Pipelines...
        </p>
      </div>
    );
  }

  const currentMonth = analyticsData?.currentMonth || {
    totalSpend: 0,
    prevMonthSpend: 0,
    transactionCount: 0,
    avgPerTransaction: 0,
    momPercentage: 0,
  };

  const allTime = analyticsData?.allTime || {
    totalSpend: 0,
    transactionCount: 0,
    avgPerTransaction: 0,
  };

  const categoryList =
    activeCategoryTab === 'allTime'
      ? analyticsData?.categoryBreakdown || []
      : analyticsData?.currentMonthCategoryBreakdown || [];

  const totalCategorySum = categoryList.reduce((sum, item) => sum + item.totalAmount, 0);

  const monthlyTrends = analyticsData?.monthlyTrends || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Financial Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Aggregated metrics, category distributions, and multi-month velocity graphs ({currency.code}).
          </p>
        </div>

        <button
          onClick={askAiAboutAnalytics}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-red-400" />
          <span>Ask AI to Optimize Budget</span>
        </button>
      </div>

      {/* High-Level Comparison KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-5 border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span>This Month Spend</span>
            <DollarSign className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-white mb-2">
            {formatAmount(currentMonth.totalSpend)}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {currentMonth.momPercentage >= 0 ? (
              <span className="text-rose-400 font-semibold flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +{currentMonth.momPercentage}%
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold flex items-center">
                <ArrowDownRight className="w-3.5 h-3.5" /> {currentMonth.momPercentage}%
              </span>
            )}
            <span className="text-slate-400">vs last month</span>
          </div>
        </div>

        <div className="glass-card p-5 border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span>Previous Month</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-white mb-2">
            {formatAmount(currentMonth.prevMonthSpend)}
          </div>
          <div className="text-xs text-slate-400">
            Baseline for MoM comparison
          </div>
        </div>

        <div className="glass-card p-5 border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span>All-Time Spend</span>
            <Layers className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-white mb-2">
            {formatAmount(allTime.totalSpend)}
          </div>
          <div className="text-xs text-slate-400">
            Across {allTime.transactionCount} lifetime expenses
          </div>
        </div>

        <div className="glass-card p-5 border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span>Avg Spend / Item</span>
            <Percent className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-white mb-2">
            {formatAmount(allTime.avgPerTransaction)}
          </div>
          <div className="text-xs text-slate-400">
            Calculated via Mongo $avg pipeline
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Chart */}
        <div className="glass-card p-6 border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-red-400" />
                  <span>Category-Wise Breakdown</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Distribution of expenses by category (Recharts Pie Chart)
                </p>
              </div>

              {/* Toggle Switch */}
              <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs self-start">
                <button
                  onClick={() => setActiveCategoryTab('allTime')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    activeCategoryTab === 'allTime'
                      ? 'bg-red-600 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All-Time
                </button>
                <button
                  onClick={() => setActiveCategoryTab('currentMonth')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    activeCategoryTab === 'currentMonth'
                      ? 'bg-red-600 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  This Month
                </button>
              </div>
            </div>

            {categoryList.length === 0 ? (
              <div className="h-72 flex items-center justify-center text-slate-500 text-xs">
                No expense records available for this period.
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryList}
                      dataKey="totalAmount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      innerRadius={55}
                      paddingAngle={4}
                    >
                      {categoryList.map((entry) => (
                        <Cell
                          key={entry.category}
                          fill={CATEGORY_CONFIG[entry.category]?.color || '#94a3b8'}
                          stroke="#0b0f19"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const percent = totalCategorySum > 0 ? Math.round((data.totalAmount / totalCategorySum) * 100) : 0;
                          return (
                            <div className="glass-modal p-3 border border-slate-700 shadow-xl text-xs">
                              <p className="font-bold text-white">{data.category}</p>
                              <p className="text-red-400 font-extrabold text-sm">
                                {formatAmount(data.totalAmount)}
                              </p>
                              <p className="text-slate-400 mt-0.5">
                                {percent}% of spending ({data.count} items)
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => (
                        <span className="text-xs text-slate-300 mr-2">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* 6-Month Monthly Spending Trend Chart */}
        <div className="glass-card p-6 border-slate-800/80">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-red-400" />
              <span>Monthly Spending Trend (Last 6 Months)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Aggregated monthly timeline ($match, $group by year & month)
            </p>
          </div>

          {monthlyTrends.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-slate-500 text-xs">
              No historical data available.
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyTrends}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis
                    dataKey="month"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${currency.symbol}${val}`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="glass-modal p-3 border border-slate-700 shadow-xl text-xs">
                            <p className="font-bold text-white mb-1">{label}</p>
                            <p className="text-red-400 font-extrabold text-sm">
                              {formatAmount(payload[0].value)}
                            </p>
                            <p className="text-slate-400 mt-1">
                              {payload[0].payload.count} transactions recorded
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalAmount"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#areaGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Category Detailed Table Breakdown */}
      <div className="glass-card border-slate-800/80 overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Category Deep Dive</h3>
            <p className="text-xs text-slate-400">
              Detailed statistics and percentage contribution of each spending category
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">
            {categoryList.length} Categories Active
          </span>
        </div>

        {categoryList.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No category metrics recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-900/40 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Count</th>
                  <th className="py-3.5 px-6">Share of Total</th>
                  <th className="py-3.5 px-6 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {categoryList.map((cat) => {
                  const share = totalCategorySum > 0 ? (cat.totalAmount / totalCategorySum) * 100 : 0;

                  return (
                    <tr key={cat.category} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-200">
                        <CategoryBadge category={cat.category} size="md" />
                      </td>
                      <td className="py-4 px-6 text-slate-400">
                        {cat.count} transactions
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 max-w-[120px] bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-red-500"
                              style={{ width: `${Math.min(share, 100)}%` }}
                            />
                          </div>
                          <span className="font-semibold text-slate-300 text-xs">
                            {share.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right font-extrabold text-white text-sm">
                        {formatAmount(cat.totalAmount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
