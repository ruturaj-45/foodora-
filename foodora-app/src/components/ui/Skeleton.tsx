import React from 'react';
import { cn } from '../../utils';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div
    className={cn(
      'animate-pulse rounded-lg bg-surface-200 dark:bg-surface-700',
      className
    )}
    aria-hidden="true"
  />
);

export const RestaurantCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-surface-900 rounded-3xl overflow-hidden shadow-card">
    <Skeleton className="h-48 w-full rounded-none" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  </div>
);

export const FoodCardSkeleton: React.FC = () => (
  <div className="flex gap-4 p-4 bg-white dark:bg-surface-900 rounded-2xl shadow-card">
    <Skeleton className="h-24 w-24 rounded-2xl flex-shrink-0" />
    <div className="flex-1 space-y-2 py-1">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex justify-between items-center pt-1">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-9 w-20 rounded-xl" />
      </div>
    </div>
  </div>
);

export const OrderCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-surface-900 rounded-3xl p-5 shadow-card space-y-4">
    <div className="flex gap-3">
      <Skeleton className="h-14 w-14 rounded-2xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <Skeleton className="h-6 w-24 rounded-full" />
    </div>
    <Skeleton className="h-px w-full" />
    <div className="flex justify-between">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-20" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-9 flex-1 rounded-xl" />
      <Skeleton className="h-9 flex-1 rounded-xl" />
    </div>
  </div>
);

export const DashboardCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-surface-900 rounded-3xl p-6 shadow-card space-y-3">
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-8 w-1/3" />
    <Skeleton className="h-3 w-2/3" />
  </div>
);

export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 5 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);
