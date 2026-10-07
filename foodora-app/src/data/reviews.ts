import type { Review } from '../types';
import { IMAGES } from './images';

export const reviews: Review[] = [
  {
    id: 'rev-1',
    orderId: 'FD20481',
    customerId: 'user-demo',
    customerName: 'Arjun Sharma',
    customerAvatar: IMAGES.avatars.user1,
    restaurantId: 'rest-2',
    rating: 5,
    comment: 'Absolutely the best biryani I have ever had! Perfectly spiced, generous portions, and delivered piping hot.',
    createdAt: '2026-09-28T20:30:00Z',
  },
  {
    id: 'rev-2',
    orderId: 'ord-xyz',
    customerId: 'user-2',
    customerName: 'Sneha Reddy',
    customerAvatar: IMAGES.avatars.user2,
    restaurantId: 'rest-2',
    rating: 5,
    comment: 'Ordered for a family gathering — everyone loved it! The dum cooking really makes the difference.',
    createdAt: '2026-09-26T18:45:00Z',
  },
  {
    id: 'rev-3',
    orderId: 'ord-abc',
    customerId: 'user-3',
    customerName: 'Kiran Patel',
    customerAvatar: IMAGES.avatars.user3,
    restaurantId: 'rest-2',
    rating: 4,
    comment: 'Great biryani and quick delivery. Would love slightly less oil next time.',
    createdAt: '2026-09-25T13:20:00Z',
  },
];
