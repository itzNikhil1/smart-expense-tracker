import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import {
  Send,
  Sparkles,
  User,
  Trash2,
  HelpCircle,
  TrendingDown,
  Receipt,
  Utensils,
  Lightbulb,
  Loader2,
  Check,
  Copy,
  Info,
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  {
    label: 'Food Spend This Month',
    query: 'How much did I spend on Food this month?',
    icon: Utensils,
  },
  {
    label: 'Top Spending Category',
    query: 'What is my highest spending category and how much have I spent on it?',
    icon: TrendingDown,
  },
  {
    label: 'Budget & Saving Advice',
    query: 'Based on my spending habits, give me 3 practical tips to save money.',
    icon: Lightbulb,
  },
  {
    label: 'Recent Transactions',
    query: 'Can you summarize my last 5 expenses with dates and amounts?',
    icon: Receipt,
  },
];

const Chat = () => {
  const { user } = useAuth();
  const { currency } = useCurrency();
  const location = useLocation();

  const [messages, setMessages] = useState(() => {
    return [
      {
        id: 'welcome',
        sender: 'ai',
        text: `Hello ${user?.name?.split(' ')[0] || 'there'}! 👋 I am **SmartSpend AI**, your personal financial assistant powered by **Google Gemini Flash**.\n\nI have direct access to your verified expenses, category breakdowns, and monthly trends. Ask me anything about your finances!`,
        timestamp: new Date(),
      },
    ];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const lastHandledPromptKey = useRef('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async (textToSend) => {
    const text = typeof textToSend === 'string' ? textToSend.trim() : inputMessage.trim();
    if (!text || loading) return;

    const userMessage = {
      id: `user-${Date.now()}-${Math.random()}`,
      sender: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await api.post('/chat', {
        message: text,
        currencySymbol: currency.symbol,
      });

      if (res.data.success) {
        const aiMessage = {
          id: `ai-${Date.now()}-${Math.random()}`,
          sender: 'ai',
          text: res.data.reply,
          timestamp: new Date(),
          source: res.data.source || 'gemini-flash',
          notice: res.data.notice,
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "I'm having trouble analyzing your records right now. Please try again shortly.";
      const aiErrorMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: `⚠️ **Notice:** ${errorMsg}`,
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, aiErrorMessage]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Handle incoming initial prompt from Dashboard/Expenses navigation
  useEffect(() => {
    if (location.state?.initialPrompt) {
      const promptText = location.state.initialPrompt;
      const key = `${promptText}-${location.state.timestamp || ''}`;

      if (lastHandledPromptKey.current !== key) {
        lastHandledPromptKey.current = key;
        window.history.replaceState({}, document.title);
        sendMessage(promptText);
      }
    }
  }, [location.state]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `welcome-reset-${Date.now()}`,
        sender: 'ai',
        text: `Conversation cleared. What else would you like to analyze about your expenses?`,
        timestamp: new Date(),
      },
    ]);
  };

  const copyToClipboard = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to render formatted markdown
  const renderFormattedText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');

    return lines.map((line, idx) => {
      // Parse horizontal rules
      if (line.trim() === '---' || line.trim() === '***') {
        return <hr key={idx} className="border-slate-700/60 my-2.5" />;
      }

      // Parse headers
      if (line.trim().startsWith('### ')) {
        return (
          <h4 key={idx} className="font-bold text-white text-sm mt-3 mb-1.5 flex items-center gap-1.5">
            <span>{line.replace('### ', '').replace(/\*\*/g, '')}</span>
          </h4>
        );
      }
      if (line.trim().startsWith('## ')) {
        return (
          <h3 key={idx} className="font-extrabold text-white text-base mt-3 mb-1.5">
            {line.replace('## ', '').replace(/\*\*/g, '')}
          </h3>
        );
      }

      // Parse bold **text** and italic *text*
      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-bold text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
          return (
            <em key={pIdx} className="italic text-red-300">
              {part.slice(1, -1)}
            </em>
          );
        }
        return part;
      });

      // Parse bullet points
      if (
        line.trim().startsWith('- ') ||
        line.trim().startsWith('* ') ||
        line.trim().startsWith('• ')
      ) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-1">
            <span className="text-red-400 font-bold mt-0.5 text-xs">•</span>
            <span className="flex-1 text-slate-200 text-xs sm:text-sm leading-relaxed">
              {formattedParts}
            </span>
          </div>
        );
      }

      // Parse numbered lists (1. , 2. )
      const numberedMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
      if (numberedMatch) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-1">
            <span className="text-red-400 font-bold text-xs mt-0.5">{numberedMatch[1]}.</span>
            <span className="flex-1 text-slate-200 text-xs sm:text-sm leading-relaxed">
              {formattedParts}
            </span>
          </div>
        );
      }

      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="my-1 text-xs sm:text-sm leading-relaxed">
          {formattedParts}
        </p>
      );
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-6rem)] flex flex-col animate-fade-in">
      {/* Chat Container */}
      <div className="glass-card border-slate-800/80 flex-1 flex flex-col overflow-hidden shadow-2xl relative">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 p-0.5 shadow-glow-brand">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-red-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">SmartSpend AI</h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1 animate-pulse" />
                  Gemini Flash Active
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  Currency: {currency.symbol} {currency.code}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Natural-language Q&A trained on your verified MongoDB expense database
              </p>
            </div>
          </div>

          <button
            onClick={clearChat}
            title="Clear Chat History"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${
                  isUser ? 'justify-end' : 'justify-start'
                } group animate-fade-in`}
              >
                {/* AI Avatar */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 p-0.5 shadow-sm shrink-0 mt-1">
                    <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-red-400" />
                    </div>
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm ${
                    isUser
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-glow-brand rounded-tr-none'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none shadow-lg'
                  }`}
                >
                  <div className="leading-relaxed whitespace-pre-wrap">
                    {renderFormattedText(msg.text)}
                  </div>

                  <div className="mt-2.5 flex items-center justify-between gap-4 text-[10px] text-slate-400 border-t border-white/10 pt-1.5">
                    <span className="flex items-center gap-1.5">
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {msg.source && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                          {msg.source}
                        </span>
                      )}
                    </span>

                    {!isUser && (
                      <button
                        onClick={() => copyToClipboard(msg.id, msg.text)}
                        className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-red-400" />
                            <span className="text-red-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Thinking loading bubble */}
          {loading && (
            <div className="flex gap-3 sm:gap-4 justify-start animate-fade-in">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 p-0.5 shrink-0 mt-1">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-red-400" />
                </div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl rounded-tl-none p-4 shadow-lg text-sm text-slate-300 flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
                <span className="text-xs text-slate-400">
                  Gemini Flash is analyzing your verified financial records...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950/50 border-t border-slate-800/60 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
              <HelpCircle className="w-3 h-3" />
              <span>Suggested:</span>
            </span>
            {SUGGESTED_PROMPTS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => sendMessage(item.query)}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800/90 text-slate-300 hover:text-white border border-slate-800/90 text-xs font-medium transition-all hover:border-red-500/40 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  <Icon className="w-3.5 h-3.5 text-red-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Message Input Box */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-t border-slate-800/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-3"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder={`Ask anything about your expenses (e.g. How much did I spend on Food this month?)...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="glass-input flex-1 py-3 text-sm"
              autoFocus
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-glow-brand transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none shrink-0 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
