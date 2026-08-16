export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { isValid: false, message: 'Email address is required' };
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const trimmed = email.trim();
  
  if (!trimmed.includes('@')) {
    return { isValid: false, message: 'Missing @ symbol in email' };
  }
  if (!trimmed.split('@')[1] || !trimmed.split('@')[1].includes('.')) {
    return { isValid: false, message: 'Missing valid domain (e.g. .com)' };
  }
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  return { isValid: true, message: '' };
};

export const checkPasswordStrength = (password) => {
  if (!password) {
    return {
      score: 0,
      label: 'Too short',
      color: 'bg-slate-700',
      textColor: 'text-slate-400',
      percentage: 0,
      criteria: {
        length: false,
        upper: false,
        lower: false,
        number: false,
        special: false,
      },
    };
  }

  const criteria = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const passedCount = Object.values(criteria).filter(Boolean).length;

  let score = 1;
  let label = 'Weak';
  let color = 'bg-rose-500';
  let textColor = 'text-rose-400';
  let percentage = 25;

  if (password.length < 6) {
    score = 1;
    label = 'Very Weak';
    color = 'bg-rose-600';
    textColor = 'text-rose-400';
    percentage = 15;
  } else if (passedCount <= 2) {
    score = 1;
    label = 'Weak';
    color = 'bg-rose-500';
    textColor = 'text-rose-400';
    percentage = 30;
  } else if (passedCount === 3) {
    score = 2;
    label = 'Medium / Fair';
    color = 'bg-amber-500';
    textColor = 'text-amber-400';
    percentage = 60;
  } else if (passedCount === 4) {
    score = 3;
    label = 'Strong';
    color = 'bg-emerald-500';
    textColor = 'text-emerald-400';
    percentage = 85;
  } else if (passedCount === 5) {
    score = 4;
    label = 'Very Strong & Secure';
    color = 'bg-gradient-to-r from-emerald-400 to-brand-400';
    textColor = 'text-emerald-300';
    percentage = 100;
  }

  return {
    score,
    label,
    color,
    textColor,
    percentage,
    criteria,
    isAcceptable: password.length >= 6,
  };
};
