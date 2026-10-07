import { Response } from 'express';
import { v4 as uuid } from 'uuid';
import pool from '../db/connection';
import { AuthRequest } from '../types';
import { generateOrderId, toCamel, safeJson } from '../utils/helpers';
import type { RowDataPacket } from 'mysql2';

const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending:          ['confirmed', 'cancelled'],
  confirmed:        ['preparing', 'cancelled'],
  preparing:        ['ready'],
  ready:            ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered:        [],
  cancelled:        [],
};

const STATUS_MESSAGES: Record<string, string> = {
  pending:          'Order placed',
  confirmed:        'Restaurant confirmed your order',
  preparing:        'Kitchen is preparing your food',
  ready:            'Order is ready for pickup',
  out_for_delivery: 'Rider has picked up your order',
  delivered:        'Order delivered. Enjoy your meal!',
  cancelled:        'Order has been cancelled',
};

// Builds a full order object with items and timeline from DB
const fetchOrderFull = async (db: Awaited<ReturnType<typeof pool.getConnection>>, orderId: string) => {
  const [orderRows] = await db.execute<RowDataPacket[]>(`
    SELECT o.*, u.name AS customer_name, r.name AS restaurant_name,
           r.cover_image AS restaurant_image
    FROM orders o
    JOIN users u       ON u.id = o.customer_id
    JOIN restaurants r ON r.id = o.restaurant_id
    WHERE o.id = ?`, [orderId]);
  const order = (orderRows as RowDataPacket[])[0];
  if (!order) return null;

  const [items] = await db.execute<RowDataPacket[]>(
    'SELECT * FROM order_items WHERE order_id=?', [orderId]
  );
  const [timeline] = await db.execute<RowDataPacket[]>(
    'SELECT * FROM order_timeline WHERE order_id=? ORDER BY created_at ASC', [orderId]
  );

  return {
    ...toCamel(order as Record<string, unknown>),
    deliveryAddress: safeJson(order.delivery_address as string, {}),
    items: (items as RowDataPacket[]).map((i) => ({
      ...toCamel(i as Record<string, unknown>),
      customizations: safeJson(i.customizations as string, []),
    })),
    timeline: (timeline as RowDataPacket[]).map((t) => toCamel(t as Record<string, unknown>)),
  };
};

// POST /api/orders
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const { restaurantId, deliveryAddress, paymentMethod, couponCode } = req.body;
  if (!restaurantId || !deliveryAddress || !paymentMethod) {
    res.status(400).json({ success: false, error: 'restaurantId, deliveryAddress and paymentMethod are required' }); return;
  }

  const db = await pool.getConnection();
  await db.beginTransaction();
  try {
    // 1. Validate restaurant
    const [restRows] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM restaurants WHERE id=? AND status="active"', [restaurantId]
    );
    if (!(restRows as RowDataPacket[]).length) {
      await db.rollback();
      res.status(400).json({ success: false, error: 'Restaurant not found or inactive' }); return;
    }
    const restaurant = (restRows as RowDataPacket[])[0];

    // 2. Load cart
    const [cartRows] = await db.execute<RowDataPacket[]>(
      `SELECT ci.*, f.price, f.name, f.image, f.is_available
       FROM cart_items ci JOIN foods f ON f.id=ci.food_id
       WHERE ci.user_id=? AND ci.restaurant_id=?`,
      [req.user!.userId, restaurantId]
    );
    if (!(cartRows as RowDataPacket[]).length) {
      await db.rollback();
      res.status(400).json({ success: false, error: 'Cart is empty' }); return;
    }

    // 3. Validate food availability & calculate subtotal
    let subtotal = 0;
    const orderItems: { foodId: string; name: string; image: string; quantity: number; basePrice: number; customizations: { id: string; name: string; price: number }[]; total: number }[] = [];

    for (const item of cartRows as RowDataPacket[]) {
      if (!item.is_available) {
        await db.rollback();
        res.status(400).json({ success: false, error: `"${item.name}" is currently unavailable` }); return;
      }
      const customizations = safeJson<{ id: string; name: string; price: number }[]>(item.customizations as string, []);
      const customTotal = customizations.reduce((s: number, c: { price: number }) => s + c.price, 0);
      const itemTotal = (Number(item.price) + customTotal) * Number(item.quantity);
      subtotal += itemTotal;
      orderItems.push({
        foodId:         item.food_id as string,
        name:           item.name as string,
        image:          item.image as string,
        quantity:       Number(item.quantity),
        basePrice:      Number(item.price),
        customizations,
        total:          itemTotal,
      });
    }

    // 4. Delivery fee + tax
    const deliveryFee = Number(restaurant.delivery_fee) || 0;
    const tax = Math.round(subtotal * 0.06);

    // 5. Validate coupon
    let discount = 0;
    let validatedCoupon: RowDataPacket | null = null;
    if (couponCode) {
      const [coupRows] = await db.execute<RowDataPacket[]>(
        'SELECT * FROM coupons WHERE code=? AND is_active=1', [couponCode.toUpperCase()]
      );
      const coupon = (coupRows as RowDataPacket[])[0];
      if (!coupon) {
        await db.rollback();
        res.status(400).json({ success: false, error: 'Invalid coupon code' }); return;
      }
      if (subtotal < Number(coupon.min_order)) {
        await db.rollback();
        res.status(400).json({ success: false, error: `Minimum order ₹${coupon.min_order} required for this coupon` }); return;
      }
      validatedCoupon = coupon;
      if (coupon.type === 'percentage') {
        discount = Math.min(Math.round(subtotal * Number(coupon.value) / 100), Number(coupon.max_discount) || Infinity);
      } else if (coupon.type === 'flat') {
        discount = Math.min(Number(coupon.value), subtotal);
      } else if (coupon.type === 'free_delivery') {
        discount = deliveryFee;
      }
    }

    const total = subtotal + deliveryFee + tax - discount;

    // 6. Simulate payment (80% success for non-COD)
    let paymentStatus: 'paid' | 'pending' | 'failed' = 'pending';
    if (paymentMethod === 'cod') {
      paymentStatus = 'pending';
    } else {
      paymentStatus = Math.random() < 0.85 ? 'paid' : 'failed';
    }

    if (paymentStatus === 'failed') {
      await db.rollback();
      res.status(402).json({ success: false, error: 'Payment failed. Please try again.', paymentStatus: 'failed' }); return;
    }

    // 7. Create order
    const orderId = generateOrderId();
    await db.execute(
      `INSERT INTO orders
       (id,customer_id,restaurant_id,subtotal,delivery_fee,tax,discount,total,
        coupon_code,payment_method,payment_status,status,delivery_address,estimated_delivery)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        orderId, req.user!.userId, restaurantId,
        subtotal, deliveryFee, tax, discount, total,
        validatedCoupon ? validatedCoupon.code : null,
        paymentMethod, paymentStatus, 'pending',
        JSON.stringify(deliveryAddress), '30–35 min',
      ]
    );

    // 8. Create order items
    for (const item of orderItems) {
      await db.execute(
        `INSERT INTO order_items (id,order_id,food_id,name,image,quantity,base_price,customizations,item_total)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [uuid(), orderId, item.foodId, item.name, item.image, item.quantity,
         item.basePrice, JSON.stringify(item.customizations), item.total]
      );
    }

    // 9. Create initial timeline entry
    await db.execute(
      'INSERT INTO order_timeline (id,order_id,status,message) VALUES (?,?,?,?)',
      [uuid(), orderId, 'pending', STATUS_MESSAGES.pending]
    );

    // 10. Create notification for customer
    await db.execute(
      'INSERT INTO notifications (id,user_id,type,title,message) VALUES (?,?,?,?,?)',
      [uuid(), req.user!.userId, 'order',
       `Order Confirmed — #${orderId}`,
       `Your order from ${restaurant.name} has been placed. Total: ₹${total}.`]
    );

    // 11. Clear cart
    await db.execute('DELETE FROM cart_items WHERE user_id=?', [req.user!.userId]);

    await db.commit();

    // Return full order
    const fullOrder = await fetchOrderFull(db, orderId);
    res.status(201).json({ success: true, data: fullOrder, message: 'Order placed successfully' });
  } catch (err) {
    await db.rollback();
    throw err;
  } finally {
    db.release();
  }
};

// GET /api/orders  (customer's own orders)
export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  const db = await pool.getConnection();
  try {
    const [orderRows] = await db.execute<RowDataPacket[]>(
      `SELECT o.*, r.name AS restaurant_name, r.cover_image AS restaurant_image
       FROM orders o JOIN restaurants r ON r.id = o.restaurant_id
       WHERE o.customer_id = ? ORDER BY o.placed_at DESC`,
      [req.user!.userId]
    );

    const orders = await Promise.all(
      (orderRows as RowDataPacket[]).map(async (o) => {
        const [items] = await db.execute<RowDataPacket[]>(
          'SELECT * FROM order_items WHERE order_id=?', [o.id]
        );
        const [timeline] = await db.execute<RowDataPacket[]>(
          'SELECT * FROM order_timeline WHERE order_id=? ORDER BY created_at ASC', [o.id]
        );
        return {
          ...toCamel(o as Record<string, unknown>),
          deliveryAddress: safeJson(o.delivery_address as string, {}),
          items: (items as RowDataPacket[]).map((i) => ({
            ...toCamel(i as Record<string, unknown>),
            customizations: safeJson(i.customizations as string, []),
          })),
          timeline: (timeline as RowDataPacket[]).map((t) => toCamel(t as Record<string, unknown>)),
        };
      })
    );
    res.json({ success: true, data: orders });
  } finally { db.release(); }
};

// GET /api/orders/:id
export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  const db = await pool.getConnection();
  try {
    const order = await fetchOrderFull(db, req.params.id);
    if (!order) { res.status(404).json({ success: false, error: 'Order not found' }); return; }

    // Only owner or restaurant can view
    const o = order as Record<string, unknown>;
    if (req.user!.role === 'customer' && o.customerId !== req.user!.userId) {
      res.status(403).json({ success: false, error: 'Access denied' }); return;
    }
    res.json({ success: true, data: order });
  } finally { db.release(); }
};

// GET /api/orders/restaurant/:restaurantId  (restaurant dashboard)
export const getRestaurantOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  const db = await pool.getConnection();
  try {
    // Verify ownership
    const [own] = await db.execute<RowDataPacket[]>(
      'SELECT id FROM restaurants WHERE id=? AND owner_id=?', [req.params.restaurantId, req.user!.userId]
    );
    if (!(own as RowDataPacket[]).length) {
      res.status(403).json({ success: false, error: 'Access denied' }); return;
    }

    const [orderRows] = await db.execute<RowDataPacket[]>(
      `SELECT o.*, u.name AS customer_name
       FROM orders o JOIN users u ON u.id=o.customer_id
       WHERE o.restaurant_id=? ORDER BY o.placed_at DESC`,
      [req.params.restaurantId]
    );

    const orders = await Promise.all(
      (orderRows as RowDataPacket[]).map(async (o) => {
        const [items] = await db.execute<RowDataPacket[]>('SELECT * FROM order_items WHERE order_id=?', [o.id]);
        const [timeline] = await db.execute<RowDataPacket[]>('SELECT * FROM order_timeline WHERE order_id=? ORDER BY created_at ASC', [o.id]);
        return {
          ...toCamel(o as Record<string, unknown>),
          deliveryAddress: safeJson(o.delivery_address as string, {}),
          items: (items as RowDataPacket[]).map((i) => ({ ...toCamel(i as Record<string, unknown>), customizations: safeJson(i.customizations as string, []) })),
          timeline: (timeline as RowDataPacket[]).map((t) => toCamel(t as Record<string, unknown>)),
        };
      })
    );
    res.json({ success: true, data: orders });
  } finally { db.release(); }
};

// PATCH /api/orders/:id/status
export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, message } = req.body;
  if (!status) { res.status(400).json({ success: false, error: 'status is required' }); return; }

  const db = await pool.getConnection();
  try {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT o.*, r.owner_id FROM orders o JOIN restaurants r ON r.id=o.restaurant_id WHERE o.id=?`,
      [req.params.id]
    );
    const order = (rows as RowDataPacket[])[0];
    if (!order) { res.status(404).json({ success: false, error: 'Order not found' }); return; }

    // Only the restaurant owner can update status
    if (order.owner_id !== req.user!.userId && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Access denied' }); return;
    }

    // Validate transition
    const allowed = STATUS_TRANSITIONS[order.status as string] || [];
    if (!allowed.includes(status)) {
      res.status(400).json({
        success: false,
        error: `Cannot transition from "${order.status}" to "${status}". Valid next statuses: ${allowed.join(', ') || 'none'}`,
      }); return;
    }

    await db.execute('UPDATE orders SET status=? WHERE id=?', [status, req.params.id]);
    await db.execute(
      'INSERT INTO order_timeline (id,order_id,status,message) VALUES (?,?,?,?)',
      [uuid(), req.params.id, status, message || STATUS_MESSAGES[status] || status]
    );

    // Notify customer
    await db.execute(
      'INSERT INTO notifications (id,user_id,type,title,message) VALUES (?,?,?,?,?)',
      [uuid(), order.customer_id, 'order',
       `Order Update — #${req.params.id}`,
       message || STATUS_MESSAGES[status] || `Your order status: ${status}`]
    );

    res.json({ success: true, message: 'Status updated', data: { status } });
  } finally { db.release(); }
};
