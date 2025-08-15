// src/components/common/UserMenu.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  LogOut, 
  Bell, 
  CreditCard, 
  HelpCircle,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { useExpense, User as UserType } from '../../context/ExpenseContext';

interface UserMenuProps {
  user: UserType | null;
  onClose: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onClose }) => {
  const { state, dispatch } = useExpense();
  const navigate = useNavigate();

  const toggleTheme = () => {
    const themes = ['light', 'dark', 'system'] as const;
    const currentIndex = themes.indexOf(state.settings.theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { theme: nextTheme }
    });
  };

  const handleLogout = () => {
    // Handle logout logic here
    dispatch({ type: 'SET_CURRENT_USER', payload: null });
    navigate('/onboarding');
    onClose();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const ThemeIcon = state.settings.theme === 'dark' ? Moon : 
                   state.settings.theme === 'light' ? Sun : Monitor;

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className={`absolute right-0 mt-2 w-64 rounded-xl shadow-xl border z-50 ${
        state.settings.theme === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      }`}
    >
      {/* User Info */}
      <div className={`p-4 border-b ${
        state.settings.theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center space-x-3">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-medium">
              {user.name.charAt(0)}
            </div>
          )}
          <div>
            <div className={`font-semibold ${
              state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {user.name}
            </div>
            <div className={`text-sm ${
              state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {user.email}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        <button
          onClick={() => handleNavigation('/profile')}
          className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
            state.settings.theme === 'dark'
              ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
              : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
        </button>

        <button
          onClick={() => handleNavigation('/settings')}
          className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
            state.settings.theme === 'dark'
              ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
              : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>

        <button
          onClick={() => handleNavigation('/payments')}
          className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
            state.settings.theme === 'dark'
              ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
              : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payment Methods</span>
        </button>

        <button
          onClick={() => handleNavigation('/reminders')}
          className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
            state.settings.theme === 'dark'
              ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
              : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
        </button>

        <button
          onClick={toggleTheme}
          className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
            state.settings.theme === 'dark'
              ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
              : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
          }`}
        >
          <ThemeIcon className="w-4 h-4" />
          <span>
            {state.settings.theme === 'dark' ? 'Dark Mode' : 
             state.settings.theme === 'light' ? 'Light Mode' : 'System Mode'}
          </span>
        </button>

        <button
          onClick={() => handleNavigation('/help')}
          className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
            state.settings.theme === 'dark'
              ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
              : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Help & Support</span>
        </button>

        <div className={`border-t my-2 ${
          state.settings.theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`} />

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </motion.div>
  );
};

export default QuickActions;