import { Response } from 'express';
import pool from '../db/connection';
import { AuthRequest } from '../types';
import type { RowDataPacket } from 'mysql2';

// GET /api/analytics/restaurant/:restaurantId
export const getRestaurantAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  const { restaurantId } = req.params;
  const db = await pool.getConnection();
  try {
    // Verify ownership
    const [own] = await db.execute<RowDataPacket[]>(
      'SELECT id FROM restaurants WHERE id=? AND owner_id=?', [restaurantId, req.user!.userId]
    );
    if (req.user!.role !== 'admin' && !(own as RowDataPacket[]).length) {
      res.status(403).json({ success: false, error: 'Access denied' }); return;
    }

    // Today's stats
    const [today] = await db.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total_orders,
              COALESCE(SUM(total),0) AS total_revenue,
              COALESCE(SUM(CASE WHEN status='delivered' THEN 1 ELSE 0 END),0) AS completed,
              COALESCE(SUM(CASE WHEN status IN('pending','confirmed') THEN 1 ELSE 0 END),0) AS pending
       FROM orders WHERE restaurant_id=? AND DATE(placed_at)=CURDATE()`,
      [restaurantId]
    );

    // Last 7 days
    const [daily] = await db.execute<RowDataPacket[]>(
      `SELECT DATE_FORMAT(placed_at,'%b %d') AS date,
              COUNT(*) AS orders,
              COALESCE(SUM(CASE WHEN payment_status='paid' THEN total ELSE 0 END),0) AS revenue
       FROM orders WHERE restaurant_id=? AND placed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE(placed_at) ORDER BY DATE(placed_at) ASC`,
      [restaurantId]
    );

    // Popular items
    const [popular] = await db.execute<RowDataPacket[]>(
      `SELECT oi.food_id, oi.name, SUM(oi.quantity) AS orders_count,
              SUM(oi.item_total) AS revenue
       FROM order_items oi JOIN orders o ON o.id=oi.order_id
       WHERE o.restaurant_id=? AND o.status='delivered'
       GROUP BY oi.food_id, oi.name ORDER BY orders_count DESC LIMIT 5`,
      [restaurantId]
    );

    // All-time totals
    const [allTime] = await db.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total_orders,
              COALESCE(SUM(CASE WHEN payment_status='paid' THEN total ELSE 0 END),0) AS total_revenue,
              COALESCE(AVG(CASE WHEN payment_status='paid' THEN total END),0) AS avg_order_value
       FROM orders WHERE restaurant_id=?`,
      [restaurantId]
    );

    res.json({
      success: true,
      data: {
        today:   (today as RowDataPacket[])[0],
        daily:   daily,
        popular: popular,
        allTime: (allTime as RowDataPacket[])[0],
      },
    });
  } finally { db.release(); }
};

// GET /api/analytics/admin
export const getAdminAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  const db = await pool.getConnection();
  try {
    const [platform] = await db.execute<RowDataPacket[]>(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role='customer') AS total_customers,
        (SELECT COUNT(*) FROM restaurants WHERE status='active') AS total_restaurants,
        (SELECT COUNT(*) FROM orders) AS total_orders,
        (SELECT COALESCE(SUM(total),0) FROM orders WHERE payment_status='paid') AS total_revenue,
        (SELECT COUNT(*) FROM orders WHERE status IN('pending','confirmed','preparing','ready','out_for_delivery')) AS active_orders,
        (SELECT COUNT(*) FROM orders WHERE DATE(placed_at)=CURDATE()) AS today_orders,
        (SELECT COALESCE(SUM(total),0) FROM orders WHERE payment_status='paid' AND DATE(placed_at)=CURDATE()) AS today_revenue
    `);

    const [daily] = await db.execute<RowDataPacket[]>(`
      SELECT DATE_FORMAT(placed_at,'%b %d') AS date,
             COUNT(*) AS orders,
             COALESCE(SUM(CASE WHEN payment_status='paid' THEN total ELSE 0 END),0) AS revenue
      FROM orders WHERE placed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(placed_at) ORDER BY DATE(placed_at) ASC
    `);

    res.json({ success: true, data: { platform: (platform as RowDataPacket[])[0], daily } });
  } finally { db.release(); }
};
