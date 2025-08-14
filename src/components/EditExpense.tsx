// src/components/EditExpense.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useExpense, Expense, generateId, calculateSplitAmounts } from '../context/ExpenseContext';

const EditExpense: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useExpense();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    baseAmount: 0,
    tax: 0,
    tip: 0,
    totalAmount: 0,
    currency: 'INR',
    category: 'general',
    subcategory: '',
    date: new Date().toISOString().split('T')[0],
    splitType: 'equal' as 'equal' | 'percentage' | 'exact' | 'shares' | 'itemized',
    groupId: '',
    tags: [] as string[],
    notes: '',
    location: {
      name: '',
      address: ''
    }
  });

  const [participants, setParticipants] = useState<Array<{
    id: string;
    name: string;
    email?: string;
    avatar?: string;
    splitType: 'equal' | 'percentage' | 'exact' | 'shares';
    splitValue?: number;
    selected: boolean;
  }>>([]);

  const [paidBy, setPaidBy] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const expense = useMemo(() => {
    return state.expenses.find(exp => exp.id === id);
  }, [state.expenses, id]);

  // Initialize form data when expense is loaded
  useEffect(() => {
    if (expense) {
      setFormData({
        title: expense.title,
        description: expense.description,
        baseAmount: expense.baseAmount,
        tax: expense.tax,
        tip: expense.tip,
        totalAmount: expense.totalAmount,
        currency: expense.currency,
        category: expense.category,
        subcategory: expense.subcategory || '',
        date: expense.date.split('T')[0],
        splitType: expense.splitType,
        groupId: expense.groupId || '',
        tags: expense.tags,
        notes: expense.notes || '',
        location: expense.location || { name: '', address: '' }
      });

      setPaidBy(expense.paidBy);

      // Initialize participants
      const allUsers = state.users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        splitType: 'equal' as const,
        splitValue: undefined,
        selected: expense.participants.some(p => p.id === user.id)
      }));

      setParticipants(allUsers);
    }
  }, [expense, state.users]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Recalculate total amount when base amount, tax, or tip changes
    if (['baseAmount', 'tax', 'tip'].includes(field)) {
      const newBaseAmount = field === 'baseAmount' ? value : formData.baseAmount;
      const newTax = field === 'tax' ? value : formData.tax;
      const newTip = field === 'tip' ? value : formData.tip;
      const newTotal = newBaseAmount + newTax + newTip;

      setFormData(prev => ({
        ...prev,
        [field]: value,
        totalAmount: newTotal
      }));
    }
  };

  const handleParticipantToggle = (userId: string) => {
    setParticipants(prev => 
      prev.map(p => 
        p.id === userId ? { ...p, selected: !p.selected } : p
      )
    );
  };

  const handlePaidByToggle = (userId: string) => {
    setPaidBy(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter an expense title');
      return;
    }

    if (formData.totalAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const selectedParticipants = participants.filter(p => p.selected);
    if (selectedParticipants.length === 0) {
      alert('Please select at least one participant');
      return;
    }

    if (paidBy.length === 0) {
      alert('Please select who paid for this expense');
      return;
    }

    setIsSubmitting(true);

    try {
             // Calculate split amounts
       const calculatedParticipants = calculateSplitAmounts(
         formData.totalAmount,
         selectedParticipants.map(p => ({
           id: p.id,
           name: p.name,
           email: p.email,
           avatar: p.avatar,
           splitType: p.splitType,
           splitValue: p.splitValue,
           settled: false
         })),
         formData.splitType
       );

      const updatedExpense: Expense = {
        ...expense!,
        title: formData.title.trim(),
        description: formData.description.trim(),
        baseAmount: formData.baseAmount,
        tax: formData.tax,
        tip: formData.tip,
        totalAmount: formData.totalAmount,
        currency: formData.currency,
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        date: formData.date,
        splitType: formData.splitType,
        participants: calculatedParticipants,
        paidBy,
        groupId: formData.groupId || undefined,
        tags: formData.tags,
        notes: formData.notes || undefined,
        location: formData.location.name ? formData.location : undefined,
        updatedAt: new Date().toISOString()
      };

      dispatch({ type: 'UPDATE_EXPENSE', payload: updatedExpense });
      
      // Navigate to expense details
      navigate(`/expense/${expense!.id}`);
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('Failed to update expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!expense) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${state.settings.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold mb-2">Expense Not Found</h1>
          <p className={`mb-4 ${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            The expense you're trying to edit doesn't exist.
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
          <h1 className="text-3xl font-bold mb-2">Edit Expense</h1>
          <p className={`${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Update the details of your expense
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      state.settings.theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Enter expense title"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      state.settings.theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="mt-4">
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
                  placeholder="Describe the expense"
                />
              </div>
            </div>

            {/* Financial Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Base Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.baseAmount}
                    onChange={(e) => handleInputChange('baseAmount', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      state.settings.theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tax
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.tax}
                    onChange={(e) => handleInputChange('tax', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      state.settings.theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tip
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.tip}
                    onChange={(e) => handleInputChange('tip', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      state.settings.theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Total Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.totalAmount}
                    readOnly
                    className={`w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-600 ${
                      state.settings.theme === 'dark'
                        ? 'border-gray-600 text-white'
                        : 'border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      state.settings.theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {state.settings.supportedCurrencies.map((currency) => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
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
                    {state.categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Split Settings */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Split Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Split Type
                  </label>
                  <select
                    value={formData.splitType}
                    onChange={(e) => handleInputChange('splitType', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      state.settings.theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="equal">Equal Split</option>
                    <option value="percentage">Percentage Split</option>
                    <option value="exact">Exact Amount</option>
                    <option value="shares">Shares Split</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Group (Optional)
                  </label>
                  <select
                    value={formData.groupId}
                    onChange={(e) => handleInputChange('groupId', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      state.settings.theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">No Group</option>
                    {state.groups.map((group) => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Participants *</h3>
              
              <div className="space-y-3">
                {participants.map((participant) => (
                  <label key={participant.id} className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={participant.selected}
                      onChange={() => handleParticipantToggle(participant.id)}
                      className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <div className="flex items-center space-x-3">
                      {participant.avatar && (
                        <img
                          src={participant.avatar}
                          alt={participant.name}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <div>
                        <div className="font-medium">{participant.name}</div>
                        <div className={`text-sm ${state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {participant.email}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Paid By */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Paid By *</h3>
              
              <div className="space-y-3">
                {state.users.map((user) => (
                  <label key={user.id} className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paidBy.includes(user.id)}
                      onChange={() => handlePaidByToggle(user.id)}
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
            </div>

            {/* Tags */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Tags</h3>
              
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      state.settings.theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Add a tag"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="flex items-center space-x-2 px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Notes</h3>
              
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  state.settings.theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Add any additional notes about this expense"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate(`/expense/${expense.id}`)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
              >
                {isSubmitting ? 'Updating...' : 'Update Expense'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditExpense;
