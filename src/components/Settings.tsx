// src/components/Settings.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useExpense } from '../context/ExpenseContext';
import { 
  User, 
  Bell, 
  Palette, 
  Globe, 
  Shield, 
  Download, 
  Upload,
  Trash2,
  Save,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const { state, dispatch } = useExpense();
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'appearance' | 'privacy' | 'data'>('general');

  const handleSettingChange = (setting: string, value: any) => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { [setting]: value }
    });
    toast.success('Settings updated');
  };

  const handleExportData = () => {
    try {
      const data = JSON.stringify(state, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smartsplit-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'data', label: 'Data', icon: Download }
  ];

  return (
    <div className={`min-h-screen ${state.settings.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className={`${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your app preferences and account settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-purple-500 text-white'
                          : state.settings.theme === 'dark'
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
            >
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold">General Settings</h3>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Default Currency
                    </label>
                    <select
                      value={state.settings.defaultCurrency}
                      onChange={(e) => handleSettingChange('defaultCurrency', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        state.settings.theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {state.settings.supportedCurrencies.map(currency => (
                        <option key={currency} value={currency}>{currency}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Language
                    </label>
                    <select
                      value={state.settings.language}
                      onChange={(e) => handleSettingChange('language', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        state.settings.theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold">Notification Settings</h3>
                  
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <span>Expense Added</span>
                      <input
                        type="checkbox"
                        checked={state.settings.notifications.expenseAdded}
                        onChange={(e) => handleSettingChange('notifications', {
                          ...state.settings.notifications,
                          expenseAdded: e.target.checked
                        })}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between">
                      <span>Payment Received</span>
                      <input
                        type="checkbox"
                        checked={state.settings.notifications.paymentReceived}
                        onChange={(e) => handleSettingChange('notifications', {
                          ...state.settings.notifications,
                          paymentReceived: e.target.checked
                        })}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between">
                      <span>Payment Requests</span>
                      <input
                        type="checkbox"
                        checked={state.settings.notifications.paymentRequest}
                        onChange={(e) => handleSettingChange('notifications', {
                          ...state.settings.notifications,
                          paymentRequest: e.target.checked
                        })}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between">
                      <span>Reminders</span>
                      <input
                        type="checkbox"
                        checked={state.settings.notifications.reminders}
                        onChange={(e) => handleSettingChange('notifications', {
                          ...state.settings.notifications,
                          reminders: e.target.checked
                        })}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between">
                      <span>Weekly Reports</span>
                      <input
                        type="checkbox"
                        checked={state.settings.notifications.weeklyReports}
                        onChange={(e) => handleSettingChange('notifications', {
                          ...state.settings.notifications,
                          weeklyReports: e.target.checked
                        })}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold">Appearance Settings</h3>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['light', 'dark', 'system'].map((theme) => (
                        <button
                          key={theme}
                          onClick={() => handleSettingChange('theme', theme)}
                          className={`p-4 border rounded-lg transition-colors ${
                            state.settings.theme === theme
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-2">
                              {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '💻'}
                            </div>
                            <div className="capitalize font-medium">{theme}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold">Privacy & Security</h3>
                  
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <span>Enable Biometric Authentication</span>
                      <input
                        type="checkbox"
                        checked={state.settings.biometricEnabled}
                        onChange={(e) => handleSettingChange('biometricEnabled', e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between">
                      <span>Enable Data Backup</span>
                      <input
                        type="checkbox"
                        checked={state.settings.backupEnabled}
                        onChange={(e) => handleSettingChange('backupEnabled', e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold">Data Management</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Export Data</h4>
                      <p className={`text-sm mb-4 ${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Download all your expense data as a backup
                      </p>
                      <button
                        onClick={handleExportData}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export Data</span>
                      </button>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Clear All Data</h4>
                      <p className={`text-sm mb-4 ${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Permanently delete all your data from this device
                      </p>
                      <button
                        onClick={handleClearData}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Clear All Data</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;