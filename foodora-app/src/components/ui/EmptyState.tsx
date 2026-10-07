import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { cn } from '../../utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      'flex flex-col items-center justify-center text-center py-16 px-6',
      className
    )}
  >
    {icon && (
      <div className="mb-4 p-4 bg-surface-100 dark:bg-surface-800 rounded-3xl">
        <span className="text-surface-400 dark:text-surface-500">{icon}</span>
      </div>
    )}
    <h3 className="text-lg font-bold text-surface-800 dark:text-white mb-2">{title}</h3>
    {description && (
      <p className="text-surface-500 dark:text-surface-400 text-sm max-w-xs mb-6">
        {description}
      </p>
    )}
    {action && (
      <Button variant="primary" onClick={action.onClick}>
        {action.label}
      </Button>
    )}
  </motion.div>
);
