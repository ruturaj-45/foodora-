import { clsx, type ClassValue } from 'clsx';

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

export const formatCurrency = (amount: number): string =>
  `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

export const formatDateTime = (dateStr: string): string =>
  `${formatDate(dateStr)} at ${formatTime(dateStr)}`;

export const truncate = (str: string, length: number): string =>
  str.length > length ? `${str.slice(0, length)}...` : str;

export const getOrderStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'Order Placed',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  return labels[status] ?? status;
};

export const getOrderStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
    confirmed: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    preparing: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
    ready: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
    out_for_delivery: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20',
    delivered: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    cancelled: 'text-red-600 bg-red-50 dark:bg-red-900/20',
  };
  return colors[status] ?? 'text-gray-600 bg-gray-50';
};

export const generateOrderId = (): string =>
  `FD${Math.floor(Math.random() * 90000) + 10000}`;

export const debounce = <T extends (...args: unknown[]) => void>(fn: T, delay: number) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
