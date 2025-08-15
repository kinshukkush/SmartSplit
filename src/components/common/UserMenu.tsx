import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Settings, 
  LogOut, 
  Bell, 
  CreditCard, 
  HelpCircle,
  Moon,
  Sun,
  ChevronDown
} from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';

const UserMenu: React.FC = () => {
  const { state, dispatch } = useExpense();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: {
        ...state.settings,
        theme: state.settings.theme === 'light' ? 'dark' : 'light'
      }
    });
  };

  const handleLogout = () => {
    // Handle logout logic here
    console.log('Logging out...');
    setIsOpen(false);
  };

  if (!state.currentUser) {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
          state.settings.theme === 'dark'
            ? 'hover:bg-gray-700 text-white'
            : 'hover:bg-gray-100 text-gray-900'
        }`}
      >
        {state.currentUser.avatar ? (
          <img
            src={state.currentUser.avatar}
            alt={state.currentUser.name}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        )}
        <span className="font-medium hidden md:block">{state.currentUser.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute right-0 mt-2 w-64 rounded-lg shadow-lg border z-50 ${
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
                {state.currentUser.avatar ? (
                  <img
                    src={state.currentUser.avatar}
                    alt={state.currentUser.name}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <div className="font-semibold">{state.currentUser.name}</div>
                  <div className={`text-sm ${
                    state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {state.currentUser.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={() => setIsOpen(false)}
                className={`w-full flex items-center space-x-3 px-4 py-2 text-left transition-colors ${
                  state.settings.theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className={`w-full flex items-center space-x-3 px-4 py-2 text-left transition-colors ${
                  state.settings.theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className={`w-full flex items-center space-x-3 px-4 py-2 text-left transition-colors ${
                  state.settings.theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Payment Methods</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className={`w-full flex items-center space-x-3 px-4 py-2 text-left transition-colors ${
                  state.settings.theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </button>

              <button
                onClick={toggleTheme}
                className={`w-full flex items-center space-x-3 px-4 py-2 text-left transition-colors ${
                  state.settings.theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                {state.settings.theme === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
                <span>{state.settings.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className={`w-full flex items-center space-x-3 px-4 py-2 text-left transition-colors ${
                  state.settings.theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-50 text-gray-700'
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
                className={`w-full flex items-center space-x-3 px-4 py-2 text-left transition-colors text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20`}
              >
                <LogOut className="w-4 h-4" />
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