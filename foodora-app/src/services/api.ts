const API_BASE = '/api';

export const getToken = (): string | null => {
  return localStorage.getItem('foodora_token');
};

export const setToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem('foodora_token', token);
  } else {
    localStorage.removeItem('foodora_token');
  }
};

async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: string; token?: string; user?: any }> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    console.warn(`[API] Error on ${endpoint}:`, err.message);
    return { success: false, error: err.message || 'Network error' };
  }
}

// ── Auth API ──
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signup: (payload: { name: string; email: string; phone: string; password: string }) =>
    apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => apiRequest('/auth/me'),

  updateProfile: (updates: any) =>
    apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  getAddresses: () => apiRequest('/auth/addresses'),

  addAddress: (address: any) =>
    apiRequest('/auth/addresses', {
      method: 'POST',
      body: JSON.stringify(address),
    }),

  deleteAddress: (id: string) =>
    apiRequest(`/auth/addresses/${id}`, {
      method: 'DELETE',
    }),
};

// ── Restaurants API ──
export const restaurantsApi = {
  getAll: () => apiRequest('/restaurants'),
  getById: (id: string) => apiRequest(`/restaurants/${id}`),
  getMenu: (id: string) => apiRequest(`/restaurants/${id}/menu`),
  getReviews: (id: string) => apiRequest(`/restaurants/${id}/reviews`),
};

// ── Cart API ──
export const cartApi = {
  getCart: () => apiRequest('/cart'),
  addToCart: (item: any) =>
    apiRequest('/cart', {
      method: 'POST',
      body: JSON.stringify(item),
    }),
  updateItem: (itemId: string, quantity: number) =>
    apiRequest(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),
  removeItem: (itemId: string) =>
    apiRequest(`/cart/${itemId}`, {
      method: 'DELETE',
    }),
  clearCart: () =>
    apiRequest('/cart', {
      method: 'DELETE',
    }),
};

// ── Orders API ──
export const ordersApi = {
  createOrder: (orderData: any) =>
    apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),
  getMyOrders: () => apiRequest('/orders'),
  getOrderById: (id: string) => apiRequest(`/orders/${id}`),
  getRestaurantOrders: (restaurantId: string) =>
    apiRequest(`/orders/restaurant/${restaurantId}`),
  updateStatus: (id: string, status: string, message?: string) =>
    apiRequest(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, message }),
    }),
};

// ── Coupons API ──
export const couponsApi = {
  validate: (code: string, subtotal: number) =>
    apiRequest('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    }),
};

// ── Favorites API ──
export const favoritesApi = {
  getFavorites: () => apiRequest('/favorites'),
  toggle: (type: 'restaurant' | 'food', targetId: string) =>
    apiRequest('/favorites/toggle', {
      method: 'POST',
      body: JSON.stringify({ type, targetId }),
    }),
};

// ── Notifications API ──
export const notificationsApi = {
  getAll: () => apiRequest('/notifications'),
  markRead: (id: string) =>
    apiRequest(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),
  markAllRead: () =>
    apiRequest('/notifications/read-all', {
      method: 'PATCH',
    }),
};

// ── Reviews API ──
export const reviewsApi = {
  create: (reviewData: { orderId: string; restaurantId: string; rating: number; comment?: string }) =>
    apiRequest('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    }),
};

// ── Admin API ──
export const adminApi = {
  getRestaurants: () => apiRequest('/admin/restaurants'),
  updateRestaurantStatus: (id: string, status: string) =>
    apiRequest(`/admin/restaurants/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  getCustomers: () => apiRequest('/admin/customers'),
  updateCustomerStatus: (id: string, status: string) =>
    apiRequest(`/admin/customers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  getOrders: () => apiRequest('/admin/orders'),
};

// ── Analytics API ──
export const analyticsApi = {
  getRestaurant: (restaurantId: string) =>
    apiRequest(`/analytics/restaurant/${restaurantId}`),
  getAdmin: () => apiRequest('/analytics/admin'),
};
