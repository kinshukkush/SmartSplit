import React from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Avatar: React.FC<AvatarProps> = ({ src, alt = 'User avatar', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-purple-500 text-white">
          {alt.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};

const Reminders: React.FC = () => {
  return (
    <div className="reminders">
      <h2>Expense Reminders</h2>
      <p>Set up reminders for recurring expenses</p>
      <div className="reminders-list">
        <div className="reminder-item">
          <h3>Monthly Rent</h3>
          <p>Due on the 1st of every month</p>
        </div>
      </div>
    </div>
  );
};

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50"
    >
      <div className="container mx-auto px-4 h-full flex items-start pt-16">
        <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
          <div className="p-4">
            <div className="flex items-center border-b pb-4">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="ml-2 w-full outline-none"
                autoFocus
              />
              <button onClick={onClose}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            {/* Search results would go here */}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Reminders;
