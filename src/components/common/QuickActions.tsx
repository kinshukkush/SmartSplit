// src/components/common/QuickActions.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Users, 
  Receipt, 
  CreditCard, 
  PieChart,
  Activity,
  FileText,
  Settings,
  X
} from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';

interface QuickActionsProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ isOpen, onClose }) => {
  const { state } = useExpense();
  const navigate = useNavigate();

  const actions = [
    {
      id: 'add-expense',
      title: 'Add Expense',
      description: 'Create new expense',
      icon: Plus,
      color: 'bg-purple-600 hover:bg-purple-700',
      onClick: () => {
        navigate('/create');
        onClose();
      }
    },
    {
      id: 'create-group',
      title: 'Create Group',
      description: 'Start expense group',
      icon: Users,
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => {
        navigate('/groups/create');
        onClose();
      }
    },
    {
      id: 'view-history',
      title: 'View History',
      description: 'See all expenses',
      icon: Receipt,
      color: 'bg-green-600 hover:bg-green-700',
      onClick: () => {
        navigate('/history');
        onClose();
      }
    },
    {
      id: 'settlements',
      title: 'Settlements',
      description: 'Manage payments',
      icon: CreditCard,
      color: 'bg-orange-600 hover:bg-orange-700',
      onClick: () => {
        navigate('/settlements');
        onClose();
      }
    },
    {
      id: 'reports',
      title: 'Reports',
      description: 'View analytics',
      icon: PieChart,
      color: 'bg-indigo-600 hover:bg-indigo-700',
      onClick: () => {
        navigate('/reports');
        onClose();
      }
    },
    {
      id: 'activity',
      title: 'Activity',
      description: 'Recent updates',
      icon: Activity,
      color: 'bg-pink-600 hover:bg-pink-700',
      onClick: () => {
        navigate('/activity');
        onClose();
      }
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`w-full max-w-md rounded-xl shadow-xl ${
              state.settings.theme === 'dark'
                ? 'bg-gray-800 border border-gray-700'
                : 'bg-white border border-gray-200'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className={`text-lg font-semibold ${
                state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Quick Actions
              </h3>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  state.settings.theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Actions Grid */}
            <div className="p-6">
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuickActions;