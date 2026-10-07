import { Response } from 'express';
import { v4 as uuid } from 'uuid';
import pool from '../db/connection';
import { AuthRequest } from '../types';
import type { RowDataPacket } from 'mysql2';

// GET /api/favorites
export const getFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
  const db = await pool.getConnection();
  try {
    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT type, target_id AS targetId FROM favorites WHERE user_id=?',
      [req.user!.userId]
    );
    const restaurants = (rows as RowDataPacket[]).filter((r) => r.type === 'restaurant').map((r) => r.targetId as string);
    const foods       = (rows as RowDataPacket[]).filter((r) => r.type === 'food').map((r) => r.targetId as string);
    res.json({ success: true, data: { restaurants, foods } });
  } finally { db.release(); }
};

// POST /api/favorites/toggle
export const toggleFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  const { type, targetId } = req.body;
  if (!type || !targetId) { res.status(400).json({ success: false, error: 'type and targetId required' }); return; }

  const db = await pool.getConnection();
  try {
    const [exists] = await db.execute<RowDataPacket[]>(
      'SELECT id FROM favorites WHERE user_id=? AND type=? AND target_id=?',
      [req.user!.userId, type, targetId]
    );
    if ((exists as RowDataPacket[]).length > 0) {
      await db.execute('DELETE FROM favorites WHERE user_id=? AND type=? AND target_id=?', [req.user!.userId, type, targetId]);
      res.json({ success: true, data: { isFavorite: false }, message: 'Removed from favourites' });
    } else {
      await db.execute(
        'INSERT INTO favorites (id,user_id,type,target_id) VALUES (?,?,?,?)',
        [uuid(), req.user!.userId, type, targetId]
      );
      res.json({ success: true, data: { isFavorite: true }, message: 'Added to favourites' });
    }
  } finally { db.release(); }
};
