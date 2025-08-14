// src/components/Reports.tsx
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useExpense, formatCurrency } from '../context/ExpenseContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

const Reports: React.FC = () => {
  const { state, helpers } = useExpense();
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [reportType, setReportType] = useState<'overview' | 'category' | 'user' | 'group'>('overview');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');

  const reportData = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const filteredExpenses = state.expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= now;
    });

    if (selectedGroup !== 'all') {
      return filteredExpenses.filter(expense => expense.groupId === selectedGroup);
    }

    return filteredExpenses;
  }, [state.expenses, dateRange, selectedGroup]);

  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    reportData.forEach(expense => {
      const category = state.categories.find(cat => cat.id === expense.category);
      const categoryName = category?.name || 'Unknown';
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + expense.totalAmount);
    });

    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value,
      percentage: (value / reportData.reduce((sum, exp) => sum + exp.totalAmount, 0)) * 100
    })).sort((a, b) => b.value - a.value);
  }, [reportData, state.categories]);

  const userData = useMemo(() => {
    const userMap = new Map<string, { paid: number; owed: number; net: number }>();
    
    reportData.forEach(expense => {
      expense.participants.forEach(participant => {
        const user = userMap.get(participant.id) || { paid: 0, owed: 0, net: 0 };
        
        if (participant.netAmount < 0) {
          user.owed += Math.abs(participant.netAmount);
        } else {
          user.paid += participant.netAmount;
        }
        user.net = user.paid - user.owed;
        
        userMap.set(participant.id, user);
      });
    });

    return Array.from(userMap.entries()).map(([userId, data]) => {
      const user = state.users.find(u => u.id === userId);
      return {
        name: user?.name || 'Unknown User',
        paid: data.paid,
        owed: data.owed,
        net: data.net
      };
    }).sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
  }, [reportData, state.users]);

  const monthlyData = useMemo(() => {
    const monthlyMap = new Map<string, number>();
    
    reportData.forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + expense.totalAmount);
    });

    return Array.from(monthlyMap.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [reportData]);

  const totalAmount = reportData.reduce((sum, expense) => sum + expense.totalAmount, 0);
  const totalExpenses = reportData.length;
  const averageExpense = totalExpenses > 0 ? totalAmount / totalExpenses : 0;
  const settledExpenses = reportData.filter(expense => expense.settled).length;
  const settlementRate = totalExpenses > 0 ? (settledExpenses / totalExpenses) * 100 : 0;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className={`min-h-screen ${state.settings.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Financial Reports</h1>
          <p className={`${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Comprehensive financial analysis and insights
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-48">
              <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  state.settings.theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="week">Last Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>

            <div className="flex-1 min-w-48">
              <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  state.settings.theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="overview">Overview</option>
                <option value="category">By Category</option>
                <option value="user">By User</option>
                <option value="group">By Group</option>
              </select>
            </div>

            <div className="flex-1 min-w-48">
              <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Group Filter
              </label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  state.settings.theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">All Groups</option>
                {state.groups.map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Amount
                </p>
                <p className="text-2xl font-bold">{formatCurrency(totalAmount, state.settings.defaultCurrency)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Expenses
                </p>
                <p className="text-2xl font-bold">{totalExpenses}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                <span className="text-2xl">📈</span>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Average Expense
                </p>
                <p className="text-2xl font-bold">{formatCurrency(averageExpense, state.settings.defaultCurrency)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Settlement Rate
                </p>
                <p className="text-2xl font-bold">{settlementRate.toFixed(1)}%</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="space-y-8">
          {/* Monthly Trend Chart */}
          {monthlyData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
            >
              <h3 className="text-xl font-semibold mb-4">Monthly Expense Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={formatMonth}
                    stroke={state.settings.theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  />
                  <YAxis 
                    stroke={state.settings.theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                    tickFormatter={(value) => formatCurrency(value, state.settings.defaultCurrency)}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value, state.settings.defaultCurrency), 'Amount']}
                    labelFormatter={formatMonth}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Category Distribution */}
          {categoryData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
              >
                <h3 className="text-xl font-semibold mb-4">Expenses by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value, state.settings.defaultCurrency), 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
              >
                <h3 className="text-xl font-semibold mb-4">Category Breakdown</h3>
                <div className="space-y-3">
                  {categoryData.map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded mr-3"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatCurrency(category.value, state.settings.defaultCurrency)}
                        </div>
                        <div className={`text-sm ${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {category.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* User Balance Chart */}
          {userData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
            >
              <h3 className="text-xl font-semibold mb-4">User Balances</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={userData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    stroke={state.settings.theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  />
                  <YAxis 
                    stroke={state.settings.theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                    tickFormatter={(value) => formatCurrency(value, state.settings.defaultCurrency)}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value, state.settings.defaultCurrency), 'Amount']}
                  />
                  <Legend />
                  <Bar dataKey="paid" fill="#10B981" name="Paid" />
                  <Bar dataKey="owed" fill="#EF4444" name="Owed" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>

        {/* Export Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-8"
        >
          <h3 className="text-xl font-semibold mb-4">Export Reports</h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => {
                const data = helpers.exportData('json', {
                  start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
                  end: new Date().toISOString()
                });
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `expense-report-${dateRange}.json`;
                a.click();
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Export as JSON
            </button>
            <button
              onClick={() => {
                const data = helpers.exportData('csv', {
                  start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
                  end: new Date().toISOString()
                });
                const blob = new Blob([data], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `expense-report-${dateRange}.csv`;
                a.click();
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Export as CSV
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Reports;
