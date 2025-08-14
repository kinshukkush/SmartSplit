// src/components/common/UserMenu.tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useExpense, formatCurrency } from '../../context/ExpenseContext';
import Avatar from './Avatar';

interface UserMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ isOpen, onClose, onToggle }) => {
  const { state, dispatch } = useExpense();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentUser = state.currentUser;

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

  const handleThemeToggle = () => {
    const themes = ['light', 'dark', 'system'] as const;
    const currentIndex = themes.indexOf(state.settings.theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { theme: nextTheme }
    });
  };

  const getThemeIcon = () => {
    switch (state.settings.theme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'system':
        return '💻';
      default:
        return '☀️';
    }
  };

  const getThemeLabel = () => {
    switch (state.settings.theme) {
      case 'light':
        return 'Light Mode';
      case 'dark':
        return 'Dark Mode';
      case 'system':
        return 'System Mode';
      default:
        return 'Light Mode';
    }
  };

  const menuItems = [
    {
      id: 'profile',
      title: 'Profile',
      description: 'View and edit your profile',
      icon: '👤',
      action: () => navigate('/profile')
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Manage app preferences',
      icon: '⚙️',
      action: () => navigate('/settings')
    },
    {
      id: 'payment-methods',
      title: 'Payment Methods',
      description: 'Manage payment options',
      icon: '💳',
      action: () => navigate('/payments')
    },
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Download your data',
      icon: '📤',
      action: () => {
        // TODO: Implement export functionality
        console.log('Export data');
      }
    },
    {
      id: 'help',
      title: 'Help & Support',
      description: 'Get help and contact support',
      icon: '❓',
      action: () => {
        // TODO: Implement help functionality
        console.log('Help & Support');
      }
    }
  ];

  if (!currentUser) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Avatar Button */}
      <button
        onClick={onToggle}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <Avatar
          src={currentUser.avatar}
          name={currentUser.name}
          size="md"
        />
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {currentUser.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {currentUser.email}
          </div>
        </div>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
            {/* User Info Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <Avatar
                  src={currentUser.avatar}
                  name={currentUser.name}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentUser.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {currentUser.email}
                  </p>
                  <div className="mt-2">
                    <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs font-medium">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={handleThemeToggle}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getThemeIcon()}</span>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Theme
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {getThemeLabel()}
                    </div>
                  </div>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-lg">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {item.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  // TODO: Implement logout functionality
                  console.log('Logout');
                  onClose();
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
