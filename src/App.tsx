import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Users, 
  Receipt, 
  DollarSign, 
  Calendar,
  Trash2,
  Edit,
  Check,
  X,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Wallet
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import './App.css';

// Types
interface User {
  id: string;
  name: string;
  email: string;
}

interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: string;
  date: string;
  paidBy: string;
  participants: { id: string; name: string; amount: number; settled: boolean }[];
  category: string;
  settled: boolean;
  createdAt: string;
}

interface AppState {
  users: User[];
  expenses: Expense[];
  currentUser: User | null;
  theme: 'light' | 'dark';
  currency: string;
}

// Initial data
const initialUsers: User[] = [
  { id: '1', name: 'You', email: 'you@example.com' },
  { id: '2', name: 'Alice', email: 'alice@example.com' },
  { id: '3', name: 'Bob', email: 'bob@example.com' },
  { id: '4', name: 'Charlie', email: 'charlie@example.com' }
];

const categories = [
  { id: 'food', name: 'Food & Dining', icon: '🍽️' },
  { id: 'transport', name: 'Transportation', icon: '🚗' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
  { id: 'utilities', name: 'Utilities', icon: '💡' },
  { id: 'general', name: 'General', icon: '💰' }
];

const currencies = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'];

function App() {
  const [state, setState] = useState<AppState>({
    users: initialUsers,
    expenses: [],
    currentUser: initialUsers[0],
    theme: 'dark',
    currency: 'USD'
  });

  const [showCreateExpense, setShowCreateExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [balanceVisible, setBalanceVisible] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'general',
    date: new Date().toISOString().split('T')[0],
    paidBy: '1',
    participants: ['1']
  });

  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('smartsplit-data');
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setState(prev => ({ ...prev, ...parsedData }));
      } catch (error) {
        console.error('Failed to load saved data');
      }
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('smartsplit-data', JSON.stringify(state));
  }, [state]);

  // Helper functions
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const calculateBalance = () => {
    if (!state.currentUser) return { totalOwed: 0, totalOwing: 0, netAmount: 0 };

    let totalOwed = 0;
    let totalOwing = 0;

    state.expenses.forEach(expense => {
      const participant = expense.participants.find(p => p.id === state.currentUser!.id);
      if (participant && !participant.settled) {
        if (expense.paidBy === state.currentUser!.id) {
          // Current user paid, others owe them
          const othersOwe = expense.participants
            .filter(p => p.id !== state.currentUser!.id && !p.settled)
            .reduce((sum, p) => sum + p.amount, 0);
          totalOwed += othersOwe;
        } else {
          // Someone else paid, current user owes
          totalOwing += participant.amount;
        }
      }
    });

    return {
      totalOwed,
      totalOwing,
      netAmount: totalOwed - totalOwing
    };
  };

  const balance = calculateBalance();

  // Form handlers
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleParticipantToggle = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.includes(userId)
        ? prev.participants.filter(id => id !== userId)
        : [...prev.participants, userId]
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      amount: '',
      category: 'general',
      date: new Date().toISOString().split('T')[0],
      paidBy: '1',
      participants: ['1']
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.amount || formData.participants.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    const splitAmount = amount / formData.participants.length;

    const newExpense: Expense = {
      id: generateId(),
      title: formData.title.trim(),
      amount,
      currency: state.currency,
      date: formData.date,
      paidBy: formData.paidBy,
      participants: formData.participants.map(userId => {
        const user = state.users.find(u => u.id === userId);
        return {
          id: userId,
          name: user?.name || 'Unknown',
          amount: splitAmount,
          settled: false
        };
      }),
      category: formData.category,
      settled: false,
      createdAt: new Date().toISOString()
    };

    if (editingExpense) {
      setState(prev => ({
        ...prev,
        expenses: prev.expenses.map(exp => 
          exp.id === editingExpense.id ? { ...newExpense, id: editingExpense.id } : exp
        )
      }));
      toast.success('Expense updated successfully!');
      setEditingExpense(null);
    } else {
      setState(prev => ({
        ...prev,
        expenses: [...prev.expenses, newExpense]
      }));
      toast.success('Expense created successfully!');
    }

    resetForm();
    setShowCreateExpense(false);
  };

  const handleEdit = (expense: Expense) => {
    setFormData({
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date,
      paidBy: expense.paidBy,
      participants: expense.participants.map(p => p.id)
    });
    setEditingExpense(expense);
    setShowCreateExpense(true);
  };

  const handleDelete = (expenseId: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      setState(prev => ({
        ...prev,
        expenses: prev.expenses.filter(exp => exp.id !== expenseId)
      }));
      toast.success('Expense deleted successfully!');
    }
  };

  const handleSettle = (expenseId: string) => {
    setState(prev => ({
      ...prev,
      expenses: prev.expenses.map(exp =>
        exp.id === expenseId
          ? {
              ...exp,
              settled: true,
              participants: exp.participants.map(p => ({ ...p, settled: true }))
            }
          : exp
      )
    }));
    toast.success('Expense settled!');
  };

  const toggleTheme = () => {
    setState(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  };

  const recentExpenses = state.expenses
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      state.theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900'
    }`}>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">SmartSplit</h1>
              <p className={`${state.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Split expenses with friends
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                state.theme === 'dark'
                  ? 'bg-gray-800 text-gray-300 hover:text-white'
                  : 'bg-white text-gray-600 hover:text-gray-900'
              }`}
            >
              {state.theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setShowCreateExpense(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-6 mb-8 ${
            state.theme === 'dark'
              ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50'
              : 'bg-white/80 backdrop-blur-sm border border-gray-200/50'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your Balance</h2>
            <button
              onClick={() => setBalanceVisible(!balanceVisible)}
              className={`p-2 rounded-lg transition-colors ${
                state.theme === 'dark'
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              {balanceVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {balanceVisible ? formatCurrency(balance.totalOwed, state.currency) : '••••••'}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">You're Owed</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {balanceVisible ? formatCurrency(balance.totalOwing, state.currency) : '••••••'}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">You Owe</div>
            </div>
            
            <div className={`text-center p-4 rounded-lg ${
              balance.netAmount >= 0 
                ? 'bg-blue-50 dark:bg-blue-900/20' 
                : 'bg-orange-50 dark:bg-orange-900/20'
            }`}>
              <div className={`text-2xl font-bold ${
                balance.netAmount >= 0 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-orange-600 dark:text-orange-400'
              }`}>
                {balanceVisible ? formatCurrency(Math.abs(balance.netAmount), state.currency) : '••••••'}
              </div>
              <div className={`text-sm ${
                balance.netAmount >= 0 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-orange-600 dark:text-orange-400'
              }`}>
                Net {balance.netAmount >= 0 ? 'Credit' : 'Debt'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Expenses */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Recent Expenses</h2>
            <div className="flex items-center space-x-2">
              <select
                value={state.currency}
                onChange={(e) => setState(prev => ({ ...prev, currency: e.target.value }))}
                className={`px-3 py-2 rounded-lg border ${
                  state.theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {currencies.map(curr => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
            </div>
          </div>

          {state.expenses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center py-12 rounded-2xl ${
                state.theme === 'dark'
                  ? 'bg-gray-800/50 border border-gray-700/50'
                  : 'bg-white/80 border border-gray-200/50'
              }`}
            >
              <div className="text-6xl mb-4">💸</div>
              <h3 className="text-xl font-semibold mb-2">No expenses yet</h3>
              <p className={`mb-6 ${state.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Start by creating your first expense split
              </p>
              <button
                onClick={() => setShowCreateExpense(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Create Your First Expense
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recentExpenses.map((expense, index) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-xl border transition-all hover:scale-[1.02] ${
                    state.theme === 'dark'
                      ? 'bg-gray-800/50 border-gray-700/50'
                      : 'bg-white border-gray-200/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{expense.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(expense.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{expense.participants.length} people</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">
                        {formatCurrency(expense.amount, expense.currency)}
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        expense.settled 
                          ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300'
                          : 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300'
                      }`}>
                        {expense.settled ? 'Settled' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Paid by: <span className="font-medium">
                        {state.users.find(u => u.id === expense.paidBy)?.name}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {expense.participants.map(participant => (
                        <div key={participant.id} className="flex items-center justify-between text-sm">
                          <span>{participant.name}</span>
                          <div className="flex items-center space-x-2">
                            <span>{formatCurrency(participant.amount, expense.currency)}</span>
                            {participant.settled ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <X className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!expense.settled && (
                      <button
                        onClick={() => handleSettle(expense.id)}
                        className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                      >
                        Settle
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(expense)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        state.theme === 'dark'
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Create/Edit Expense Modal */}
        <AnimatePresence>
          {showCreateExpense && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => {
                setShowCreateExpense(false);
                setEditingExpense(null);
                resetForm();
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-md rounded-xl shadow-xl p-6 ${
                  state.theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <h3 className="text-xl font-semibold mb-6">
                  {editingExpense ? 'Edit Expense' : 'Create New Expense'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        state.theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Enter expense title"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Amount *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => handleInputChange('amount', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          state.theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Date</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          state.theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        state.theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Paid By</label>
                    <select
                      value={formData.paidBy}
                      onChange={(e) => handleInputChange('paidBy', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        state.theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {state.users.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Participants *</label>
                    <div className="space-y-2">
                      {state.users.map(user => (
                        <label key={user.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.participants.includes(user.id)}
                            onChange={() => handleParticipantToggle(user.id)}
                            className="mr-3 h-4 w-4 text-purple-600 rounded"
                          />
                          <span>{user.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateExpense(false);
                        setEditingExpense(null);
                        resetForm();
                      }}
                      className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                        state.theme === 'dark'
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      {editingExpense ? 'Update' : 'Create'} Expense
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Stats */}
        {state.expenses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8"
          >
            <div className={`rounded-xl p-4 ${
              state.theme === 'dark'
                ? 'bg-gray-800/50 border border-gray-700/50'
                : 'bg-white border border-gray-200/50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${
                    state.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Total Expenses
                  </p>
                  <p className="text-2xl font-bold">{state.expenses.length}</p>
                </div>
                <Receipt className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className={`rounded-xl p-4 ${
              state.theme === 'dark'
                ? 'bg-gray-800/50 border border-gray-700/50'
                : 'bg-white border border-gray-200/50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${
                    state.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Total Amount
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(
                      state.expenses.reduce((sum, exp) => sum + exp.amount, 0),
                      state.currency
                    )}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className={`rounded-xl p-4 ${
              state.theme === 'dark'
                ? 'bg-gray-800/50 border border-gray-700/50'
                : 'bg-white border border-gray-200/50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${
                    state.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Settled
                  </p>
                  <p className="text-2xl font-bold text-green-500">
                    {state.expenses.filter(exp => exp.settled).length}
                  </p>
                </div>
                <Check className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className={`rounded-xl p-4 ${
              state.theme === 'dark'
                ? 'bg-gray-800/50 border border-gray-700/50'
                : 'bg-white border border-gray-200/50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${
                    state.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Pending
                  </p>
                  <p className="text-2xl font-bold text-orange-500">
                    {state.expenses.filter(exp => !exp.settled).length}
                  </p>
                </div>
                <X className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: state.theme === 'dark' ? '#374151' : '#ffffff',
            color: state.theme === 'dark' ? '#ffffff' : '#111827',
          },
        }}
      />
    </div>
  );
}

export default App;