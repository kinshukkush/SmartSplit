// src/components/common/UpdatePrompt.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';

const UpdatePrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Listen for service worker update events
    const handleUpdateAvailable = () => {
      setShowPrompt(true);
    };

    window.addEventListener('appUpdateAvailable', handleUpdateAvailable);
    return () => window.removeEventListener('appUpdateAvailable', handleUpdateAvailable);
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    // Refresh the page to load the new version
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-50 max-w-sm"
        >
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Update Available
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  A new version of SmartSplit is available with improvements and bug fixes.
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white text-sm rounded-md transition-colors"
                  >
                    {isUpdating ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3" />
                    )}
                    <span>{isUpdating ? 'Updating...' : 'Update'}</span>
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm transition-colors"
                  >
                    Later
                  </button>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpdatePrompt;