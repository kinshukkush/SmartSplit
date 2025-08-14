// src/components/common/EmptyState.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';

interface EmptyStateProps {
  icon?: string | LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  suggestions?: Array<{
    label: string;
    onClick: () => void;
  }>;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  suggestions,
  className = ''
}) => {
  const { state } = useExpense();

  const getButtonClasses = (variant: 'primary' | 'secondary' | 'outline' = 'primary') => {
    const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors';
    
    switch (variant) {
      case 'primary':
        return `${baseClasses} ${
          state.settings.theme === 'dark'
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`;
      case 'secondary':
        return `${baseClasses} ${
          state.settings.theme === 'dark'
            ? 'bg-gray-600 hover:bg-gray-700 text-white'
            : 'bg-gray-500 hover:bg-gray-600 text-white'
        }`;
      case 'outline':
        return `${baseClasses} ${
          state.settings.theme === 'dark'
            ? 'border border-gray-600 hover:bg-gray-700 text-gray-300 hover:text-white'
            : 'border border-gray-300 hover:bg-gray-50 text-gray-700 hover:text-gray-900'
        }`;
      default:
        return baseClasses;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center py-12 px-6 ${className}`}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
        className="text-6xl mb-4"
      >
        {typeof icon === 'string' ? (
          icon
        ) : icon ? (
          React.createElement(icon, { 
            className: `w-16 h-16 mx-auto ${
              state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }` 
          })
        ) : (
          '📋'
        )}
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`text-xl font-semibold mb-2 ${
          state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}
      >
        {title}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`text-base mb-6 max-w-md mx-auto ${
          state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}
      >
        {description}
      </motion.p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-center items-center"
        >
          {action && (
            <button
              onClick={action.onClick}
              className={getButtonClasses(action.variant)}
            >
              {action.label}
            </button>
          )}
          
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className={getButtonClasses(secondaryAction.variant)}
            >
              {secondaryAction.label}
            </button>
          )}
        </motion.div>
      )}

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <p className={`text-sm mb-3 ${
            state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Quick suggestions:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={suggestion.onClick}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  state.settings.theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyState;
