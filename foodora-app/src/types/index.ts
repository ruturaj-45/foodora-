// ─── Core Enums ────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'upi' | 'card' | 'cod';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type RestaurantStatus = 'active' | 'inactive' | 'pending_approval' | 'suspended';
export type UserRole = 'customer' | 'restaurant' | 'admin';
export type PriceRange = '₹' | '₹₹' | '₹₹₹' | '₹₹₹₹';
export type VegType = 'veg' | 'non-veg' | 'vegan';

// ─── Address ───────────────────────────────────────────────────────────────────

export interface Address {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

// ─── User / Customer ───────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: UserRole;
  addresses: Address[];
  favoriteRestaurants: string[];
  favoriteFoods: string[];
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive' | 'banned';
}

// ─── Food / Menu ───────────────────────────────────────────────────────────────

export interface FoodAddon {
  id: string;
  name: string;
  price: number;
}

export interface FoodCustomization {
  id: string;
  name: string;
  price: number;
  selected?: boolean;
}

export interface Food {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  vegType: VegType;
  rating: number;
  ratingCount: number;
  isBestseller: boolean;
  isAvailable: boolean;
  ingredients?: string[];
  customizations: FoodCustomization[];
  tags?: string[];
}

// ─── Restaurant ────────────────────────────────────────────────────────────────

export interface MenuCategory {
  id: string;
  name: string;
  icon?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisine: string[];
  coverImage: string;
  logo: string;
  rating: number;
  ratingCount: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  priceRange: PriceRange;
  address: string;
  city: string;
  status: RestaurantStatus;
  isOpen: boolean;
  offer?: string;
  tags?: string[];
  menuCategories: MenuCategory[];
  ownerId: string;
  totalOrders: number;
  revenue: number;
  joinedDate: string;
}

// ─── Cart ──────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  foodId: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  image: string;
  basePrice: number;
  customizations: FoodCustomization[];
  quantity: number;
}

// ─── Order ─────────────────────────────────────────────────────────────────────

export interface OrderItem {
  foodId: string;
  name: string;
  image: string;
  quantity: number;
  basePrice: number;
  customizations: FoodCustomization[];
  total: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  restaurantId: string;
  restaurantName: string;
  restaurantImage: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  deliveryAddress: Address;
  deliveryPartner?: string;
  estimatedDelivery: string;
  placedAt: string;
  updatedAt: string;
  timeline: OrderTimeline[];
  rating?: number;
  review?: string;
}

export interface OrderTimeline {
  status: OrderStatus;
  timestamp: string;
  message: string;
}

// ─── Coupon ────────────────────────────────────────────────────────────────────

export type CouponType = 'percentage' | 'flat' | 'free_delivery';

export interface Coupon {
  code: string;
  type: CouponType;
  value: number;
  minOrder: number;
  maxDiscount?: number;
  description: string;
  isActive: boolean;
}

// ─── Review ────────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  restaurantId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// ─── Offer ─────────────────────────────────────────────────────────────────────

export interface Offer {
  id: string;
  restaurantId: string;
  title: string;
  description: string;
  type: 'percentage' | 'flat' | 'bogo' | 'free_delivery';
  value: number;
  minOrder: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  couponCode?: string;
}

// ─── Analytics ─────────────────────────────────────────────────────────────────

export interface DailyStats {
  date: string;
  orders: number;
  revenue: number;
}

export interface PopularItem {
  foodId: string;
  name: string;
  orders: number;
  revenue: number;
}

// ─── Notification ──────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  type: 'order' | 'offer' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Toast ─────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}
