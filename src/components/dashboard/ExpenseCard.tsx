// src/components/dashboard/ExpenseCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Receipt, MoreVertical, MapPin, Tag } from 'lucide-react';
import { formatCurrency } from '../../context/ExpenseContext';

interface ExpenseCardProps {
  expense: any;
  viewMode?: 'cards' | 'list';
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleSettle?: () => void;
  onDuplicate?: () => void;
  currentUserId?: string;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  viewMode = 'cards',
  isSelected = false,
  onToggleSelect,
  onView,
  onEdit,
  onDelete,
  onToggleSettle,
  onDuplicate,
  currentUserId
}) => {
  const isListView = viewMode === 'list';

  return (
    <motion.div
      layout
      className={`${
        isListView ? 'flex items-center p-4' : 'p-6'
      } bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:shadow-lg transition-all cursor-pointer ${
        isSelected ? 'ring-2 ring-purple-500' : ''
      }`}
      whileHover={{ scale: 1.02 }}
      onClick={onView}
    >
      {isListView ? (
        <div className="flex items-center justify-between w-full space-x-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-white font-medium">
                {expense.title.charAt(0)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {expense.title}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span>{new Date(expense.date).toLocaleDateString()}</span>
                <span>{expense.participants.length} people</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  expense.settled 
                    ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300'
                    : 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300'
                }`}>
                  {expense.settled ? 'Settled' : 'Pending'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(expense.totalAmount, expense.currency)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {expense.category}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {expense.title}
                </h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  expense.settled 
                    ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300'
                    : 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300'
                }`}>
                  {expense.settled ? 'Settled' : 'Pending'}
                </span>
              </div>
              {expense.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {expense.description}
                </p>
              )}
            </div>
            <div className="text-right ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(expense.totalAmount, expense.currency)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(expense.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{expense.participants.length} people</span>
            </div>
            {expense.location && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{expense.location.name}</span>
              </div>
            )}
          </div>

          {expense.tags && expense.tags.length > 0 && (
            <div className="flex items-center flex-wrap gap-2">
              {expense.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
                >
                  <Tag className="w-3 h-3" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full">
              {expense.category}
            </span>
            
            <div className="flex items-center space-x-2">
              {currentUserId && expense.participants.some((p: any) => p.id === currentUserId) && (
                <div className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Your share: </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(
                      expense.participants.find((p: any) => p.id === currentUserId)?.owedAmount || 0, 
                      expense.currency
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ExpenseCard;