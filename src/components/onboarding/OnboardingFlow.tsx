import React, { useState } from 'react';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  content: React.ReactNode;
}

interface OnboardingFlowProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: "Welcome!",
      description: "Let's get you started with our platform",
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">Welcome to our platform!</h3>
          <p className="text-gray-600 leading-relaxed">
            We're excited to have you here. Let's take a quick tour to help you get started.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-sm">
              💡 Tip: You can skip this onboarding at any time and return to it later.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Features",
      description: "Discover what you can do",
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">Explore Our Features</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Expense Tracking</p>
                <p className="text-sm text-gray-500">Track and categorize your expenses easily</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Analytics Dashboard</p>
                <p className="text-sm text-gray-500">Get insights into your spending patterns</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Budget Management</p>
                <p className="text-sm text-gray-500">Set and monitor your spending limits</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Get Started",
      description: "You're ready to go!",
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">You're All Set!</h3>
          <p className="text-gray-600 leading-relaxed">
            You now have everything you need to get started. Let's begin your journey!
          </p>
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg text-white">
            <h4 className="font-semibold text-lg mb-2">Ready to begin?</h4>
            <p className="text-blue-100">
              Click "Get Started" to access your dashboard and start managing your expenses.
            </p>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  index <= currentStep ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          {onSkip && (
            <button
              onClick={onSkip}
              className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors duration-200"
            >
              Skip
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h2>
            <p className="text-gray-600">
              {steps[currentStep].description}
            </p>
          </div>
          
          <div className="min-h-[200px]">
            {steps[currentStep].content}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={prevStep}
            disabled={isFirstStep}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              isFirstStep
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Previous
          </button>
          
          <div className="text-sm text-gray-500">
            {currentStep + 1} of {steps.length}
          </div>
          
          <button
            onClick={nextStep}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isLastStep ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;