import { Response } from 'express';
import pool from '../db/connection';
import { AuthRequest } from '../types';
import { toCamel } from '../utils/helpers';
import type { RowDataPacket } from 'mysql2';

// GET /api/notifications
export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  const db = await pool.getConnection();
  try {
    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 30',
      [req.user!.userId]
    );
    const [unread] = await db.execute<RowDataPacket[]>(
      'SELECT COUNT(*) AS count FROM notifications WHERE user_id=? AND is_read=0',
      [req.user!.userId]
    );
    res.json({
      success: true,
      data: (rows as RowDataPacket[]).map((r) => toCamel(r as Record<string, unknown>)),
      unreadCount: (unread as RowDataPacket[])[0].count,
    });
  } finally { db.release(); }
};

// PATCH /api/notifications/:id/read
export const markRead = async (req: AuthRequest, res: Response): Promise<void> => {
  const db = await pool.getConnection();
  try {
    await db.execute('UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?', [req.params.id, req.user!.userId]);
    res.json({ success: true });
  } finally { db.release(); }
};

// PATCH /api/notifications/read-all
export const markAllRead = async (req: AuthRequest, res: Response): Promise<void> => {
  const db = await pool.getConnection();
  try {
    await db.execute('UPDATE notifications SET is_read=1 WHERE user_id=?', [req.user!.userId]);
    res.json({ success: true });
  } finally { db.release(); }
};
