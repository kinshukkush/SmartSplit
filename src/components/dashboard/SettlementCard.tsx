// src/components/dashboard/SettlementCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CreditCard, ArrowRight, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useExpense, formatCurrency, Settlement } from '../../context/ExpenseContext';

const SettlementCard: React.FC = () => {
  const { state, helpers } = useExpense();

  const settlements = state.settlements;
  const settlementSuggestions = helpers.getSettlementSuggestions();

  const pendingSettlements = settlements.filter(s => s.status === 'suggested');
  const completedSettlements = settlements.filter(s => s.status === 'completed');
  const totalPendingAmount = pendingSettlements.reduce((sum, s) => sum + s.amount, 0);

  const getStatusIcon = (status: Settlement['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'agreed':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'suggested':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'declined':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Settlement['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'agreed':
        return 'text-blue-600 dark:text-blue-400';
      case 'suggested':
        return 'text-orange-600 dark:text-orange-400';
      case 'declined':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
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
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <CreditCard className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className={`font-semibold ${
              state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Settlements
            </h3>
            <p className={`text-sm ${
              state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Payment management
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
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {pendingSettlements.length}
          </div>
          <div className="text-sm text-orange-600 dark:text-orange-400">
            Pending
          </div>
        </div>
        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {completedSettlements.length}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">
            Completed
          </div>
        </div>
      </div>

      {/* Pending Amount */}
      {totalPendingAmount > 0 && (
        <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
              Total Pending
            </span>
            <span className="text-lg font-bold text-orange-700 dark:text-orange-300">
              {formatCurrency(totalPendingAmount, state.settings.defaultCurrency)}
            </span>
          </div>
        </div>
      )}

      {/* Recent Settlements */}
      <div className="space-y-3">
        <h4 className={`text-sm font-medium ${
          state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Recent Settlements
        </h4>
        
        {settlements.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-2">💳</div>
            <p className={`text-sm ${
              state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              No settlements yet
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {settlements.slice(0, 3).map((settlement) => {
              const fromUser = state.users.find(u => u.id === settlement.fromUserId);
              const toUser = state.users.find(u => u.id === settlement.toUserId);
              
              return (
                <div
                  key={settlement.id}
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
                          {fromUser?.name || 'Unknown'}
                        </span>
                        <span className="text-gray-500">→</span>
                        <span className={`text-sm font-medium ${
                          state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {toUser?.name || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusIcon(settlement.status)}
                        <span className={`text-xs font-medium ${getStatusColor(settlement.status)}`}>
                          {settlement.status.charAt(0).toUpperCase() + settlement.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${
                        state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {formatCurrency(settlement.amount, settlement.currency)}
                      </div>
                      <div className={`text-xs ${
                        state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {new Date(settlement.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Settlement Suggestions */}
      {settlementSuggestions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className={`text-sm font-medium ${
              state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Suggested Settlements
            </h4>
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
              {settlementSuggestions.length}
            </span>
          </div>
          
          <div className="space-y-2">
            {settlementSuggestions.slice(0, 2).map((suggestion) => {
              const fromUser = state.users.find(u => u.id === suggestion.fromUserId);
              const toUser = state.users.find(u => u.id === suggestion.toUserId);
              
              return (
                <div
                  key={suggestion.id}
                  className={`p-3 rounded-lg border border-blue-200 dark:border-blue-800 ${
                    state.settings.theme === 'dark'
                      ? 'bg-blue-900/20'
                      : 'bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${
                          state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {fromUser?.name || 'Unknown'}
                        </span>
                        <span className="text-blue-500">→</span>
                        <span className={`text-sm font-medium ${
                          state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {toUser?.name || 'Unknown'}
                        </span>
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Suggested settlement
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${
                        state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {formatCurrency(suggestion.amount, suggestion.currency)}
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
      <div className="mt-6">
        <Link
          to="/settlements"
          className={`block w-full text-center py-2 px-4 rounded-lg font-medium transition-colors ${
            state.settings.theme === 'dark'
              ? 'bg-orange-600 hover:bg-orange-700 text-white'
              : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
        >
          View All Settlements
        </Link>
      </div>
    </motion.div>
  );
};

export default SettlementCard;
