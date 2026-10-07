import type { DailyStats, PopularItem } from '../types';

export const restaurantDailyStats: DailyStats[] = [
  { date: 'Sep 25', orders: 94, revenue: 18200 },
  { date: 'Sep 26', orders: 112, revenue: 22400 },
  { date: 'Sep 27', orders: 88, revenue: 17600 },
  { date: 'Sep 28', orders: 128, revenue: 24850 },
  { date: 'Sep 29', orders: 105, revenue: 21000 },
  { date: 'Sep 30', orders: 134, revenue: 26200 },
  { date: 'Oct 1', orders: 116, revenue: 23100 },
  { date: 'Oct 2', orders: 128, revenue: 24850 },
];

export const restaurantPopularItems: PopularItem[] = [
  { foodId: 'food-201', name: 'Chicken Biryani', orders: 2140, revenue: 599200 },
  { foodId: 'food-202', name: 'Mutton Biryani', orders: 1560, revenue: 592800 },
  { foodId: 'food-203', name: 'Veg Biryani', orders: 680, revenue: 149600 },
];

export const platformDailyStats: DailyStats[] = [
  { date: 'Sep 25', orders: 1240, revenue: 186000 },
  { date: 'Sep 26', orders: 1380, revenue: 207000 },
  { date: 'Sep 27', orders: 1190, revenue: 178500 },
  { date: 'Sep 28', orders: 1520, revenue: 228000 },
  { date: 'Sep 29', orders: 1410, revenue: 211500 },
  { date: 'Sep 30', orders: 1680, revenue: 252000 },
  { date: 'Oct 1', orders: 1450, revenue: 217500 },
  { date: 'Oct 2', orders: 1520, revenue: 228000 },
];

export const orderStatusData = [
  { name: 'Delivered', value: 88, color: '#22c55e' },
  { name: 'Pending', value: 5, color: '#f97316' },
  { name: 'Preparing', value: 4, color: '#3b82f6' },
  { name: 'Cancelled', value: 3, color: '#ef4444' },
];

export const platformStats = {
  totalCustomers: 48240,
  totalRestaurants: 342,
  totalOrders: 284920,
  totalRevenue: 48500000,
  activeOrders: 1247,
  todayOrders: 1520,
  todayRevenue: 228000,
  avgOrderValue: 320,
};
