import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Order, OrderStatus } from '../types';
import { mockOrders } from '../data/orders';

interface OrdersContextType {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, message?: string) => void;
  getOrderById: (id: string) => Order | undefined;
  getActiveOrders: () => Order[];
  getCompletedOrders: () => Order[];
  getCancelledOrders: () => Order[];
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);
const STORAGE_KEY = 'foodora_orders';

export const OrdersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : mockOrders;
    } catch {
      return mockOrders;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const addOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, message?: string) => {
    const statusMessages: Record<OrderStatus, string> = {
      pending: 'Order placed',
      confirmed: 'Restaurant confirmed your order',
      preparing: 'Kitchen is preparing your food',
      ready: 'Order is ready for pickup',
      out_for_delivery: 'Rider has picked up your order',
      delivered: 'Order delivered. Enjoy your meal!',
      cancelled: 'Order has been cancelled',
    };

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const timeline = [
          ...o.timeline,
          {
            status,
            timestamp: new Date().toISOString(),
            message: message ?? statusMessages[status],
          },
        ];
        return { ...o, status, updatedAt: new Date().toISOString(), timeline };
      })
    );
  };

  const getOrderById = (id: string) => orders.find((o) => o.id === id);

  const getActiveOrders = () =>
    orders.filter((o) =>
      ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.status)
    );

  const getCompletedOrders = () => orders.filter((o) => o.status === 'delivered');

  const getCancelledOrders = () => orders.filter((o) => o.status === 'cancelled');

  return (
    <OrdersContext.Provider
      value={{
        orders,
        addOrder,
        updateOrderStatus,
        getOrderById,
        getActiveOrders,
        getCompletedOrders,
        getCancelledOrders,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = (): OrdersContextType => {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders must be used within OrdersProvider');
  return ctx;
};
