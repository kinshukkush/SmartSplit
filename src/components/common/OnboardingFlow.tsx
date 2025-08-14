// src/components/onboarding/OnboardingFlow.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useExpense, generateId } from '../../context/ExpenseContext';
import { useNavigate } from 'react-router-dom';

const OnboardingFlow: React.FC = () => {
  const { dispatch } = useExpense();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    defaultCurrency: 'INR'
  });

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to SmartSplit! 🎉',
      description: 'Split expenses with friends easily and keep track of who owes what.',
    },
    {
      id: 'profile',
      title: 'Set up your profile',
      description: 'Tell us a bit about yourself to get started.',
    },
    {
      id: 'currency',
      title: 'Choose your currency',
      description: 'Select your preferred currency for expenses.',
    },
    {
      id: 'ready',
      title: "You're all set! ✨",
      description: 'Start splitting expenses with your friends and family.',
    }
  ];

  const currencies = [
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Create user profile
    const newUser = {
      id: generateId('user'),
      name: userData.name,
      email: userData.email,
      phone: '',
      avatar: '',
      color: '#6366f1',
      paymentMethods: [],
      createdAt: new Date().toISOString(),
      isActive: true,
      preferences: {
        defaultCurrency: userData.defaultCurrency,
        notifications: {
          expenseAdded: true,
          paymentReceived: true,
          paymentRequest: true,
          reminders: true,
          weeklyReports: false
        }
      }
    };

    // Add user and set as current user
    dispatch({ type: 'ADD_USER', payload: newUser });
    dispatch({ type: 'SET_CURRENT_USER', payload: newUser });
    
    // Update app settings
    dispatch({ type: 'UPDATE_SETTINGS', payload: { 
      defaultCurrency: userData.defaultCurrency 
    }});

    // Navigate to dashboard
    navigate('/');
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: // Profile step
        return userData.name.trim().length > 0 && userData.email.trim().length > 0;
      case 2: // Currency step
        return userData.defaultCurrency.length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-purple-400' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-gray-300 text-sm">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">
                {steps[currentStep].title}
              </h1>
              <p className="text-gray-300 text-lg">
                {steps[currentStep].description}
              </p>
            </div>

            {/* Step content */}
            {currentStep === 0 && (
              <div className="text-center space-y-6">
                <div className="text-6xl mb-4">💸</div>
                <div className="space-y-4 text-gray-300">
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>Split bills with friends easily</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>Track who owes what</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>Settle payments seamlessly</span>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <p className="text-gray-300 text-center mb-6">
                  Choose your preferred currency for tracking expenses
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {currencies.map((currency) => (
                    <motion.button
                      key={currency.code}
                      onClick={() => setUserData({ ...userData, defaultCurrency: currency.code })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        userData.defaultCurrency === currency.code
                          ? 'border-purple-400 bg-purple-400/20'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-2xl mb-2">{currency.symbol}</div>
                      <div className="text-white font-semibold">{currency.code}</div>
                      <div className="text-gray-300 text-sm">{currency.name}</div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="text-center space-y-6">
                <div className="text-6xl mb-4">🎉</div>
                <div className="space-y-4">
                  <p className="text-gray-300">
                    Welcome aboard, <span className="text-purple-400 font-semibold">{userData.name}</span>!
                  </p>
                  <p className="text-gray-300">
                    Your default currency is set to <span className="text-purple-400 font-semibold">{userData.defaultCurrency}</span>
                  </p>
                  <p className="text-gray-300">
                    You can always change these settings later in your profile.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  currentStep === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  isStepValid()
                    ? 'bg-purple-500 hover:bg-purple-600 text-white'
                    : 'bg-gray-600 cursor-not-allowed text-gray-400'
                }`}
              >
                <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingFlow;