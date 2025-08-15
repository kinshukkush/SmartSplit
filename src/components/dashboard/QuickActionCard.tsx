// src/components/dashboard/QuickActionCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  gradient: string;
  badge?: string | null;
  primary?: boolean;
  delay?: number;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  icon: Icon,
  href,
  gradient,
  badge,
  primary = false,
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000 }}
      className="relative"
    >
      <Link
        to={href}
        className={`block p-6 rounded-2xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${
          primary 
            ? `bg-gradient-to-r ${gradient} text-white shadow-lg`
            : `bg-gradient-to-r ${gradient} text-white`
        }`}
      >
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-xl ${
            primary ? 'bg-white/20' : 'bg-white/10'
          }`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm opacity-90">{description}</p>
          </div>
        </div>
        
        {badge && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
            {badge}
          </div>
        )}
      </Link>
    </motion.div>
  );
};

export default QuickActionCard;