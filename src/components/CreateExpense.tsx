// src/components/CreateExpense.tsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Minus,
  Users,
  Calculator,
  Receipt,
  Tags,
  Calendar,
  Camera,
  MapPin,
  Repeat,
  CreditCard,
  Search,
  X,
  Upload,
  Scan,
  DollarSign,
  Percent,
  Equal,
  Split,
  Clock,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Star,
  Zap,
  Globe,
  Smartphone,
  Image as ImageIcon,
  FileText,
  Save,
  Eye,
  EyeOff,
  Target,
  TrendingUp
} from 'lucide-react';

import { useExpense, Expense, Participant, User, Group, generateId, calculateSplitAmounts } from '../context/ExpenseContext';
import LoadingSpinner from './common/LoadingSpinner';
import ImageUpload from './common/ImageUpload';
import LocationPicker from './common/LocationPicker';
import ParticipantSelector from './common/ParticipantSelector';
import CategorySelector from './common/CategorySelector';
import PaymentMethodSelector from './common/PaymentMethodSelector';
import ReceiptScanner from './common/ReceiptScanner';
import SplitCalculator from './common/SplitCalculator';
import RecurringOptions from './common/RecurringOptions';
import toast from 'react-hot-toast';

interface CreateExpenseProps {
  editingExpense?: Expense;
  onComplete?: () => void;
}

const CreateExpense: React.FC<CreateExpenseProps> = ({ editingExpense, onComplete }) => {
  const { state, dispatch, helpers } = useExpense();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    title: editingExpense?.title || '',
    description: editingExpense?.description || '',
    baseAmount: editingExpense?.baseAmount?.toString() || '',
    tax: editingExpense?.tax?.toString() || '0',
    tip: editingExpense?.tip?.toString() || '0',
    currency: editingExpense?.currency || state.settings.defaultCurrency,
    splitType: editingExpense?.splitType || 'equal' as const,
    category: editingExpense?.category || '',
    subcategory: editingExpense?.subcategory || '',
    date: editingExpense?.date ? editingExpense.date.split('T')[0] : new Date().toISOString().split('T')[0],
    location: editingExpense?.location || null,
    notes: editingExpense?.notes || '',
    isRecurring: editingExpense?.isRecurring || false,
    recurringPattern: editingExpense?.recurringPattern || null
  });

  const [participants, setParticipants] = useState<Omit<Participant, 'owedAmount' | 'paidAmount' | 'netAmount'>[]>(
    editingExpense?.participants.map(p => ({
      id: p.id,
      name: p.name,
      email: p.email,
      avatar: p.avatar,
      settled: p.settled,
      splitType: p.splitType,
      splitValue: p.splitValue,
      itemizedSplit: p.itemizedSplit
    })) || [
      {
        id: state.currentUser?.id || 'user-1',
        name: state.currentUser?.name || 'You',
        email: state.currentUser?.email,
        avatar: state.currentUser?.avatar,
        settled: false,
        splitType: 'equal',
        splitValue: undefined,
        itemizedSplit: []
      }
    ]
  );

  const [paidBy, setPaidBy] = useState<string[]>(
    editingExpense?.paidBy || [state.currentUser?.id || 'user-1']
  );

  const [paymentBreakdown, setPaymentBreakdown] = useState(
    editingExpense?.paymentBreakdown || []
  );

  const [receiptImages, setReceiptImages] = useState<string[]>(
    editingExpense?.receiptImages || []
  );

  const [attachments, setAttachments] = useState(
    editingExpense?.attachments || []
  );

  const [tags, setTags] = useState<string[]>(
    editingExpense?.tags || []
  );

  // UI state
  const [currentStep, setCurrentStep] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showParticipantSearch, setShowParticipantSearch] = useState(false);
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [previewMode, setPreviewMode] = useState(false);

  // Refs
  const titleInputRef = useRef<HTMLInputElement>(null);
  const participantSearchRef = useRef<HTMLInputElement>(null);

  // Calculations
  const baseAmount = parseFloat(formData.baseAmount) || 0;
  const taxAmount = parseFloat(formData.tax) || 0;
  const tipAmount = parseFloat(formData.tip) || 0;
  const totalAmount = baseAmount + taxAmount + tipAmount;

  const calculatedParticipants = useMemo(() => {
    if (participants.length === 0 || totalAmount === 0) return [];

    try {
      return calculateSplitAmounts(totalAmount, participants, formData.splitType);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Split calculation error');
      return participants.map(p => ({ ...p, owedAmount: 0, paidAmount: 0, netAmount: 0 }));
    }
  }, [participants, formData.splitType, totalAmount]);

  // Smart suggestions
  const suggestedParticipants = useMemo(() => {
    const recentParticipants = new Set<string>();

    // Get participants from recent expenses
    state.expenses
      .filter(exp => new Date(exp.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .forEach(exp => {
        exp.participants.forEach(p => {
          if (p.id !== state.currentUser?.id) {
            recentParticipants.add(p.id);
          }
        });
      });

    return state.users.filter(user =>
      user.id !== state.currentUser?.id &&
      recentParticipants.has(user.id)
    ).slice(0, 6);
  }, [state.expenses, state.users, state.currentUser]);

  const suggestedCategories = useMemo(() => {
    const categoryUsage = new Map<string, number>();

    state.expenses.forEach(exp => {
      categoryUsage.set(exp.category, (categoryUsage.get(exp.category) || 0) + 1);
    });

    return Array.from(categoryUsage.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category]) => category);
  }, [state.expenses]);

  // Form steps
  const steps = [
    { id: 'basic', title: 'Basic Info', icon: Receipt },
    { id: 'participants', title: 'Participants', icon: Users },
    { id: 'split', title: 'Split Details', icon: Calculator },
    { id: 'advanced', title: 'Advanced', icon: Star }
  ];

  // Effects
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Auto-save to localStorage
    const autoSaveData = {
      formData,
      participants,
      paidBy,
      tags,
      timestamp: Date.now()
    };
    localStorage.setItem('createExpense_autoSave', JSON.stringify(autoSaveData));
  }, [formData, participants, paidBy, tags]);

  useEffect(() => {
    // Load auto-saved data
    const savedData = localStorage.getItem('createExpense_autoSave');
    if (savedData && !editingExpense) {
      try {
        const parsed = JSON.parse(savedData);
        const timeDiff = Date.now() - parsed.timestamp;

        if (timeDiff < 24 * 60 * 60 * 1000) { // 24 hours
          toast((t) => (
            <div className="flex items-center space-x-2">
              <span>Restore unsaved expense?</span>
              <button
                onClick={() => {
                  setFormData(parsed.formData);
                  setParticipants(parsed.participants);
                  setPaidBy(parsed.paidBy);
                  setTags(parsed.tags);
                  toast.dismiss(t.id);
                }}
                className="px-2 py-1 bg-purple-500 text-white rounded text-xs"
              >
                Restore
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="px-2 py-1 bg-gray-500 text-white rounded text-xs"
              >
                Dismiss
              </button>
            </div>
          ), { duration: 10000 });
        }
      } catch (error) {
        console.error('Failed to parse auto-saved data:', error);
      }
    }
  }, [editingExpense]);

  // Handlers
  const handleReceiptScan = (scannedData: any) => {
    if (scannedData.title) setFormData(prev => ({ ...prev, title: scannedData.title }));
    if (scannedData.amount) setFormData(prev => ({ ...prev, baseAmount: scannedData.amount.toString() }));
    if (scannedData.tax) setFormData(prev => ({ ...prev, tax: scannedData.tax.toString() }));
    if (scannedData.date) setFormData(prev => ({ ...prev, date: scannedData.date }));
    if (scannedData.merchant) setFormData(prev => ({ ...prev, description: scannedData.merchant }));

    toast.success('Receipt data extracted successfully!');
    setShowReceiptScanner(false);
  };

  const handleAddParticipant = (user: User) => {
    if (!participants.find(p => p.id === user.id)) {
      setParticipants(prev => [...prev, {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        settled: false,
        splitType: formData.splitType,
        splitValue: undefined,
        itemizedSplit: []
      }]);

      toast.success(`Added ${user.name} to the expense`);
    }
  };

  const handleRemoveParticipant = (id: string) => {
    if (participants.length > 1) {
      setParticipants(prev => prev.filter(p => p.id !== id));
      setPaidBy(prev => prev.filter(pid => pid !== id));

      const user = state.users.find(u => u.id === id);
      if (user) {
        toast.success(`Removed ${user.name} from the expense`);
      }
    }
  };

  const handleParticipantUpdate = (id: string, field: keyof Participant, value: any) => {
    setParticipants(prev => prev.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!baseAmount || baseAmount <= 0) {
      errors.baseAmount = 'Amount must be greater than 0';
    }

    if (participants.length === 0) {
      errors.participants = 'At least one participant is required';
    }

    if (paidBy.length === 0) {
      errors.paidBy = 'Someone must pay for this expense';
    }

    if (formData.splitType === 'percentage') {
      const totalPercentage = participants.reduce((sum, p) => sum + (p.splitValue || 0), 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        errors.splitType = 'Percentages must add up to 100%';
      }
    }

    if (formData.splitType === 'exact') {
      const totalExact = participants.reduce((sum, p) => sum + (p.splitValue || 0), 0);
      if (Math.abs(totalExact - totalAmount) > 0.01) {
        errors.splitType = 'Exact amounts must equal the total amount';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setIsSubmitting(true);

    try {
      const expense: Expense = {
        id: editingExpense?.id || generateId('expense'),
        title: formData.title.trim(),
        description: formData.description.trim(),
        baseAmount,
        tax: taxAmount,
        tip: tipAmount,
        totalAmount,
        currency: formData.currency,
        exchangeRate: formData.currency !== state.settings.defaultCurrency ? 1 : undefined,
        splitType: formData.splitType,
        participants: calculatedParticipants,
        paidBy,
        paymentBreakdown,
        category: formData.category,
        subcategory: formData.subcategory,
        date: new Date(formData.date).toISOString(),
        location: formData.location,
        settled: false,
        receiptImages,
        tags,
        groupId: undefined, // Can be set if creating from a group
        isRecurring: formData.isRecurring,
        recurringPattern: formData.recurringPattern,
        createdBy: state.currentUser?.id || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: formData.notes.trim(),
        attachments
      };

      if (editingExpense) {
        dispatch({ type: 'UPDATE_EXPENSE', payload: expense });
        toast.success('Expense updated successfully!');
      } else {
        dispatch({ type: 'ADD_EXPENSE', payload: expense });
        toast.success('Expense created successfully!');

        // Clear auto-save
        localStorage.removeItem('createExpense_autoSave');
      }

      if (onComplete) {
        onComplete();
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to save expense:', error);
      toast.error('Failed to save expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    const draftData = {
      formData,
      participants,
      paidBy,
      tags,
      receiptImages,
      attachments,
      timestamp: Date.now()
    };

    localStorage.setItem(`expenseDraft_${Date.now()}`, JSON.stringify(draftData));
    toast.success('Draft saved!');
  };

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className={`text-3xl font-bold ${state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
          {editingExpense ? 'Edit Expense' : 'Split a Bill'} 💸
        </h1>
        <p className={`text-lg ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
          {editingExpense ? 'Update your expense details' : 'Add a new expense and split it with friends'}
        </p>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center space-x-2 ${index < steps.length - 1 ? 'mr-4' : ''
                }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${index <= currentStep
                  ? 'bg-purple-500 text-white'
                  : state.settings.theme === 'dark'
                    ? 'bg-gray-700 text-gray-400'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                {index + 1}
              </div>
              <span className={`text-sm font-medium ${index <= currentStep
                  ? 'text-purple-500'
                  : state.settings.theme === 'dark'
                    ? 'text-gray-400'
                    : 'text-gray-500'
                }`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-2 ${index < currentStep ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
              )}
            </div>
          ))}
        </div>
        {/* Quick Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-6"
        >
          <button
            type="button"
            onClick={() => setShowReceiptScanner(true)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${state.settings.theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
          >
            <Scan className="w-4 h-4" />
            <span>Scan Receipt</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLocationPicker(true)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${state.settings.theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Add Location</span>
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${state.settings.theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
          >
            <Save className="w-4 h-4" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${previewMode
                ? 'bg-purple-500 border-purple-500 text-white'
                : state.settings.theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
          >
            {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{previewMode ? 'Edit' : 'Preview'}</span>
          </button>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Step 1: Basic Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-2xl p-6 border ${state.settings.theme === 'dark'
                ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-sm'
                : 'bg-white/80 border-gray-200/50 backdrop-blur-sm'
              }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-semibold flex items-center ${state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                <Receipt className="w-5 h-5 mr-2 text-purple-500" />
                Expense Details
              </h2>
              {receiptImages.length > 0 && (
                <div className="flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">{receiptImages.length} receipt(s)</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  What's this expense for? *
                </label>
                <input
                  ref={titleInputRef}
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full rounded-lg px-4 py-3 border transition-colors ${validationErrors.title
                      ? 'border-red-500 focus:ring-red-500'
                      : state.settings.theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500'
                    }`}
                  placeholder="e.g., Dinner at Italian restaurant"
                  required
                />
                {validationErrors.title && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.title}</p>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Total Amount *
                </label>
                <div className="relative">
                  <span className={`absolute left-3 top-3 text-lg font-medium ${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                    {formData.currency === 'INR' ? '₹' : '$'}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.baseAmount}
                    onChange={(e) => setFormData({ ...formData, baseAmount: e.target.value })}
                    className={`w-full rounded-lg pl-8 pr-4 py-3 border text-lg font-medium transition-colors ${validationErrors.baseAmount
                        ? 'border-red-500 focus:ring-red-500'
                        : state.settings.theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500'
                      }`}
                    placeholder="0.00"
                    required
                  />
                </div>
                {validationErrors.baseAmount && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.baseAmount}</p>
                )}
              </div>

              {/* Currency */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className={`w-full rounded-lg px-4 py-3 border transition-colors ${state.settings.theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500'
                    }`}
                >
                  {state.settings.supportedCurrencies.map(currency => (
                    <option key={currency} value={currency}>
                      {currency} {currency === 'INR' ? '(₹)' : '($)'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tax */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Tax ({formData.currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.tax}
                  onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                  className={`w-full rounded-lg px-4 py-3 border transition-colors ${state.settings.theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500'
                    }`}
                  placeholder="0.00"
                />
              </div>

              {/* Tip */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Tip ({formData.currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.tip}
                  onChange={(e) => setFormData({ ...formData, tip: e.target.value })}
                  className={`w-full rounded-lg px-4 py-3 border transition-colors ${state.settings.theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500'
                    }`}
                  placeholder="0.00"
                />
              </div>

              {/* Category */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Category *
                </label>
                <CategorySelector
                  value={formData.category}
                  onChange={(category) => setFormData({ ...formData, category })}
                  categories={state.categories}
                  suggestions={suggestedCategories}
                />
              </div>

              {/* Date */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={`w-full rounded-lg px-4 py-3 border transition-colors ${state.settings.theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500'
                      }`}
                  />
                  <Calendar className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Description (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full rounded-lg px-4 py-3 border transition-colors ${state.settings.theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500'
                    }`}
                  rows={3}
                  placeholder="Add more details about this expense..."
                />
              </div>

              {/* Location Display */}
              {formData.location && (
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    Location
                  </label>
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${state.settings.theme === 'dark'
                      ? 'bg-gray-700 border-gray-600'
                      : 'bg-gray-50 border-gray-200'
                    }`}>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-green-500" />
                      <span className={`text-sm ${state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                        {formData.location.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, location: null })}
                      className="text-red-500 hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Total Amount Breakdown */}
              {(totalAmount > 0) && (
                <div className="md:col-span-2">
                  <div className={`p-4 rounded-lg ${state.settings.theme === 'dark'
                      ? 'bg-purple-900/30 border border-purple-500/30'
                      : 'bg-purple-50 border border-purple-200'
                    }`}>
                    <h3 className={`font-semibold mb-2 ${state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                      Amount Breakdown
                    </h3>
                    <div className="space-y-1 text-sm">
                      <div className={`flex justify-between ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        <span>Base amount:</span>
                        <span>{formData.currency} {baseAmount.toFixed(2)}</span>
                      </div>
                      {taxAmount > 0 && (
                        <div className={`flex justify-between ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          <span>Tax:</span>
                          <span>{formData.currency} {taxAmount.toFixed(2)}</span>
                        </div>
                      )}
                      {tipAmount > 0 && (
                        <div className={`flex justify-between ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          <span>Tip:</span>
                          <span>{formData.currency} {tipAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className={`flex justify-between font-semibold text-lg border-t pt-1 ${state.settings.theme === 'dark'
                          ? 'text-purple-300 border-purple-500/30'
                          : 'text-purple-600 border-purple-200'
                        }`}>
                        <span>Total:</span>
                        <span>{formData.currency} {totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Step 2: Participants */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-2xl p-6 border ${state.settings.theme === 'dark'
                ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-sm'
                : 'bg-white/80 border-gray-200/50 backdrop-blur-sm'
              }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-semibold flex items-center ${state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                <Users className="w-5 h-5 mr-2 text-purple-500" />
                Who's involved? ({participants.length})
              </h2>
              <button
                type="button"
                onClick={() => setShowParticipantSearch(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add People</span>
              </button>
            </div>

            {validationErrors.participants && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.participants}</p>
              </div>
            )}

            {/* Quick Add Suggestions */}
            {suggestedParticipants.length > 0 && (
              <div className="mb-6">
                <h3 className={`text-sm font-medium mb-3 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Recently split with
                </h3>
                <div className="flex flex-wrap gap-2">
                  {suggestedParticipants.map(user => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleAddParticipant(user)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${participants.some(p => p.id === user.id)
                          ? 'bg-purple-500 border-purple-500 text-white'
                          : state.settings.theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <span className="text-sm">{user.name}</span>
                      {participants.some(p => p.id === user.id) && (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Participants List */}
            <div className="space-y-4">
              {participants.map((participant, index) => (
                <motion.div
                  key={participant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`p-4 rounded-xl border ${state.settings.theme === 'dark'
                      ? 'bg-gray-700/50 border-gray-600'
                      : 'bg-gray-50 border-gray-200'
                    }`}
                >
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {participant.avatar ? (
                        <img
                          src={participant.avatar}
                          alt={participant.name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-medium">
                          {participant.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Participant Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className={`font-medium truncate ${state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                          {participant.name}
                          {participant.id === state.currentUser?.id && (
                            <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded-full">
                              You
                            </span>
                          )}
                        </h3>
                        {index === 0 && (
                          <Star className="w-4 h-4 text-yellow-500" title="Expense creator" />
                        )}
                      </div>
                      {participant.email && (
                        <p className={`text-sm truncate ${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                          {participant.email}
                        </p>
                      )}
                    </div>

                    {/* Payment Options */}
                    <div className="flex items-center space-x-3">
                      {/* Paid By Checkbox */}
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={paidBy.includes(participant.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPaidBy(prev => [...prev, participant.id]);
                            } else {
                              setPaidBy(prev => prev.filter(id => id !== participant.id));
                            }
                          }}
                          className="w-4 h-4 text-purple-500 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500 dark:focus:ring-purple-600"
                        />
                        <span className={`text-sm ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          Paid
                        </span>
                      </label>

                      {/* Amount Display */}
                      <div className="text-right">
                        <div className={`font-semibold ${state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                          {formData.currency} {calculatedParticipants.find(p => p.id === participant.id)?.owedAmount?.toFixed(2) || '0.00'}
                        </div>
                        <div className={`text-xs ${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                          owes
                        </div>
                      </div>

                      {/* Remove Button */}
                      {participants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveParticipant(participant.id)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          title="Remove participant"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {validationErrors.paidBy && (
              <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.paidBy}</p>
              </div>
            )}
          </motion.div>

          {/* Step 3: Split Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-2xl p-6 border ${state.settings.theme === 'dark'
                ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-sm'
                : 'bg-white/80 border-gray-200/50 backdrop-blur-sm'
              }`}
          >
            <h2 className={`text-xl font-semibold mb-6 flex items-center ${state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
              <Calculator className="w-5 h-5 mr-2 text-purple-500" />
              How should this be split?
            </h2>

            {/* Split Type Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                {
                  value: 'equal',
                  label: 'Equally',
                  description: 'Split the total amount equally',
                  icon: Equal,
                  recommended: participants.length <= 4
                },
                {
                  value: 'percentage',
                  label: 'By Percentage',
                  description: 'Each person pays a percentage',
                  icon: Percent,
                  recommended: false
                },
                {
                  value: 'exact',
                  label: 'Exact Amounts',
                  description: 'Enter specific amounts',
                  icon: DollarSign,
                  recommended: false
                },
                {
                  value: 'shares',
                  label: 'By Shares',
                  description: 'Based on number of shares',
                  icon: Split,
                  recommended: false
                }
              ].map((option) => {
                const IconComponent = option.icon;
                return (
                  <label
                    key={option.value}
                    className={`relative cursor-pointer p-4 rounded-xl border-2 transition-all hover:scale-[1.02] ${formData.splitType === option.value
                        ? 'border-purple-500 bg-purple-500/10'
                        : state.settings.theme === 'dark'
                          ? 'border-gray-600 hover:border-gray-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <input
                      type="radio"
                      name="splitType"
                      value={option.value}
                      checked={formData.splitType === option.value}
                      onChange={(e) => setFormData({ ...formData, splitType: e.target.value as any })}
                      className="sr-only"
                    />

                    {option.recommended && (
                      <div className="absolute -top-2 -right-2">
                        <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                          <Zap className="w-3 h-3" />
                          <span>Recommended</span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col items-center space-y-3">
                      <div className={`p-3 rounded-full ${formData.splitType === option.value
                          ? 'bg-purple-500 text-white'
                          : state.settings.theme === 'dark'
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                        <IconComponent className="w-6 h-6" />
                      </div>

                      <div className="text-center">
                        <div className={`font-semibold ${state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                          {option.label}
                        </div>
                        <div className={`text-sm mt-1 ${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            {validationErrors.splitType && (
              <div className="mb-6 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.splitType}</p>
              </div>
            )}

            {/* Split Calculator */}
            {formData.splitType !== 'equal' && totalAmount > 0 && (
              <SplitCalculator
                splitType={formData.splitType}
                participants={participants}
                totalAmount={totalAmount}
                currency={formData.currency}
                onParticipantUpdate={handleParticipantUpdate}
              />
            )}

            {/* Split Summary */}
            {totalAmount > 0 && calculatedParticipants.length > 0 && (
              <div className={`mt-6 p-4 rounded-xl ${state.settings.theme === 'dark'
                  ? 'bg-gray-700/50 border border-gray-600'
                  : 'bg-gray-50 border border-gray-200'
                }`}>
                <h3 className={`font-semibold mb-3 ${state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                  Split Summary
                </h3>

                <div className="space-y-2">
                  {calculatedParticipants.map(participant => (
                    <div key={participant.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-medium">
                          {participant.name.charAt(0).toUpperCase()}
                        </div>
                        <span className={`text-sm ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          {participant.name}
                        </span>
                        {paidBy.includes(participant.id) && (
                          <span className="text-xs bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 px-2 py-0.5 rounded-full">
                            Paid
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                          {formData.currency} {participant.owedAmount.toFixed(2)}
                        </div>
                        {participant.netAmount !== 0 && (
                          <div className={`text-xs ${participant.netAmount > 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                            {participant.netAmount > 0 ? 'gets back' : 'owes'} {formData.currency} {Math.abs(participant.netAmount).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className={`mt-3 pt-3 border-t flex justify-between items-center ${state.settings.theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                  }`}>
                  <span className={`font-semibold ${state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                    Total
                  </span>
                  <span className={`font-semibold text-lg ${state.settings.theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                    }`}>
                    {formData.currency} {totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Step 4: Advanced Options */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className={`rounded-2xl border ${state.settings.theme === 'dark'
                ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-sm'
                : 'bg-white/80 border-gray-200/50 backdrop-blur-sm'
              }`}
          >
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full p-6 flex items-center justify-between text-left"
            >
              <h2 className={`text-xl font-semibold flex items-center ${state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                <Star className="w-5 h-5 mr-2 text-purple-500" />
                Advanced Options
              </h2>
              {showAdvanced ? (
                <ChevronUp className={`w-5 h-5 ${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`} />
              ) : (
                <ChevronDown className={`w-5 h-5 ${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`} />
              )}
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-6 pb-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tags */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        Tags
                      </label>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center space-x-1 px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full text-sm"
                            >
                              <span>{tag}</span>
                              <button
                                type="button"
                                onClick={() => setTags(prev => prev.filter((_, i) => i !== index))}
                                className="text-purple-400 hover:text-purple-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder="Add a tag and press Enter"
                          className={`w-full rounded-lg px-4 py-3 border transition-colors ${state.settings.theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                              : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500'
                            }`}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const value = (e.target as HTMLInputElement).value.trim();
                              if (value && !tags.includes(value)) {
                                setTags(prev => [...prev, value]);
                                (e.target as HTMLInputElement).value = '';
                              }
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        Additional Notes
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className={`w-full rounded-lg px-4 py-3 border transition-colors ${state.settings.theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                            : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500'
                          }`}
                        rows={3}
                        placeholder="Any additional notes about this expense..."
                      />
                    </div>

                    {/* Recurring Options */}
                    <div className="md:col-span-2">
                      <div className="flex items-center space-x-3 mb-4">
                        <input
                          type="checkbox"
                          id="recurring"
                          checked={formData.isRecurring}
                          onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                          className="w-4 h-4 text-purple-500 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500"
                        />
                        <label htmlFor="recurring" className={`text-sm font-medium ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          Make this a recurring expense
                        </label>
                      </div>

                      {formData.isRecurring && (
                        <RecurringOptions
                          pattern={formData.recurringPattern}
                          onChange={(pattern) => setFormData({ ...formData, recurringPattern: pattern })}
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4"
          >
            <button
              type="button"
              onClick={() => navigate('/')}
              className={`w-full sm:w-auto px-8 py-3 rounded-lg border transition-all hover:scale-[1.02] ${state.settings.theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || participants.length === 0 || !totalAmount}
              className={`w-full sm:w-auto px-8 py-3 rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center justify-center space-x-2 ${isSubmitting || participants.length === 0 || !totalAmount
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl'
                }`}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="small" />
                  <span>{editingExpense ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <>
                  <Receipt className="w-5 h-5" />
                  <span>{editingExpense ? 'Update Expense' : 'Split the Bill'}</span>
                </>
              )}
            </button>
          </motion.div>

          {/* Quick Summary Card */}
          {totalAmount > 0 && calculatedParticipants.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className={`sticky bottom-4 p-4 rounded-xl shadow-lg border ${state.settings.theme === 'dark'
                  ? 'bg-gray-800/95 border-gray-700 backdrop-blur-sm'
                  : 'bg-white/95 border-gray-200 backdrop-blur-sm'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`text-sm ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                    {participants.length} people • {formData.splitType} split
                  </div>
                  <div className={`font-semibold ${state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                    Total: {formData.currency} {totalAmount.toFixed(2)}
                  </div>
                </div>
                <div className={`text-sm ${state.settings.theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                  }`}>
                  {formData.currency} {(totalAmount / participants.length).toFixed(2)} per person
                </div>
              </div>
            </motion.div>
          )}
        </form>

        {/* Modals */}
        <AnimatePresence>
          {/* Receipt Scanner Modal */}
          {showReceiptScanner && (
            <ReceiptScanner
              isOpen={showReceiptScanner}
              onClose={() => setShowReceiptScanner(false)}
              onScan={handleReceiptScan}
            />
          )}

          {/* Location Picker Modal */}
          {showLocationPicker && (
            <LocationPicker
              isOpen={showLocationPicker}
              onClose={() => setShowLocationPicker(false)}
              onLocationSelect={(location) => {
                setFormData({ ...formData, location });
                setShowLocationPicker(false);
              }}
            />
          )}

          {/* Participant Search Modal */}
          {showParticipantSearch && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowParticipantSearch(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-md rounded-2xl p-6 ${state.settings.theme === 'dark'
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-gray-200'
                  }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                    Add People
                  </h3>
                  <button
                    onClick={() => setShowParticipantSearch(false)}
                    className={`p-2 rounded-lg transition-colors ${state.settings.theme === 'dark'
                        ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <ParticipantSelector
                  users={state.users.filter(user =>
                    user.id !== state.currentUser?.id &&
                    !participants.some(p => p.id === user.id)
                  )}
                  onSelect={(user) => {
                    handleAddParticipant(user);
                    setShowParticipantSearch(false);
                  }}
                  placeholder="Search for friends..."
                />

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      // Navigate to add new user flow
                      setShowParticipantSearch(false);
                      navigate('/users/create');
                    }}
                    className="flex items-center space-x-2 text-purple-500 hover:text-purple-400 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add new friend</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image Upload Modal */}
        <ImageUpload
          images={receiptImages}
          onImagesChange={setReceiptImages}
          maxImages={5}
          acceptedTypes={['image/*']}
          onOCRExtract={handleReceiptScan}
        />

        {/* Floating Help Button */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1 }}
          className="fixed bottom-20 right-6 z-40"
        >
          <button
            type="button"
            onClick={() => {
              toast((t) => (
                <div className="max-w-sm">
                  <h4 className="font-semibold mb-2">💡 Quick Tips</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Scan receipts for quick data entry</li>
                    <li>• Use "Equal" split for most situations</li>
                    <li>• Add location to track where you spent</li>
                    <li>• Tag expenses for better organization</li>
                  </ul>
                </div>
              ), { duration: 8000 });
            }}
            className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 ${state.settings.theme === 'dark'
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
          >
            <span className="text-xl">💡</span>
          </button>
        </motion.div>

        {/* Draft Auto-save Indicator */}
        <AnimatePresence>
          {formData.title && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="fixed bottom-4 left-4 z-30"
            >
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${state.settings.theme === 'dark'
                  ? 'bg-gray-800/90 text-gray-300 border border-gray-700'
                  : 'bg-white/90 text-gray-600 border border-gray-200'
                }`}>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Auto-saved</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
};

export default CreateExpense;