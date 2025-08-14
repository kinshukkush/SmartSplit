// src/components/Dashboard.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  TrendingUp,
  Users,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  AlertCircle,
  CheckCircle,
  DollarSign,
  CreditCard,
  Bell,
  Calendar,
  Filter,
  Eye,
  EyeOff,
  Zap,
  Target,
  PieChart,
  Activity,
  Send,
  Download,
  RefreshCw,
  Settings,
  ChevronRight,
  Star,
  Wallet,
  TrendingDown
} from 'lucide-react';

import { useExpense } from '../context/ExpenseContext';
import { formatCurrency } from '../context/ExpenseContext';
import BalanceCard from './dashboard/BalanceCard';
import QuickActionCard from './dashboard/QuickActionCard';
import ExpenseCard from './dashboard/ExpenseCard';
import SettlementCard from './dashboard/SettlementCard';
import ActivityFeedCard from './dashboard/ActivityFeedCard';
import InsightsCard from './dashboard/InsightsCard';
import DebtOverviewCard from './dashboard/DebtOverviewCard';
import GroupOverviewCard from './dashboard/GroupOverviewCard';
import ReminderCard from './dashboard/ReminderCard';
import LoadingSpinner from './common/LoadingSpinner';
import EmptyState from './common/EmptyState';

const Dashboard: React.FC = () => {
  const { state, dispatch, helpers } = useExpense();
  const navigate = useNavigate();
  
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'year'>('month');
  const [refreshing, setRefreshing] = useState(false);

  // Enhanced stats calculation
  const stats = useMemo(() => {
    if (!state.currentUser) return null;

    const now = new Date();
    const filterDate = new Date();
    
    switch (timeFilter) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const filteredExpenses = state.expenses.filter(expense => 
      new Date(expense.date) >= filterDate
    );

    const userBalance = helpers.calculateBalance(state.currentUser.id);
    const userDebts = helpers.getUserDebts(state.currentUser.id);
    
    const totalExpenses = filteredExpenses.length;
    const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.totalAmount, 0);
    const settledExpenses = filteredExpenses.filter(expense => expense.settled).length;
    const pendingAmount = filteredExpenses
      .filter(expense => !expense.settled)
      .reduce((sum, expense) => sum + expense.totalAmount, 0);

    const myExpenses = filteredExpenses.filter(expense => 
      expense.participants.some(p => p.id === state.currentUser.id)
    );

    const myTotalSpent = myExpenses.reduce((sum, expense) => {
      const participant = expense.participants.find(p => p.id === state.currentUser.id);
      return sum + (participant?.owedAmount || 0);
    }, 0);

    // Calculate category breakdown
    const categoryBreakdown = new Map<string, number>();
    myExpenses.forEach(expense => {
      const participant = expense.participants.find(p => p.id === state.currentUser.id);
      const amount = participant?.owedAmount || 0;
      categoryBreakdown.set(
        expense.category,
        (categoryBreakdown.get(expense.category) || 0) + amount
      );
    });

    // Get top spending category
    const topCategory = Array.from(categoryBreakdown.entries())
      .sort((a, b) => b[1] - a[1])[0];

    return {
      totalExpenses,
      totalAmount,
      settledExpenses,
      pendingAmount,
      settlementRate: totalExpenses > 0 ? (settledExpenses / totalExpenses) * 100 : 0,
      myTotalSpent,
      userBalance,
      userDebts,
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
      categoryBreakdown: Array.from(categoryBreakdown.entries()),
      myExpensesCount: myExpenses.length
    };
  }, [state.expenses, state.currentUser, timeFilter, helpers]);

  // Recent activity
  const recentActivity = useMemo(() => {
    return state.activityFeed
      .slice(0, 10)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [state.activityFeed]);

  // Recent expenses with enhanced data
  const recentExpenses = useMemo(() => {
    if (!state.currentUser) return [];
    
    return state.expenses
      .filter(expense => 
        expense.participants.some(p => p.id === state.currentUser.id)
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(expense => {
        const participant = expense.participants.find(p => p.id === state.currentUser.id);
        return {
          ...expense,
          myShare: participant?.owedAmount || 0,
          myNet: participant?.netAmount || 0,
          isPayer: expense.paidBy.includes(state.currentUser.id)
        };
      });
  }, [state.expenses, state.currentUser]);

  // Settlement suggestions
  const settlementSuggestions = useMemo(() => {
    return helpers.getSettlementSuggestions().slice(0, 3);
  }, [helpers]);

  // Active reminders
  const activeReminders = useMemo(() => {
    if (!state.currentUser) return [];
    return helpers.getUnreadReminders(state.currentUser.id).slice(0, 3);
  }, [state.currentUser, helpers]);

  // Enhanced quick actions
  const quickActions = [
    {
      title: 'Split Bill',
      description: 'Add new expense',
      icon: Plus,
      href: '/create',
      gradient: 'from-purple-500 to-pink-500',
      badge: null,
      primary: true
    },
    {
      title: 'Settle Up',
      description: 'Pay or request money',
      icon: CreditCard,
      href: '/settlements',
      gradient: 'from-green-500 to-teal-500',
      badge: settlementSuggestions.length > 0 ? settlementSuggestions.length.toString() : null
    },
    {
      title: 'Activity',
      description: 'Recent transactions',
      icon: Activity,
      href: '/activity',
      gradient: 'from-blue-500 to-cyan-500',
      badge: recentActivity.length > 0 ? 'New' : null
    },
    {
      title: 'Groups',
      description: 'Manage friend groups',
      icon: Users,
      href: '/groups',
      gradient: 'from-orange-500 to-red-500',
      badge: null
    }
  ];

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!state.currentUser) {
    return (
      <EmptyState
        icon={Wallet}
        title="Welcome to SmartSplit"
        description="Set up your profile to start managing expenses"
        action={{
          label: 'Get Started',
          onClick: () => navigate('/onboarding')
        }}
      />
    );
  }

  if (!stats) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Unable to load dashboard"
        description="There was an error loading your data"
        action={{
          label: 'Retry',
          onClick: handleRefresh
        }}
      />
    );
  }

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

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${
            state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Welcome back, {state.currentUser.name}! 👋
          </h1>
          <p className={`text-lg ${
            state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Here's your expense overview for this {timeFilter}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Time Filter */}
          <div className={`flex rounded-lg border ${
            state.settings.theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            {(['week', 'month', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimeFilter(period)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  timeFilter === period
                    ? 'bg-purple-500 text-white'
                    : state.settings.theme === 'dark'
                      ? 'text-gray-300 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <motion.button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`p-2 rounded-lg transition-colors ${
              state.settings.theme === 'dark'
                ? 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700'
                : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </motion.div>

      {/* Balance Overview */}
      <motion.div variants={itemVariants}>
        <BalanceCard
          balance={stats.userBalance}
          visible={balanceVisible}
          onToggleVisibility={() => setBalanceVisible(!balanceVisible)}
          debts={stats.userDebts}
        />
      </motion.div>

      {/* Quick Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`rounded-2xl p-6 transition-all duration-200 hover:scale-[1.02] ${
          state.settings.theme === 'dark'
            ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50'
            : 'bg-white/80 backdrop-blur-sm border border-gray-200/50'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-medium ${
              state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              My Expenses
            </h3>
            <Receipt className="w-5 h-5 text-purple-400" />
          </div>
          <p className={`text-2xl font-bold ${
            state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {stats.myExpensesCount}
          </p>
          <p className="text-xs text-green-500 mt-1">
            {formatCurrency(stats.myTotalSpent, state.settings.defaultCurrency)} spent
          </p>
        </div>

        <div className={`rounded-2xl p-6 transition-all duration-200 hover:scale-[1.02] ${
          state.settings.theme === 'dark'
            ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50'
            : 'bg-white/80 backdrop-blur-sm border border-gray-200/50'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-medium ${
              state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Total Volume
            </h3>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <p className={`text-2xl font-bold ${
            state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {formatCurrency(stats.totalAmount, state.settings.defaultCurrency)}
          </p>
          <p className="text-xs text-blue-400 mt-1">
            {stats.totalExpenses} transactions
          </p>
        </div>

        <div className={`rounded-2xl p-6 transition-all duration-200 hover:scale-[1.02] ${
          state.settings.theme === 'dark'
            ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50'
            : 'bg-white/80 backdrop-blur-sm border border-gray-200/50'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-medium ${
              state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Pending
            </h3>
            <Clock className="w-5 h-5 text-orange-400" />
          </div>
          <p className={`text-2xl font-bold ${
            state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {formatCurrency(stats.pendingAmount, state.settings.defaultCurrency)}
          </p>
          <p className="text-xs text-orange-400 mt-1">
            {stats.totalExpenses - stats.settledExpenses} unsettled
          </p>
        </div>

        <div className={`rounded-2xl p-6 transition-all duration-200 hover:scale-[1.02] ${
          state.settings.theme === 'dark'
            ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50'
            : 'bg-white/80 backdrop-blur-sm border border-gray-200/50'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-medium ${
              state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Settlement Rate
            </h3>
            <Target className="w-5 h-5 text-green-400" />
          </div>
          <p className={`text-2xl font-bold ${
            state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {stats.settlementRate.toFixed(0)}%
          </p>
          <p className={`text-xs mt-1 ${
            stats.settlementRate >= 80 ? 'text-green-500' : 
            stats.settlementRate >= 60 ? 'text-yellow-500' : 'text-red-500'
          }`}>
            {stats.settlementRate >= 80 ? 'Excellent' : 
             stats.settlementRate >= 60 ? 'Good' : 'Needs improvement'}
          </p>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className={`text-xl font-bold ${
            state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Quick Actions
          </h2>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <QuickActionCard
              key={action.title}
              {...action}
              delay={index * 100}
            />
          ))}
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Recent Expenses & Activity */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Expenses */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-bold ${
                state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Recent Expenses
              </h2>
              <Link
                to="/history"
                className="flex items-center space-x-1 text-purple-500 hover:text-purple-400 text-sm font-medium transition-colors"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

                        {recentExpenses.length > 0 ? (
              <div className="space-y-3">
                {recentExpenses.map((expense) => (
                  <ExpenseCard key={expense.id} expense={expense} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Receipt}
                title="No expenses yet"
                description="Create your first expense split to get started"
                action={{
                  label: 'Create Expense',
                  onClick: () => navigate('/create')
                }}
              />
            )}
          </motion.div>

          {/* Activity Feed */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-bold ${
                state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Recent Activity
              </h2>
              <Link
                to="/activity"
                className="flex items-center space-x-1 text-purple-500 hover:text-purple-400 text-sm font-medium transition-colors"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {recentActivity.length > 0 ? (
              <ActivityFeedCard activities={recentActivity.slice(0, 5)} />
            ) : (
              <div className={`rounded-xl p-6 text-center ${
                state.settings.theme === 'dark'
                  ? 'bg-gray-800/50 border border-gray-700/50'
                  : 'bg-white/80 border border-gray-200/50'
              }`}>
                <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className={`text-sm ${
                  state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  No recent activity
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column - Sidebar Cards */}
        <div className="space-y-6">
          
          {/* Settlements */}
          {settlementSuggestions.length > 0 && (
            <motion.div variants={itemVariants}>
              <SettlementCard settlements={settlementSuggestions} />
            </motion.div>
          )}

          {/* Active Reminders */}
          {activeReminders.length > 0 && (
            <motion.div variants={itemVariants}>
              <ReminderCard reminders={activeReminders} />
            </motion.div>
          )}

          {/* Debt Overview */}
          <motion.div variants={itemVariants}>
            <DebtOverviewCard 
              debts={stats.userDebts}
              currentUserId={state.currentUser.id}
            />
          </motion.div>

          {/* Group Overview */}
          {state.groups.length > 0 && (
            <motion.div variants={itemVariants}>
              <GroupOverviewCard groups={state.groups.slice(0, 3)} />
            </motion.div>
          )}

          {/* Spending Insights */}
          {stats.topCategory && (
            <motion.div variants={itemVariants}>
              <InsightsCard
                topCategory={stats.topCategory}
                categoryBreakdown={stats.categoryBreakdown}
                totalSpent={stats.myTotalSpent}
              />
            </motion.div>
          )}

          {/* Quick Stats Card */}
          <motion.div variants={itemVariants} className={`rounded-xl p-6 ${
            state.settings.theme === 'dark'
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50'
              : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200/50'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-semibold ${
                state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Quick Stats
              </h3>
              <PieChart className="w-5 h-5 text-purple-400" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${
                  state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Active Groups
                </span>
                <span className={`font-medium ${
                  state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {state.groups.filter(g => g.isActive).length}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-sm ${
                  state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Total Friends
                </span>
                <span className={`font-medium ${
                  state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {state.users.length - 1}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-sm ${
                  state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  This Month
                </span>
                <span className={`font-medium ${
                  state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {stats.myExpensesCount} expenses
                </span>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <Link
                  to="/analytics"
                  className="flex items-center justify-center space-x-2 text-sm text-purple-500 hover:text-purple-400 font-medium transition-colors"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>View Analytics</span>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Tips Card */}
          <motion.div variants={itemVariants} className={`rounded-xl p-6 ${
            state.settings.theme === 'dark'
              ? 'bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/20'
              : 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/50'
          }`}>
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
              <h3 className={`font-semibold ${
                state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Pro Tip
              </h3>
            </div>
            
            <p className={`text-sm mb-3 ${
              state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {stats.settlementRate < 50 
                ? "Keep track of your expenses and settle regularly to maintain good relationships!"
                : stats.userBalance.netAmount > 0
                  ? "You're owed money! Send a friendly reminder to settle up."
                  : "Great job keeping your expenses settled! Your friends appreciate it."
              }
            </p>
            
            <button
              onClick={() => navigate('/tips')}
              className="text-sm text-purple-500 hover:text-purple-400 font-medium transition-colors"
            >
              More tips →
            </button>
          </motion.div>
        </div>
      </div>

      {/* Bottom Section - Additional Insights */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Monthly Summary */}
        <div className={`rounded-xl p-6 ${
          state.settings.theme === 'dark'
            ? 'bg-gray-800/50 border border-gray-700/50'
            : 'bg-white/80 border border-gray-200/50'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${
              state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Monthly Summary
            </h3>
            <Calendar className="w-5 h-5 text-blue-400" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={`text-sm ${
                state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Total Expenses
              </span>
              <span className={`font-medium ${
                state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {stats.myExpensesCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={`text-sm ${
                state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Amount Spent
              </span>
              <span className={`font-medium ${
                state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {formatCurrency(stats.myTotalSpent, state.settings.defaultCurrency)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className={`rounded-xl p-6 ${
          state.settings.theme === 'dark'
            ? 'bg-gray-800/50 border border-gray-700/50'
            : 'bg-white/80 border border-gray-200/50'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${
              state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Payment Methods
            </h3>
            <CreditCard className="w-5 h-5 text-green-400" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${
                state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Active Methods
              </span>
              <span className={`font-medium ${
                state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {state.currentUser?.paymentMethods?.length || 0}
              </span>
            </div>
            <Link
              to="/payments"
              className="text-sm text-purple-500 hover:text-purple-400 font-medium transition-colors"
            >
              Manage methods →
            </Link>
          </div>
        </div>

        {/* Security */}
        <div className={`rounded-xl p-6 ${
          state.settings.theme === 'dark'
            ? 'bg-gray-800/50 border border-gray-700/50'
            : 'bg-white/80 border border-gray-200/50'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${
              state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Security
            </h3>
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className={`text-sm ${
                state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Data encrypted
              </span>
            </div>
            <Link
              to="/settings"
              className="text-sm text-purple-500 hover:text-purple-400 font-medium transition-colors"
            >
              Privacy settings →
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Floating Action Button - Mobile */}
      <motion.div
        className="fixed bottom-6 right-6 lg:hidden z-50"
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
    </motion.div>
  );
};

export default Dashboard;