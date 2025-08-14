// src/components/common/ModalManager.tsx
import React from 'react';
import { AnimatePresence } from 'framer-motion';

const ModalManager: React.FC = () => {
  // This component manages global modals
  // For now, it's empty as modals are handled individually
  return (
    <AnimatePresence>
      {/* Global modals would be rendered here */}
    </AnimatePresence>
  );
};

export default ModalManager;