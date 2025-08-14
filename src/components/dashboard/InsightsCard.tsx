// src/components/dashboard/InsightsCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, PieChart, ArrowRight } from 'lucide-react';
import { useExpense, formatCurrency } from '../../context/ExpenseContext';

const InsightsCard: React.FC = () => {
  const { state } = useExpense();

  // Calculate insights
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthExpenses = state.expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });

  const previousMonthExpenses = state.expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    return expenseDate.getMonth() === prevMonth && expenseDate.getFullYear() === prevYear;
  });

  const currentMonthTotal = currentMonthExpenses.reduce((sum, exp) => sum + exp.totalAmount, 0);
  const previousMonthTotal = previousMonthExpenses.reduce((sum, exp) => sum + exp.totalAmount, 0);
  
  const spendingChange = previousMonthTotal > 0 
    ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100 
    : 0;

  const averageExpense = currentMonthExpenses.length > 0 
    ? currentMonthTotal / currentMonthExpenses.length 
    : 0;

  const topCategory = currentMonthExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.totalAmount;
    return acc;
  }, {} as Record<string, number>);

  const topCategoryName = Object.entries(topCategory)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

  const insights = [
    {
      id: 'spending-trend',
      title: 'Spending Trend',
      value: `${spendingChange >= 0 ? '+' : ''}${spendingChange.toFixed(1)}%`,
      description: 'vs last month',
      icon: spendingChange >= 0 ? TrendingUp : TrendingDown,
      color: spendingChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
      bgColor: spendingChange >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
    },
    {
      id: 'avg-expense',
      title: 'Average Expense',
      value: formatCurrency(averageExpense, state.settings.defaultCurrency),
      description: 'per transaction',
      icon: Target,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      id: 'top-category',
      title: 'Top Category',
      value: topCategoryName,
      description: 'this month',
      icon: PieChart,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-6 transition-all duration-200 hover:scale-[1.02] ${
        state.settings.theme === 'dark'
          ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50'
          : 'bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-sm border border-gray-200/50'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <PieChart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className={`font-semibold ${
              state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Spending Insights
            </h3>
            <p className={`text-sm ${
              state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              This month's analysis
            </p>
          </div>
        </div>
        
        <div className={`p-2 rounded-lg transition-colors ${
          state.settings.theme === 'dark'
            ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
            : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
        }`}>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* Insights Grid */}
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border ${
              state.settings.theme === 'dark'
                ? 'bg-gray-700/50 border-gray-600/50'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${insight.bgColor}`}>
                <insight.icon className={`w-4 h-4 ${insight.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${
                    state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {insight.title}
                  </span>
                  <span className={`text-sm font-semibold ${insight.color}`}>
                    {insight.value}
                  </span>
                </div>
                <p className={`text-xs ${
                  state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {insight.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Monthly Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {currentMonthExpenses.length}
            </div>
            <div className={`text-sm ${
              state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Expenses
            </div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {formatCurrency(currentMonthTotal, state.settings.defaultCurrency)}
            </div>
            <div className={`text-sm ${
              state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Total Spent
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-6">
        <button
          className={`block w-full text-center py-2 px-4 rounded-lg font-medium transition-colors ${
            state.settings.theme === 'dark'
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-indigo-500 hover:bg-indigo-600 text-white'
          }`}
        >
          View Detailed Reports
        </button>
      </div>
    </motion.div>
  );
};

export default InsightsCard;