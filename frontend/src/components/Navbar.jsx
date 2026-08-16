import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import ProfileModal from './ProfileModal';
import {
  LayoutDashboard,
  ReceiptText,
  PieChart,
  BotMessageSquare,
  PlusCircle,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

const Navbar = ({ onOpenAddModal }) => {
  const { user, logout } = useAuth();
  const { currency } = useCurrency();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Expenses', path: '/expenses', icon: ReceiptText },
    { name: 'Analytics', path: '/analytics', icon: PieChart },
    {
      name: 'Ask AI',
      path: '/chat',
      icon: BotMessageSquare,
      highlight: true,
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-8">
              <NavLink to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 p-0.5 shadow-glow-brand group-hover:scale-105 transition-transform duration-300">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-red-500 group-hover:text-white transition-colors" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                    SmartSpend
                  </span>
                  <span className="text-[10px] font-semibold text-red-500 tracking-wider uppercase -mt-1">
                    Financial Suite
                  </span>
                </div>
              </NavLink>

              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-slate-850 text-red-400 border border-slate-700/80 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                        } ${item.highlight ? 'relative' : ''}`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                      {item.highlight && (
                        <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold uppercase rounded-md bg-red-500/15 text-red-400 border border-red-500/30 tracking-wide">
                          AI
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div className="hidden md:flex items-center gap-3">
              {onOpenAddModal && (
                <button
                  type="button"
                  onClick={onOpenAddModal}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl shadow-glow-brand transition-all duration-200 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Expense</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsProfileOpen(true)}
                title="View Profile & Settings"
                className="flex items-center gap-2.5 pl-3 border-l border-slate-800 hover:bg-slate-900/80 p-1.5 rounded-2xl border border-transparent hover:border-slate-700/60 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-800 group-hover:bg-red-600/20 border border-slate-700/60 group-hover:border-red-500/40 flex items-center justify-center text-slate-300 group-hover:text-red-400 transition-colors">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-white truncate max-w-[110px] group-hover:text-red-400 transition-colors">
                    {user?.name || 'User'}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[110px]">
                    Currency: <strong className="text-slate-200">{currency.symbol}</strong>
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
              </button>

              <button
                onClick={handleLogout}
                title="Log out"
                className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            <div className="flex md:hidden items-center gap-2">
              {onOpenAddModal && (
                <button
                  type="button"
                  onClick={onOpenAddModal}
                  className="p-2 text-white bg-red-600 rounded-xl shadow-glow-brand"
                >
                  <PlusCircle className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsProfileOpen(true)}
                className="p-2 text-slate-300 bg-slate-800 rounded-xl"
              >
                <UserIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-2xl px-4 pt-3 pb-5 space-y-2 animate-fade-in">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-850 text-red-400 border border-slate-700'
                        : 'text-slate-400 hover:bg-slate-900 text-slate-200'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </div>
                  {item.highlight && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-red-500/20 text-red-400 border border-red-500/30 uppercase">
                      AI
                    </span>
                  )}
                </NavLink>
              );
            })}

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between px-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsProfileOpen(true);
                }}
                className="flex items-center gap-3 text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">{user?.name}</span>
                  <span className="text-xs text-red-400">Settings & Currency ({currency.symbol})</span>
                </div>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
};

export default Navbar;
