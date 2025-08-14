// src/components/dashboard/ReminderCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bell, Clock, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { useExpense, formatCurrency, Reminder } from '../../context/ExpenseContext';

const ReminderCard: React.FC = () => {
  const { state, dispatch } = useExpense();

  const currentUser = state.currentUser;
  if (!currentUser) return null;

  // Get reminders for current user
  const userReminders = state.reminders.filter(reminder => 
    reminder.toUserId === currentUser.id && reminder.status === 'pending'
  );

  const pendingReminders = userReminders.filter(r => r.status === 'pending');
  const acknowledgedReminders = userReminders.filter(r => r.status === 'acknowledged');

  const getReminderIcon = (type: Reminder['type']) => {
    switch (type) {
      case 'payment_due':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'expense_added':
        return <Bell className="w-4 h-4 text-blue-500" />;
      case 'settlement_suggestion':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getReminderColor = (type: Reminder['type']) => {
    switch (type) {
      case 'payment_due':
        return 'text-red-600 dark:text-red-400';
      case 'expense_added':
        return 'text-blue-600 dark:text-blue-400';
      case 'settlement_suggestion':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getReminderBgColor = (type: Reminder['type']) => {
    switch (type) {
      case 'payment_due':
        return 'bg-red-50 dark:bg-red-900/20';
      case 'expense_added':
        return 'bg-blue-50 dark:bg-blue-900/20';
      case 'settlement_suggestion':
        return 'bg-green-50 dark:bg-green-900/20';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const markAsRead = (reminderId: string) => {
    dispatch({
      type: 'DISMISS_REMINDER',
      payload: reminderId
    });
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
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
            <Bell className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h3 className={`font-semibold ${
              state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Reminders
            </h3>
            <p className={`text-sm ${
              state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Important notifications
            </p>
          </div>
        </div>
        
        <Link
          to="/reminders"
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
        <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
            {pendingReminders.length}
          </div>
          <div className="text-xs text-yellow-600 dark:text-yellow-400">
            Pending
          </div>
        </div>
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {acknowledgedReminders.length}
          </div>
          <div className="text-xs text-green-600 dark:text-green-400">
            Read
          </div>
        </div>
      </div>

      {/* Recent Reminders */}
      <div className="space-y-3">
        <h4 className={`text-sm font-medium ${
          state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Recent Reminders
        </h4>
        
        {userReminders.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-2">🔔</div>
            <p className={`text-sm ${
              state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              No reminders yet
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {userReminders.slice(0, 3).map((reminder) => {
              const fromUser = state.users.find(u => u.id === reminder.fromUserId);
              
              return (
                <div
                  key={reminder.id}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    state.settings.theme === 'dark'
                      ? 'bg-gray-700/50 border-gray-600/50'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-lg ${getReminderBgColor(reminder.type)}`}>
                        {getReminderIcon(reminder.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${getReminderColor(reminder.type)}`}>
                          {reminder.title}
                        </div>
                        <p className={`text-xs mt-1 ${
                          state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {reminder.message}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className={`text-xs ${
                            state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {formatTimeAgo(reminder.createdAt)}
                          </span>
                          {fromUser && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className={`text-xs ${
                                state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                From {fromUser.name}
                              </span>
                            </>
                          )}
                        </div>
                        {reminder.amount && (
                          <div className="mt-2">
                            <span className={`text-xs font-medium ${getReminderColor(reminder.type)}`}>
                              {formatCurrency(reminder.amount, reminder.currency || state.settings.defaultCurrency)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {reminder.status === 'pending' && (
                      <button
                        onClick={() => markAsRead(reminder.id)}
                        className={`p-1 rounded transition-colors ${
                          state.settings.theme === 'dark'
                            ? 'hover:bg-gray-600 text-gray-400 hover:text-white'
                            : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {pendingReminders.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <button
              onClick={() => {
                pendingReminders.forEach(reminder => markAsRead(reminder.id));
              }}
              className={`flex-1 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-lg transition-colors`}
            >
              Mark All as Read
            </button>
            <Link
              to="/reminders"
              className={`flex-1 px-3 py-2 text-center bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors`}
            >
              View All
            </Link>
          </div>
        </div>
      )}

      {/* Action Button */}
      {userReminders.length === 0 && (
        <div className="mt-6">
          <Link
            to="/reminders"
            className={`block w-full text-center py-2 px-4 rounded-lg font-medium transition-colors ${
              state.settings.theme === 'dark'
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-yellow-500 hover:bg-yellow-600 text-white'
            }`}
          >
            View All Reminders
          </Link>
        </div>
      )}
    </motion.div>
  );
};

export default ReminderCard;
