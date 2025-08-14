// src/components/common/OfflineIndicator.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { WifiOff } from 'lucide-react';

const OfflineIndicator: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
    >
      <div className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm font-medium">You're offline</span>
      </div>
    </motion.div>
  );
};

export default OfflineIndicator;