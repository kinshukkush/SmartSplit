// src/components/common/QuickActions.tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useExpense } from '../../context/ExpenseContext';

interface QuickActionsProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ isOpen, onClose, onToggle }) => {
  const { state } = useExpense();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const quickActions = [
    {
      id: 'create-expense',
      title: 'Add Expense',
      description: 'Create a new expense',
      icon: '💰',
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      action: () => navigate('/create')
    },
    {
      id: 'create-group',
      title: 'Create Group',
      description: 'Start a new expense group',
      icon: '👥',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      action: () => navigate('/groups/create')
    },
    {
      id: 'settlements',
      title: 'Settlements',
      description: 'View pending settlements',
      icon: '⚖️',
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      action: () => navigate('/settlements')
    },
    {
      id: 'reports',
      title: 'Reports',
      description: 'View financial reports',
      icon: '📊',
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      action: () => navigate('/reports')
    },
    {
      id: 'activity',
      title: 'Activity Feed',
      description: 'View recent activities',
      icon: '📝',
      color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      action: () => navigate('/activity')
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Manage app settings',
      icon: '⚙️',
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      action: () => navigate('/settings')
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleActionClick = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Quick Actions Button */}
      <button
        onClick={onToggle}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quick Actions
              </h3>
            </div>

            {/* Actions Grid */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleActionClick(action.action)}
                    className="p-4 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${action.color}`}>
                        {action.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {action.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Quick access to common actions
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuickActions;
