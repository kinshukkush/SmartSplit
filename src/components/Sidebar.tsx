// src/components/Sidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Plus,
  History,
  Users,
  BarChart3,
  Settings,
  CreditCard,
  Bell,
  Activity,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  Wallet
} from 'lucide-react';

import { useExpense } from '../context/ExpenseContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { state } = useExpense();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, badge: null },
    { name: 'Create Expense', href: '/create', icon: Plus, badge: null },
    { name: 'History', href: '/history', icon: History, badge: null },
    { name: 'Groups', href: '/groups', icon: Users, badge: state.groups.length.toString() },
    { name: 'Settlements', href: '/settlements', icon: CreditCard, badge: null },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, badge: null },
    { name: 'Activity', href: '/activity', icon: Activity, badge: null },
    { name: 'Settings', href: '/settings', icon: Settings, badge: null },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -320 }}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ type: 'tween', duration: 0.3 }}
        className={`fixed left-0 top-0 h-full w-80 z-50 lg:relative lg:translate-x-0 ${
          state.settings.theme === 'dark'
            ? 'bg-gray-900 border-gray-700'
            : 'bg-white border-gray-200'
        } border-r flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className={`text-xl font-bold ${
              state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              SmartSplit
            </span>
          </div>
          <button
            onClick={onClose}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              state.settings.theme === 'dark'
                ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={item.href}
                  onClick={() => onClose()}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-purple-500 text-white shadow-lg'
                      : state.settings.theme === 'dark'
                        ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* User Info */}
        {state.currentUser && (
          <div className={`p-4 border-t ${
            state.settings.theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-medium">
                {state.currentUser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${
                  state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {state.currentUser.name}
                </p>
                <p className={`text-sm truncate ${
                  state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {state.currentUser.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default Sidebar;