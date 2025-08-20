// Simple context for the single page app
import React, { createContext, useContext } from 'react';

// This is now just a placeholder since we moved everything to App.tsx
const ExpenseContext = createContext({});

export const useExpense = () => useContext(ExpenseContext);
export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// Keep these exports for compatibility
export const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
export const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

export default ExpenseContext;