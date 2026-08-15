import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import api from '../api/axios';
import {
  X,
  User,
  Mail,
  Calendar,
  DollarSign,
  Receipt,
  LogOut,
  Sparkles,
  Coins,
  Check,
  Shield,
} from 'lucide-react';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { currency, currencies, changeCurrency, formatAmount } = useCurrency();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const fetchProfileStats = async () => {
        try {
          const res = await api.get('/analytics/summary');
          if (res.data.success) {
            setStats(res.data.data);
          }
        } catch (e) {
          console.warn('Failed to load profile stats');
        }
      };
      fetchProfileStats();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Member';

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const allTimeSpend = stats?.allTime?.totalSpend || 0;
  const transactionCount = stats?.allTime?.transactionCount || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className="glass-modal w-full max-w-md p-6 sm:p-7 relative border border-slate-700/60 shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 p-0.5 shadow-glow-brand shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl font-bold text-white tracking-wider">
              {initials}
            </div>
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-white truncate">{user?.name}</h2>
            <p className="text-xs text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3 h-3 text-slate-500" />
              <span>{user?.email}</span>
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                <Shield className="w-2.5 h-2.5" />
                Verified Account
              </span>
            </div>
          </div>
        </div>

        {/* Financial Highlights */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Lifetime Spend
            </span>
            <span className="text-lg font-extrabold text-white">
              {formatAmount(allTimeSpend)}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Total Expenses
            </span>
            <span className="text-lg font-extrabold text-white">
              {transactionCount} logs
            </span>
          </div>
        </div>

        {/* Currency Preference Selector */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-emerald-400" />
              <span>Display Currency</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-normal">
              Active: {currency.code} ({currency.symbol})
            </span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {currencies.map((curr) => {
              const isSelected = currency.code === curr.code;
              return (
                <button
                  key={curr.code}
                  type="button"
                  onClick={() => changeCurrency(curr.code)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500 shadow-glow-brand'
                      : 'bg-slate-950/40 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="font-bold">{curr.symbol} {curr.code}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Account Meta & Actions */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-500" />
            <span>Joined {joinDate}</span>
          </span>

          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
