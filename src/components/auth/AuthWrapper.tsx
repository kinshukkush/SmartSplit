// src/components/auth/AuthWrapper.tsx
import React from 'react';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  // For now, this is just a passthrough component
  // In a real app, you would implement authentication logic here
  return <>{children}</>;
};

export default AuthWrapper;