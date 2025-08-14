// src/components/dashboard/QuickActionCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Users, 
  Receipt, 
  TrendingUp, 
  Settings, 
  Bell,
  CreditCard,
  FileText
} from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';

const QuickActionCard: React.FC = () => {
  const { state } = useExpense();

  const quickActions = [
    {
      id: 'add-expense',
      title: 'Add Expense',
      description: 'Create new expense',
      icon: Plus,
      color: 'bg-green-500',
      href: '/create',
      badge: null
    },
    {
      id: 'create-group',
      title: 'Create Group',
      description: 'Start expense group',
      icon: Users,
      color: 'bg-blue-500',
      href: '/groups/create',
      badge: null
    },
    {
      id: 'view-history',
      title: 'View History',
      description: 'See all expenses',
      icon: Receipt,
      color: 'bg-purple-500',
      href: '/history',
      badge: state.expenses.length
    },
    {
      id: 'settlements',
      title: 'Settlements',
      description: 'Manage payments',
      icon: CreditCard,
      color: 'bg-orange-500',
      href: '/settlements',
      badge: state.settlements.filter(s => s.status === 'suggested').length
    },
    {
      id: 'reports',
      title: 'Reports',
      description: 'View analytics',
      icon: TrendingUp,
      color: 'bg-indigo-500',
      href: '/reports',
      badge: null
    },
    {
      id: 'activity',
      title: 'Activity',
      description: 'Recent updates',
      icon: Bell,
      color: 'bg-pink-500',
      href: '/activity',
      badge: state.activityFeed.filter(a => {
        const activityDate = new Date(a.timestamp);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return activityDate > oneDayAgo;
      }).length
    },
    {
      id: 'export',
      title: 'Export Data',
      description: 'Download reports',
      icon: FileText,
      color: 'bg-teal-500',
      href: '/export',
      badge: null
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'App preferences',
      icon: Settings,
      color: 'bg-gray-500',
      href: '/settings',
      badge: null
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
        <div>
          <h3 className={`text-lg font-semibold ${
            state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Quick Actions
          </h3>
          <p className={`text-sm ${
            state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Access common features
          </p>
        </div>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              to={action.href}
              className={`block p-4 rounded-xl transition-all duration-200 hover:scale-105 ${
                state.settings.theme === 'dark'
                  ? 'bg-gray-700/50 hover:bg-gray-700 border border-gray-600/50'
                  : 'bg-white/60 hover:bg-white border border-gray-200/50'
              }`}
            >
              <div className="relative">
                {/* Icon */}
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>

                {/* Badge */}
                {action.badge !== null && action.badge > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {action.badge > 9 ? '9+' : action.badge}
                  </div>
                )}

                {/* Content */}
                <h4 className={`text-sm font-medium mb-1 ${
                  state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {action.title}
                </h4>
                <p className={`text-xs ${
                  state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {action.description}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className={`text-xs ${
            state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Quick access to your most used features
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default QuickActionCard;
