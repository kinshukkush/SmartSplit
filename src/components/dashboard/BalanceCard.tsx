// src/components/dashboard/BalanceCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useExpense, formatCurrency, DebtSummary } from '../../context/ExpenseContext';

interface BalanceCardProps {
  balance: DebtSummary;
  visible: boolean;
  onToggleVisibility: () => void;
  debts: { owes: DebtSummary[]; owed: DebtSummary[] };
}

const BalanceCard: React.FC<BalanceCardProps> = ({ 
  balance, 
  visible, 
  onToggleVisibility, 
  debts 
}) => {
  const { state } = useExpense();

  const totalOwed = debts.owes.reduce((sum, debt) => sum + debt.totalOwed, 0);
  const totalOwing = debts.owed.reduce((sum, debt) => sum + debt.totalOwing, 0);
  const netBalance = balance.netAmount;

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
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className={`font-semibold ${
              state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Balance Overview
            </h3>
            <p className={`text-sm ${
              state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Your current financial status
            </p>
          </div>
        </div>
        
        <button
          onClick={onToggleVisibility}
          className={`p-2 rounded-lg transition-colors ${
            state.settings.theme === 'dark'
              ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
          }`}
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Balance */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${
            state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Net Balance
          </span>
          <div className={`flex items-center space-x-1 ${
            netBalance >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {netBalance >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="text-xs font-medium">
              {netBalance >= 0 ? 'Positive' : 'Negative'}
            </span>
          </div>
        </div>
        
        <div className={`text-3xl font-bold ${
          netBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }`}>
          {visible ? formatCurrency(Math.abs(netBalance), balance.currency) : '••••••'}
        </div>
        
        <p className={`text-sm ${
          state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {netBalance >= 0 ? 'You are owed' : 'You owe'} {formatCurrency(Math.abs(netBalance), balance.currency)}
        </p>
      </div>

      {/* Balance Breakdown */}
      {visible && (
        <div className="space-y-4">
          {/* You Owe */}
          {totalOwing > 0 && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-700 dark:text-red-300">
                  You Owe
                </span>
                <TrendingDown className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-lg font-semibold text-red-700 dark:text-red-300">
                {formatCurrency(totalOwing, balance.currency)}
              </div>
              <p className="text-xs text-red-600 dark:text-red-400">
                {debts.owes.length} person{debts.owes.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* You Are Owed */}
          {totalOwed > 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  You Are Owed
                </span>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-lg font-semibold text-green-700 dark:text-green-300">
                {formatCurrency(totalOwed, balance.currency)}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400">
                {debts.owed.length} person{debts.owed.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* No Debts */}
          {totalOwing === 0 && totalOwed === 0 && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="text-2xl mb-2">✅</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  All Settled Up!
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  No outstanding debts
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      {visible && (totalOwing > 0 || totalOwed > 0) && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            {totalOwing > 0 && (
              <button className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors">
                Pay Debts
              </button>
            )}
            {totalOwed > 0 && (
              <button className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors">
                Request Payment
              </button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BalanceCard;
