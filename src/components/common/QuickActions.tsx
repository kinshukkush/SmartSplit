import React from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Users, 
  Calculator, 
  Receipt, 
  CreditCard, 
  PieChart,
  Clock,
  Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useExpense } from '../../context/ExpenseContext';

const QuickActions: React.FC = () => {
  const { state } = useExpense();
  const navigate = useNavigate();

  const actions = [
    {
      id: 'add-expense',
      title: 'Add Expense',
      description: 'Split a new bill',
      icon: Plus,
      color: 'bg-purple-600 hover:bg-purple-700',
      onClick: () => navigate('/create-expense')
    },
    {
      id: 'create-group',
      title: 'Create Group',
      description: 'Start a new group',
      icon: Users,
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => navigate('/create-group')
    },
    {
      id: 'settle-up',
      title: 'Settle Up',
      description: 'Pay your debts',
      icon: CreditCard,
      color: 'bg-green-600 hover:bg-green-700',
      onClick: () => navigate('/settlements')
    },
    {
      id: 'view-reports',
      title: 'View Reports',
      description: 'See spending insights',
      icon: PieChart,
      color: 'bg-orange-600 hover:bg-orange-700',
      onClick: () => navigate('/reports')
    }
  ];

  return (
    <div className={`p-6 rounded-lg ${
      state.settings.theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    } shadow-sm`}>
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={action.onClick}
            className={`${action.color} text-white p-4 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg`}
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <action.icon className="w-6 h-6" />
              <div>
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs opacity-90">{action.description}</div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Recent Activity Shortcut */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => navigate('/history')}
          className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
            state.settings.theme === 'dark'
              ? 'hover:bg-gray-700 text-gray-300'
              : 'hover:bg-gray-50 text-gray-700'
          }`}
        >
          <div className="flex items-center space-x-3">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Recent Activity</span>
          </div>
          <div className={`text-xs px-2 py-1 rounded-full ${
            state.settings.theme === 'dark'
              ? 'bg-gray-700 text-gray-400'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {state.expenses.length}
          </div>
        </button>
      </div>

      {/* Notifications Shortcut */}
      <div className="mt-2">
        <button
          onClick={() => navigate('/notifications')}
          className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
            state.settings.theme === 'dark'
              ? 'hover:bg-gray-700 text-gray-300'
              : 'hover:bg-gray-50 text-gray-700'
          }`}
        >
          <div className="flex items-center space-x-3">
            <Bell className="w-4 h-4" />
            <span className="text-sm font-medium">Notifications</span>
          </div>
          {state.notifications.filter(n => !n.read).length > 0 && (
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          )}
        </button>
      </div>
    </div>
  );
};

export default QuickActions;