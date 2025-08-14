// src/components/common/SearchModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useExpense, formatCurrency } from '../../context/ExpenseContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSearch }) => {
  const { state } = useExpense();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{
    id: string;
    type: 'expense' | 'group' | 'user';
    title: string;
    subtitle: string;
    amount?: number;
    currency?: string;
    date?: string;
  }>>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchResults: Array<{
      id: string;
      type: 'expense' | 'group' | 'user';
      title: string;
      subtitle: string;
      amount?: number;
      currency?: string;
      date?: string;
    }> = [];

    // Search expenses
    const expenseResults = state.expenses
      .filter(expense => 
        expense.title.toLowerCase().includes(query.toLowerCase()) ||
        expense.description.toLowerCase().includes(query.toLowerCase()) ||
        expense.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      )
      .slice(0, 5)
      .map(expense => ({
        id: expense.id,
        type: 'expense' as const,
        title: expense.title,
        subtitle: expense.description,
        amount: expense.totalAmount,
        currency: expense.currency,
        date: expense.date
      }));

    // Search groups
    const groupResults = state.groups
      .filter(group => 
        group.name.toLowerCase().includes(query.toLowerCase()) ||
        group.description.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 3)
      .map(group => ({
        id: group.id,
        type: 'group' as const,
        title: group.name,
        subtitle: group.description
      }));

    // Search users
    const userResults = state.users
      .filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 3)
      .map(user => ({
        id: user.id,
        type: 'user' as const,
        title: user.name,
        subtitle: user.email
      }));

    searchResults.push(...expenseResults, ...groupResults, ...userResults);
    setResults(searchResults);
  }, [query, state.expenses, state.groups, state.users]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleResultClick = (result: typeof results[0]) => {
    switch (result.type) {
      case 'expense':
        navigate(`/expense/${result.id}`);
        break;
      case 'group':
        navigate(`/group/${result.id}`);
        break;
      case 'user':
        navigate(`/profile/${result.id}`);
        break;
    }
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black bg-opacity-50" />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <form onSubmit={handleSubmit} className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search expenses, groups, users..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </form>

            {/* Search Results */}
            {query && (
              <div className="max-h-96 overflow-y-auto">
                {results.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="text-4xl mb-4">🔍</div>
                    <p className="text-gray-500 dark:text-gray-400">No results found for "{query}"</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {results.map((result) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleResultClick(result)}
                        className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          {/* Icon */}
                          <div className="flex-shrink-0">
                            {result.type === 'expense' && (
                              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                <span className="text-green-600 dark:text-green-400 text-sm">💰</span>
                              </div>
                            )}
                            {result.type === 'group' && (
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 dark:text-blue-400 text-sm">👥</span>
                              </div>
                            )}
                            {result.type === 'user' && (
                              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                                <span className="text-purple-600 dark:text-purple-400 text-sm">👤</span>
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {result.title}
                              </h4>
                              {result.amount && result.currency && (
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {formatCurrency(result.amount, result.currency)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {result.subtitle}
                              </p>
                              {result.date && (
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                  {formatDate(result.date)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Press Enter to search all results</span>
                <span>Esc to close</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
