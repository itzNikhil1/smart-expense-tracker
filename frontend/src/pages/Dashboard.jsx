import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import CategoryBadge, { CATEGORY_CONFIG } from '../components/CategoryBadge';
import ExpenseModal from '../components/ExpenseModal';
import {
  CreditCard,
  TrendingUp,
  Tag,
  PlusCircle,
  Sparkles,
  ArrowRight,
  ChevronRight,
  BotMessageSquare,
  Receipt,
  PieChart as PieIcon,
  Loader2,
  Calendar,
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
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const { currency, formatAmount } = useCurrency();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [quickQuestion, setQuickQuestion] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, expensesRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/expenses?page=1&limit=5&sortBy=date&sortOrder=desc'),
      ]);

      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.data);
      }
      if (expensesRes.data.success) {
        setRecentExpenses(expensesRes.data.expenses);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAddExpense = async (data) => {
    await api.post('/expenses', data);
    fetchDashboardData();
  };

  const handleAskAI = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const prompt = quickQuestion.trim() || 'Can you analyze my recent spending patterns and provide actionable budget insights?';
    navigate('/chat', {
      state: {
        initialPrompt: prompt,
        timestamp: Date.now(),
      },
    });
  };

  const askAboutCategory = (catName) => {
    navigate('/chat', {
      state: {
        initialPrompt: `How much have I spent on ${catName} and how does it compare to my other expenses?`,
        timestamp: Date.now(),
      },
    });
  };

  const currentMonth = analytics?.currentMonth || {
    totalSpend: 0,
    transactionCount: 0,
    avgPerTransaction: 0,
    momPercentage: 0,
  };

  const categoryBreakdown = analytics?.categoryBreakdown || [];
  const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;
  const monthlyTrends = analytics?.monthlyTrends || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 glass-card p-6 sm:p-8 border-slate-800/80 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
              Overview
            </span>
            <span className="text-xs text-slate-400">
              {new Date().toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Here is your spending breakdown and AI financial summary formatted in{' '}
            <strong className="text-brand-300">{currency.code} ({currency.symbol})</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-glow-brand transition-all duration-200"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-brand-300 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 transition-colors"
          >
            <BotMessageSquare className="w-4 h-4 text-brand-400" />
            <span>Ask AI</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Spent This Month"
          value={formatAmount(currentMonth.totalSpend)}
          icon={TrendingUp}
          trend={currentMonth.momPercentage >= 0 ? 'up' : 'down'}
          trendValue={`${Math.abs(currentMonth.momPercentage)}% vs last month`}
          subtitle=""
          colorScheme="brand"
        />
        <StatCard
          title="Avg Per Transaction"
          value={formatAmount(currentMonth.avgPerTransaction)}
          icon={TrendingUp}
          subtitle={`Across ${currentMonth.transactionCount} transactions`}
          colorScheme="emerald"
        />
        <StatCard
          title="Total Transactions"
          value={currentMonth.transactionCount.toString()}
          icon={Receipt}
          subtitle="Logged this month"
          colorScheme="blue"
        />
        <StatCard
          title="Top Category"
          value={topCategory ? topCategory.category : 'N/A'}
          icon={Tag}
          subtitle={
            topCategory
              ? `${formatAmount(topCategory.totalAmount)} total`
              : 'No expenses yet'
          }
          colorScheme="amber"
        />
      </div>

      {/* Quick AI Question Banner */}
      <div className="glass-card p-5 border-brand-500/30 bg-gradient-to-r from-brand-950/40 via-slate-900/60 to-indigo-950/40 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Ask your expenses anything</h3>
              <p className="text-xs text-slate-400">
                Powered by Google Gemini — instantly get spending summaries, category analysis & tips.
              </p>
            </div>
          </div>

          <form onSubmit={handleAskAI} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder={`e.g. How much did I spend on Food?`}
              value={quickQuestion}
              onChange={(e) => setQuickQuestion(e.target.value)}
              className="glass-input text-xs w-full sm:w-72 py-2"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-500 shrink-0 transition-colors shadow-glow-brand cursor-pointer"
            >
              Ask AI
            </button>
          </form>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Spending Trend Bar Chart (2 cols) */}
        <div className="lg:col-span-2 glass-card p-6 border-slate-800/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">6-Month Spending Trend</h3>
              <p className="text-xs text-slate-400">Monthly expense history calculated via MongoDB Aggregation</p>
            </div>
            <Link
              to="/analytics"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              <span>View Analytics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            </div>
          ) : monthlyTrends.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-sm">
              <Calendar className="w-10 h-10 mb-2 opacity-50" />
              <span>No monthly trend data available yet</span>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                            <p className="font-semibold text-white mb-1">{label}</p>
                            <p className="text-brand-400 font-bold">
                              Total: {formatAmount(payload[0].value)}
                            </p>
                            <p className="text-slate-400">
                              {payload[0].payload.count} transactions
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="totalAmount"
                    fill="url(#brandGradient)"
                    radius={[6, 6, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="brandGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Category Breakdown Donut Chart (1 col) */}
        <div className="glass-card p-6 border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white">Category Share</h3>
              <PieIcon className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-400 mb-4">All-time category distribution</p>

            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
              </div>
            ) : categoryBreakdown.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs">
                <span>No expense categories tracked yet</span>
              </div>
            ) : (
              <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      dataKey="totalAmount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {categoryBreakdown.map((entry) => (
                        <Cell
                          key={entry.category}
                          fill={CATEGORY_CONFIG[entry.category]?.hex || '#8b5cf6'}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0];
                          return (
                            <div className="glass-modal p-2.5 border border-slate-700 text-xs">
                              <p className="font-semibold text-white">{data.name}</p>
                              <p className="text-brand-300 font-bold">
                                {formatAmount(data.value)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Mini Category Legend with Click to Ask AI */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80">
            {categoryBreakdown.slice(0, 4).map((cat) => (
              <button
                key={cat.category}
                type="button"
                onClick={() => askAboutCategory(cat.category)}
                title={`Ask AI about ${cat.category}`}
                className="flex items-center gap-2 text-xs p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors text-left group"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      CATEGORY_CONFIG[cat.category]?.hex || '#8b5cf6',
                  }}
                />
                <span className="text-slate-300 truncate group-hover:text-brand-300">{cat.category}</span>
                <span className="text-slate-400 ml-auto font-medium">
                  {currency.symbol}{cat.totalAmount.toFixed(0)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="glass-card p-6 border-slate-800/80">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-white">Recent Transactions</h3>
            <p className="text-xs text-slate-400">Latest logged expenses</p>
          </div>
          <Link
            to="/expenses"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-400 hover:text-brand-300"
          >
            <span>View All Expenses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          </div>
        ) : recentExpenses.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            <Receipt className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="font-semibold text-slate-300">No expenses recorded yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Click "Add Expense" above to record your first transaction.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentExpenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(exp.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <CategoryBadge category={exp.category} size="sm" />
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-200 truncate max-w-xs">
                      {exp.description}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-white whitespace-nowrap">
                      {formatAmount(exp.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      <ExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddExpense}
        title="Add Expense"
      />
    </div>
  );
};

export default Dashboard;
