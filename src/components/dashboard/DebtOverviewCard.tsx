// src/components/dashboard/DebtOverviewCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, Users, ArrowRight } from 'lucide-react';
import { useExpense, formatCurrency, DebtSummary } from '../../context/ExpenseContext';

const DebtOverviewCard: React.FC = () => {
  const { state, helpers } = useExpense();

  const currentUser = state.currentUser;
  if (!currentUser) return null;

  const userDebts = helpers.getUserDebts(currentUser.id);
  const userBalance = helpers.calculateBalance(currentUser.id);

  const totalOwed = userDebts.owes.reduce((sum, debt) => sum + debt.totalOwed, 0);
  const totalOwing = userDebts.owed.reduce((sum, debt) => sum + debt.totalOwing, 0);
  const netAmount = userBalance.netAmount;

  const topDebtors = userDebts.owes
    .sort((a, b) => b.totalOwed - a.totalOwed)
    .slice(0, 3);

  const topCreditors = userDebts.owed
    .sort((a, b) => b.totalOwing - a.totalOwing)
    .slice(0, 3);

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
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <ArrowDownRight className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className={`font-semibold ${
              state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Debt Overview
            </h3>
            <p className={`text-sm ${
              state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Your financial obligations
            </p>
          </div>
        </div>
        
        <Link
          to="/settlements"
          className={`p-2 rounded-lg transition-colors ${
            state.settings.theme === 'dark'
              ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
          }`}
        >
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="text-lg font-bold text-red-600 dark:text-red-400">
            {formatCurrency(totalOwing, state.settings.defaultCurrency)}
          </div>
          <div className="text-xs text-red-600 dark:text-red-400">
            You Owe
          </div>
        </div>
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {formatCurrency(totalOwed, state.settings.defaultCurrency)}
          </div>
          <div className="text-xs text-green-600 dark:text-green-400">
            You're Owed
          </div>
        </div>
        <div className={`text-center p-3 rounded-lg ${
          netAmount >= 0 
            ? 'bg-green-50 dark:bg-green-900/20' 
            : 'bg-red-50 dark:bg-red-900/20'
        }`}>
          <div className={`text-lg font-bold ${
            netAmount >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {formatCurrency(Math.abs(netAmount), state.settings.defaultCurrency)}
          </div>
          <div className={`text-xs ${
            netAmount >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {netAmount >= 0 ? 'Net Credit' : 'Net Debt'}
          </div>
        </div>
      </div>

      {/* Top Debtors */}
      {topDebtors.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <ArrowDownRight className="w-4 h-4 text-red-500" />
            <h4 className={`text-sm font-medium ${
              state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Top People You Owe
            </h4>
          </div>
          
          <div className="space-y-2">
            {topDebtors.map((debt) => {
              const user = state.users.find(u => u.id === debt.userId);
              return (
                <div
                  key={debt.userId}
                  className={`p-3 rounded-lg border ${
                    state.settings.theme === 'dark'
                      ? 'bg-gray-700/50 border-gray-600/50'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">
                          {user?.name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${
                          state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {user?.name || 'Unknown User'}
                        </div>
                        <div className="text-xs text-red-600 dark:text-red-400">
                          {debt.expenseCount} expense{debt.expenseCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${
                        state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {formatCurrency(debt.totalOwed, debt.currency)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Creditors */}
      {topCreditors.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <ArrowUpRight className="w-4 h-4 text-green-500" />
            <h4 className={`text-sm font-medium ${
              state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Top People Who Owe You
            </h4>
          </div>
          
          <div className="space-y-2">
            {topCreditors.map((credit) => {
              const user = state.users.find(u => u.id === credit.userId);
              return (
                <div
                  key={credit.userId}
                  className={`p-3 rounded-lg border ${
                    state.settings.theme === 'dark'
                      ? 'bg-gray-700/50 border-gray-600/50'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          {user?.name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${
                          state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {user?.name || 'Unknown User'}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400">
                          {credit.expenseCount} expense{credit.expenseCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${
                        state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {formatCurrency(credit.totalOwing, credit.currency)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Debts State */}
      {totalOwing === 0 && totalOwed === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🎉</div>
          <div className={`text-lg font-medium ${
            state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            All Settled Up!
          </div>
          <p className={`text-sm ${
            state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            No outstanding debts or credits
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {(totalOwing > 0 || totalOwed > 0) && (
        <div className="mt-6 space-y-2">
          {totalOwing > 0 && (
            <button className={`block w-full text-center py-2 px-4 rounded-lg font-medium transition-colors ${
              state.settings.theme === 'dark'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}>
              Pay Your Debts
            </button>
          )}
          {totalOwed > 0 && (
            <button className={`block w-full text-center py-2 px-4 rounded-lg font-medium transition-colors ${
              state.settings.theme === 'dark'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}>
              Request Payments
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default DebtOverviewCard;
