import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ExpenseModal from './components/ExpenseModal';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Analytics from './pages/Analytics';
import Chat from './pages/Chat';
import api from './api/axios';

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [globalAddModalOpen, setGlobalAddModalOpen] = useState(false);

  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/signup';

  const handleGlobalAddExpense = async (data) => {
    await api.post('/expenses', data);
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 selection:bg-brand-500 selection:text-white">
      {isAuthenticated && !isAuthPage && (
        <Navbar onOpenAddModal={() => setGlobalAddModalOpen(true)} />
      )}

      <main className="flex-1">
        <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/signup"
            element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />}
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <Expenses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {isAuthenticated && (
        <ExpenseModal
          isOpen={globalAddModalOpen}
          onClose={() => setGlobalAddModalOpen(false)}
          onSubmit={handleGlobalAddExpense}
          title="Quick Add Expense"
        />
      )}
    </div>
  );
};

const App = () => {
  return <AppContent />;
};

export default App;
