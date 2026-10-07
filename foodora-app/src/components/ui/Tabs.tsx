import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => (
  <div className={cn('flex gap-1 p-1 bg-surface-100 dark:bg-surface-800 rounded-2xl', className)}>
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={cn(
          'relative flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
          activeTab === tab.id
            ? 'text-white'
            : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'
        )}
      >
        {activeTab === tab.id && (
          <motion.div
            layoutId="active-tab"
            className="absolute inset-0 bg-brand-500 rounded-xl"
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          />
        )}
        <span className="relative z-10">{tab.label}</span>
        {tab.count !== undefined && (
          <span
            className={cn(
              'relative z-10 text-xs font-bold px-1.5 py-0.5 rounded-full',
              activeTab === tab.id
                ? 'bg-white/20 text-white'
                : 'bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-400'
            )}
          >
            {tab.count}
          </span>
        )}
      </button>
    ))}
  </div>
);

// Simple underline-style tabs
interface UnderlineTabsProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const UnderlineTabs: React.FC<UnderlineTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
}) => (
  <div className={cn('flex gap-6 border-b border-surface-200 dark:border-surface-700', className)}>
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={cn(
          'relative pb-3 text-sm font-semibold transition-colors',
          activeTab === tab.id
            ? 'text-brand-500'
            : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'
        )}
      >
        {tab.label}
        {activeTab === tab.id && (
          <motion.div
            layoutId="underline"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"
          />
        )}
      </button>
    ))}
  </div>
);
