import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, FoodCustomization } from '../types';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  restaurantId: string | null;
  restaurantName: string | null;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'foodora_cart';

const calcItemPrice = (basePrice: number, customizations: FoodCustomization[]): number =>
  basePrice + customizations.reduce((sum, c) => sum + c.price, 0);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const restaurantId = items.length > 0 ? items[0].restaurantId : null;
  const restaurantName = items.length > 0 ? items[0].restaurantName : null;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const addItem = (newItem: Omit<CartItem, 'id'>) => {
    setItems((prev) => {
      // If adding from a different restaurant, clear cart first
      if (prev.length > 0 && prev[0].restaurantId !== newItem.restaurantId) {
        const id = `cart-${Date.now()}`;
        return [{ ...newItem, id }];
      }

      // Check if same item with same customizations already exists
      const customKey = newItem.customizations.map((c) => c.id).sort().join(',');
      const existing = prev.find(
        (i) =>
          i.foodId === newItem.foodId &&
          i.customizations.map((c) => c.id).sort().join(',') === customKey
      );

      if (existing) {
        return prev.map((i) =>
          i.id === existing.id ? { ...i, quantity: i.quantity + newItem.quantity } : i
        );
      }

      const id = `cart-${Date.now()}`;
      return [...prev, { ...newItem, id }];
    });
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity } : i)));
  };

  const clearCart = () => setItems([]);

  const getSubtotal = (): number =>
    items.reduce(
      (sum, i) => sum + calcItemPrice(i.basePrice, i.customizations) * i.quantity,
      0
    );

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        restaurantId,
        restaurantName,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
