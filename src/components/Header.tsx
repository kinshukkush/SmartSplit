// src/components/Header.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Wallet,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Plus,
  Moon,
  Sun,
  Monitor,
  CreditCard,
  Users,
  Activity,
  ChevronDown,
  Filter,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

import { useExpense } from '../context/ExpenseContext';
import { formatCurrency } from '../context/ExpenseContext';
import Avatar from './common/Avatar';
import SearchModal from './common/SearchModal';
import NotificationDropdown from './common/NotificationDropdown';
import QuickActions from './common/QuickActions';
import UserMenu from './common/UserMenu';

interface HeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, sidebarOpen }) => {
  const { state, dispatch, helpers } = useExpense();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  
  const searchRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Get current user balance
  const currentUserBalance = state.currentUser 
    ? helpers.calculateBalance(state.currentUser.id)
    : null;

  // Get unread notifications
  const unreadReminders = state.currentUser 
    ? helpers.getUnreadReminders(state.currentUser.id)
    : [];

  // Get recent activity count
  const recentActivityCount = state.activityFeed.filter(activity => {
    const activityDate = new Date(activity.timestamp);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return activityDate > oneDayAgo;
  }).length;

  // Generate breadcrumbs based on current route
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Home', href: '/' }];

    let currentPath = '';
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      
      // Map route segments to readable names
      const segmentMap: Record<string, string> = {
        'create': 'Create Expense',
        'history': 'History',
        'groups': 'Groups',
        'analytics': 'Analytics',
        'settings': 'Settings',
        'profile': 'Profile',
        'settlements': 'Settlements',
        'payments': 'Payment Methods',
        'reminders': 'Reminders',
        'activity': 'Activity',
        'reports': 'Reports'
      };

      const name = segmentMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({ name, href: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Handle theme toggle
  const toggleTheme = () => {
    const themes = ['light', 'dark', 'system'] as const;
    const currentIndex = themes.indexOf(state.settings.theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { theme: nextTheme }
    });
  };

  // Handle search
  const [searchQuery, setSearchQuery] = useState('');
  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/history?search=${encodeURIComponent(query)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      // Cmd/Ctrl + K for search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
      
      // Escape to close modals
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setUserMenuOpen(false);
        setNotificationsOpen(false);
        setQuickActionsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, []);

  const ThemeIcon = state.settings.theme === 'dark' ? Moon : 
                   state.settings.theme === 'light' ? Sun : Monitor;

  return (
    <>
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-200 ${
        state.settings.theme === 'dark'
          ? 'bg-gray-900/80 border-gray-700/50'
          : 'bg-white/80 border-gray-200/50'
      }`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              {/* Sidebar Toggle */}
              <button
                onClick={onMenuClick}
                className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                  state.settings.theme === 'dark'
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Logo & Brand */}
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="relative">
                  <motion.div 
                    className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Wallet className="w-4 h-4 text-white" />
                  </motion.div>
                </div>
                <div className="hidden sm:block">
                  <span className={`text-lg font-bold transition-colors ${
                    state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    SmartSplit
                  </span>
                </div>
              </Link>

              {/* Breadcrumbs - Desktop only */}
              <div className="hidden lg:flex items-center space-x-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.href} className="flex items-center space-x-2">
                    {index > 0 && (
                      <ChevronDown className="w-4 h-4 text-gray-400 rotate-[-90deg]" />
                    )}
                    <Link
                      to={crumb.href}
                      className={`px-2 py-1 rounded transition-colors ${
                        index === breadcrumbs.length - 1
                          ? state.settings.theme === 'dark'
                            ? 'text-purple-400 font-medium'
                            : 'text-purple-600 font-medium'
                          : state.settings.theme === 'dark'
                            ? 'text-gray-400 hover:text-gray-200'
                            : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {crumb.name}
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Center Section - Balance Info */}
            {currentUserBalance && (
              <motion.div 
                className="hidden md:flex items-center space-x-4 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="text-center">
                  <div className={`text-xs font-medium ${
                    state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Your Balance
                  </div>
                  <div className={`font-bold ${
                    currentUserBalance.netAmount >= 0
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}>
                    {formatCurrency(Math.abs(currentUserBalance.netAmount), currentUserBalance.currency)}
                  </div>
                </div>
                
                {currentUserBalance.netAmount !== 0 && (
                  <div className="text-center">
                    <div className={`text-xs font-medium ${
                      state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {currentUserBalance.netAmount > 0 ? 'You are owed' : 'You owe'}
                    </div>
                    <Link
                      to="/settlements"
                      className="text-xs text-purple-500 hover:text-purple-400 font-medium"
                    >
                      Settle up →
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            {/* Right Section */}
            <div className="flex items-center space-x-2">
              
              {/* Search Button */}
              <motion.button
                onClick={() => setSearchOpen(true)}
                className={`hidden sm:flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors border ${
                  state.settings.theme === 'dark'
                    ? 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100/50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Search className="w-4 h-4" />
                <span className="text-sm">Search</span>
                <div className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                  state.settings.theme === 'dark'
                    ? 'bg-gray-700 text-gray-400'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  ⌘K
                </div>
              </motion.button>

              {/* Mobile Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className={`sm:hidden p-2 rounded-lg transition-colors ${
                  state.settings.theme === 'dark'
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Quick Actions */}
              <motion.button
                onClick={() => setQuickActionsOpen(true)}
                className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition-shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-5 h-5" />
              </motion.button>

              {/* Theme Toggle */}
              <motion.button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  state.settings.theme === 'dark'
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ThemeIcon className="w-5 h-5" />
              </motion.button>

              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <motion.button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className={`relative p-2 rounded-lg transition-colors ${
                    state.settings.theme === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bell className="w-5 h-5" />
                  {unreadReminders.length > 0 && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      {unreadReminders.length > 9 ? '9+' : unreadReminders.length}
                    </motion.div>
                  )}
                </motion.button>

                <AnimatePresence>
                  {notificationsOpen && (
                    <NotificationDropdown
                      notifications={unreadReminders}
                      onClose={() => setNotificationsOpen(false)}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <motion.button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-1 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Avatar
                    user={state.currentUser}
                    size="sm"
                    showOnlineStatus={true}
                  />
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </motion.button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <UserMenu
                      user={state.currentUser}
                      onClose={() => setUserMenuOpen(false)}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Quick Stats Bar */}
        {currentUserBalance && (
          <div className="md:hidden px-4 py-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div>
                  <span className="text-gray-500">Balance: </span>
                  <span className={`font-medium ${
                    currentUserBalance.netAmount >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {formatCurrency(Math.abs(currentUserBalance.netAmount), currentUserBalance.currency)}
                  </span>
                </div>
                
                {recentActivityCount > 0 && (
                  <Link
                    to="/activity"
                    className="flex items-center space-x-1 text-purple-500"
                  >
                    <Activity className="w-4 h-4" />
                    <span>{recentActivityCount} new</span>
                  </Link>
                )}
              </div>

              {currentUserBalance.netAmount !== 0 && (
                <Link
                  to="/settlements"
                  className="text-purple-500 font-medium"
                >
                  Settle →
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Modals */}
      <AnimatePresence>
        {searchOpen && (
          <SearchModal
            isOpen={searchOpen}
            onClose={() => setSearchOpen(false)}
            onSearch={handleSearch}
          />
        )}
        
        {quickActionsOpen && (
          <QuickActions
            isOpen={quickActionsOpen}
            onClose={() => setQuickActionsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;