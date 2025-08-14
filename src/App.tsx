// src/App.tsx
import React, { Suspense, lazy, useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Link,
  Navigate,
  useLocation
} from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';

import { ExpenseProvider, useExpense } from './context/ExpenseContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorFallback from './components/common/ErrorFallback';
import OfflineIndicator from './components/common/OfflineIndicator';
import UpdatePrompt from './components/common/UpdatePrompt';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import AuthWrapper from './components/auth/AuthWrapper';
import ModalManager from './components/common/ModalManager';
import NotificationCenter from './components/common/NotificationCenter';

import './App.css';

// Lazy load components for better performance
const Dashboard = lazy(() => import('./components/Dashboard'));
const CreateExpense = lazy(() => import('./components/CreateExpense'));
const EditExpense = lazy(() => import('./components/EditExpense'));
const ExpenseDetails = lazy(() => import('./components/ExpenseDetails'));
const History = lazy(() => import('./components/History'));
const Groups = lazy(() => import('./components/Groups'));
const GroupDetails = lazy(() => import('./components/GroupDetails'));
const CreateGroup = lazy(() => import('./components/CreateGroup'));
const Analytics = lazy(() => import('./components/Analytics'));
const Settings = lazy(() => import('./components/Settings'));
const Profile = lazy(() => import('./components/Profile'));
const Settlements = lazy(() => import('./components/Settlements'));
const PaymentMethods = lazy(() => import('./components/PaymentMethods'));
const Reminders = lazy(() => import('./components/Reminders'));
const ActivityFeed = lazy(() => import('./components/ActivityFeed'));
const Reports = lazy(() => import('./components/Reports'));

// Page transition animations
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3
};

// Main Layout Component with Sidebar
const MainLayout = () => {
  const { state } = useExpense();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  // Handle offline status
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (state.isLoading) {
    return <AppLoadingScreen />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      state.settings.theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900'
    }`}>
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
      }`}>
        {/* Header */}
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        
        {/* Main Content Area */}
        <main className="container mx-auto px-4 py-6 max-w-7xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Suspense fallback={<PageLoadingSpinner />}>
                <Outlet />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Notification Center */}
      <NotificationCenter />
      
      {/* Modal Manager */}
      <ModalManager />
      
      {/* Offline Indicator */}
      {!isOnline && <OfflineIndicator />}
      
      {/* Update Prompt for PWA */}
      <UpdatePrompt />
      
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: state.settings.theme === 'dark' ? '#374151' : '#ffffff',
            color: state.settings.theme === 'dark' ? '#ffffff' : '#111827',
            border: `1px solid ${state.settings.theme === 'dark' ? '#4B5563' : '#E5E7EB'}`,
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </div>
  );
};

// App Loading Screen
const AppLoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SmartSplit</h1>
          <p className="text-purple-200">Loading your expenses...</p>
        </div>
        <LoadingSpinner size="large" />
      </div>
    </div>
  );
};

// Page Loading Spinner
const PageLoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center py-20">
      <LoadingSpinner size="medium" />
    </div>
  );
};

// Not Found Component
const NotFound = () => {
  const { state } = useExpense();
  
  return (
    <div className={`flex flex-col items-center justify-center min-h-screen text-center ${
      state?.settings?.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto px-4"
      >
        <div className="mb-8">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-6xl font-bold text-purple-400 mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
          <p className={`mb-6 ${
            state?.settings?.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Sorry, the page you are looking for does not exist.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            to="/"
            className="block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
          >
            Go Back Home
          </Link>
          
          <Link
            to="/create"
            className={`block px-6 py-3 border rounded-lg transition-colors font-medium ${
              state?.settings?.theme === 'dark'
                ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Create New Expense
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { state } = useExpense();
  
  // In a real app, you'd check authentication here
  // For now, we'll just check if user is set up
  if (!state.currentUser) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <>{children}</>;
};

// Onboarding Route Wrapper
const OnboardingRoute = () => {
  const { state } = useExpense();
  
  // If user is already set up, redirect to dashboard
  if (state.currentUser && !state.isLoading) {
    return <Navigate to="/" replace />;
  }
  
  return <OnboardingFlow />;
};

// Error Boundary Fallback
const AppErrorFallback = ({ error, resetErrorBoundary }: any) => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full text-center">
        <div className="text-red-400 text-5xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-gray-400 mb-4">
          {error?.message || 'An unexpected error occurred'}
        </p>
        <div className="space-y-2">
          <button
            onClick={resetErrorBoundary}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="w-full px-4 py-2 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded transition-colors"
          >
            Reset App Data
          </button>
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, []);

  // Handle app updates
  useEffect(() => {
    // Listen for app updates
    const handleAppUpdate = () => {
      if (confirm('A new version is available. Would you like to update?')) {
        window.location.reload();
      }
    };

    window.addEventListener('appUpdateAvailable', handleAppUpdate);
    return () => window.removeEventListener('appUpdateAvailable', handleAppUpdate);
  }, []);

  return (
    <ErrorBoundary FallbackComponent={AppErrorFallback}>
      <ExpenseProvider>
        <Router>
          <AuthWrapper>
            <Routes>
              {/* Onboarding Route */}
              <Route path="/onboarding" element={<OnboardingRoute />} />
              
              {/* Protected Routes with Main Layout */}
              <Route element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                {/* Dashboard */}
                <Route path="/" element={<Dashboard />} />
                
                {/* Expense Routes */}
                <Route path="/create" element={<CreateExpense />} />
                <Route path="/expense/:id" element={<ExpenseDetails />} />
                <Route path="/expense/:id/edit" element={<EditExpense />} />
                <Route path="/history" element={<History />} />
                
                {/* Group Routes */}
                <Route path="/groups" element={<Groups />} />
                <Route path="/groups/create" element={<CreateGroup />} />
                <Route path="/groups/:id" element={<GroupDetails />} />
                <Route path="/groups/:id/expenses" element={<History />} />
                
                {/* Financial Routes */}
                <Route path="/settlements" element={<Settlements />} />
                <Route path="/payments" element={<PaymentMethods />} />
                <Route path="/reminders" element={<Reminders />} />
                
                {/* Analytics & Reports */}
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/reports" element={<Reports />} />
                
                {/* Activity & Social */}
                <Route path="/activity" element={<ActivityFeed />} />
                
                {/* User Routes */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthWrapper>
        </Router>
      </ExpenseProvider>
    </ErrorBoundary>
  );
}

export default App;