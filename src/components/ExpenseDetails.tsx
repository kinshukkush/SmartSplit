// src/components/ExpenseDetails.tsx
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useExpense, formatCurrency } from '../context/ExpenseContext';

const ExpenseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useExpense();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const expense = useMemo(() => {
    return state.expenses.find(exp => exp.id === id);
  }, [state.expenses, id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserName = (userId: string) => {
    return state.users.find(user => user.id === userId)?.name || 'Unknown User';
  };

  const getUserAvatar = (userId: string) => {
    return state.users.find(user => user.id === userId)?.avatar;
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = state.categories.find(cat => cat.id === categoryId);
    return category?.icon || '💰';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = state.categories.find(cat => cat.id === categoryId);
    return category?.color || '#6366f1';
  };

  const handleDeleteExpense = () => {
    if (expense) {
      dispatch({ type: 'DELETE_EXPENSE', payload: expense.id });
      navigate('/history');
    }
  };

  const handleSettleExpense = () => {
    if (expense) {
      dispatch({ type: 'SETTLE_EXPENSE', payload: expense.id });
    }
  };

  if (!expense) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${state.settings.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold mb-2">Expense Not Found</h1>
          <p className={`mb-4 ${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            The expense you're looking for doesn't exist or you don't have access to it.
          </p>
          <button
            onClick={() => navigate('/history')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Back to History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${state.settings.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div 
                className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl"
                style={{ backgroundColor: getCategoryColor(expense.category) }}
              >
                {getCategoryIcon(expense.category)}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{expense.title}</h1>
                <p className={`${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {formatDate(expense.date)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {!expense.settled && (
                <button
                  onClick={handleSettleExpense}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Mark as Settled
                </button>
              )}
              <button
                onClick={() => navigate(`/expense/${expense.id}/edit`)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Edit Expense
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Amount Display */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {formatCurrency(expense.totalAmount, expense.currency)}
            </div>
            <div className={`text-sm ${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {expense.settled ? 'Settled' : 'Pending Settlement'}
            </div>
          </div>
        </div>

        {/* Expense Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <p>{expense.description || 'No description provided'}</p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Category
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getCategoryIcon(expense.category)}</span>
                  <span>{state.categories.find(cat => cat.id === expense.category)?.name || 'Unknown'}</span>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Date
                </label>
                <p>{formatDate(expense.date)}</p>
              </div>

              {expense.location && (
                <div>
                  <label className={`block text-sm font-medium mb-1 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Location
                  </label>
                  <p>{expense.location.name}</p>
                  <p className={`text-sm ${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {expense.location.address}
                  </p>
                </div>
              )}

              {expense.tags.length > 0 && (
                <div>
                  <label className={`block text-sm font-medium mb-1 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {expense.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Financial Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Financial Breakdown</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Base Amount
                  </label>
                  <p className="text-lg font-semibold">
                    {formatCurrency(expense.baseAmount, expense.currency)}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tax
                  </label>
                  <p className="text-lg font-semibold">
                    {formatCurrency(expense.tax, expense.currency)}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tip
                  </label>
                  <p className="text-lg font-semibold">
                    {formatCurrency(expense.tip, expense.currency)}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Total
                  </label>
                  <p className="text-lg font-semibold text-purple-600">
                    {formatCurrency(expense.totalAmount, expense.currency)}
                  </p>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Split Type
                </label>
                <p className="capitalize">{expense.splitType.replace('_', ' ')}</p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Paid By
                </label>
                <div className="space-y-2">
                  {expense.paidBy.map((userId) => (
                    <div key={userId} className="flex items-center space-x-2">
                      {getUserAvatar(userId) && (
                        <img
                          src={getUserAvatar(userId)}
                          alt={getUserName(userId)}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <span>{getUserName(userId)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Participants */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6"
        >
          <h3 className="text-lg font-semibold mb-4">Participants</h3>
          
          <div className="space-y-3">
            {expense.participants.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getUserAvatar(participant.id) && (
                    <img
                      src={getUserAvatar(participant.id)}
                      alt={getUserName(participant.id)}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div>
                    <div className="font-medium">{getUserName(participant.id)}</div>
                    <div className={`text-sm ${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {participant.splitType} split
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold">
                    {formatCurrency(participant.owedAmount, expense.currency)}
                  </div>
                  <div className={`text-sm ${participant.settled ? 'text-green-600' : 'text-yellow-600'}`}>
                    {participant.settled ? 'Settled' : 'Pending'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Notes */}
        {expense.notes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6"
          >
            <h3 className="text-lg font-semibold mb-4">Notes</h3>
            <p className="whitespace-pre-wrap">{expense.notes}</p>
          </motion.div>
        )}

        {/* Receipt Images */}
        {expense.receiptImages && expense.receiptImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6"
          >
            <h3 className="text-lg font-semibold mb-4">Receipt Images</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {expense.receiptImages.map((imageUrl, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={`Receipt ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="text-center">
                <div className="text-5xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold mb-2">Delete Expense</h3>
                <p className={`mb-6 ${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Are you sure you want to delete this expense? This action cannot be undone.
                </p>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteExpense}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseDetails;
