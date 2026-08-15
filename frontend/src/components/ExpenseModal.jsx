import React, { useState, useEffect } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { X, Calendar, Tag, FileText, Loader2, Coins } from 'lucide-react';
import { CATEGORY_CONFIG } from './CategoryBadge';

const CATEGORIES = ['Food', 'Travel', 'Bills', 'Shopping', 'Health', 'Other'];

const ExpenseModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  title = 'Add Expense',
}) => {
  const { currency, currencies, changeCurrency } = useCurrency();
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        amount: initialData.amount || '',
        category: initialData.category || 'Food',
        description: initialData.description || '',
        date: initialData.date
          ? new Date(initialData.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
      });
    } else {
      setFormData({
        amount: '',
        category: 'Food',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
    setErrors({});
    setServerError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = `Please enter a positive amount greater than ${currency.symbol}0`;
    }
    if (!formData.category || !CATEGORIES.includes(formData.category)) {
      newErrors.category = 'Please select a valid category';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError('');

    try {
      await onSubmit({
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description.trim(),
        date: formData.date,
      });
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save expense. Please check inputs.';
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className="glass-modal w-full max-w-lg p-6 sm:p-8 relative border border-slate-700/60 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition-colors"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
          {initialData ? 'Edit Expense' : 'Add New Expense'}
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          Record your financial transactions with multi-currency tracking and AI intelligence.
        </p>

        {serverError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount input & Currency Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Amount & Currency
              </label>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <Coins className="w-3 h-3 text-brand-400" />
                <span>Currency:</span>
                <select
                  value={currency.code}
                  onChange={(e) => changeCurrency(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-brand-300 rounded px-1.5 py-0.5 text-xs font-semibold cursor-pointer outline-none"
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code} className="bg-slate-900 text-slate-100">
                      {c.symbol} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="relative flex items-center">
              <span className="absolute left-3.5 flex items-center pointer-events-none text-brand-400 font-bold text-base z-10">
                {currency.symbol}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={`glass-input glass-input-icon-left w-full pr-4 text-lg font-semibold ${
                  errors.amount ? 'border-rose-500/80 focus:border-rose-500' : ''
                }`}
                autoFocus
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-rose-400 mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const config = CATEGORY_CONFIG[cat];
                const Icon = config.icon;
                const isSelected = formData.category === cat;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-glow-brand'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
            {errors.category && (
              <p className="text-xs text-rose-400 mt-1">{errors.category}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description / Merchant
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 z-10">
                <FileText className="w-4 h-4" />
              </span>
              <input
                type="text"
                maxLength={200}
                placeholder="e.g., Grocery store, Monthly Netflix, Flight tickets"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`glass-input glass-input-icon-left w-full text-sm ${
                  errors.description ? 'border-rose-500/80 focus:border-rose-500' : ''
                }`}
              />
            </div>
            {errors.description && (
              <p className="text-xs text-rose-400 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Date
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 z-10">
                <Calendar className="w-4 h-4" />
              </span>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`glass-input glass-input-icon-left w-full text-sm ${
                  errors.date ? 'border-rose-500/80 focus:border-rose-500' : ''
                }`}
              />
            </div>
            {errors.date && (
              <p className="text-xs text-rose-400 mt-1">{errors.date}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-glow-brand transition-all duration-200 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{initialData ? 'Update Expense' : 'Save Expense'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
