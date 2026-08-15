import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCurrency } from '../context/CurrencyContext';
import CategoryBadge, { CATEGORY_CONFIG } from '../components/CategoryBadge';
import ExpenseModal from '../components/ExpenseModal';
import {
  Search,
  Filter,
  PlusCircle,
  Edit2,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  AlertTriangle,
  Loader2,
  Receipt,
  ArrowUpDown,
  BotMessageSquare,
  Sparkles,
  Tag,
} from 'lucide-react';

const CATEGORIES = ['All', 'Food', 'Travel', 'Bills', 'Shopping', 'Health', 'Other'];

const Expenses = () => {
  const { currency, formatAmount } = useCurrency();
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch Expenses with debounce / pagination
  const fetchExpenses = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: 10,
          sortBy,
          sortOrder,
        };

        if (searchTerm.trim()) params.search = searchTerm.trim();
        if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const res = await api.get('/expenses', { params });
        if (res.data.success) {
          setExpenses(res.data.expenses);
          setPagination(res.data.pagination);
        }
      } catch (err) {
        console.error('Failed to fetch expenses:', err);
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, selectedCategory, startDate, endDate, sortBy, sortOrder]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExpenses(1);
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchExpenses]);

  // Actions
  const handleAddExpense = async (data) => {
    const res = await api.post('/expenses', data);
    if (res.data.success) {
      fetchExpenses(1);
    }
  };

  const handleEditExpense = async (data) => {
    if (!editingExpense) return;
    const res = await api.put(`/expenses/${editingExpense._id}`, data);
    if (res.data.success) {
      setEditingExpense(null);
      fetchExpenses(pagination.page);
    }
  };

  const handleDeleteExpense = async () => {
    if (!deletingExpense) return;
    try {
      setActionLoading(true);
      const res = await api.delete(`/expenses/${deletingExpense._id}`);
      if (res.data.success) {
        setDeletingExpense(null);
        fetchExpenses(pagination.page);
      }
    } catch (err) {
      console.error('Failed to delete expense:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setStartDate('');
    setEndDate('');
    setSortBy('date');
    setSortOrder('desc');
  };

  const setThisMonthFilter = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    setStartDate(firstDay);
    setEndDate(lastDay);
  };

  const askAiAboutCurrentFilter = () => {
    let prompt = 'Can you analyze my recent spending patterns and provide actionable budget insights?';
    if (selectedCategory && selectedCategory !== 'All') {
      prompt = `How much did I spend on ${selectedCategory} and how can I optimize my ${selectedCategory} expenses?`;
    } else if (searchTerm.trim()) {
      prompt = `Tell me about my expenses matching "${searchTerm.trim()}".`;
    }
    navigate('/chat', { state: { initialPrompt: prompt, timestamp: Date.now() } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5 sm:space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Expense Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            View, filter, search, and manage all your tracked financial transactions ({currency.code}).
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={askAiAboutCurrentFilter}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Ask AI</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-glow-brand transition-all duration-200 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar - Fully Responsive for Mobile & Desktop */}
      <div className="glass-card p-4 sm:p-5 border-slate-800/80 space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 sm:gap-3">
          {/* Search input (4 cols on desktop) */}
          <div className="sm:col-span-2 lg:col-span-4 relative flex items-center">
            <span className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 z-10">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search description / merchant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input glass-input-icon-left w-full text-xs sm:text-sm"
            />
          </div>

          {/* Category Dropdown (3 cols on desktop) */}
          <div className="sm:col-span-1 lg:col-span-3 relative flex items-center">
            <span className="absolute left-3.5 flex items-center pointer-events-none text-brand-400 z-10">
              <Tag className="w-3.5 h-3.5" />
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="glass-input glass-input-icon-left w-full text-xs sm:text-sm appearance-none bg-slate-900 pr-8 cursor-pointer text-slate-200"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-900 text-slate-100">
                  {cat === 'All' ? '📁 All Categories' : `${cat}`}
                </option>
              ))}
            </select>
            <span className="absolute right-3 flex items-center pointer-events-none text-slate-400">
              <ChevronDown className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Date Pickers Container (Mobile 2-column, Desktop 4 cols) */}
          <div className="sm:col-span-1 lg:col-span-4 grid grid-cols-2 gap-2">
            {/* Start Date */}
            <div className="relative flex items-center bg-slate-950/60 border border-slate-800 rounded-xl px-2.5 py-1.5 focus-within:border-brand-500">
              <div className="flex flex-col w-full">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5 text-brand-400" /> From
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-slate-100 text-xs outline-none w-full cursor-pointer"
                />
              </div>
            </div>

            {/* End Date */}
            <div className="relative flex items-center bg-slate-950/60 border border-slate-800 rounded-xl px-2.5 py-1.5 focus-within:border-brand-500">
              <div className="flex flex-col w-full">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5 text-indigo-400" /> To
                </span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-slate-100 text-xs outline-none w-full cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Reset button (1 col on desktop) */}
          <div className="sm:col-span-2 lg:col-span-1 flex items-center">
            <button
              onClick={resetFilters}
              title="Reset all filters"
              className="w-full h-full min-h-[38px] flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-850 hover:bg-slate-800 border border-slate-700/60 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="lg:hidden">Reset Filters</span>
            </button>
          </div>
        </div>

        {/* Category Pills & Quick Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-800/60 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-slate-500 font-medium shrink-0 mr-0.5">Quick:</span>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg shrink-0 transition-all cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-brand-600 text-white font-semibold shadow-sm'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            <button
              onClick={setThisMonthFilter}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer text-xs"
            >
              This Month
            </button>
            <span className="text-slate-400 text-xs">
              Total Found: <strong className="text-white">{pagination.total}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Expenses Container */}
      <div className="glass-card border-slate-800/80 overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-3" />
            <p className="text-xs text-slate-400">Loading expense records...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="py-16 text-center text-slate-400 px-4">
            <Receipt className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-slate-200">No expenses found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchTerm || selectedCategory !== 'All' || startDate || endDate
                ? 'Try adjusting your search keywords or clearing active date filters.'
                : 'Get started by creating your first expense entry.'}
            </p>
            {(searchTerm || selectedCategory !== 'All' || startDate || endDate) && (
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* 📱 Mobile Card View (shown only on screens < sm) */}
            <div className="sm:hidden divide-y divide-slate-800/70">
              {expenses.map((exp) => (
                <div key={exp._id} className="p-4 space-y-2 hover:bg-slate-850/40 transition-colors">
                  {/* Top row: Category Badge & Amount */}
                  <div className="flex items-center justify-between">
                    <CategoryBadge category={exp.category} size="sm" />
                    <span className="font-extrabold text-white text-base">
                      {formatAmount(exp.amount)}
                    </span>
                  </div>

                  {/* Middle row: Description */}
                  <p className="text-sm font-medium text-slate-200 leading-snug">
                    {exp.description}
                  </p>

                  {/* Bottom row: Date & Action buttons */}
                  <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {new Date(exp.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingExpense(exp)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-brand-300 bg-slate-800 hover:bg-slate-750 transition-colors"
                      >
                        <Edit2 className="w-3 h-3 text-brand-400" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setDeletingExpense(exp)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-rose-400" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 💻 Desktop Table View (hidden on mobile, shown on sm and up) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-slate-900/40 text-slate-400 text-xs uppercase tracking-wider">
                    <th
                      className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors"
                      onClick={() => {
                        if (sortBy === 'date') {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy('date');
                          setSortOrder('desc');
                        }
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Date</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-500" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th
                      className="py-3.5 px-4 text-right cursor-pointer hover:text-white transition-colors"
                      onClick={() => {
                        if (sortBy === 'amount') {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy('amount');
                          setSortOrder('desc');
                        }
                      }}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Amount</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-500" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {expenses.map((exp) => (
                    <tr
                      key={exp._id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-4 px-4 text-xs text-slate-300 font-medium whitespace-nowrap">
                        {new Date(exp.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <CategoryBadge category={exp.category} size="md" />
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-200">
                        <div className="truncate max-w-xs sm:max-w-md">
                          {exp.description}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-extrabold text-white whitespace-nowrap">
                        {formatAmount(exp.amount)}
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingExpense(exp)}
                            title="Edit Expense"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingExpense(exp)}
                            title="Delete Expense"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination Footer */}
        {pagination.pages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 border-t border-slate-800/80 bg-slate-950/40 text-xs text-slate-400">
            <div>
              Showing{' '}
              <strong className="text-white">
                {(pagination.page - 1) * pagination.limit + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-white">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </strong>{' '}
              of <strong className="text-white">{pagination.total}</strong> results
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2">
              <button
                onClick={() => fetchExpenses(pagination.page - 1)}
                disabled={!pagination.hasPrev || loading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <span className="px-3 py-1 font-semibold text-slate-200">
                Page {pagination.page} of {pagination.pages}
              </span>

              <button
                onClick={() => fetchExpenses(pagination.page + 1)}
                disabled={!pagination.hasNext || loading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
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

      {/* Edit Expense Modal */}
      {editingExpense && (
        <ExpenseModal
          isOpen={!!editingExpense}
          onClose={() => setEditingExpense(null)}
          onSubmit={handleEditExpense}
          initialData={editingExpense}
          title="Edit Expense"
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-modal max-w-md w-full p-6 space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-white">Delete Expense</h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Are you sure you want to delete{' '}
                <strong className="text-slate-200">"{deletingExpense.description}"</strong> (
                {formatAmount(deletingExpense.amount)})? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingExpense(null)}
                disabled={actionLoading}
                className="px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteExpense}
                disabled={actionLoading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-all disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Expense</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
