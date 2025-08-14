// src/components/History.tsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Download,
  Calendar,
  Users,
  Receipt,
  CheckCircle,
  Clock,
  Trash2,
  Edit,
  Eye,
  MoreVertical,
  ArrowUpDown,
  X,
  Plus,
  CalendarRange,
  DollarSign,
  User,
  Tag,
  FileText,
  Share,
  Copy,
  Archive,
  Star,
  StarOff,
  CreditCard,
  MapPin,
  Camera,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Equal,
  Percent,
  Split,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Settings,
  BookmarkPlus,
  Bookmark,
  SlidersHorizontal,
  List,
  Grid,
  Timeline,
  ExternalLink,
  AlertTriangle,
  Info
} from 'lucide-react';

import { useExpense, Expense, formatCurrency, generateId } from '../context/ExpenseContext';
import LoadingSpinner from './common/LoadingSpinner';
import EmptyState from './common/EmptyState';
import ExpenseCard from './history/ExpenseCard';
import ExpenseTimeline from './history/ExpenseTimeline';
import BulkActionsBar from './history/BulkActionsBar';
import FilterPanel from './history/FilterPanel';
import ExportModal from './history/ExportModal';
import ExpenseDetailsModal from './common/ExpenseDetailsModal';
import ConfirmDialog from './common/ConfirmDialog';
import DateRangePicker from './common/DateRangePicker';
import toast from 'react-hot-toast';

interface FilterState {
  search: string;
  categories: string[];
  statuses: string[];
  participants: string[];
  groups: string[];
  dateRange: { start: string; end: string } | null;
  amountRange: { min: number; max: number } | null;
  paymentMethods: string[];
  tags: string[];
  splitTypes: string[];
  hasReceipts: boolean | null;
  hasLocation: boolean | null;
  isRecurring: boolean | null;
}

interface SortState {
  field: 'date' | 'amount' | 'title' | 'participants' | 'status';
  order: 'asc' | 'desc';
}

const History: React.FC = () => {
  const { state, dispatch, helpers } = useExpense();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State management
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('search') || '',
    categories: searchParams.getAll('category'),
    statuses: searchParams.getAll('status') || ['settled', 'pending'],
    participants: searchParams.getAll('participant'),
    groups: searchParams.getAll('group'),
    dateRange: null,
    amountRange: null,
    paymentMethods: [],
    tags: searchParams.getAll('tag'),
    splitTypes: [],
    hasReceipts: null,
    hasLocation: null,
    isRecurring: null
  });

  const [sort, setSort] = useState<SortState>({
    field: 'date',
    order: 'desc'
  });

  const [viewMode, setViewMode] = useState<'cards' | 'list' | 'timeline'>('cards');
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set());
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [savedFilters, setSavedFilters] = useState<Array<{ id: string; name: string; filters: FilterState }>>([]);

  // Loading and pagination
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // Confirmation dialogs
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'info'
  });

  // Enhanced expense data with calculations
  const enhancedExpenses = useMemo(() => {
    return state.expenses.map(expense => {
      const currentUserParticipant = expense.participants.find(p => p.id === state.currentUser?.id);
      const paidByUser = state.users.find(u => expense.paidBy.includes(u.id));
      const group = expense.groupId ? state.groups.find(g => g.id === expense.groupId) : null;
      
      return {
        ...expense,
        currentUserShare: currentUserParticipant?.owedAmount || 0,
        currentUserNet: currentUserParticipant?.netAmount || 0,
        isPaidByCurrentUser: expense.paidBy.includes(state.currentUser?.id || ''),
        isOwedMoney: (currentUserParticipant?.netAmount || 0) > 0,
        isOwingMoney: (currentUserParticipant?.netAmount || 0) < 0,
        paidByUser,
        group,
        participantNames: expense.participants.map(p => p.name).join(', '),
        daysAgo: Math.floor((Date.now() - new Date(expense.date).getTime()) / (1000 * 60 * 60 * 24)),
        settlementStatus: expense.settled ? 'settled' : 
                         (currentUserParticipant?.netAmount || 0) === 0 ? 'even' : 'pending'
      };
    });
  }, [state.expenses, state.users, state.groups, state.currentUser]);

  // Filtered and sorted expenses
  const filteredExpenses = useMemo(() => {
    let filtered = enhancedExpenses.filter(expense => {
      // Search filter
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = !filters.search || 
        expense.title.toLowerCase().includes(searchLower) ||
        expense.description.toLowerCase().includes(searchLower) ||
        expense.participantNames.toLowerCase().includes(searchLower) ||
        expense.paidByUser?.name.toLowerCase().includes(searchLower) ||
        expense.tags.some(tag => tag.toLowerCase().includes(searchLower));

      // Category filter
      const matchesCategory = filters.categories.length === 0 || 
        filters.categories.includes(expense.category);

      // Status filter
      const matchesStatus = filters.statuses.length === 0 || 
        filters.statuses.includes(expense.settlementStatus);

      // Participants filter
      const matchesParticipants = filters.participants.length === 0 ||
        filters.participants.some(participantId => 
          expense.participants.some(p => p.id === participantId)
        );

      // Groups filter
      const matchesGroups = filters.groups.length === 0 ||
        (expense.groupId && filters.groups.includes(expense.groupId));

      // Date range filter
      const matchesDateRange = !filters.dateRange ||
        (new Date(expense.date) >= new Date(filters.dateRange.start) &&
         new Date(expense.date) <= new Date(filters.dateRange.end));

      // Amount range filter
      const matchesAmountRange = !filters.amountRange ||
        (expense.totalAmount >= filters.amountRange.min &&
         expense.totalAmount <= filters.amountRange.max);

      // Tags filter
      const matchesTags = filters.tags.length === 0 ||
        filters.tags.every(tag => expense.tags.includes(tag));

      // Split type filter
      const matchesSplitType = filters.splitTypes.length === 0 ||
        filters.splitTypes.includes(expense.splitType);

      // Receipt filter
      const matchesReceipts = filters.hasReceipts === null ||
        (filters.hasReceipts === true && (expense.receiptImages?.length || 0) > 0) ||
        (filters.hasReceipts === false && (expense.receiptImages?.length || 0) === 0);

      // Location filter
      const matchesLocation = filters.hasLocation === null ||
        (filters.hasLocation === true && expense.location !== null) ||
        (filters.hasLocation === false && expense.location === null);

      // Recurring filter
      const matchesRecurring = filters.isRecurring === null ||
        expense.isRecurring === filters.isRecurring;

      return matchesSearch && matchesCategory && matchesStatus && 
             matchesParticipants && matchesGroups && matchesDateRange && 
             matchesAmountRange && matchesTags && matchesSplitType && 
             matchesReceipts && matchesLocation && matchesRecurring;
    });

    // Sort expenses
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sort.field) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'amount':
          aValue = a.totalAmount;
          bValue = b.totalAmount;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'participants':
          aValue = a.participants.length;
          bValue = b.participants.length;
          break;
        case 'status':
          aValue = a.settlementStatus;
          bValue = b.settlementStatus;
          break;
        default:
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
      }

      if (sort.order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [enhancedExpenses, filters, sort]);

  // Paginated expenses
  const paginatedExpenses = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredExpenses.slice(0, start + pageSize);
  }, [filteredExpenses, page, pageSize]);

  // Statistics
  const stats = useMemo(() => {
    const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.totalAmount, 0);
    const settledAmount = filteredExpenses
      .filter(exp => exp.settled)
      .reduce((sum, exp) => sum + exp.totalAmount, 0);
    const pendingAmount = totalAmount - settledAmount;
    
    const currentUserOwed = filteredExpenses.reduce((sum, exp) => 
      sum + (exp.currentUserNet > 0 ? exp.currentUserNet : 0), 0);
    const currentUserOwes = filteredExpenses.reduce((sum, exp) => 
      sum + (exp.currentUserNet < 0 ? Math.abs(exp.currentUserNet) : 0), 0);

    const categoryBreakdown = new Map<string, number>();
    filteredExpenses.forEach(exp => {
      categoryBreakdown.set(exp.category, (categoryBreakdown.get(exp.category) || 0) + exp.totalAmount);
    });

    return {
      totalCount: filteredExpenses.length,
      totalAmount,
      settledAmount,
      pendingAmount,
      settlementRate: totalAmount > 0 ? (settledAmount / totalAmount) * 100 : 0,
      currentUserOwed,
      currentUserOwes,
      currentUserNet: currentUserOwed - currentUserOwes,
      topCategory: Array.from(categoryBreakdown.entries())
        .sort((a, b) => b[1] - a[1])[0] || null
    };
  }, [filteredExpenses]);

  // Handle filter changes
  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      categories: [],
      statuses: ['settled', 'pending'],
      participants: [],
      groups: [],
      dateRange: null,
      amountRange: null,
      paymentMethods: [],
      tags: [],
      splitTypes: [],
      hasReceipts: null,
      hasLocation: null,
      isRecurring: null
    });
    setPage(1);
  }, []);

  // Handle sort changes
  const updateSort = useCallback((field: SortState['field']) => {
    setSort(prev => ({
      field,
      order: prev.field === field && prev.order === 'desc' ? 'asc' : 'desc'
    }));
  }, []);

  // Bulk actions
  const handleBulkSettle = useCallback(async () => {
    const expensesToSettle = Array.from(selectedExpenses);
    setIsLoading(true);
    
    try {
      for (const expenseId of expensesToSettle) {
        dispatch({ type: 'SETTLE_EXPENSE', payload: expenseId });
      }
      toast.success(`Settled ${expensesToSettle.length} expense(s)`);
      setSelectedExpenses(new Set());
    } catch (error) {
      toast.error('Failed to settle expenses');
    } finally {
      setIsLoading(false);
    }
  }, [selectedExpenses, dispatch]);

  const handleBulkDelete = useCallback(async () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Expenses',
      message: `Are you sure you want to delete ${selectedExpenses.size} expense(s)? This action cannot be undone.`,
      onConfirm: async () => {
        setIsLoading(true);
        try {
          for (const expenseId of selectedExpenses) {
            dispatch({ type: 'DELETE_EXPENSE', payload: expenseId });
          }
          toast.success(`Deleted ${selectedExpenses.size} expense(s)`);
          setSelectedExpenses(new Set());
        } catch (error) {
          toast.error('Failed to delete expenses');
        } finally {
          setIsLoading(false);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
      type: 'danger'
    });
  }, [selectedExpenses, dispatch]);

  // Export functionality
  const handleExport = useCallback((format: 'csv' | 'json' | 'pdf', expenses: Expense[]) => {
    try {
      const data = helpers.exportData(format, {
        start: filters.dateRange?.start || '',
        end: filters.dateRange?.end || ''
      });
      
      const blob = new Blob([data], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smartsplit-history-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success(`Exported ${expenses.length} expense(s) as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export data');
    }
  }, [filters.dateRange, helpers]);

  // Save and load filters
  const saveCurrentFilter = useCallback(() => {
    const filterName = prompt('Enter a name for this filter:');
    if (filterName) {
      const newFilter = {
        id: generateId('filter'),
        name: filterName,
        filters: { ...filters }
      };
      setSavedFilters(prev => [...prev, newFilter]);
      localStorage.setItem('smartsplit_saved_filters', JSON.stringify([...savedFilters, newFilter]));
      toast.success('Filter saved successfully');
    }
  }, [filters, savedFilters]);

  const loadSavedFilter = useCallback((savedFilter: typeof savedFilters[0]) => {
    setFilters(savedFilter.filters);
    setPage(1);
    toast.success(`Loaded filter: ${savedFilter.name}`);
  }, []);

  // Individual expense actions
  const handleToggleSettle = useCallback((expense: Expense) => {
    dispatch({ 
      type: expense.settled ? 'UPDATE_EXPENSE' : 'SETTLE_EXPENSE', 
      payload: expense.settled 
        ? { ...expense, settled: false, participants: expense.participants.map(p => ({ ...p, settled: false })) }
        : expense.id
    });
    toast.success(`Expense ${expense.settled ? 'marked as pending' : 'settled'}`);
  }, [dispatch]);

  const handleDeleteExpense = useCallback((expense: Expense) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Expense',
      message: `Are you sure you want to delete "${expense.title}"? This action cannot be undone.`,
      onConfirm: () => {
        dispatch({ type: 'DELETE_EXPENSE', payload: expense.id });
        toast.success('Expense deleted successfully');
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
      type: 'danger'
    });
  }, [dispatch]);

    const handleEditExpense = useCallback((expense: Expense) => {
    navigate(`/expense/${expense.id}/edit`);
  }, [navigate]);

  const handleViewExpenseDetails = useCallback((expense: Expense) => {
    setSelectedExpense(expense);
  }, []);

  const handleDuplicateExpense = useCallback((expense: Expense) => {
    const duplicatedExpense = {
      ...expense,
      id: generateId('expense'),
      title: `${expense.title} (Copy)`,
      date: new Date().toISOString(),
      settled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      participants: expense.participants.map(p => ({ ...p, settled: false }))
    };
    
    dispatch({ type: 'ADD_EXPENSE', payload: duplicatedExpense });
    toast.success('Expense duplicated successfully');
  }, [dispatch]);

  // Load saved filters on mount
  useEffect(() => {
    const saved = localStorage.getItem('smartsplit_saved_filters');
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load saved filters:', error);
      }
    }
  }, []);

  // Update URL search params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.search) params.set('search', filters.search);
    filters.categories.forEach(cat => params.append('category', cat));
    filters.statuses.forEach(status => params.append('status', status));
    filters.participants.forEach(participant => params.append('participant', participant));
    filters.groups.forEach(group => params.append('group', group));
    filters.tags.forEach(tag => params.append('tag', tag));
    
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (state.isLoading && !enhancedExpenses.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className={`text-3xl font-bold ${
            state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Transaction History 📊
          </h1>
          <p className={`text-lg mt-2 ${
            state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            View and manage all your shared expenses
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className={`flex rounded-lg border ${
            state.settings.theme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            {[
              { mode: 'cards', icon: Grid, label: 'Cards' },
              { mode: 'list', icon: List, label: 'List' },
              { mode: 'timeline', icon: Timeline, label: 'Timeline' }
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-purple-500 text-white'
                    : state.settings.theme === 'dark'
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                } ${mode === 'cards' ? 'rounded-l-lg' : mode === 'timeline' ? 'rounded-r-lg' : ''}`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Export Button */}
          <motion.button
            onClick={() => setShowExportModal(true)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
              state.settings.theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </motion.button>

          {/* Filter Toggle */}
          <motion.button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              showFilterPanel
                ? 'bg-purple-500 text-white'
                : state.settings.theme === 'dark'
                  ? 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {Object.values(filters).some(v => 
              Array.isArray(v) ? v.length > 0 : v !== null && v !== ''
            ) && (
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className={`rounded-xl p-4 ${
          state.settings.theme === 'dark'
            ? 'bg-gray-800/50 border border-gray-700/50'
            : 'bg-white border border-gray-200/50'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Total Expenses
              </p>
              <p className={`text-2xl font-bold ${
                state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {stats.totalCount}
              </p>
            </div>
            <Receipt className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className={`rounded-xl p-4 ${
          state.settings.theme === 'dark'
            ? 'bg-gray-800/50 border border-gray-700/50'
            : 'bg-white border border-gray-200/50'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Total Amount
              </p>
              <p className={`text-xl font-bold ${
                state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {formatCurrency(stats.totalAmount, state.settings.defaultCurrency)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className={`rounded-xl p-4 ${
          state.settings.theme === 'dark'
            ? 'bg-gray-800/50 border border-gray-700/50'
            : 'bg-white border border-gray-200/50'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Settled
              </p>
              <p className="text-xl font-bold text-green-500">
                {formatCurrency(stats.settledAmount, state.settings.defaultCurrency)}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className={`rounded-xl p-4 ${
          state.settings.theme === 'dark'
            ? 'bg-gray-800/50 border border-gray-700/50'
            : 'bg-white border border-gray-200/50'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Pending
              </p>
              <p className="text-xl font-bold text-orange-500">
                {formatCurrency(stats.pendingAmount, state.settings.defaultCurrency)}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className={`rounded-xl p-4 ${
          state.settings.theme === 'dark'
            ? 'bg-gray-800/50 border border-gray-700/50'
            : 'bg-white border border-gray-200/50'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                You're Owed
              </p>
              <p className="text-xl font-bold text-green-500">
                {formatCurrency(stats.currentUserOwed, state.settings.defaultCurrency)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className={`rounded-xl p-4 ${
          state.settings.theme === 'dark'
            ? 'bg-gray-800/50 border border-gray-700/50'
            : 'bg-white border border-gray-200/50'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                You Owe
              </p>
              <p className="text-xl font-bold text-red-500">
                {formatCurrency(stats.currentUserOwes, state.settings.defaultCurrency)}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </motion.div>

      {/* Search and Quick Filters */}
      <motion.div variants={itemVariants} className={`rounded-xl p-6 ${
        state.settings.theme === 'dark'
          ? 'bg-gray-800/50 border border-gray-700/50'
          : 'bg-white/80 border border-gray-200/50'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses, participants, or descriptions..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                state.settings.theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500'
              }`}
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={filters.statuses.length === 1 ? filters.statuses[0] : 'all'}
              onChange={(e) => {
                const value = e.target.value;
                updateFilters({ 
                  statuses: value === 'all' ? ['settled', 'pending'] : [value] 
                });
              }}
              className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                state.settings.theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500'
              }`}
            >
              <option value="all">All Status</option>
              <option value="settled">Settled</option>
              <option value="pending">Pending</option>
              <option value="even">Even</option>
            </select>

            {/* Sort */}
            <div className="flex items-center space-x-1">
              <select
                value={sort.field}
                onChange={(e) => updateSort(e.target.value as SortState['field'])}
                className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                  state.settings.theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500'
                }`}
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="title">Title</option>
                <option value="participants">Participants</option>
                <option value="status">Status</option>
              </select>

              <button
                onClick={() => updateSort(sort.field)}
                className={`p-2 rounded-lg border transition-colors ${
                  state.settings.theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                    : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                }`}
              >
                {sort.order === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Clear Filters */}
            {(filters.search || filters.categories.length > 0 || filters.statuses.length < 2) && (
              <button
                onClick={clearFilters}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                  state.settings.theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <X className="w-4 h-4" />
                <span className="text-sm">Clear</span>
              </button>
            )}

            {/* Save Filter */}
            {Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : v !== null && v !== '') && (
              <button
                onClick={saveCurrentFilter}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                  state.settings.theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                                <BookmarkPlus className="w-4 h-4" />
                <span className="text-sm">Save</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {(filters.categories.length > 0 || filters.participants.length > 0 || filters.tags.length > 0) && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className={`text-sm font-medium ${
              state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Active filters:
            </span>
            
            {filters.categories.map(category => (
              <span
                key={`cat-${category}`}
                className="inline-flex items-center space-x-1 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full text-sm"
              >
                <span>{category}</span>
                <button
                  onClick={() => updateFilters({ 
                    categories: filters.categories.filter(c => c !== category) 
                  })}
                  className="text-purple-400 hover:text-purple-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {filters.participants.map(participantId => {
              const user = state.users.find(u => u.id === participantId);
              return user ? (
                <span
                  key={`participant-${participantId}`}
                  className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-sm"
                >
                  <span>{user.name}</span>
                  <button
                    onClick={() => updateFilters({ 
                      participants: filters.participants.filter(p => p !== participantId) 
                    })}
                    className="text-blue-400 hover:text-blue-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ) : null;
            })}

            {filters.tags.map(tag => (
              <span
                key={`tag-${tag}`}
                className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-full text-sm"
              >
                <span>#{tag}</span>
                <button
                  onClick={() => updateFilters({ 
                    tags: filters.tags.filter(t => t !== tag) 
                  })}
                  className="text-green-400 hover:text-green-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Saved Filters */}
        {savedFilters.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center space-x-3 mb-2">
              <span className={`text-sm font-medium ${
                state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Saved filters:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {savedFilters.map(savedFilter => (
                <button
                  key={savedFilter.id}
                  onClick={() => loadSavedFilter(savedFilter)}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-lg border transition-colors ${
                    state.settings.theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Bookmark className="w-3 h-3" />
                  <span className="text-sm">{savedFilter.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Results Summary */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div className={`text-sm ${
          state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Showing {paginatedExpenses.length} of {stats.totalCount} expenses
          {filters.search && ` for "${filters.search}"`}
        </div>
        
        <div className="flex items-center space-x-4 text-sm">
          <div className={`${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Total: <span className="font-semibold">{formatCurrency(stats.totalAmount, state.settings.defaultCurrency)}</span>
          </div>
          <div className="text-green-500">
            Settled: <span className="font-semibold">{filteredExpenses.filter(exp => exp.settled).length}</span>
          </div>
          <div className="text-orange-500">
            Pending: <span className="font-semibold">{filteredExpenses.filter(exp => !exp.settled).length}</span>
          </div>
        </div>
      </motion.div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedExpenses.size > 0 && (
          <BulkActionsBar
            selectedCount={selectedExpenses.size}
            onSettle={handleBulkSettle}
            onDelete={handleBulkDelete}
            onExport={() => setShowExportModal(true)}
            onClear={() => setSelectedExpenses(new Set())}
            isLoading={isLoading}
          />
        )}
      </AnimatePresence>

      {/* Expenses Display */}
      <AnimatePresence mode="wait">
        {filteredExpenses.length > 0 ? (
          <motion.div
            key={`expenses-${viewMode}`}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {viewMode === 'timeline' ? (
              <ExpenseTimeline
                expenses={paginatedExpenses}
                selectedExpenses={selectedExpenses}
                onToggleSelect={(expenseId) => {
                  const newSelected = new Set(selectedExpenses);
                  if (newSelected.has(expenseId)) {
                    newSelected.delete(expenseId);
                  } else {
                    newSelected.add(expenseId);
                  }
                  setSelectedExpenses(newSelected);
                }}
                onExpenseAction={(expense, action) => {
                  switch (action) {
                    case 'view':
                      handleViewExpenseDetails(expense);
                      break;
                    case 'edit':
                      handleEditExpense(expense);
                      break;
                    case 'delete':
                      handleDeleteExpense(expense);
                      break;
                    case 'settle':
                      handleToggleSettle(expense);
                      break;
                    case 'duplicate':
                      handleDuplicateExpense(expense);
                      break;
                  }
                }}
              />
            ) : (
              <div className={
                viewMode === 'cards'
                  ? 'grid grid-cols-1 lg:grid-cols-2 gap-6'
                  : 'space-y-4'
              }>
                {paginatedExpenses.map((expense, index) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ExpenseCard
                      expense={expense}
                      viewMode={viewMode}
                      isSelected={selectedExpenses.has(expense.id)}
                      onToggleSelect={() => {
                        const newSelected = new Set(selectedExpenses);
                        if (newSelected.has(expense.id)) {
                          newSelected.delete(expense.id);
                        } else {
                          newSelected.add(expense.id);
                        }
                        setSelectedExpenses(newSelected);
                      }}
                      onView={() => handleViewExpenseDetails(expense)}
                      onEdit={() => handleEditExpense(expense)}
                      onDelete={() => handleDeleteExpense(expense)}
                      onToggleSettle={() => handleToggleSettle(expense)}
                      onDuplicate={() => handleDuplicateExpense(expense)}
                      currentUserId={state.currentUser?.id}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {state.expenses.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="No expenses yet"
                description="Start by creating your first expense to track shared costs"
                action={{
                  label: 'Create Expense',
                  onClick: () => navigate('/create')
                }}
                suggestions={[
                  { label: 'Split a restaurant bill', onClick: () => navigate('/create') },
                  { label: 'Track travel expenses', onClick: () => navigate('/create') },
                  { label: 'Share utility costs', onClick: () => navigate('/create') }
                ]}
              />
            ) : (
              <EmptyState
                icon={Search}
                title="No expenses match your filters"
                description="Try adjusting your search criteria or filters"
                action={{
                  label: 'Clear All Filters',
                  onClick: clearFilters
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Load More Button */}
      {paginatedExpenses.length < filteredExpenses.length && (
        <motion.div variants={itemVariants} className="flex justify-center">
          <button
            onClick={() => setPage(prev => prev + 1)}
            disabled={isLoading}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
              state.settings.theme === 'dark'
                ? 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {isLoading ? (
              <LoadingSpinner size="small" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>Load More ({filteredExpenses.length - paginatedExpenses.length} remaining)</span>
          </button>
        </motion.div>
      )}

      {/* Filter Panel Sidebar */}
      <AnimatePresence>
        {showFilterPanel && (
          <FilterPanel
            filters={filters}
            onUpdateFilters={updateFilters}
            onClose={() => setShowFilterPanel(false)}
            users={state.users}
            groups={state.groups}
            categories={state.categories}
            expenses={enhancedExpenses}
          />
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {/* Export Modal */}
        {showExportModal && (
          <ExportModal
            isOpen={showExportModal}
            onClose={() => setShowExportModal(false)}
            expenses={selectedExpenses.size > 0 
              ? filteredExpenses.filter(exp => selectedExpenses.has(exp.id))
              : filteredExpenses
            }
            onExport={handleExport}
          />
        )}

        {/* Expense Details Modal */}
        {selectedExpense && (
          <ExpenseDetailsModal
            expense={selectedExpense}
            isOpen={!!selectedExpense}
            onClose={() => setSelectedExpense(null)}
            onEdit={() => {
              handleEditExpense(selectedExpense);
              setSelectedExpense(null);
            }}
            onDelete={() => {
              handleDeleteExpense(selectedExpense);
              setSelectedExpense(null);
            }}
            onToggleSettle={() => {
              handleToggleSettle(selectedExpense);
              setSelectedExpense(null);
            }}
            onDuplicate={() => {
              handleDuplicateExpense(selectedExpense);
              setSelectedExpense(null);
            }}
            currentUserId={state.currentUser?.id}
          />
        )}

        {/* Confirmation Dialog */}
        {confirmDialog.isOpen && (
          <ConfirmDialog
            isOpen={confirmDialog.isOpen}
            title={confirmDialog.title}
            message={confirmDialog.message}
            type={confirmDialog.type}
            onConfirm={confirmDialog.onConfirm}
            onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
          />
        )}
      </AnimatePresence>

      {/* Floating Action Button - Mobile */}
      <motion.div
        className="fixed bottom-6 right-6 lg:hidden z-40"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          onClick={() => navigate('/create')}
          className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </motion.div>

      {/* Quick Insights */}
      {stats.totalCount > 0 && (
        <motion.div
          variants={itemVariants}
          className={`rounded-xl p-6 ${
            state.settings.theme === 'dark'
              ? 'bg-gray-800/50 border border-gray-700/50'
              : 'bg-white/80 border border-gray-200/50'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${
              state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Quick Insights
            </h3>
            <BarChart3 className="w-5 h-5 text-purple-500" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                stats.settlementRate >= 80 ? 'text-green-500' : 
                stats.settlementRate >= 60 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {stats.settlementRate.toFixed(0)}%
              </div>
              <div className={`text-sm ${
                state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Settlement Rate
              </div>
            </div>

            <div className="text-center">
              <div className={`text-2xl font-bold ${
                state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {formatCurrency(stats.totalAmount / Math.max(stats.totalCount, 1), state.settings.defaultCurrency)}
              </div>
              <div className={`text-sm ${
                state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Avg per Expense
              </div>
            </div>

            <div className="text-center">
              <div className={`text-2xl font-bold ${
                stats.currentUserNet >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {formatCurrency(Math.abs(stats.currentUserNet), state.settings.defaultCurrency)}
              </div>
              <div className={`text-sm ${
                state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Net {stats.currentUserNet >= 0 ? 'Owed' : 'Owing'}
              </div>
            </div>

            <div className="text-center">
              <div className={`text-2xl font-bold ${
                state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {stats.topCategory?.[0] || 'N/A'}
              </div>
              <div className={`text-sm ${
                state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Top Category
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default History;