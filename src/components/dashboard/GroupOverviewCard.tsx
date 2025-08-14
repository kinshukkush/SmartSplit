// src/components/dashboard/GroupOverviewCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Plus, ArrowRight, Calendar, DollarSign } from 'lucide-react';
import { useExpense, formatCurrency, Group } from '../../context/ExpenseContext';

const GroupOverviewCard: React.FC = () => {
  const { state } = useExpense();

  const currentUser = state.currentUser;
  if (!currentUser) return null;

  // Get groups where current user is a member
  const userGroups = state.groups.filter(group => 
    group.members.includes(currentUser.id)
  );

  // Get recent group expenses
  const recentGroupExpenses = state.expenses
    .filter(expense => expense.groupId && userGroups.some(g => g.id === expense.groupId))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Calculate group stats
  const totalGroupExpenses = recentGroupExpenses.length;
  const totalGroupAmount = recentGroupExpenses.reduce((sum, exp) => sum + exp.totalAmount, 0);

  const getGroupColor = (group: Group) => {
    return group.color || '#6366f1';
  };

  const getGroupIcon = (group: Group) => {
    // You can customize this based on group category or other properties
    return '👥';
  };

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
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className={`font-semibold ${
              state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Group Overview
            </h3>
            <p className={`text-sm ${
              state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Your expense groups
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link
            to="/groups/create"
            className={`p-2 rounded-lg transition-colors ${
              state.settings.theme === 'dark'
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            <Plus className="w-4 h-4" />
          </Link>
          <Link
            to="/groups"
            className={`p-2 rounded-lg transition-colors ${
              state.settings.theme === 'dark'
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {userGroups.length}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400">
            Groups
          </div>
        </div>
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {totalGroupExpenses}
          </div>
          <div className="text-xs text-green-600 dark:text-green-400">
            Expenses
          </div>
        </div>
        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {formatCurrency(totalGroupAmount, state.settings.defaultCurrency)}
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400">
            Total
          </div>
        </div>
      </div>

      {/* Recent Groups */}
      <div className="space-y-3">
        <h4 className={`text-sm font-medium ${
          state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Your Groups
        </h4>
        
        {userGroups.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-2">👥</div>
            <p className={`text-sm ${
              state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              No groups yet
            </p>
            <Link
              to="/groups/create"
              className={`inline-block mt-3 px-4 py-2 rounded-lg font-medium transition-colors ${
                state.settings.theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Create Group
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {userGroups.slice(0, 3).map((group) => {
              const groupExpenses = state.expenses.filter(exp => exp.groupId === group.id);
              const groupTotal = groupExpenses.reduce((sum, exp) => sum + exp.totalAmount, 0);
              
              return (
                <Link
                  key={group.id}
                  to={`/groups/${group.id}`}
                  className={`block p-3 rounded-lg border transition-all duration-200 hover:scale-[1.02] ${
                    state.settings.theme === 'dark'
                      ? 'bg-gray-700/50 border-gray-600/50 hover:bg-gray-700'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium"
                        style={{ backgroundColor: getGroupColor(group) }}
                      >
                        {getGroupIcon(group)}
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${
                          state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {group.name}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Users className="w-3 h-3" />
                          <span>{group.members.length} members</span>
                          <span>•</span>
                          <span>{groupExpenses.length} expenses</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                                             <div className={`text-sm font-semibold ${
                         state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                       }`}>
                         {formatCurrency(groupTotal, group.settings.defaultCurrency || state.settings.defaultCurrency)}
                       </div>
                      <div className={`text-xs ${
                        state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {group.category}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Group Activity */}
      {recentGroupExpenses.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className={`text-sm font-medium mb-3 ${
            state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Recent Group Activity
          </h4>
          
          <div className="space-y-2">
            {recentGroupExpenses.slice(0, 3).map((expense) => {
              const group = expense.groupId ? state.groups.find(g => g.id === expense.groupId) : null;
              const paidBy = state.users.find(u => u.id === expense.paidBy[0]);
              
              return (
                <div
                  key={expense.id}
                  className={`p-3 rounded-lg border ${
                    state.settings.theme === 'dark'
                      ? 'bg-gray-700/50 border-gray-600/50'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${
                          state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {expense.title}
                        </span>
                        {group && (
                          <span 
                            className="text-xs px-2 py-1 rounded-full text-white"
                            style={{ backgroundColor: getGroupColor(group) }}
                          >
                            {group.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                        <DollarSign className="w-3 h-3" />
                        <span>Paid by {paidBy?.name || 'Unknown'}</span>
                        <span>•</span>
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(expense.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${
                        state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {formatCurrency(expense.totalAmount, expense.currency)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Button */}
      {userGroups.length > 0 && (
        <div className="mt-6">
          <Link
            to="/groups"
            className={`block w-full text-center py-2 px-4 rounded-lg font-medium transition-colors ${
              state.settings.theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            View All Groups
          </Link>
        </div>
      )}
    </motion.div>
  );
};

export default GroupOverviewCard;
