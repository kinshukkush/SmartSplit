// src/components/Settlements.tsx
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useExpense, Settlement, formatCurrency, generateId } from '../context/ExpenseContext';

const Settlements: React.FC = () => {
  const { state, dispatch, helpers } = useExpense();
  const [filter, setFilter] = useState<'all' | 'suggested' | 'agreed' | 'completed' | 'declined'>('all');
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredSettlements = useMemo(() => {
    let settlements = state.settlements;

    if (filter !== 'all') {
      settlements = settlements.filter(settlement => settlement.status === filter);
    }

    return settlements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [state.settlements, filter]);

  const settlementSuggestions = useMemo(() => {
    return helpers.getSettlementSuggestions();
  }, [helpers]);

  const getUserName = (userId: string) => {
    return state.users.find(user => user.id === userId)?.name || 'Unknown User';
  };

  const getUserAvatar = (userId: string) => {
    return state.users.find(user => user.id === userId)?.avatar;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: Settlement['status']) => {
    switch (status) {
      case 'suggested':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'agreed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'declined':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleCreateSettlement = (fromUserId: string, toUserId: string, amount: number) => {
    const settlement: Settlement = {
      id: generateId('settlement'),
      fromUserId,
      toUserId,
      amount,
      currency: state.settings.defaultCurrency,
      expenseIds: [],
      suggestedDate: new Date().toISOString(),
      status: 'suggested',
      createdAt: new Date().toISOString()
    };

    dispatch({ type: 'ADD_SETTLEMENT', payload: settlement });
    setShowCreateModal(false);
  };

  const handleUpdateSettlementStatus = (settlementId: string, status: Settlement['status']) => {
    const settlement = state.settlements.find(s => s.id === settlementId);
    if (settlement) {
      dispatch({
        type: 'UPDATE_SETTLEMENT',
        payload: { ...settlement, status }
      });
    }
  };

  const handleAcceptSuggestion = (suggestion: Settlement) => {
    dispatch({ type: 'ADD_SETTLEMENT', payload: suggestion });
  };

  return (
    <div className={`min-h-screen ${state.settings.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settlements</h1>
          <p className={`${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage and track expense settlements between users
          </p>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  state.settings.theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">All Settlements</option>
                <option value="suggested">Suggested</option>
                <option value="agreed">Agreed</option>
                <option value="completed">Completed</option>
                <option value="declined">Declined</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
              >
                Create Settlement
              </button>
              <button
                onClick={() => {
                  const suggestions = helpers.getSettlementSuggestions();
                  suggestions.forEach(suggestion => {
                    dispatch({ type: 'ADD_SETTLEMENT', payload: suggestion });
                  });
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                Auto-Suggest All
              </button>
            </div>
          </div>
        </div>

        {/* Settlement Suggestions */}
        {settlementSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6"
          >
            <h3 className="text-lg font-semibold mb-4">Settlement Suggestions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {settlementSuggestions.slice(0, 6).map((suggestion) => (
                <div
                  key={`${suggestion.fromUserId}-${suggestion.toUserId}`}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                        <span className="text-sm">💰</span>
                      </div>
                      <span className="font-medium">{formatCurrency(suggestion.amount, suggestion.currency)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className={state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        From:
                      </span>
                      <span className="font-medium">{getUserName(suggestion.fromUserId)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        To:
                      </span>
                      <span className="font-medium">{getUserName(suggestion.toUserId)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAcceptSuggestion(suggestion)}
                    className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Accept Suggestion
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Settlements List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredSettlements.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="text-6xl mb-4">💳</div>
                <h3 className="text-xl font-semibold mb-2">No settlements found</h3>
                <p className={`${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {filter === 'all' 
                    ? 'No settlements have been created yet'
                    : `No settlements with status "${filter}" found`
                  }
                </p>
              </motion.div>
            ) : (
              filteredSettlements.map((settlement, index) => (
                <motion.div
                  key={settlement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        {getUserAvatar(settlement.fromUserId) && (
                          <img
                            src={getUserAvatar(settlement.fromUserId)}
                            alt={getUserName(settlement.fromUserId)}
                            className="w-10 h-10 rounded-full"
                          />
                        )}
                        <div className="text-center">
                          <span className="text-2xl">→</span>
                        </div>
                        {getUserAvatar(settlement.toUserId) && (
                          <img
                            src={getUserAvatar(settlement.toUserId)}
                            alt={getUserName(settlement.toUserId)}
                            className="w-10 h-10 rounded-full"
                          />
                        )}
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{getUserName(settlement.fromUserId)}</span>
                          <span className={state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                            pays
                          </span>
                          <span className="font-semibold">{getUserName(settlement.toUserId)}</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(settlement.amount, settlement.currency)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(settlement.status)}`}>
                        {settlement.status.charAt(0).toUpperCase() + settlement.status.slice(1)}
                      </span>
                      
                      <button
                        onClick={() => setSelectedSettlement(settlement)}
                        className="px-3 py-1 text-sm text-purple-600 hover:text-purple-700 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className={state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      Suggested: {formatDate(settlement.suggestedDate)}
                    </span>
                    <span className={state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      Created: {formatDate(settlement.createdAt)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  {settlement.status === 'suggested' && (
                    <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => handleUpdateSettlementStatus(settlement.id, 'agreed')}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        Agree
                      </button>
                      <button
                        onClick={() => handleUpdateSettlementStatus(settlement.id, 'declined')}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {settlement.status === 'agreed' && (
                    <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => handleUpdateSettlementStatus(settlement.id, 'completed')}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        Mark as Completed
                      </button>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Settlement Details Modal */}
        {selectedSettlement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Settlement Details</h3>
                <button
                  onClick={() => setSelectedSettlement(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Amount
                  </label>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(selectedSettlement.amount, selectedSettlement.currency)}
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    From
                  </label>
                  <p className="font-medium">{getUserName(selectedSettlement.fromUserId)}</p>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    To
                  </label>
                  <p className="font-medium">{getUserName(selectedSettlement.toUserId)}</p>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status
                  </label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedSettlement.status)}`}>
                    {selectedSettlement.status.charAt(0).toUpperCase() + selectedSettlement.status.slice(1)}
                  </span>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Suggested Date
                  </label>
                  <p>{formatDate(selectedSettlement.suggestedDate)}</p>
                </div>

                {selectedSettlement.notes && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Notes
                    </label>
                    <p>{selectedSettlement.notes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Create Settlement Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Create Settlement</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    From User
                  </label>
                  <select
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      state.settings.theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {state.users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    To User
                  </label>
                  <select
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      state.settings.theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {state.users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      state.settings.theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="0.00"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Handle create settlement logic
                      setShowCreateModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Create Settlement
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

export default Settlements;
