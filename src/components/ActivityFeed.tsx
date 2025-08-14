// src/components/ActivityFeed.tsx
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useExpense, ActivityFeedItem } from '../context/ExpenseContext';
import { formatCurrency } from '../context/ExpenseContext';

const ActivityFeed: React.FC = () => {
  const { state } = useExpense();
  const [filter, setFilter] = useState<'all' | 'expense_added' | 'payment_made' | 'user_joined' | 'group_created'>('all');
  const [timeRange, setTimeRange] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const filteredActivities = useMemo(() => {
    let activities = state.activityFeed;

    // Filter by type
    if (filter !== 'all') {
      activities = activities.filter(activity => activity.type === filter);
    }

    // Filter by time range
    const now = new Date();
    switch (timeRange) {
      case 'today':
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        activities = activities.filter(activity => new Date(activity.timestamp) >= today);
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        activities = activities.filter(activity => new Date(activity.timestamp) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        activities = activities.filter(activity => new Date(activity.timestamp) >= monthAgo);
        break;
    }

    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [state.activityFeed, filter, timeRange]);

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
    if (diffInMinutes < 43200) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`min-h-screen ${state.settings.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Activity Feed</h1>
          <p className={`${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Track all activities and updates in your expense groups
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            {/* Type Filter */}
            <div className="flex-1 min-w-48">
              <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Activity Type
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  state.settings.theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">All Activities</option>
                <option value="expense_added">Expenses Added</option>
                <option value="payment_made">Payments Made</option>
                <option value="user_joined">Users Joined</option>
                <option value="group_created">Groups Created</option>
              </select>
            </div>

            {/* Time Range Filter */}
            <div className="flex-1 min-w-48">
              <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Time Range
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  state.settings.theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredActivities.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-2">No activities found</h3>
                <p className={`${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {filter === 'all' && timeRange === 'all' 
                    ? 'Start adding expenses to see activity here'
                    : 'No activities match your current filters'
                  }
                </p>
              </motion.div>
            ) : (
              filteredActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 ${
                    activity.type === 'expense_added' ? 'border-l-green-500' :
                    activity.type === 'payment_made' ? 'border-l-purple-500' :
                    activity.type === 'user_joined' ? 'border-l-yellow-500' :
                    activity.type === 'group_created' ? 'border-l-indigo-500' :
                    'border-l-gray-500'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Activity Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>

                    {/* Activity Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">{activity.title}</h3>
                        <span className={`text-sm ${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatTimestamp(activity.timestamp)}
                        </span>
                      </div>
                      
                      <p className={`mb-3 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {activity.description}
                      </p>

                      {/* User Info */}
                      <div className="flex items-center space-x-2">
                        {activity.userAvatar && (
                          <img
                            src={activity.userAvatar}
                            alt={activity.userName}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <span className={`text-sm font-medium ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {activity.userName}
                        </span>
                      </div>

                      {/* Metadata */}
                      {activity.metadata && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          {activity.metadata.amount && activity.metadata.currency && (
                            <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                              state.settings.theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {formatCurrency(activity.metadata.amount, activity.metadata.currency)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Load More Button */}
        {filteredActivities.length > 0 && (
          <div className="text-center mt-8">
            <button
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                state.settings.theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
              }`}
            >
              Load More Activities
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
