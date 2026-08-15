import React from 'react';
import { checkPasswordStrength } from '../utils/validation';
import { Check, X, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';

const PasswordStrengthMeter = ({ password }) => {
  if (!password) return null;

  const strength = checkPasswordStrength(password);

  const criteriaItems = [
    { key: 'length', label: '8+ characters' },
    { key: 'upper', label: 'Uppercase letter (A-Z)' },
    { key: 'lower', label: 'Lowercase letter (a-z)' },
    { key: 'number', label: 'Number (0-9)' },
    { key: 'special', label: 'Special symbol (!@#$%^&*)' },
  ];

  return (
    <div className="mt-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 text-xs space-y-2 animate-fade-in">
      {/* Header bar with strength score */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
          {strength.score >= 3 ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          ) : strength.score === 2 ? (
            <Shield className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          )}
          <span>Password Strength:</span>
        </span>
        <span className={`text-[11px] font-bold ${strength.textColor}`}>
          {strength.label}
        </span>
      </div>

      {/* 4-segment visual progress bar */}
      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
        {[1, 2, 3, 4].map((seg) => {
          const filled = strength.score >= seg;
          return (
            <div
              key={seg}
              className={`h-full rounded-full transition-all duration-300 ${
                filled ? strength.color : 'bg-slate-800'
              }`}
            />
          );
        })}
      </div>

      {/* Criteria Checklist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-800/80 text-[11px]">
        {criteriaItems.map((item) => {
          const passed = strength.criteria[item.key];
          return (
            <div
              key={item.key}
              className={`flex items-center gap-1.5 transition-colors ${
                passed ? 'text-emerald-400 font-medium' : 'text-slate-500'
              }`}
            >
              {passed ? (
                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0 ml-0.5" />
              )}
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
