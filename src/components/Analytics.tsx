// src/components/Analytics.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Calendar,
  Users,
  ArrowUp,
  ArrowDown,
  Target,
  DollarSign,
  Clock,
  Filter,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Settings,
  Info,
  AlertCircle,
  CheckCircle,
  Star,
  Zap,
  Brain,
  Activity,
  CreditCard,
  Wallet,
  Globe,
  MapPin,
  Tag,
  Receipt,
  Split,
  Equal,
  Percent,
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Share,
  Bookmark,
  Bell,
  Lightbulb
} from 'lucide-react';

import { useExpense, formatCurrency, User, Expense, Group } from '../context/ExpenseContext';
import LoadingSpinner from './common/LoadingSpinner';
import DateRangePicker from './common/DateRangePicker';
import AnalyticsCard from './analytics/AnalyticsCard';
import SpendingChart from './analytics/SpendingChart';
import CategoryBreakdown from './analytics/CategoryBreakdown';
import TrendAnalysis from './analytics/TrendAnalysis';
import InsightsPanel from './analytics/InsightsPanel';
import ComparisonView from './analytics/ComparisonView';
import PredictiveAnalytics from './analytics/PredictiveAnalytics';
import ExportModal from './common/ExportModal';
import toast from 'react-hot-toast';

interface AnalyticsFilters {
  dateRange: 'week' | 'month' | 'quarter' | 'year' | 'custom';
  customDateRange?: { start: string; end: string };
  categories: string[];
  groups: string[];
  participants: string[];
  currency: string;
  splitTypes: string[];
  includeSettled: boolean;
  includePending: boolean;
}

interface MetricCard {
  id: string;
  title: string;
  value: number | string;
  change?: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: any;
  color: string;
  description: string;
  trend?: number[];
}

const Analytics: React.FC = () => {
  const { state, helpers } = useExpense();

  // State management
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: 'month',
    categories: [],
    groups: [],
    participants: [],
    currency: state.settings.defaultCurrency,
    splitTypes: [],
    includeSettled: true,
    includePending: true
  });

  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'comparison' | 'predictive'>('overview');
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(new Set(['spending', 'expenses', 'settlement', 'balance']));
  const [showFilters, setShowFilters] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [comparisonPeriod, setComparisonPeriod] = useState<'previous' | 'year_ago'>('previous');

  // Privacy settings
  const [privacyMode, setPrivacyMode] = useState(false);
  const [blurSensitiveData, setBlurSensitiveData] = useState(false);

  // Enhanced analytics calculations
  const analytics = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    // Calculate date range
    switch (filters.dateRange) {
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'custom':
        startDate = filters.customDateRange ? new Date(filters.customDateRange.start) : new Date();
        endDate = filters.customDateRange ? new Date(filters.customDateRange.end) : now;
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Filter expenses based on criteria
    let filteredExpenses = state.expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const inDateRange = expenseDate >= startDate && expenseDate <= endDate;
      
      const matchesCategory = filters.categories.length === 0 || filters.categories.includes(expense.category);
      const matchesGroup = filters.groups.length === 0 || (expense.groupId && filters.groups.includes(expense.groupId));
      const matchesParticipant = filters.participants.length === 0 || 
        expense.participants.some(p => filters.participants.includes(p.id));
      const matchesSplitType = filters.splitTypes.length === 0 || filters.splitTypes.includes(expense.splitType);
      const matchesStatus = (filters.includeSettled && expense.settled) || 
        (filters.includePending && !expense.settled);

      return inDateRange && matchesCategory && matchesGroup && 
             matchesParticipant && matchesSplitType && matchesStatus;
    });

    // Convert currency if needed
    if (filters.currency !== state.settings.defaultCurrency) {
      // In a real app, you'd apply exchange rates here
      // For now, we'll just use the original amounts
    }

    // Calculate comparison period
    const periodLength = endDate.getTime() - startDate.getTime();
    const comparisonStartDate = new Date(startDate.getTime() - periodLength);
    const comparisonEndDate = new Date(startDate.getTime());

    const comparisonExpenses = state.expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= comparisonStartDate && expenseDate < comparisonEndDate;
    });

    // Basic metrics
    const totalExpenses = filteredExpenses.length;
    const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.totalAmount, 0);
    const settledAmount = filteredExpenses
      .filter(exp => exp.settled)
      .reduce((sum, exp) => sum + exp.totalAmount, 0);
    const pendingAmount = totalAmount - settledAmount;
    const avgExpenseAmount = totalExpenses > 0 ? totalAmount / totalExpenses : 0;

    // Comparison metrics
    const comparisonTotal = comparisonExpenses.reduce((sum, exp) => sum + exp.totalAmount, 0);
    const comparisonCount = comparisonExpenses.length;
    const totalChange = comparisonTotal > 0 ? ((totalAmount - comparisonTotal) / comparisonTotal) * 100 : 0;
    const countChange = comparisonCount > 0 ? ((totalExpenses - comparisonCount) / comparisonCount) * 100 : 0;

    // Settlement metrics
    const settledCount = filteredExpenses.filter(exp => exp.settled).length;
    const settlementRate = totalExpenses > 0 ? (settledCount / totalExpenses) * 100 : 0;

    // User-specific metrics (current user balance)
    const currentUserId = state.currentUser?.id;
    let userBalance = 0;
    let userOwed = 0;
    let userOwes = 0;
    let userExpenseCount = 0;
    let userTotalSpent = 0;

    if (currentUserId) {
      const userBalanceData = helpers.calculateBalance(currentUserId);
      userBalance = userBalanceData.netAmount;
      userOwed = userBalanceData.totalOwed;
      userOwes = userBalanceData.totalOwing;

      filteredExpenses.forEach(expense => {
        const userParticipant = expense.participants.find(p => p.id === currentUserId);
        if (userParticipant) {
          userExpenseCount++;
          userTotalSpent += userParticipant.owedAmount;
        }
      });
    }

    // Category analysis
    const categoryBreakdown = new Map<string, {
      amount: number;
      count: number;
      settled: number;
      pending: number;
      avgAmount: number;
      trend: number[];
    }>();

    filteredExpenses.forEach(expense => {
      const existing = categoryBreakdown.get(expense.category) || {
        amount: 0,
        count: 0,
        settled: 0,
        pending: 0,
        avgAmount: 0,
        trend: []
      };

      existing.amount += expense.totalAmount;
      existing.count += 1;
      if (expense.settled) {
        existing.settled += expense.totalAmount;
      } else {
        existing.pending += expense.totalAmount;
      }

      categoryBreakdown.set(expense.category, existing);
    });

    // Calculate averages and trends for categories
    categoryBreakdown.forEach((data, category) => {
      data.avgAmount = data.count > 0 ? data.amount / data.count : 0;
      
      // Calculate 6-month trend for this category
      const trend = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        
        const monthAmount = state.expenses
          .filter(exp => exp.category === category)
          .filter(exp => {
            const date = new Date(exp.date);
            return date >= monthStart && date <= monthEnd;
          })
          .reduce((sum, exp) => sum + exp.totalAmount, 0);
        
        trend.push(monthAmount);
      }
      data.trend = trend;
    });

    const categoryData = Array.from(categoryBreakdown.entries())
      .map(([category, data]) => ({
        category,
        ...data,
        percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);

    // Monthly trends (last 12 months)
    const monthlyTrends = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthExpenses = state.expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate >= monthDate && expDate < nextMonthDate;
      });
      
      const monthAmount = monthExpenses.reduce((sum, exp) => sum + exp.totalAmount, 0);
      const monthCount = monthExpenses.length;
      const monthSettled = monthExpenses.filter(exp => exp.settled).length;
      
      monthlyTrends.push({
        month: monthDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
        monthKey: `${monthDate.getFullYear()}-${monthDate.getMonth()}`,
        amount: monthAmount,
        count: monthCount,
        settled: monthSettled,
        settlementRate: monthCount > 0 ? (monthSettled / monthCount) * 100 : 0,
        avgAmount: monthCount > 0 ? monthAmount / monthCount : 0
      });
    }

    // Participant analysis
    const participantData = new Map<string, {
      name: string;
      totalPaid: number;
      totalOwed: number;
      expenseCount: number;
      settlementRate: number;
      avgExpense: number;
      netBalance: number;
    }>();

    state.users.forEach(user => {
      let totalPaid = 0;
      let totalOwed = 0;
      let expenseCount = 0;
      let settledCount = 0;

      filteredExpenses.forEach(expense => {
        const participant = expense.participants.find(p => p.id === user.id);
        if (participant) {
          expenseCount++;
          totalOwed += participant.owedAmount;
          
          if (expense.paidBy.includes(user.id)) {
            const userPayment = expense.paymentBreakdown?.find(p => p.userId === user.id);
            totalPaid += userPayment?.amount || 0;
          }
          
          if (participant.settled) {
            settledCount++;
          }
        }
      });

      if (expenseCount > 0) {
        participantData.set(user.id, {
          name: user.name,
          totalPaid,
          totalOwed,
          expenseCount,
          settlementRate: (settledCount / expenseCount) * 100,
          avgExpense: totalOwed / expenseCount,
          netBalance: totalPaid - totalOwed
        });
      }
    });

    const topSpenders = Array.from(participantData.values())
      .sort((a, b) => b.totalPaid - a.totalPaid)
      .slice(0, 10);

    const topParticipants = Array.from(participantData.values())
      .sort((a, b) => b.expenseCount - a.expenseCount)
      .slice(0, 10);

    // Group analysis
    const groupData = state.groups.map(group => {
      const groupExpenses = filteredExpenses.filter(exp => exp.groupId === group.id);
      const groupTotal = groupExpenses.reduce((sum, exp) => sum + exp.totalAmount, 0);
      const groupSettled = groupExpenses.filter(exp => exp.settled).length;
      const groupBalance = helpers.calculateGroupBalance(group.id);
      
      return {
        id: group.id,
        name: group.name,
        totalAmount: groupTotal,
        expenseCount: groupExpenses.length,
        settlementRate: groupExpenses.length > 0 ? (groupSettled / groupExpenses.length) * 100 : 0,
        avgExpense: groupExpenses.length > 0 ? groupTotal / groupExpenses.length : 0,
        activeMembers: group.members.length,
        balanceData: Array.from(groupBalance.entries())
      };
    }).filter(group => group.expenseCount > 0)
      .sort((a, b) => b.totalAmount - a.totalAmount);

    return {
      // Basic metrics
      totalExpenses,
      totalAmount,
      settledAmount,
      pendingAmount,
      avgExpenseAmount,
      settlementRate,
      
      // Comparison metrics
      totalChange,
      countChange,
      comparisonTotal,
      comparisonCount,
      
      // User metrics
      userBalance,
      userOwed,
      userOwes,
      userExpenseCount,
      userTotalSpent,
      
      // Detailed analysis
      categoryData,
      monthlyTrends,
      topSpenders,
      topParticipants,
      groupData,
      participantData,
      
      // Time period info
      startDate,
      endDate,
      periodLength: Math.ceil(periodLength / (1000 * 60 * 60 * 24)), // days
      
      // Additional insights
      mostExpensiveExpense: filteredExpenses.reduce((max, exp) => 
        exp.totalAmount > (max?.totalAmount || 0) ? exp : max, null),
      oldestUnsettledExpense: filteredExpenses
        .filter(exp => !exp.settled)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] || null
    };
  }, [state.expenses, state.users, state.groups, state.currentUser, filters, helpers]);

    // Metric cards configuration
  const metricCards: MetricCard[] = useMemo(() => [
    {
      id: 'spending',
      title: 'Total Spending',
      value: formatCurrency(analytics.totalAmount, filters.currency),
      change: analytics.totalChange,
      changeType: analytics.totalChange > 0 ? 'increase' : analytics.totalChange < 0 ? 'decrease' : 'neutral',
      icon: DollarSign,
      color: 'purple',
      description: `${analytics.totalExpenses} expenses in ${analytics.periodLength} days`,
      trend: analytics.monthlyTrends.slice(-6).map(m => m.amount)
    },
    {
      id: 'expenses',
      title: 'Expense Count',
      value: analytics.totalExpenses.toString(),
      change: analytics.countChange,
      changeType: analytics.countChange > 0 ? 'increase' : analytics.countChange < 0 ? 'decrease' : 'neutral',
      icon: Receipt,
      color: 'blue',
      description: `Avg ${formatCurrency(analytics.avgExpenseAmount, filters.currency)} per expense`,
      trend: analytics.monthlyTrends.slice(-6).map(m => m.count)
    },
    {
      id: 'settlement',
      title: 'Settlement Rate',
      value: `${analytics.settlementRate.toFixed(1)}%`,
      change: 0, // Calculate settlement rate change
      changeType: analytics.settlementRate >= 80 ? 'increase' : analytics.settlementRate >= 60 ? 'neutral' : 'decrease',
      icon: CheckCircle,
      color: analytics.settlementRate >= 80 ? 'green' : analytics.settlementRate >= 60 ? 'yellow' : 'red',
      description: `${analytics.totalExpenses - Math.floor(analytics.totalExpenses * analytics.settlementRate / 100)} pending`,
      trend: analytics.monthlyTrends.slice(-6).map(m => m.settlementRate)
    },
    {
      id: 'balance',
      title: 'Your Balance',
      value: formatCurrency(Math.abs(analytics.userBalance), filters.currency),
      change: 0,
      changeType: analytics.userBalance > 0 ? 'increase' : analytics.userBalance < 0 ? 'decrease' : 'neutral',
      icon: analytics.userBalance > 0 ? TrendingUp : analytics.userBalance < 0 ? TrendingDown : Target,
      color: analytics.userBalance > 0 ? 'green' : analytics.userBalance < 0 ? 'red' : 'gray',
      description: analytics.userBalance > 0 ? "You're owed money" : analytics.userBalance < 0 ? "You owe money" : "You're even",
      trend: []
    },
    {
      id: 'average',
      title: 'Average Expense',
      value: formatCurrency(analytics.avgExpenseAmount, filters.currency),
      change: 0,
      changeType: 'neutral',
      icon: Target,
      color: 'indigo',
      description: 'Per expense amount',
      trend: analytics.monthlyTrends.slice(-6).map(m => m.avgAmount)
    },
    {
      id: 'participation',
      title: 'Your Participation',
      value: `${analytics.userExpenseCount}`,
      change: 0,
      changeType: 'neutral',
      icon: Activity,
      color: 'teal',
      description: `Out of ${analytics.totalExpenses} total expenses`,
      trend: []
    }
  ], [analytics, filters.currency]);

  // Handlers
  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
    toast.success('Analytics refreshed');
  };

  const handleFilterChange = (newFilters: Partial<AnalyticsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleExport = (format: 'pdf' | 'csv' | 'json') => {
    try {
      // Generate export data
      const exportData = {
        summary: {
          totalAmount: analytics.totalAmount,
          totalExpenses: analytics.totalExpenses,
          settlementRate: analytics.settlementRate,
          period: `${analytics.startDate.toISOString().split('T')[0]} to ${analytics.endDate.toISOString().split('T')[0]}`
        },
        categoryBreakdown: analytics.categoryData,
        monthlyTrends: analytics.monthlyTrends,
        topSpenders: analytics.topSpenders,
        groupAnalysis: analytics.groupData
      };

      const dataStr = format === 'json' ? 
        JSON.stringify(exportData, null, 2) :
        helpers.exportData(format === 'csv' ? 'csv' : 'json');

      const blob = new Blob([dataStr], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smartsplit-analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`Analytics exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export analytics');
    }
  };

  const generateInsights = useMemo(() => {
    const insights = [];

    // Spending pattern insights
    if (analytics.categoryData.length > 0) {
      const topCategory = analytics.categoryData[0];
      insights.push({
        type: 'pattern',
        icon: PieChart,
        title: 'Top Spending Category',
        description: `${topCategory.category} accounts for ${topCategory.percentage.toFixed(1)}% of your spending`,
        color: 'blue',
        action: `View ${topCategory.category} expenses`
      });
    }

    // Settlement insights
    if (analytics.settlementRate < 70) {
      insights.push({
        type: 'warning',
        icon: AlertCircle,
        title: 'Low Settlement Rate',
        description: `Only ${analytics.settlementRate.toFixed(1)}% of expenses are settled. Consider sending reminders.`,
        color: 'orange',
        action: 'View pending settlements'
      });
    } else if (analytics.settlementRate >= 90) {
      insights.push({
        type: 'success',
        icon: CheckCircle,
        title: 'Excellent Settlement Rate',
        description: `${analytics.settlementRate.toFixed(1)}% settlement rate shows great financial discipline!`,
        color: 'green',
        action: null
      });
    }

    // Balance insights
    if (Math.abs(analytics.userBalance) > analytics.avgExpenseAmount * 2) {
      insights.push({
        type: analytics.userBalance > 0 ? 'positive' : 'negative',
        icon: analytics.userBalance > 0 ? TrendingUp : TrendingDown,
        title: analytics.userBalance > 0 ? 'Money Owed to You' : 'Outstanding Debt',
        description: `You ${analytics.userBalance > 0 ? 'are owed' : 'owe'} ${formatCurrency(Math.abs(analytics.userBalance), filters.currency)}`,
        color: analytics.userBalance > 0 ? 'green' : 'red',
        action: 'Settle up'
      });
    }

    // Spending trend insights
    const recentTrend = analytics.monthlyTrends.slice(-3);
    const isIncreasingSpend = recentTrend.every((month, index) => 
      index === 0 || month.amount >= recentTrend[index - 1].amount
    );
    
    if (isIncreasingSpend && recentTrend.length >= 3) {
      const increase = ((recentTrend[2].amount - recentTrend[0].amount) / recentTrend[0].amount) * 100;
      if (increase > 20) {
        insights.push({
          type: 'trend',
          icon: TrendingUp,
          title: 'Increasing Spending Trend',
          description: `Your spending has increased ${increase.toFixed(1)}% over the last 3 months`,
          color: 'orange',
          action: 'Set spending goals'
        });
      }
    }

    // Group insights
    if (analytics.groupData.length > 0) {
      const mostActiveGroup = analytics.groupData[0];
      insights.push({
        type: 'info',
        icon: Users,
        title: 'Most Active Group',
        description: `"${mostActiveGroup.name}" has ${mostActiveGroup.expenseCount} expenses totaling ${formatCurrency(mostActiveGroup.totalAmount, filters.currency)}`,
        color: 'purple',
        action: `View ${mostActiveGroup.name}`
      });
    }

    // Old unsettled expense insight
    if (analytics.oldestUnsettledExpense) {
      const daysSinceExpense = Math.floor(
        (Date.now() - new Date(analytics.oldestUnsettledExpense.date).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceExpense > 30) {
        insights.push({
          type: 'reminder',
          icon: Clock,
          title: 'Old Unsettled Expense',
          description: `"${analytics.oldestUnsettledExpense.title}" from ${daysSinceExpense} days ago is still unsettled`,
          color: 'red',
          action: 'Send reminder'
        });
      }
    }

    return insights;
  }, [analytics, filters.currency]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (state.isLoading) {
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
            Analytics & Insights 📊
          </h1>
          <p className={`text-lg mt-2 ${
            state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Understand your spending patterns and financial habits
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
              { mode: 'overview', label: 'Overview', icon: BarChart3 },
              { mode: 'detailed', label: 'Detailed', icon: PieChart },
              { mode: 'comparison', label: 'Compare', icon: TrendingUp },
              { mode: 'predictive', label: 'Predict', icon: Brain }
            ].map(({ mode, label, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-purple-500 text-white'
                    : state.settings.theme === 'dark'
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                } ${mode === 'overview' ? 'rounded-l-lg' : mode === 'predictive' ? 'rounded-r-lg' : ''}`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Privacy Toggle */}
          <motion.button
            onClick={() => setPrivacyMode(!privacyMode)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              privacyMode
                ? 'bg-purple-500 text-white'
                : state.settings.theme === 'dark'
                  ? 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {privacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="hidden sm:inline">{privacyMode ? 'Show' : 'Hide'}</span>
          </motion.button>

          {/* Refresh Button */}
          <motion.button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
              state.settings.theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </motion.button>

          {/* Filters Toggle */}
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              showFilters
                ? 'bg-purple-500 text-white'
                : state.settings.theme === 'dark'
                  ? 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </motion.button>

          {/* Export Button */}
          <motion.button
            onClick={() => setShowExport(true)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
              state.settings.theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </motion.button>
        </div>
      </motion.div>
            {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            variants={itemVariants}
            className={`rounded-xl p-6 border ${
              state.settings.theme === 'dark'
                ? 'bg-gray-800/50 border-gray-700/50'
                : 'bg-white/80 border-gray-200/50'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range Filter */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Time Period
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange({ dateRange: e.target.value as any })}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    state.settings.theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500'
                  }`}
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Currency Filter */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Currency
                </label>
                <select
                  value={filters.currency}
                  onChange={(e) => handleFilterChange({ currency: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    state.settings.theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500'
                  }`}
                >
                  {state.settings.supportedCurrencies.map(currency => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>

              {/* Categories Filter */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Categories
                </label>
                <select
                  multiple
                  value={filters.categories}
                  onChange={(e) => handleFilterChange({ 
                    categories: Array.from(e.target.selectedOptions, option => option.value)
                  })}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    state.settings.theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500'
                  }`}
                  size={3}
                >
                  {state.categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Status
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.includeSettled}
                      onChange={(e) => handleFilterChange({ includeSettled: e.target.checked })}
                      className="w-4 h-4 text-purple-500 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500"
                    />
                    <span className={`ml-2 text-sm ${
                      state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Settled
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.includePending}
                      onChange={(e) => handleFilterChange({ includePending: e.target.checked })}
                      className="w-4 h-4 text-purple-500 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500"
                    />
                    <span className={`ml-2 text-sm ${
                      state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Pending
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Custom Date Range */}
            {filters.dateRange === 'custom' && (
              <div className="mt-4">
                <DateRangePicker
                  startDate={filters.customDateRange?.start || ''}
                  endDate={filters.customDateRange?.end || ''}
                  onChange={(start, end) => handleFilterChange({ 
                    customDateRange: { start, end } 
                  })}
                />
              </div>
            )}

            {/* Quick Filter Buttons */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className={`text-sm font-medium ${
                state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Quick filters:
              </span>
              
              {[
                { label: 'High Value (>₹1000)', filter: {} },
                { label: 'Recent (Last 7 days)', filter: { dateRange: 'week' as const } },
                { label: 'Unsettled Only', filter: { includeSettled: false, includePending: true } },
                { label: 'Group Expenses', filter: {} },
              ].map((quickFilter, index) => (
                <button
                  key={index}
                  onClick={() => handleFilterChange(quickFilter.filter)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    state.settings.theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {quickFilter.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Key Metrics Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metricCards
          .filter(card => selectedMetrics.has(card.id))
          .map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <AnalyticsCard
                {...card}
                isPrivate={privacyMode}
                onClick={() => {
                  // Handle metric card click - show detailed view
                  console.log(`Clicked on ${card.id}`);
                }}
              />
            </motion.div>
          ))}
      </motion.div>

      {/* Metric Selection */}
      <motion.div variants={itemVariants} className={`rounded-xl p-4 border ${
        state.settings.theme === 'dark'
          ? 'bg-gray-800/30 border-gray-700/50'
          : 'bg-white/50 border-gray-200/50'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-sm font-medium ${
            state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Show metrics:
          </span>
          <button
            onClick={() => setSelectedMetrics(new Set(metricCards.map(c => c.id)))}
            className="text-xs text-purple-500 hover:text-purple-400"
          >
            Select All
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {metricCards.map(card => (
            <button
              key={card.id}
              onClick={() => {
                const newSelected = new Set(selectedMetrics);
                if (newSelected.has(card.id)) {
                  newSelected.delete(card.id);
                } else {
                  newSelected.add(card.id);
                }
                setSelectedMetrics(newSelected);
              }}
              className={`flex items-center space-x-2 px-3 py-1 text-xs rounded-full border transition-colors ${
                selectedMetrics.has(card.id)
                  ? 'bg-purple-500 border-purple-500 text-white'
                  : state.settings.theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <card.icon className="w-3 h-3" />
              <span>{card.title}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Main Content Based on View Mode */}
      <AnimatePresence mode="wait">
        {viewMode === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Breakdown */}
              <motion.div variants={itemVariants}>
                <CategoryBreakdown
                  data={analytics.categoryData}
                  currency={filters.currency}
                  isPrivate={privacyMode}
                  onCategoryClick={(category) => {
                    // Navigate to filtered history
                    console.log(`View ${category} expenses`);
                  }}
                />
              </motion.div>

              {/* Monthly Trends */}
              <motion.div variants={itemVariants}>
                <SpendingChart
                  data={analytics.monthlyTrends}
                  currency={filters.currency}
                  isPrivate={privacyMode}
                  type="line"
                />
              </motion.div>
            </div>

            {/* Top Spenders */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${
              state.settings.theme === 'dark'
                ? 'bg-gray-800/50 border border-gray-700/50'
                : 'bg-white/80 border border-gray-200/50'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-semibold flex items-center ${
                  state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  <Users className="w-5 h-5 mr-2 text-purple-500" />
                  Top Contributors
                </h3>
                <button
                  onClick={() => {/* Show detailed participant analysis */}}
                  className="text-purple-500 hover:text-purple-400 text-sm font-medium flex items-center space-x-1"
                >
                  <span>View All</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {analytics.topSpenders.slice(0, 5).map((spender, index) => (
                  <div
                    key={spender.name}
                    className={`text-center p-4 rounded-lg ${
                      state.settings.theme === 'dark'
                        ? 'bg-gray-700/50'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="relative mb-3">
                      <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center font-bold text-white text-lg ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                        index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                        'bg-gradient-to-r from-purple-400 to-pink-500'
                      }`}>
                        #{index + 1}
                      </div>
                      {index < 3 && (
                        <div className="absolute -top-1 -right-1">
                          <Star className={`w-4 h-4 ${
                            index === 0 ? 'text-yellow-400' :
                            index === 1 ? 'text-gray-400' :
                            'text-orange-400'
                          }`} />
                        </div>
                      )}
                    </div>
                    <h4 className={`font-semibold mb-1 ${
                      state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {spender.name}
                    </h4>
                    <p className="text-purple-500 font-bold">
                      {privacyMode ? '***' : formatCurrency(spender.totalPaid, filters.currency)}
                    </p>
                    <p className={`text-xs mt-1 ${
                      state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {spender.expenseCount} expenses
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Smart Insights */}
            <motion.div variants={itemVariants}>
              <InsightsPanel
                insights={generateInsights}
                isPrivate={privacyMode}
                onInsightAction={(insight, action) => {
                  console.log(`Action: ${action} for insight:`, insight);
                  // Handle insight actions
                }}
              />
            </motion.div>
          </motion.div>
        )}

        {viewMode === 'detailed' && (
          <motion.div
            key="detailed"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Detailed Charts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <TrendAnalysis
                monthlyData={analytics.monthlyTrends}
                categoryData={analytics.categoryData}
                currency={filters.currency}
                isPrivate={privacyMode}
              />
              
              <div className="space-y-6">
                {/* Settlement Analysis */}
                <div className={`rounded-xl p-6 ${
                  state.settings.theme === 'dark'
                    ? 'bg-gray-800/50 border border-gray-700/50'
                    : 'bg-white/80 border border-gray-200/50'
                }`}>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center ${
                    state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                    Settlement Analysis
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${
                        state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Settlement Rate
                      </span>
                      <span className={`font-semibold ${
                        analytics.settlementRate >= 80 ? 'text-green-500' :
                        analytics.settlementRate >= 60 ? 'text-yellow-500' :
                        'text-red-500'
                      }`}>
                        {analytics.settlementRate.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          analytics.settlementRate >= 80 ? 'bg-green-500' :
                          analytics.settlementRate >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${analytics.settlementRate}%` }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className={`font-semibold ${
                          state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {privacyMode ? '**' : Math.floor(analytics.totalExpenses * analytics.settlementRate / 100)}
                        </div>
                        <div className={`${
                          state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Settled
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`font-semibold ${
                          state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {privacyMode ? '**' : analytics.totalExpenses - Math.floor(analytics.totalExpenses * analytics.settlementRate / 100)}
                        </div>
                        <div className={`${
                          state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Pending
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Group Performance */}
                {analytics.groupData.length > 0 && (
                  <div className={`rounded-xl p-6 ${
                    state.settings.theme === 'dark'
                      ? 'bg-gray-800/50 border border-gray-700/50'
                      : 'bg-white/80 border border-gray-200/50'
                  }`}>
                    <h3 className={`text-lg font-semibold mb-4 flex items-center ${
                      state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      <Users className="w-5 h-5 mr-2 text-blue-500" />
                      Group Activity
                    </h3>
                    
                    <div className="space-y-3">
                      {analytics.groupData.slice(0, 3).map(group => (
                        <div key={group.id} className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              {group.name.charAt(0)}
                            </div>
                            <div>
                              <div className={`font-medium ${
                                state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}>
                                {group.name}
                              </div>
                              <div className={`text-xs ${
                                state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                {group.expenseCount} expenses
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${
                              state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {privacyMode ? '***' : formatCurrency(group.totalAmount, filters.currency)}
                            </div>
                            <div className={`text-xs ${
                              group.settlementRate >= 80 ? 'text-green-500' :
                              group.settlementRate >= 60 ? 'text-yellow-500' :
                              'text-red-500'
                            }`}>
                              {group.settlementRate.toFixed(0)}% settled
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {analytics.groupData.length > 3 && (
                      <button className="w-full mt-3 text-center text-purple-500 hover:text-purple-400 text-sm font-medium">
                        View all {analytics.groupData.length} groups
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Participant Details */}
            <div className={`rounded-xl p-6 ${
              state.settings.theme === 'dark'
                ? 'bg-gray-800/50 border border-gray-700/50'
                : 'bg-white/80 border border-gray-200/50'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-semibold flex items-center ${
                  state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  <Activity className="w-5 h-5 mr-2 text-indigo-500" />
                  Participant Analysis
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setComparisonPeriod(comparisonPeriod === 'previous' ? 'year_ago' : 'previous')}
                    className="text-sm text-purple-500 hover:text-purple-400"
                  >
                    Compare to {comparisonPeriod === 'previous' ? 'year ago' : 'previous period'}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${
                      state.settings.theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                      <th className={`text-left py-3 px-2 font-medium ${
                        state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Participant
                      </th>
                      <th className={`text-right py-3 px-2 font-medium ${
                        state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Expenses
                      </th>
                      <th className={`text-right py-3 px-2 font-medium ${
                        state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Total Paid
                      </th>
                      <th className={`text-right py-3 px-2 font-medium ${
                        state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Settlement Rate
                      </th>
                      <th className={`text-right py-3 px-2 font-medium ${
                        state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Net Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topSpenders.slice(0, 8).map((participant, index) => (
                      <tr key={participant.name} className={`border-b ${
                        state.settings.theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'
                      }`}>
                        <td className="py-3 px-2">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                              index < 3 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-gray-400 to-gray-600'
                            }`}>
                              {participant.name.charAt(0)}
                            </div>
                            <span className={`font-medium ${
                              state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {participant.name}
                            </span>
                          </div>
                        </td>
                        <td className={`text-right py-3 px-2 ${
                          state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {privacyMode ? '**' : participant.expenseCount}
                        </td>
                        <td className={`text-right py-3 px-2 font-semibold ${
                          state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {privacyMode ? '***' : formatCurrency(participant.totalPaid, filters.currency)}
                        </td>
                        <td className="text-right py-3 px-2">
                          <span className={`font-medium ${
                            participant.settlementRate >= 80 ? 'text-green-500' :
                            participant.settlementRate >= 60 ? 'text-yellow-500' :
                            'text-red-500'
                          }`}>
                            {privacyMode ? '**%' : `${participant.settlementRate.toFixed(0)}%`}
                          </span>
                        </td>
                        <td className="text-right py-3 px-2">
                          <span className={`font-semibold ${
                            participant.netBalance > 0 ? 'text-green-500' :
                            participant.netBalance < 0 ? 'text-red-500' :
                            state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {privacyMode ? '***' : formatCurrency(Math.abs(participant.netBalance), filters.currency)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {viewMode === 'comparison' && (
          <motion.div
            key="comparison"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <ComparisonView
              currentPeriod={analytics}
              comparisonPeriod={comparisonPeriod}
              currency={filters.currency}
              isPrivate={privacyMode}
              onPeriodChange={setComparisonPeriod}
            />
          </motion.div>
        )}

        {viewMode === 'predictive' && (
          <motion.div
            key="predictive"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <PredictiveAnalytics
              historicalData={analytics.monthlyTrends}
              categoryData={analytics.categoryData}
              userSpending={analytics.userTotalSpent}
              currency={filters.currency}
              isPrivate={privacyMode}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Modal */}
      <AnimatePresence>
        {showExport && (
          <ExportModal
            isOpen={showExport}
            onClose={() => setShowExport(false)}
            title="Export Analytics"
            onExport={(format) => {
              handleExport(format as any);
              setShowExport(false);
            }}
            exportOptions={[
              {
                format: 'pdf',
                name: 'PDF Report',
                description: 'Comprehensive analytics report with charts'
              },
              {
                format: 'csv',
                name: 'CSV Data',
                description: 'Raw data for external analysis'
              },
              {
                format: 'json',
                name: 'JSON Export',
                description: 'Structured data for developers'
              }
            ]}
          />
        )}
      </AnimatePresence>

      {/* Floating Insights Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-40"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          onClick={() => {
            // Show insights modal or navigate to insights page
            toast((t) => (
              <div className="max-w-sm">
                <h4 className="font-semibold mb-2">💡 Quick Insight</h4>
                <p className="text-sm">
                  {generateInsights.length > 0 
                    ? generateInsights[Math.floor(Math.random() * generateInsights.length)].description
                    : "You're doing great with your expense management!"
                  }
                </p>
              </div>
            ), { duration: 6000 });
          }}
          className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 hover:shadow-xl"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Lightbulb className="w-5 h-5" />
        </motion.button>
      </motion.div>

      {/* Bottom Summary Card */}
      <motion.div variants={itemVariants} className={`rounded-xl p-6 ${
        state.settings.theme === 'dark'
          ? 'bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700'
          : 'bg-gradient-to-r from-white to-gray-50 border border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${
            state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            📈 Period Summary
          </h3>
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className={`${
              state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {analytics.startDate.toLocaleDateString()} - {analytics.endDate.toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div>
            <div className={`text-2xl font-bold mb-1 ${
              state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {privacyMode ? '***' : analytics.periodLength}
            </div>
            <div className={`text-sm ${
              state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Days Analyzed
            </div>
          </div>

          <div>
            <div className={`text-2xl font-bold mb-1 ${
              analytics.totalChange >= 0 ? 'text-red-500' : 'text-green-500'
            }`}>
              {privacyMode ? '**%' : `${analytics.totalChange >= 0 ? '+' : ''}${analytics.totalChange.toFixed(1)}%`}
            </div>
            <div className={`text-sm ${
              state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Spending Change
            </div>
          </div>

          <div>
            <div className={`text-2xl font-bold mb-1 ${
              analytics.categoryData.length > 0 ? 'text-purple-500' : 
              state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {privacyMode ? '**' : analytics.categoryData.length}
            </div>
            <div className={`text-sm ${
              state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Categories Used
            </div>
          </div>

          <div>
            <div className={`text-2xl font-bold mb-1 ${
              analytics.userExpenseCount > 0 ? 'text-blue-500' :
              state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {privacyMode ? '**%' : `${((analytics.userExpenseCount / Math.max(analytics.totalExpenses, 1)) * 100).toFixed(0)}%`}
            </div>
            <div className={`text-sm ${
              state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Your Participation
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Analytics;