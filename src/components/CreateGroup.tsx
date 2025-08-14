// src/components/CreateGroup.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useExpense, Group, generateId } from '../context/ExpenseContext';

const CreateGroup: React.FC = () => {
  const { state, dispatch } = useExpense();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    color: '#6366f1',
    allowMemberInvites: true,
    requireApprovalForExpenses: false,
    defaultSplitType: 'equal' as const,
    defaultCurrency: state.settings.defaultCurrency
  });

  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colorOptions = [
    { name: 'Purple', value: '#6366f1' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Indigo', value: '#8b5cf6' },
    { name: 'Teal', value: '#14b8a6' }
  ];

  const splitTypeOptions = [
    { value: 'equal', label: 'Equal Split' },
    { value: 'percentage', label: 'Percentage Split' },
    { value: 'exact', label: 'Exact Amount' },
    { value: 'shares', label: 'Shares Split' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMemberToggle = (userId: string) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a group name');
      return;
    }

    if (selectedMembers.length === 0) {
      alert('Please select at least one member');
      return;
    }

    setIsSubmitting(true);

    try {
      const newGroup: Group = {
        id: generateId('group'),
        name: formData.name.trim(),
        description: formData.description.trim(),
        members: [state.currentUser!.id, ...selectedMembers],
        admins: [state.currentUser!.id],
        color: formData.color,
        category: formData.category,
        settings: {
          defaultSplitType: formData.defaultSplitType,
          defaultCurrency: formData.defaultCurrency,
          allowMemberInvites: formData.allowMemberInvites,
          requireApprovalForExpenses: formData.requireApprovalForExpenses,
          categories: []
        },
        createdAt: new Date().toISOString(),
        createdBy: state.currentUser!.id,
        isActive: true,
        totalExpenses: 0,
        totalAmount: 0,
        lastActivity: new Date().toISOString()
      };

      dispatch({ type: 'ADD_GROUP', payload: newGroup });
      
      // Navigate to the new group
      navigate(`/groups/${newGroup.id}`);
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen ${state.settings.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Group</h1>
          <p className={`${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Set up a new expense group to track shared expenses with friends, family, or colleagues
          </p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Group Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      state.settings.theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Enter group name"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      state.settings.theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Describe the purpose of this group"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      state.settings.theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="general">General</option>
                    <option value="roommates">Roommates</option>
                    <option value="family">Family</option>
                    <option value="friends">Friends</option>
                    <option value="work">Work</option>
                    <option value="travel">Travel</option>
                    <option value="events">Events</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Group Color
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => handleInputChange('color', color.value)}
                        className={`w-full h-12 rounded-lg border-2 transition-all ${
                          formData.color === color.value
                            ? 'border-gray-900 dark:border-white scale-105'
                            : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Group Settings */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Group Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Default Split Type
                  </label>
                  <select
                    value={formData.defaultSplitType}
                    onChange={(e) => handleInputChange('defaultSplitType', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      state.settings.theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {splitTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Default Currency
                  </label>
                  <select
                    value={formData.defaultCurrency}
                    onChange={(e) => handleInputChange('defaultCurrency', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      state.settings.theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {state.settings.supportedCurrencies.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.allowMemberInvites}
                      onChange={(e) => handleInputChange('allowMemberInvites', e.target.checked)}
                      className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className={`text-sm ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Allow members to invite others
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.requireApprovalForExpenses}
                      onChange={(e) => handleInputChange('requireApprovalForExpenses', e.target.checked)}
                      className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className={`text-sm ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Require admin approval for expenses
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Add Members */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Add Members *</h3>
              
              <div className="space-y-3">
                {state.users
                  .filter(user => user.id !== state.currentUser?.id)
                  .map((user) => (
                    <label key={user.id} className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(user.id)}
                        onChange={() => handleMemberToggle(user.id)}
                        className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <div className="flex items-center space-x-3">
                        {user.avatar && (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className={`text-sm ${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
              </div>

              {state.users.filter(user => user.id !== state.currentUser?.id).length === 0 && (
                <div className="text-center py-6">
                  <div className="text-4xl mb-2">👥</div>
                  <p className={`${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    No other users available to add to the group
                  </p>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/groups')}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.name.trim() || selectedMembers.length === 0}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
              >
                {isSubmitting ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateGroup;
