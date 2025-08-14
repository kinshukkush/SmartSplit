// src/components/dashboard/ActivityFeedCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useExpense, ActivityFeedItem, formatCurrency } from '../../context/ExpenseContext';

interface ActivityFeedCardProps {
  activities: ActivityFeedItem[];
}

const ActivityFeedCard: React.FC<ActivityFeedCardProps> = ({ activities }) => {
  const { state } = useExpense();

  const getActivityIcon = (type: ActivityFeedItem['type']) => {
    switch (type) {
      case 'expense_added':
        return '💰';
      case 'expense_updated':
        return '✏️';
      case 'payment_made':
        return '💳';
      case 'user_joined':
        return '👤';
      case 'group_created':
        return '👥';
      case 'reminder_sent':
        return '🔔';
      default:
        return '📝';
    }
  };

  const getActivityColor = (type: ActivityFeedItem['type']) => {
    switch (type) {
      case 'expense_added':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'expense_updated':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'payment_made':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'user_joined':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'group_created':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'reminder_sent':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <button
          className={`text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors ${
            state.settings.theme === 'dark' ? 'hover:text-purple-400' : ''
          }`}
        >
          View All
        </button>
      </div>

      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-2">📝</div>
            <p className={`text-sm ${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              No recent activity
            </p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {/* Activity Icon */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>

              {/* Activity Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium truncate">{activity.title}</p>
                  <span className={`text-xs ${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
                
                <p className={`text-xs truncate ${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {activity.description}
                </p>

                {/* User Info */}
                <div className="flex items-center space-x-2 mt-1">
                  {activity.userAvatar && (
                    <img
                      src={activity.userAvatar}
                      alt={activity.userName}
                      className="w-4 h-4 rounded-full"
                    />
                  )}
                  <span className={`text-xs ${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {activity.userName}
                  </span>
                </div>

                {/* Metadata */}
                {activity.metadata && activity.metadata.amount && activity.metadata.currency && (
                  <div className="mt-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      state.settings.theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {formatCurrency(activity.metadata.amount, activity.metadata.currency)}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {activities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            className={`w-full text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors ${
              state.settings.theme === 'dark' ? 'hover:text-purple-400' : ''
            }`}
          >
            Load More Activities
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeedCard;
