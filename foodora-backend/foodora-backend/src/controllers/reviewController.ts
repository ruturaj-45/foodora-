import { Response } from 'express';
import { v4 as uuid } from 'uuid';
import pool from '../db/connection';
import { AuthRequest } from '../types';
import { toCamel } from '../utils/helpers';
import type { RowDataPacket } from 'mysql2';

// GET /api/restaurants/:id/reviews
export const getReviews = async (req: AuthRequest | undefined, res: Response): Promise<void> => {
  const restaurantId = (req as AuthRequest).params.id;
  const db = await pool.getConnection();
  try {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT rv.*, u.name AS customer_name, u.avatar AS customer_avatar
       FROM reviews rv JOIN users u ON u.id=rv.customer_id
       WHERE rv.restaurant_id=? ORDER BY rv.created_at DESC LIMIT 20`,
      [restaurantId]
    );
    res.json({ success: true, data: (rows as RowDataPacket[]).map((r) => toCamel(r as Record<string, unknown>)) });
  } finally { db.release(); }
};

// POST /api/reviews
export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  const { orderId, restaurantId, rating, comment } = req.body;
  if (!orderId || !restaurantId || !rating) {
    res.status(400).json({ success: false, error: 'orderId, restaurantId and rating are required' }); return;
  }
  if (rating < 1 || rating > 5) {
    res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' }); return;
  }

  const db = await pool.getConnection();
  try {
    // Verify the customer actually ordered from this restaurant
    const [orderCheck] = await db.execute<RowDataPacket[]>(
      'SELECT id FROM orders WHERE id=? AND customer_id=? AND restaurant_id=? AND status="delivered"',
      [orderId, req.user!.userId, restaurantId]
    );
    if (!(orderCheck as RowDataPacket[]).length) {
      res.status(403).json({ success: false, error: 'You can only review restaurants you have ordered from and received' }); return;
    }
    // Check not already reviewed
    const [dup] = await db.execute<RowDataPacket[]>('SELECT id FROM reviews WHERE order_id=?', [orderId]);
    if ((dup as RowDataPacket[]).length > 0) {
      res.status(409).json({ success: false, error: 'You have already reviewed this order' }); return;
    }

    const id = uuid();
    await db.execute(
      'INSERT INTO reviews (id,order_id,customer_id,restaurant_id,rating,comment) VALUES (?,?,?,?,?,?)',
      [id, orderId, req.user!.userId, restaurantId, rating, comment || null]
    );

    // Recalculate restaurant average rating
    await db.execute(
      `UPDATE restaurants r
       SET rating = (SELECT ROUND(AVG(rating),2) FROM reviews WHERE restaurant_id = r.id),
           rating_count = (SELECT COUNT(*) FROM reviews WHERE restaurant_id = r.id)
       WHERE r.id = ?`,
      [restaurantId]
    );

    // Also save rating on the order
    await db.execute('UPDATE orders SET status=status WHERE id=?', [orderId]);

    res.status(201).json({ success: true, data: { id, rating, comment }, message: 'Review submitted' });
  } finally { db.release(); }
};
