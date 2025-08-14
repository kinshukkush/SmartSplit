// src/components/Settings.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Bell,
  Moon,
  Sun,
  Globe,
  Download,
  Upload,
  Trash2,
  User,
  Mail,
  Key,
  Shield,
  CreditCard,
  Smartphone,
  Monitor,
  Palette,
  Volume2,
  VolumeX,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Check,
  X,
  Search,
  ChevronRight,
  Info,
  AlertTriangle,
  HelpCircle,
  MessageSquare,
  Star,
  Heart,
  Share,
  Link2,
  Zap,
  Database,
  FileText,
  Camera,
  MapPin,
  Calendar,
  Clock,
  Filter,
  Tag,
  Users,
  BarChart3
} from 'lucide-react';

import { useExpense } from '../context/ExpenseContext';
import LoadingSpinner from './common/LoadingSpinner';
import ConfirmDialog from './common/ConfirmDialog';
import toast from 'react-hot-toast';



interface SettingsTab {
  id: string;
  name: string;
  icon: any;
  badge?: string;
  description: string;
}

interface NotificationPreference {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  type: 'push' | 'email' | 'sms';
}

const Settings: React.FC = () => {
  const { state, dispatch, helpers } = useExpense();
  const [activeTab, setActiveTab] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Enhanced tabs with descriptions
  const tabs: SettingsTab[] = [
    {
      id: 'general',
      name: 'General',
      icon: SettingsIcon,
      description: 'App preferences and defaults'
    },
    {
      id: 'profile',
      name: 'Profile',
      icon: User,
      description: 'Personal information and avatar'
    },
    {
      id: 'security',
      name: 'Security',
      icon: Shield,
      description: 'Privacy and security settings'
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: Bell,
      badge: state.reminders.length.toString(),
      description: 'Manage how you get notified'
    },
    {
      id: 'payments',
      name: 'Payments',
      icon: CreditCard,
      description: 'Payment methods and preferences'
    },
    {
      id: 'appearance',
      name: 'Appearance',
      icon: Palette,
      description: 'Theme and display settings'
    },
    {
      id: 'data',
      name: 'Data & Privacy',
      icon: Database,
      description: 'Export, import, and manage data'
    },
    {
      id: 'support',
      name: 'Help & Support',
      icon: HelpCircle,
      description: 'Get help and contact support'
    }
  ];

  
    // Enhanced currency options with symbols and regions
  const currencies = [
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', region: 'India' },
    { code: 'USD', name: 'US Dollar', symbol: '$', region: 'United States' },
    { code: 'EUR', name: 'Euro', symbol: '€', region: 'European Union' },
    { code: 'GBP', name: 'British Pound', symbol: '£', region: 'United Kingdom' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', region: 'Japan' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', region: 'Canada' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', region: 'Australia' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', region: 'Switzerland' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', region: 'China' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩', region: 'South Korea' }
  ];

  // Enhanced notification preferences
  const notificationPreferences: NotificationPreference[] = [
    {
      id: 'expense_added',
      title: 'New Expense Added',
      description: 'When someone adds you to a new expense',
      enabled: state.currentUser?.preferences.notifications.expenseAdded || true,
      type: 'push'
    },
    {
      id: 'payment_received',
      title: 'Payment Received',
      description: 'When someone pays you back',
      enabled: state.currentUser?.preferences.notifications.paymentReceived || true,
      type: 'push'
    },
    {
      id: 'payment_request',
      title: 'Payment Requests',
      description: 'When someone requests money from you',
      enabled: state.currentUser?.preferences.notifications.paymentRequest || true,
      type: 'push'
    },
    {
      id: 'reminders',
      title: 'Settlement Reminders',
      description: 'Periodic reminders for unsettled expenses',
      enabled: state.currentUser?.preferences.notifications.reminders || true,
      type: 'push'
    },
    {
      id: 'weekly_reports',
      title: 'Weekly Reports',
      description: 'Summary of your weekly spending and activity',
      enabled: state.currentUser?.preferences.notifications.weeklyReports || false,
      type: 'email'
    },
    {
      id: 'group_activity',
      title: 'Group Activity',
      description: 'Updates from your expense groups',
      enabled: true,
      type: 'push'
    },
    {
      id: 'security_alerts',
      title: 'Security Alerts',
      description: 'Important account security notifications',
      enabled: true,
      type: 'email'
    },
    {
      id: 'app_updates',
      title: 'App Updates',
      description: 'New features and app improvements',
      enabled: false,
      type: 'push'
    }
  ];

  // Theme options
  const themeOptions = [
    { 
      id: 'light', 
      name: 'Light', 
      icon: Sun, 
      description: 'Clean and bright interface',
      preview: 'bg-white border-gray-200 text-gray-900'
    },
    { 
      id: 'dark', 
      name: 'Dark', 
      icon: Moon, 
      description: 'Easy on the eyes',
      preview: 'bg-gray-900 border-gray-700 text-white'
    },
    { 
      id: 'system', 
      name: 'System', 
      icon: Monitor, 
      description: 'Follows your device setting',
      preview: 'bg-gradient-to-r from-gray-100 to-gray-900 border-gray-500 text-gray-700'
    }
  ];

  // Language options
  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' }
  ];

  // Helper functions
  const updateSettings = (updates: Partial<typeof state.settings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: updates });
    toast.success('Settings updated successfully');
  };

  const updateUserPreferences = (updates: any) => {
    if (state.currentUser) {
      const updatedUser = {
        ...state.currentUser,
        preferences: {
          ...state.currentUser.preferences,
          ...updates
        }
      };
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      toast.success('Preferences updated');
    }
  };

  const handleProfileImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setProfileImage(imageUrl);
        
        if (state.currentUser) {
          const updatedUser = {
            ...state.currentUser,
            avatar: imageUrl
          };
          dispatch({ type: 'UPDATE_USER', payload: updatedUser });
          toast.success('Profile picture updated');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const exportData = async () => {
    setIsLoading(true);
    try {
      const exportData = helpers.exportData('json');
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smartsplit-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setIsLoading(false);
    }
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      await helpers.importData(await file.text(), 'json');
      toast.success('Data imported successfully');
    } catch (error) {
      toast.error('Failed to import data. Please check the file format.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllData = () => {
    setShowDeleteConfirm(true);
  };

  const confirmClearData = async () => {
    setIsLoading(true);
    try {
      localStorage.clear();
      sessionStorage.clear();
      toast.success('All data cleared successfully');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error('Failed to clear data');
      setIsLoading(false);
    }
  };

  const filteredTabs = tabs.filter(tab =>
    searchQuery === '' ||
    tab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tab.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <h1 className={`text-3xl font-bold ${
            state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Settings ⚙️
          </h1>
          <p className={`text-lg mt-2 ${
            state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Customize your SmartSplit experience
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <motion.button
            onClick={exportData}
            disabled={isLoading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
              state.settings.theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Export Data</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search settings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-colors ${
            state.settings.theme === 'dark'
              ? 'bg-gray-800 border-gray-700 text-white focus:ring-purple-500 focus:border-purple-500'
              : 'bg-white border-gray-200 text-gray-900 focus:ring-purple-500 focus:border-purple-500'
          }`}
        />
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`lg:w-80 rounded-2xl p-6 ${
            state.settings.theme === 'dark'
              ? 'bg-gray-800/50 border border-gray-700/50'
              : 'bg-white border border-gray-200/50'
          }`}
        >
          <nav className="space-y-2">
            {filteredTabs.map((tab, index) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? state.settings.theme === 'dark'
                        ? 'bg-purple-900/50 border border-purple-500/50 text-purple-300'
                        : 'bg-purple-50 border border-purple-200 text-purple-700'
                      : state.settings.theme === 'dark'
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">{tab.name}</div>
                      <div className={`text-xs ${
                        activeTab === tab.id
                          ? state.settings.theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                          : 'text-gray-500'
                      }`}>
                        {tab.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {tab.badge && (
                      <span className="px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                        {tab.badge}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </motion.button>
              );
            })}
          </nav>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`flex-1 rounded-2xl p-6 ${
            state.settings.theme === 'dark'
              ? 'bg-gray-800/50 border border-gray-700/50'
              : 'bg-white border border-gray-200/50'
          }`}
        >
          <AnimatePresence mode="wait">
            {/* General Settings Tab */}
            {activeTab === 'general' && (
              <motion.div
                key="general"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <SettingsIcon className="w-6 h-6 text-purple-500" />
                  <h2 className={`text-2xl font-bold ${
                    state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    General Settings
                  </h2>
                </div>

                {/* Default Currency */}
                <div className="space-y-3">
                  <label className={`block text-sm font-medium ${
                    state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <Globe className="w-4 h-4 inline mr-2" />
                    Default Currency
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {currencies.slice(0, 6).map(currency => (
                      <motion.button
                        key={currency.code}
                        onClick={() => updateSettings({ defaultCurrency: currency.code })}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          state.settings.defaultCurrency === currency.code
                            ? 'border-purple-500 bg-purple-500/10'
                            : state.settings.theme === 'dark'
                              ? 'border-gray-700 hover:border-gray-600'
                              : 'border-gray-200 hover:border-gray-300'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className={`font-semibold ${
                              state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {currency.symbol} {currency.code}
                            </div>
                            <div className={`text-sm ${
                              state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {currency.name}
                            </div>
                            <div className={`text-xs ${
                              state.settings.theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                            }`}>
                              {currency.region}
                            </div>
                          </div>
                          {state.settings.defaultCurrency === currency.code && (
                            <Check className="w-5 h-5 text-purple-500" />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* App Preferences */}
                <div className="space-y-4">
                  <h3 className={`text-lg font-semibold ${
                    state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    App Preferences
                  </h3>

                  <div className={`p-4 rounded-lg border ${
                    state.settings.theme === 'dark'
                      ? 'border-gray-700 bg-gray-800/30'
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-medium ${
                          state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          Auto-settle Threshold
                        </div>
                        <div className={`text-sm mt-1 ${
                          state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Automatically suggest settlements above this amount
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm ${
                          state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {currencies.find(c => c.code === state.settings.defaultCurrency)?.symbol}
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="10"
                          value={state.settings.autoSettleThreshold}
                          onChange={(e) => updateSettings({ autoSettleThreshold: parseFloat(e.target.value) || 0 })}
                          className={`w-20 px-2 py-1 rounded border text-center ${
                            state.settings.theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border ${
                    state.settings.theme === 'dark'
                      ? 'border-gray-700 bg-gray-800/30'
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-medium ${
                          state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          Reminder Frequency
                        </div>
                        <div className={`text-sm mt-1 ${
                          state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          How often to send payment reminders
                        </div>
                      </div>
                      <select
                        value={state.settings.reminderFrequency}
                        onChange={(e) => updateSettings({ reminderFrequency: e.target.value as any })}
                        className={`px-3 py-1 rounded border ${
                          state.settings.theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Language Selection */}
                <div className="space-y-3">
                  <label className={`block text-sm font-medium ${
                    state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Language
                  </label>
                  <select
                    value={state.settings.language}
                    onChange={(e) => updateSettings({ language: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      state.settings.theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500'
                    }`}
                  >
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.nativeName} ({lang.name})
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}

            {/* Profile Settings Tab */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <User className="w-6 h-6 text-purple-500" />
                                    <h2 className={`text-2xl font-bold ${
                    state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Profile Settings
                  </h2>
                </div>

                {/* Profile Picture */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center">
                      {profileImage || state.currentUser?.avatar ? (
                        <img
                          src={profileImage || state.currentUser?.avatar}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-2xl font-bold">
                          {state.currentUser?.name?.charAt(0) || 'U'}
                        </span>
                      )}
                    </div>
                    <motion.button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white hover:bg-purple-600 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Camera className="w-4 h-4" />
                    </motion.button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${
                      state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {state.currentUser?.name || 'Your Name'}
                    </h3>
                    <p className={`${
                      state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {state.currentUser?.email || 'your.email@example.com'}
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-purple-500 hover:text-purple-400 text-sm font-medium mt-1"
                    >
                      Change photo
                    </button>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={state.currentUser?.name || ''}
                      onChange={(e) => {
                        if (state.currentUser) {
                          dispatch({
                            type: 'UPDATE_USER',
                            payload: { ...state.currentUser, name: e.target.value }
                          });
                        }
                      }}
                      className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                        state.settings.theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500'
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={state.currentUser?.email || ''}
                      onChange={(e) => {
                        if (state.currentUser) {
                          dispatch({
                            type: 'UPDATE_USER',
                            payload: { ...state.currentUser, email: e.target.value }
                          });
                        }
                      }}
                      className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                        state.settings.theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500'
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={state.currentUser?.phone || ''}
                      onChange={(e) => {
                        if (state.currentUser) {
                          dispatch({
                            type: 'UPDATE_USER',
                            payload: { ...state.currentUser, phone: e.target.value }
                          });
                        }
                      }}
                      className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                        state.settings.theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500'
                      }`}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Preferred Currency
                    </label>
                    <select
                      value={state.currentUser?.preferences?.defaultCurrency || state.settings.defaultCurrency}
                      onChange={(e) => updateUserPreferences({ defaultCurrency: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                        state.settings.theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500'
                      }`}
                    >
                      {currencies.map(currency => (
                        <option key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Account Statistics */}
                <div className={`p-6 rounded-lg border ${
                  state.settings.theme === 'dark'
                    ? 'border-gray-700 bg-gray-800/30'
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <h3 className={`text-lg font-semibold mb-4 ${
                    state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Account Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {state.expenses.filter(exp => exp.participants.some(p => p.id === state.currentUser?.id)).length}
                      </div>
                      <div className={`text-sm ${
                        state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Total Expenses
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {state.groups.filter(group => group.members.includes(state.currentUser?.id || '')).length}
                      </div>
                      <div className={`text-sm ${
                        state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Active Groups
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {state.currentUser ? helpers.calculateBalance(state.currentUser.id).expenseCount : 0}
                      </div>
                      <div className={`text-sm ${
                        state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Settled
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {Math.floor((Date.now() - new Date(state.currentUser?.createdAt || 0).getTime()) / (1000 * 60 * 60 * 24))}
                      </div>
                      <div className={`text-sm ${
                        state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Days Active
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Security Settings Tab */}
            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <Shield className="w-6 h-6 text-purple-500" />
                  <h2 className={`text-2xl font-bold ${
                    state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Security & Privacy
                  </h2>
                </div>

                {/* Privacy Settings */}
                <div className="space-y-4">
                  <h3 className={`text-lg font-semibold ${
                    state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Privacy Settings
                  </h3>

                  {[
                    {
                      id: 'biometric',
                      title: 'Biometric Authentication',
                      description: 'Use fingerprint or face recognition to unlock the app',
                      icon: Smartphone,
                      enabled: state.settings.biometricEnabled
                    },
                    {
                      id: 'backup',
                      title: 'Automatic Backup',
                      description: 'Automatically backup your data to secure cloud storage',
                      icon: Database,
                      enabled: state.settings.backupEnabled
                    }
                  ].map((setting) => (
                    <div
                      key={setting.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        state.settings.theme === 'dark'
                          ? 'border-gray-700 bg-gray-800/30'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${
                          state.settings.theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                        }`}>
                          <setting.icon className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                          <div className={`font-medium ${
                            state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {setting.title}
                          </div>
                          <div className={`text-sm ${
                            state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {setting.description}
                          </div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={setting.enabled}
                          onChange={(e) => updateSettings({ 
                            [setting.id === 'biometric' ? 'biometricEnabled' : 'backupEnabled']: e.target.checked 
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  ))}
                </div>

                {/* Password & Authentication */}
                <div className="space-y-4">
                  <h3 className={`text-lg font-semibold ${
                    state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Password & Authentication
                  </h3>

                  <div className={`p-4 rounded-lg border ${
                    state.settings.theme === 'dark'
                      ? 'border-gray-700 bg-gray-800/30'
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${
                          state.settings.theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                        }`}>
                          <Key className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                          <div className={`font-medium ${
                            state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            Change Password
                          </div>
                          <div className={`text-sm ${
                            state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Last changed 30 days ago
                          </div>
                        </div>
                      </div>
                      <motion.button
                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Update
                      </motion.button>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border ${
                    state.settings.theme === 'dark'
                      ? 'border-gray-700 bg-gray-800/30'
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${
                          state.settings.theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                        }`}>
                          <Smartphone className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                          <div className={`font-medium ${
                            state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            Two-Factor Authentication
                          </div>
                          <div className={`text-sm ${
                            state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Add extra security to your account
                          </div>
                        </div>
                      </div>
                      <motion.button
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          state.settings.theme === 'dark'
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Enable
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Data Privacy */}
                <div className={`p-6 rounded-lg border-2 border-dashed ${
                  state.settings.theme === 'dark'
                    ? 'border-gray-600 bg-gray-800/20'
                    : 'border-gray-300 bg-gray-50'
                }`}>
                  <div className="text-center">
                    <Shield className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                    <h3 className={`text-lg font-semibold mb-2 ${
                      state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Your Data is Secure
                    </h3>
                    <p className={`mb-4 ${
                      state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      All your expense data is encrypted and stored locally on your device. 
                      We never store your personal financial information on our servers.
                    </p>
                    <div className="flex items-center justify-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1 text-green-500">
                        <Check className="w-4 h-4" />
                        <span>End-to-End Encrypted</span>
                      </div>
                      <div className="flex items-center space-x-1 text-green-500">
                        <Check className="w-4 h-4" />
                        <span>Local Storage Only</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

                        {/* Notifications Settings Tab */}
            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <Bell className="w-6 h-6 text-purple-500" />
                  <h2 className={`text-2xl font-bold ${
                    state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Notification Settings
                  </h2>
                </div>

                {/* Master Toggle */}
                <div className={`p-4 rounded-lg border-2 ${
                  state.settings.notifications.expenseAdded
                    ? 'border-purple-500 bg-purple-500/10'
                    : state.settings.theme === 'dark'
                      ? 'border-gray-700 bg-gray-800/30'
                      : 'border-gray-300 bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-purple-500 rounded-full">
                        <Bell className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className={`text-lg font-semibold ${
                          state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          Enable Notifications
                        </div>
                        <div className={`text-sm ${
                          state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Get notified about expenses, payments, and reminders
                        </div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={state.settings.notifications.expenseAdded}
                        onChange={(e) => updateUserPreferences({
                          notifications: {
                            ...state.currentUser?.preferences.notifications,
                            expenseAdded: e.target.checked
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>

                {/* Notification Categories */}
                <div className="space-y-4">
                  <h3 className={`text-lg font-semibold ${
                    state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Notification Types
                  </h3>

                  {notificationPreferences.map((pref) => (
                    <div
                      key={pref.id}
                      className={`p-4 rounded-lg border transition-all ${
                        state.settings.theme === 'dark'
                          ? 'border-gray-700 bg-gray-800/30'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className={`font-medium ${
                              state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {pref.title}
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              pref.type === 'push' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' :
                              pref.type === 'email' ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300' :
                              'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300'
                            }`}>
                              {pref.type.toUpperCase()}
                            </span>
                          </div>
                          <div className={`text-sm mt-1 ${
                            state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {pref.description}
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input
                            type="checkbox"
                            checked={pref.enabled}
                            onChange={(e) => {
                              // Update specific notification preference
                              const updates = {
                                notifications: {
                                  ...state.currentUser?.preferences.notifications,
                                  [pref.id]: e.target.checked
                                }
                              };
                              updateUserPreferences(updates);
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quiet Hours */}
                <div className={`p-4 rounded-lg border ${
                  state.settings.theme === 'dark'
                    ? 'border-gray-700 bg-gray-800/30'
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <h4 className={`font-medium mb-3 ${
                    state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Quiet Hours
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        From
                      </label>
                      <input
                        type="time"
                        defaultValue="22:00"
                        className={`w-full px-3 py-2 rounded border ${
                          state.settings.theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Until
                      </label>
                      <input
                        type="time"
                        defaultValue="08:00"
                        className={`w-full px-3 py-2 rounded border ${
                          state.settings.theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>
                  <p className={`text-xs mt-2 ${
                    state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    No notifications will be sent during quiet hours except for urgent alerts
                  </p>
                </div>
              </motion.div>
            )}

            {/* Payment Settings Tab */}
            {activeTab === 'payments' && (
              <motion.div
                key="payments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <CreditCard className="w-6 h-6 text-purple-500" />
                  <h2 className={`text-2xl font-bold ${
                    state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Payment Settings
                  </h2>
                </div>

                {/* Payment Methods */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-lg font-semibold ${
                      state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Payment Methods
                    </h3>
                    <motion.button
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Method</span>
                    </motion.button>
                  </div>

                  {state.currentUser?.paymentMethods?.map((method, index) => (
                    <div
                      key={method.id}
                      className={`p-4 rounded-lg border ${
                        method.isDefault
                          ? 'border-purple-500 bg-purple-500/10'
                          : state.settings.theme === 'dark'
                            ? 'border-gray-700 bg-gray-800/30'
                            : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${
                            method.type === 'upi' ? 'bg-orange-100 dark:bg-orange-900' :
                            method.type === 'card' ? 'bg-blue-100 dark:bg-blue-900' :
                            method.type === 'bank' ? 'bg-green-100 dark:bg-green-900' :
                            'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            <CreditCard className={`w-5 h-5 ${
                              method.type === 'upi' ? 'text-orange-600 dark:text-orange-300' :
                              method.type === 'card' ? 'text-blue-600 dark:text-blue-300' :
                              method.type === 'bank' ? 'text-green-600 dark:text-green-300' :
                              'text-gray-600 dark:text-gray-300'
                            }`} />
                          </div>
                          <div>
                            <div className={`font-medium ${
                              state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {method.name}
                            </div>
                            <div className={`text-sm ${
                              state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {method.identifier} • {method.type.toUpperCase()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {method.isDefault && (
                            <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full">
                              Default
                            </span>
                          )}
                          <motion.button
                            className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                              state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className={`p-8 text-center rounded-lg border-2 border-dashed ${
                      state.settings.theme === 'dark'
                        ? 'border-gray-700 bg-gray-800/20'
                        : 'border-gray-300 bg-gray-50'
                    }`}>
                      <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className={`text-lg font-semibold mb-2 ${
                        state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        No Payment Methods
                      </h3>
                      <p className={`mb-4 ${
                        state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Add your preferred payment methods to make settlements easier
                      </p>
                      <motion.button
                        className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Add Your First Method
                      </motion.button>
                    </div>
                  )}
                </div>

                {/* Payment Preferences */}
                <div className="space-y-4">
                  <h3 className={`text-lg font-semibold ${
                    state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Payment Preferences
                  </h3>

                  <div className={`p-4 rounded-lg border ${
                    state.settings.theme === 'dark'
                      ? 'border-gray-700 bg-gray-800/30'
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-medium ${
                          state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          Auto-settle Small Amounts
                        </div>
                        <div className={`text-sm ${
                          state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Automatically settle amounts below ₹{state.settings.autoSettleThreshold}
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={false}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border ${
                    state.settings.theme === 'dark'
                      ? 'border-gray-700 bg-gray-800/30'
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-medium ${
                          state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          Request Payment Confirmations
                        </div>
                        <div className={`text-sm ${
                          state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Ask for confirmation before processing payments
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={true}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Appearance Settings Tab */}
            {activeTab === 'appearance' && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <Palette className="w-6 h-6 text-purple-500" />
                  <h2 className={`text-2xl font-bold ${
                    state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Appearance & Display
                  </h2>
                </div>

                {/* Theme Selection */}
                <div className="space-y-4">
                  <h3 className={`text-lg font-semibold ${
                    state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Theme
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {themeOptions.map((theme) => {
                      const IconComponent = theme.icon;
                      return (
                        <motion.button
                          key={theme.id}
                          onClick={() => updateSettings({ theme: theme.id as any })}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            state.settings.theme === theme.id
                              ? 'border-purple-500 bg-purple-500/10'
                              : state.settings.theme === 'dark'
                                ? 'border-gray-700 hover:border-gray-600'
                                : 'border-gray-200 hover:border-gray-300'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.preview}`}>
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div>
                              <div className={`font-semibold ${
                                state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}>
                                {theme.name}
                              </div>
                              <div className={`text-sm ${
                                state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {theme.description}
                              </div>
                            </div>
                          </div>
                          {state.settings.theme === theme.id && (
                            <div className="flex items-center justify-center">
                              <Check className="w-5 h-5 text-purple-500" />
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
                
                                  <div className={`p-4 rounded-lg border ${
                    state.settings.theme === 'dark'
                      ? 'border-gray-700 bg-gray-800/30'
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-medium ${
                          state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          Compact View
                        </div>
                        <div className={`text-sm ${
                          state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Show more information in less space
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={false}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border ${
                    state.settings.theme === 'dark'
                      ? 'border-gray-700 bg-gray-800/30'
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-medium ${
                          state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          Show Balance on Dashboard
                        </div>
                        <div className={`text-sm ${
                          state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Display your current balance prominently
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={true}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border ${
                    state.settings.theme === 'dark'
                      ? 'border-gray-700 bg-gray-800/30'
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="space-y-3">
                      <div className={`font-medium ${
                        state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Date Format
                      </div>
                      <select
                        value={state.settings.dateFormat}
                        onChange={(e) => updateSettings({ dateFormat: e.target.value })}
                        className={`w-full px-3 py-2 rounded border ${
                          state.settings.theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2023)</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2023)</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD (2023-12-31)</option>
                        <option value="DD MMM YYYY">DD MMM YYYY (31 Dec 2023)</option>
                      </select>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border ${
                    state.settings.theme === 'dark'
                      ? 'border-gray-700 bg-gray-800/30'
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="space-y-3">
                      <div className={`font-medium ${
                        state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Number Format
                      </div>
                      <select
                        value={state.settings.numberFormat}
                        onChange={(e) => updateSettings({ numberFormat: e.target.value })}
                        className={`w-full px-3 py-2 rounded border ${
                          state.settings.theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="1,00,000.00">Indian (1,00,000.00)</option>
                        <option value="100,000.00">International (100,000.00)</option>
                        <option value="100.000,00">European (100.000,00)</option>
                        <option value="1 00 000,00">French (1 00 000,00)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Data & Privacy Tab */}
            {activeTab === 'data' && (
              <motion.div
                key="data"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <Database className="w-6 h-6 text-purple-500" />
                  <h2 className={`text-2xl font-bold ${
                    state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Data & Privacy
                  </h2>
                </div>

                {/* Storage Usage */}
                <div className={`p-6 rounded-lg border ${
                  state.settings.theme === 'dark'
                    ? 'border-gray-700 bg-gray-800/30'
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <h3 className={`text-lg font-semibold mb-4 ${
                    state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Storage Usage
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {state.expenses.length}
                      </div>
                      <div className={`text-sm ${
                        state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Expenses
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {state.groups.length}
                      </div>
                      <div className={`text-sm ${
                        state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Groups
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {state.users.length}
                      </div>
                      <div className={`text-sm ${
                        state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Contacts
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {Math.round(JSON.stringify(state).length / 1024)}KB
                      </div>
                      <div className={`text-sm ${
                        state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Total Size
                      </div>
                    </div>
                  </div>
                </div>

                {/* Export Data */}
                <div className={`p-6 rounded-lg border-2 border-blue-500/30 bg-blue-500/10`}>
                  <h3 className="text-blue-300 font-semibold mb-2 flex items-center">
                    <Download className="w-5 h-5 mr-2" />
                    Export Your Data
                  </h3>
                  <p className={`mb-4 ${
                    state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Download all your expense data, groups, and settings as a backup file. 
                    This includes all your personal information and transaction history.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <motion.button
                      onClick={() => exportData()}
                      disabled={isLoading}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      <span>Export JSON</span>
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        const csvData = helpers.exportData('csv');
                        const blob = new Blob([csvData], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `smartsplit-expenses-${new Date().toISOString().split('T')[0]}.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                        toast.success('CSV exported successfully');
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FileText className="w-4 h-4" />
                      <span>Export CSV</span>
                    </motion.button>
                  </div>
                </div>

                {/* Import Data */}
                <div className={`p-6 rounded-lg border-2 border-green-500/30 bg-green-500/10`}>
                  <h3 className="text-green-300 font-semibold mb-2 flex items-center">
                    <Upload className="w-5 h-5 mr-2" />
                    Import Data
                  </h3>
                  <p className={`mb-4 ${
                    state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Restore your data from a previously exported backup file. 
                    This will merge with your existing data.
                  </p>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="hidden"
                    id="import-data"
                  />
                  <motion.label
                    htmlFor="import-data"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span>Choose Backup File</span>
                  </motion.label>
                </div>

                {/* Clear All Data */}
                <div className={`p-6 rounded-lg border-2 border-red-500/30 bg-red-500/10`}>
                  <h3 className="text-red-300 font-semibold mb-2 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Clear All Data
                  </h3>
                  <p className={`mb-4 ${
                    state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Permanently delete all your expenses, groups, settings, and personal data. 
                    This action cannot be undone.
                  </p>
                  <motion.button
                    onClick={clearAllData}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear All Data</span>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Support Tab */}
            {activeTab === 'support' && (
              <motion.div
                key="support"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <HelpCircle className="w-6 h-6 text-purple-500" />
                  <h2 className={`text-2xl font-bold ${
                    state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Help & Support
                  </h2>
                </div>

                {/* Quick Help */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      title: 'Getting Started Guide',
                      description: 'Learn the basics of splitting expenses',
                      icon: FileText,
                      color: 'blue'
                    },
                    {
                      title: 'FAQ',
                      description: 'Frequently asked questions',
                      icon: HelpCircle,
                      color: 'green'
                    },
                    {
                      title: 'Contact Support',
                      description: 'Get help from our team',
                      icon: MessageSquare,
                      color: 'purple'
                    },
                    {
                      title: 'Send Feedback',
                      description: 'Help us improve SmartSplit',
                      icon: Heart,
                      color: 'pink'
                    }
                  ].map((item) => (
                    <motion.div
                      key={item.title}
                      className={`p-6 rounded-lg border cursor-pointer transition-all ${
                        state.settings.theme === 'dark'
                          ? 'border-gray-700 bg-gray-800/30 hover:bg-gray-700/50'
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${
                          item.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' :
                          item.color === 'green' ? 'bg-green-100 dark:bg-green-900' :
                          item.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900' :
                          'bg-pink-100 dark:bg-pink-900'
                        }`}>
                          <item.icon className={`w-6 h-6 ${
                            item.color === 'blue' ? 'text-blue-600 dark:text-blue-300' :
                            item.color === 'green' ? 'text-green-600 dark:text-green-300' :
                            item.color === 'purple' ? 'text-purple-600 dark:text-purple-300' :
                            'text-pink-600 dark:text-pink-300'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold ${
                            state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {item.title}
                          </h3>
                          <p className={`text-sm ${
                            state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {item.description}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* App Information */}
                <div className={`p-6 rounded-lg border ${
                  state.settings.theme === 'dark'
                    ? 'border-gray-700 bg-gray-800/30'
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <h3 className={`text-lg font-semibold mb-4 ${
                    state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    App Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className={`font-medium ${
                        state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Version
                      </div>
                      <div className={`${
                        state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        2.1.0 (Build 2024.1)
                      </div>
                    </div>
                    <div>
                      <div className={`font-medium ${
                        state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Last Updated
                      </div>
                      <div className={`${
                        state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {new Date().toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className={`font-medium ${
                        state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Platform
                      </div>
                      <div className={`${
                        state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {navigator.platform}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rate & Share */}
                <div className={`p-6 rounded-lg border-2 border-purple-500/30 bg-purple-500/10`}>
                  <h3 className="text-purple-300 font-semibold mb-2 flex items-center">
                    <Star className="w-5 h-5 mr-2" />
                    Enjoying SmartSplit?
                  </h3>
                  <p className={`mb-4 ${
                    state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Help others discover SmartSplit by rating and sharing the app
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <motion.button
                      className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                      whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                    >
                      <Star className="w-4 h-4" />
                      <span>Rate App</span>
                    </motion.button>
                    <motion.button
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: 'SmartSplit - Expense Sharing Made Easy',
                            text: 'Check out SmartSplit for easy expense sharing with friends!',
                            url: window.location.origin
                          });
                        } else {
                          navigator.clipboard.writeText(window.location.origin);
                          toast.success('Link copied to clipboard!');
                        }
                      }}
                    >
                      <Share className="w-4 h-4" />
                      <span>Share App</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <ConfirmDialog
            isOpen={showDeleteConfirm}
            title="Clear All Data"
            message="Are you sure you want to permanently delete all your data? This includes all expenses, groups, settings, and cannot be undone."
            type="danger"
            onConfirm={confirmClearData}
            onCancel={() => setShowDeleteConfirm(false)}
            confirmText="Delete Everything"
            cancelText="Keep My Data"
          />
        )}
      </AnimatePresence>

      {/* Floating Save Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-40"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          onClick={() => toast.success('All settings are automatically saved!')}
          className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-lg flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Check className="w-5 h-5" />
        </motion.button>
      </motion.div>

      {/* Success Toast for Settings Changes */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-20 right-6 z-50"
        >
          <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg ${
            state.settings.theme === 'dark'
              ? 'bg-gray-800 border border-gray-700 text-white'
              : 'bg-white border border-gray-200 text-gray-900'
          }`}>
            <RefreshCw className="w-4 h-4 animate-spin text-purple-500" />
            <span className="text-sm font-medium">Saving settings...</span>
          </div>
        </motion.div>
      )}

      {/* Quick Settings Panel for Mobile */}
      <div className="lg:hidden fixed bottom-20 left-4 z-40">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7 }}
        >
          <motion.button
            onClick={() => {
              const newTheme = state.settings.theme === 'dark' ? 'light' : 'dark';
              updateSettings({ theme: newTheme });
            }}
            className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center ${
              state.settings.theme === 'dark'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-800 text-yellow-400'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {state.settings.theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Settings; 