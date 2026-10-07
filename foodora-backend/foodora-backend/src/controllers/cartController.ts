import { Response } from 'express';
import { v4 as uuid } from 'uuid';
import pool from '../db/connection';
import { AuthRequest } from '../types';
import { toCamel, safeJson } from '../utils/helpers';
import type { RowDataPacket } from 'mysql2';

const buildCartItem = (row: RowDataPacket) => ({
  ...toCamel(row as Record<string, unknown>),
  customizations: safeJson<{ id: string; name: string; price: number }[]>(row.customizations as string, []),
});

// GET /api/cart
export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const db = await pool.getConnection();
  try {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT ci.*, f.name, f.image, f.price AS base_price, f.is_available,
              r.name AS restaurant_name, r.delivery_fee, r.min_order
       FROM cart_items ci
       JOIN foods f ON f.id = ci.food_id
       JOIN restaurants r ON r.id = ci.restaurant_id
       WHERE ci.user_id = ?`,
      [req.user!.userId]
    );
    res.json({ success: true, data: (rows as RowDataPacket[]).map(buildCartItem) });
  } finally { db.release(); }
};

// POST /api/cart
export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const { foodId, restaurantId, quantity = 1, customizations = [] } = req.body;
  if (!foodId || !restaurantId) {
    res.status(400).json({ success: false, error: 'foodId and restaurantId are required' }); return;
  }

  const db = await pool.getConnection();
  try {
    // Validate food exists and is available
    const [foodRows] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM foods WHERE id=? AND restaurant_id=? AND is_available=1', [foodId, restaurantId]
    );
    if (!(foodRows as RowDataPacket[]).length) {
      res.status(400).json({ success: false, error: 'Food item not available' }); return;
    }

    // If user already has items from a different restaurant → clear first
    const [existing] = await db.execute<RowDataPacket[]>(
      'SELECT DISTINCT restaurant_id FROM cart_items WHERE user_id=? LIMIT 1', [req.user!.userId]
    );
    if ((existing as RowDataPacket[]).length > 0 && (existing as RowDataPacket[])[0].restaurant_id !== restaurantId) {
      await db.execute('DELETE FROM cart_items WHERE user_id=?', [req.user!.userId]);
    }

    // Check duplicate (same food + same customizations)
    const customKey = JSON.stringify(
      [...customizations].sort((a: { id: string }, b: { id: string }) => a.id.localeCompare(b.id))
    );
    const [dup] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM cart_items WHERE user_id=? AND food_id=?', [req.user!.userId, foodId]
    );
    const existingItem = (dup as RowDataPacket[]).find((item) => {
      const storedKey = JSON.stringify(
        [...safeJson<{ id: string }[]>(item.customizations as string, [])].sort((a, b) => a.id.localeCompare(b.id))
      );
      return storedKey === customKey;
    });

    if (existingItem) {
      await db.execute(
        'UPDATE cart_items SET quantity = quantity + ? WHERE id=?',
        [quantity, existingItem.id]
      );
      res.json({ success: true, message: 'Cart updated', data: { id: existingItem.id } });
    } else {
      const id = uuid();
      await db.execute(
        'INSERT INTO cart_items (id,user_id,food_id,restaurant_id,quantity,customizations) VALUES (?,?,?,?,?,?)',
        [id, req.user!.userId, foodId, restaurantId, quantity, JSON.stringify(customizations)]
      );
      res.status(201).json({ success: true, message: 'Added to cart', data: { id } });
    }
  } finally { db.release(); }
};

// PUT /api/cart/:itemId
export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  const { quantity } = req.body;
  const db = await pool.getConnection();
  try {
    if (quantity <= 0) {
      await db.execute('DELETE FROM cart_items WHERE id=? AND user_id=?', [req.params.itemId, req.user!.userId]);
      res.json({ success: true, message: 'Item removed' });
    } else {
      await db.execute(
        'UPDATE cart_items SET quantity=? WHERE id=? AND user_id=?',
        [quantity, req.params.itemId, req.user!.userId]
      );
      res.json({ success: true, message: 'Quantity updated' });
    }
  } finally { db.release(); }
};

// DELETE /api/cart/:itemId
export const removeCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  const db = await pool.getConnection();
  try {
    await db.execute('DELETE FROM cart_items WHERE id=? AND user_id=?', [req.params.itemId, req.user!.userId]);
    res.json({ success: true, message: 'Item removed' });
  } finally { db.release(); }
};

// DELETE /api/cart
export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const db = await pool.getConnection();
  try {
    await db.execute('DELETE FROM cart_items WHERE user_id=?', [req.user!.userId]);
    res.json({ success: true, message: 'Cart cleared' });
  } finally { db.release(); }
};
