import { Response } from 'express';
import pool from '../db/connection';
import { AuthRequest } from '../types';
import { toCamel, rowsToCamel } from '../utils/helpers';
import type { RowDataPacket } from 'mysql2';

// GET /api/admin/restaurants
export const getRestaurants = async (_req: AuthRequest, res: Response): Promise<void> => {
  const db = await pool.getConnection();
  try {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT r.*, u.name AS owner_name, u.email AS owner_email,
              (SELECT COUNT(*) FROM orders WHERE restaurant_id=r.id) AS total_orders_count
       FROM restaurants r JOIN users u ON u.id=r.owner_id
       ORDER BY r.created_at DESC`
    );
    res.json({ success: true, data: (rows as RowDataPacket[]).map((r) => ({
      ...toCamel(r as Record<string, unknown>),
      cuisine: typeof r.cuisine === 'string' ? r.cuisine.split(',').map((s: string) => s.trim()) : [],
    }))});
  } finally { db.release(); }
};

// PATCH /api/admin/restaurants/:id/status
export const updateRestaurantStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.body;
  const valid = ['active', 'inactive', 'suspended', 'pending_approval'];
  if (!valid.includes(status)) { res.status(400).json({ success: false, error: 'Invalid status' }); return; }

  const db = await pool.getConnection();
  try {
    await db.execute('UPDATE restaurants SET status=? WHERE id=?', [status, req.params.id]);
    res.json({ success: true, message: `Restaurant ${status}` });
  } finally { db.release(); }
};

// GET /api/admin/customers
export const getCustomers = async (_req: AuthRequest, res: Response): Promise<void> => {
  const db = await pool.getConnection();
  try {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT u.*,
              (SELECT COUNT(*) FROM orders WHERE customer_id=u.id) AS total_orders,
              (SELECT COALESCE(SUM(total),0) FROM orders WHERE customer_id=u.id AND payment_status='paid') AS total_spent
       FROM users u WHERE u.role='customer' ORDER BY u.created_at DESC`
    );
    res.json({
      success: true,
      data: (rows as RowDataPacket[]).map((u) => {
        const { password: _pw, ...safe } = u;
        return toCamel(safe as Record<string, unknown>);
      }),
    });
  } finally { db.release(); }
};

// PATCH /api/admin/customers/:id/status
export const updateCustomerStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.body;
  if (!['active', 'banned', 'inactive'].includes(status)) {
    res.status(400).json({ success: false, error: 'Invalid status' }); return;
  }
  const db = await pool.getConnection();
  try {
    await db.execute('UPDATE users SET status=? WHERE id=? AND role="customer"', [status, req.params.id]);
    res.json({ success: true, message: `Customer ${status}` });
  } finally { db.release(); }
};

// GET /api/admin/orders
export const getAllOrders = async (_req: AuthRequest, res: Response): Promise<void> => {
  const db = await pool.getConnection();
  try {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT o.*, u.name AS customer_name, r.name AS restaurant_name
       FROM orders o JOIN users u ON u.id=o.customer_id JOIN restaurants r ON r.id=o.restaurant_id
       ORDER BY o.placed_at DESC LIMIT 100`
    );
    res.json({ success: true, data: rowsToCamel(rows as Record<string, unknown>[]) });
  } finally { db.release(); }
};
