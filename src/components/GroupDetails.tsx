// src/components/GroupDetails.tsx
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useExpense, Group, formatCurrency } from '../context/ExpenseContext';

const GroupDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch, helpers } = useExpense();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'members' | 'settings'>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  const group = useMemo(() => {
    return state.groups.find(g => g.id === id);
  }, [state.groups, id]);

  const groupExpenses = useMemo(() => {
    if (!group) return [];
    return helpers.getExpensesByGroup(group.id);
  }, [group, helpers]);

  const groupBalance = useMemo(() => {
    if (!group) return new Map();
    return helpers.calculateGroupBalance(group.id);
  }, [group, helpers]);

  const totalAmount = groupExpenses.reduce((sum, expense) => sum + expense.totalAmount, 0);
  const settledExpenses = groupExpenses.filter(expense => expense.settled).length;
  const settlementRate = groupExpenses.length > 0 ? (settledExpenses / groupExpenses.length) * 100 : 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUserName = (userId: string) => {
    return state.users.find(user => user.id === userId)?.name || 'Unknown User';
  };

  const getUserAvatar = (userId: string) => {
    return state.users.find(user => user.id === userId)?.avatar;
  };

  const isAdmin = group?.admins.includes(state.currentUser?.id || '') || false;

  if (!group) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${state.settings.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold mb-2">Group Not Found</h1>
          <p className={`mb-4 ${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            The group you're looking for doesn't exist or you don't have access to it.
          </p>
          <button
            onClick={() => navigate('/groups')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${state.settings.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div 
                className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl"
                style={{ backgroundColor: group.color }}
              >
                {group.avatar || '👥'}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{group.name}</h1>
                <p className={`${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {group.description || 'No description provided'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {isAdmin && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Edit Group
                </button>
              )}
              <button
                onClick={() => navigate('/create')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Add Expense
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{groupExpenses.length}</div>
              <div className={`text-sm ${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Expenses
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalAmount, group.settings.defaultCurrency)}
              </div>
              <div className={`text-sm ${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Amount
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{group.members.length}</div>
              <div className={`text-sm ${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Members
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{settlementRate.toFixed(1)}%</div>
              <div className={`text-sm ${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Settlement Rate
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'expenses', label: 'Expenses', icon: '💰' },
                { id: 'members', label: 'Members', icon: '👥' },
                { id: 'settings', label: 'Settings', icon: '⚙️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Recent Activity */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {state.activityFeed
                        .filter(activity => activity.relatedEntityId === group.id)
                        .slice(0, 5)
                        .map((activity) => (
                          <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                              <span className="text-sm">📝</span>
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{activity.title}</div>
                              <div className={`text-sm ${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {formatDate(activity.timestamp)}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Member Balances */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Member Balances</h3>
                    <div className="space-y-3">
                      {Array.from(groupBalance.entries()).map(([userId, balance]) => (
                        <div key={userId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getUserAvatar(userId) && (
                              <img
                                src={getUserAvatar(userId)}
                                alt={getUserName(userId)}
                                className="w-8 h-8 rounded-full"
                              />
                            )}
                            <span className="font-medium">{getUserName(userId)}</span>
                          </div>
                          <span className={`font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(Math.abs(balance), group.settings.defaultCurrency)}
                            {balance >= 0 ? ' (owed)' : ' (owes)'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'expenses' && (
                <motion.div
                  key="expenses"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Group Expenses</h3>
                    <button
                      onClick={() => navigate('/create')}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                    >
                      Add Expense
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {groupExpenses.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-2">💰</div>
                        <p className={`${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          No expenses in this group yet
                        </p>
                      </div>
                    ) : (
                      groupExpenses.map((expense) => (
                        <div key={expense.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                              <span>💰</span>
                            </div>
                            <div>
                              <div className="font-medium">{expense.title}</div>
                              <div className={`text-sm ${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {formatDate(expense.date)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {formatCurrency(expense.totalAmount, expense.currency)}
                            </div>
                            <div className={`text-sm ${expense.settled ? 'text-green-600' : 'text-yellow-600'}`}>
                              {expense.settled ? 'Settled' : 'Pending'}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'members' && (
                <motion.div
                  key="members"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Group Members</h3>
                    {isAdmin && (
                      <button
                        onClick={() => setShowAddMemberModal(true)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                      >
                        Add Member
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.members.map((memberId) => {
                      const user = state.users.find(u => u.id === memberId);
                      const isGroupAdmin = group.admins.includes(memberId);
                      
                      return (
                        <div key={memberId} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3 mb-3">
                            {user?.avatar && (
                              <img
                                src={user.avatar}
                                alt={user?.name}
                                className="w-10 h-10 rounded-full"
                              />
                            )}
                            <div>
                              <div className="font-medium">{user?.name || 'Unknown User'}</div>
                              <div className={`text-sm ${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {user?.email}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className={`text-sm px-2 py-1 rounded ${
                              isGroupAdmin 
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}>
                              {isGroupAdmin ? 'Admin' : 'Member'}
                            </span>
                            
                            {isAdmin && memberId !== state.currentUser?.id && (
                              <button
                                onClick={() => {
                                  // Handle remove member
                                }}
                                className="text-red-600 hover:text-red-700 text-sm"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h3 className="text-lg font-semibold mb-4">Group Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Default Split Type
                      </label>
                      <p className="text-sm">{group.settings.defaultSplitType}</p>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Default Currency
                      </label>
                      <p className="text-sm">{group.settings.defaultCurrency}</p>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Member Invites
                      </label>
                      <p className="text-sm">{group.settings.allowMemberInvites ? 'Allowed' : 'Not Allowed'}</p>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Expense Approval
                      </label>
                      <p className="text-sm">{group.settings.requireApprovalForExpenses ? 'Required' : 'Not Required'}</p>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Created
                      </label>
                      <p className="text-sm">{formatDate(group.createdAt)}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetails;
