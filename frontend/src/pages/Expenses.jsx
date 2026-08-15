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
  RotateCcw,
  AlertTriangle,
  Loader2,
  Receipt,
  ArrowUpDown,
  BotMessageSquare,
  Sparkles,
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
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchExpenses = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', pagination.limit);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      if (selectedCategory && selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }
      if (startDate) {
        params.append('startDate', startDate);
      }
      if (endDate) {
        params.append('endDate', endDate);
      }

      const res = await api.get(`/expenses?${params.toString()}`);
      if (res.data.success) {
        setExpenses(res.data.expenses);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, sortBy, sortOrder, searchTerm, selectedCategory, startDate, endDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExpenses(1);
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchExpenses]);

  const handleAddExpense = async (data) => {
    await api.post('/expenses', data);
    fetchExpenses(1);
  };

  const handleUpdateExpense = async (data) => {
    if (!editingExpense) return;
    await api.put(`/expenses/${editingExpense._id}`, data);
    setEditingExpense(null);
    fetchExpenses(pagination.page);
  };

  const handleDeleteExpense = async () => {
    if (!deletingExpense) return;
    try {
      setDeleteLoading(true);
      await api.delete(`/expenses/${deletingExpense._id}`);
      setDeletingExpense(null);
      fetchExpenses(pagination.page);
    } catch (err) {
      console.error('Failed to delete expense:', err);
    } finally {
      setDeleteLoading(false);
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
    navigate('/chat', { state: { initialPrompt: prompt } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Expense Management
          </h1>
          <p className="text-sm text-slate-400">
            View, filter, search, and manage all your tracked financial transactions ({currency.code}).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={askAiAboutCurrentFilter}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Ask AI About Expenses</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-glow-brand transition-all duration-200 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card p-5 border-slate-800/80 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search input (4 cols) */}
          <div className="md:col-span-4 relative flex items-center">
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

          {/* Category Dropdown (3 cols) */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="glass-input w-full text-xs sm:text-sm appearance-none bg-slate-900 cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-900 text-slate-100">
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date (2 cols) */}
          <div className="md:col-span-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Start Date"
              className="glass-input w-full text-xs sm:text-sm"
            />
          </div>

          {/* End Date (2 cols) */}
          <div className="md:col-span-2">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="End Date"
              className="glass-input w-full text-xs sm:text-sm"
            />
          </div>

          {/* Reset button (1 col) */}
          <div className="md:col-span-1 flex items-center">
            <button
              onClick={resetFilters}
              title="Reset all filters"
              className="w-full h-full min-h-[40px] flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Pills & Quick Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500 font-medium mr-1">Quick:</span>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-brand-600 text-white font-semibold shadow-sm'
                      : 'bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={setThisMonthFilter}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              This Month
            </button>
            <span className="text-slate-400">
              Total Found:{' '}
              <strong className="text-white">{pagination.total}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="glass-card border-slate-800/80 overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-3" />
            <p className="text-xs text-slate-400">Loading expense records...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Receipt className="w-14 h-14 mx-auto text-slate-600 mb-3" />
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
          <div className="overflow-x-auto">
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
        )}

        {/* Pagination Footer */}
        {pagination.pages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-t border-slate-800/80 bg-slate-950/40 text-xs text-slate-400">
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

            <div className="flex items-center gap-2">
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
          onSubmit={handleUpdateExpense}
          initialData={editingExpense}
          title="Edit Expense"
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-modal w-full max-w-md p-6 border-slate-700/60 relative animate-slide-up">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Delete Expense?</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mb-2">
              Are you sure you want to delete this expense record?
            </p>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1 mb-5">
              <p>
                <strong>Description:</strong> {deletingExpense.description}
              </p>
              <p>
                <strong>Amount:</strong> {formatAmount(deletingExpense.amount)} ({deletingExpense.category})
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingExpense(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteExpense}
                disabled={deleteLoading}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Confirm Delete</span>
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
