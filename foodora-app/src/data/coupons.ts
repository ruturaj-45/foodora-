import type { Coupon } from '../types';

export const coupons: Coupon[] = [
  {
    code: 'FOOD20',
    type: 'percentage',
    value: 20,
    minOrder: 200,
    maxDiscount: 150,
    description: '20% OFF on orders above ₹200 (max ₹150)',
    isActive: true,
  },
  {
    code: 'WELCOME50',
    type: 'flat',
    value: 50,
    minOrder: 150,
    description: '₹50 OFF on your order (min ₹150)',
    isActive: true,
  },
  {
    code: 'FREEDELIVERY',
    type: 'free_delivery',
    value: 0,
    minOrder: 100,
    description: 'Free delivery on this order',
    isActive: true,
  },
  {
    code: 'BIRYANI100',
    type: 'flat',
    value: 100,
    minOrder: 400,
    description: '₹100 OFF on orders above ₹400',
    isActive: true,
  },
  {
    code: 'NEWUSER',
    type: 'percentage',
    value: 30,
    minOrder: 200,
    maxDiscount: 200,
    description: '30% OFF for new users (max ₹200)',
    isActive: true,
  },
];

export const validateCoupon = (
  code: string,
  subtotal: number
): { valid: boolean; coupon?: Coupon; error?: string } => {
  const coupon = coupons.find((c) => c.code.toUpperCase() === code.toUpperCase());

  if (!coupon) return { valid: false, error: 'Invalid coupon code' };
  if (!coupon.isActive) return { valid: false, error: 'This coupon has expired' };
  if (subtotal < coupon.minOrder)
    return {
      valid: false,
      error: `Minimum order amount is ₹${coupon.minOrder} for this coupon`,
    };

  return { valid: true, coupon };
};

export const calculateDiscount = (coupon: Coupon, subtotal: number, deliveryFee: number): number => {
  if (coupon.type === 'percentage') {
    const discount = (subtotal * coupon.value) / 100;
    return coupon.maxDiscount ? Math.min(discount, coupon.maxDiscount) : discount;
  }
  if (coupon.type === 'flat') {
    return Math.min(coupon.value, subtotal);
  }
  if (coupon.type === 'free_delivery') {
    return deliveryFee;
  }
  return 0;
};
