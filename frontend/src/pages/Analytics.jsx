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
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center gap-1">
              <Layers className="w-3 h-3" />
              <span>Database Aggregation</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Financial Analytics & Intelligence
          </h1>
          <p className="text-sm text-slate-400">
            Real-time multi-stage MongoDB aggregations analyzed in{' '}
            <strong className="text-brand-300">{currency.code} ({currency.symbol})</strong>.
          </p>
        </div>

        <button
          onClick={askAiAboutAnalytics}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-glow-brand transition-all cursor-pointer self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ask AI for Optimization Tips</span>
        </button>
      </div>

      {/* Top Aggregation Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-5 border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span>This Month Spend</span>
            <DollarSign className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-white mb-2">
            {formatAmount(currentMonth.totalSpend)}
          </div>
          <div className="flex items-center gap-1 text-xs">
            {currentMonth.momPercentage > 0 ? (
              <span className="inline-flex items-center gap-0.5 text-rose-400 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{currentMonth.momPercentage}% vs last month
              </span>
            ) : currentMonth.momPercentage < 0 ? (
              <span className="inline-flex items-center gap-0.5 text-emerald-400 font-semibold">
                <ArrowDownRight className="w-3.5 h-3.5" />
                {currentMonth.momPercentage}% vs last month
              </span>
            ) : (
              <span className="text-slate-400 font-semibold">Same as last month</span>
            )}
          </div>
        </div>

        <div className="glass-card p-5 border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span>Previous Month Spend</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-white mb-2">
            {formatAmount(currentMonth.prevMonthSpend)}
          </div>
          <div className="text-xs text-slate-400">
            Baseline for MoM financial growth
          </div>
        </div>

        <div className="glass-card p-5 border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span>All-Time Total Spend</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
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
                  <PieIcon className="w-4 h-4 text-brand-400" />
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
                      ? 'bg-brand-600 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All-Time
                </button>
                <button
                  onClick={() => setActiveCategoryTab('currentMonth')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    activeCategoryTab === 'currentMonth'
                      ? 'bg-brand-600 text-white font-semibold shadow-sm'
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
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={5}
                    >
                      {categoryList.map((entry) => (
                        <Cell
                          key={entry.category}
                          fill={CATEGORY_CONFIG[entry.category]?.hex || '#8b5cf6'}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0];
                          const percent =
                            totalCategorySum > 0
                              ? ((Number(item.value) / totalCategorySum) * 100).toFixed(1)
                              : 0;
                          return (
                            <div className="glass-modal p-3 border border-slate-700 shadow-xl text-xs">
                              <p className="font-bold text-white">{item.name}</p>
                              <p className="text-brand-300 font-extrabold text-sm my-0.5">
                                {formatAmount(item.value)}
                              </p>
                              <p className="text-slate-400">
                                {percent}% of total • {item.payload.count} transactions
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
              <BarChart3 className="w-4 h-4 text-brand-400" />
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
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
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
                            <p className="text-brand-300 font-extrabold text-sm">
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
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#areaGradient)"
                    dot={{ fill: '#8b5cf6', stroke: '#ffffff', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#c4b5fd' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown Deep-Dive Table */}
      <div className="glass-card p-6 border-slate-800/80">
        <h3 className="text-base font-bold text-white mb-1">
          Detailed Category Performance
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Detailed breakdown of total expenditure, transaction counts, and wallet share.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Transactions</th>
                <th className="py-3 px-4">Share of Total</th>
                <th className="py-3 px-4 text-right">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {categoryList.map((item) => {
                const percentage =
                  totalCategorySum > 0
                    ? Math.round((item.totalAmount / totalCategorySum) * 100)
                    : 0;
                const config = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.Other;

                return (
                  <tr key={item.category} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <CategoryBadge category={item.category} size="md" />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-300 font-medium whitespace-nowrap">
                      {item.count} items
                    </td>
                    <td className="py-3.5 px-4 w-1/3">
                      <div className="flex items-center gap-3">
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: config.hex,
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-300 w-10 text-right">
                          {percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-white whitespace-nowrap">
                      {formatAmount(item.totalAmount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
