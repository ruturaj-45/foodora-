import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import pool from '../db/connection';
import { signToken } from '../utils/jwt';
import { AuthRequest } from '../types';
import { toCamel } from '../utils/helpers';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

// POST /api/auth/signup
export const signup = async (req: Request, res: Response): Promise<void> => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    res.status(400).json({ success: false, error: 'All fields are required' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    return;
  }

  const db = await pool.getConnection();
  try {
    const [exists] = await db.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?', [email]
    );
    if ((exists as RowDataPacket[]).length > 0) {
      res.status(409).json({ success: false, error: 'Email already registered' });
      return;
    }

    const id = uuid();
    const hashed = await bcrypt.hash(password, 10);
    await db.execute<ResultSetHeader>(
      'INSERT INTO users (id,name,email,phone,password,role) VALUES (?,?,?,?,?,?)',
      [id, name, email, phone, hashed, 'customer']
    );

    const token = signToken({ userId: id, role: 'customer' });
    res.status(201).json({
      success: true,
      data: { token, user: { id, name, email, phone, role: 'customer', avatar: null } },
      message: 'Account created successfully',
    });
  } finally {
    db.release();
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ success: false, error: 'Email and password are required' });
    return;
  }

  const db = await pool.getConnection();
  try {
    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ? AND status != "banned"', [email]
    );
    const user = (rows as RowDataPacket[])[0];
    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password as string);
    if (!valid) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const token = signToken({ userId: user.id as string, role: user.role as 'customer' | 'restaurant' | 'admin' });

    // Fetch addresses
    const [addrs] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC', [user.id]
    );

    // If restaurant user → get their restaurant id
    let restaurantId: string | null = null;
    if (user.role === 'restaurant') {
      const [rest] = await db.execute<RowDataPacket[]>(
        'SELECT id FROM restaurants WHERE owner_id = ? LIMIT 1', [user.id]
      );
      if ((rest as RowDataPacket[]).length > 0) {
        restaurantId = (rest as RowDataPacket[])[0].id as string;
      }
    }

    const { password: _pw, ...safeUser } = user;
    res.json({
      success: true,
      data: {
        token,
        user: {
          ...toCamel(safeUser as Record<string, unknown>),
          addresses: (addrs as RowDataPacket[]).map((a) => toCamel(a as Record<string, unknown>)),
          restaurantId,
        },
      },
    });
  } finally {
    db.release();
  }
};

// GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const db = await pool.getConnection();
  try {
    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ?', [req.user!.userId]
    );
    const user = (rows as RowDataPacket[])[0];
    if (!user) { res.status(404).json({ success: false, error: 'User not found' }); return; }

    const [addrs] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC', [user.id]
    );

    let restaurantId: string | null = null;
    if (user.role === 'restaurant') {
      const [rest] = await db.execute<RowDataPacket[]>(
        'SELECT id FROM restaurants WHERE owner_id = ? LIMIT 1', [user.id]
      );
      if ((rest as RowDataPacket[]).length > 0) restaurantId = (rest as RowDataPacket[])[0].id as string;
    }

    const { password: _pw, ...safeUser } = user;
    res.json({
      success: true,
      data: {
        ...toCamel(safeUser as Record<string, unknown>),
        addresses: (addrs as RowDataPacket[]).map((a) => toCamel(a as Record<string, unknown>)),
        restaurantId,
      },
    });
  } finally {
    db.release();
  }
};

// PUT /api/auth/profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, phone, avatar } = req.body;
  const db = await pool.getConnection();
  try {
    await db.execute(
      'UPDATE users SET name=?, phone=?, avatar=? WHERE id=?',
      [name, phone, avatar ?? null, req.user!.userId]
    );
    res.json({ success: true, message: 'Profile updated' });
  } finally {
    db.release();
  }
};

// GET /api/auth/addresses
export const getAddresses = async (req: AuthRequest, res: Response): Promise<void> => {
  const db = await pool.getConnection();
  try {
    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM addresses WHERE user_id=? ORDER BY is_default DESC', [req.user!.userId]
    );
    res.json({ success: true, data: (rows as RowDataPacket[]).map((r) => toCamel(r as Record<string, unknown>)) });
  } finally { db.release(); }
};

// POST /api/auth/addresses
export const addAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  const { label, line1, line2, city, state, pincode, isDefault } = req.body;
  const db = await pool.getConnection();
  try {
    const id = uuid();
    if (isDefault) {
      await db.execute('UPDATE addresses SET is_default=0 WHERE user_id=?', [req.user!.userId]);
    }
    await db.execute(
      'INSERT INTO addresses (id,user_id,label,line1,line2,city,state,pincode,is_default) VALUES (?,?,?,?,?,?,?,?,?)',
      [id, req.user!.userId, label || 'Home', line1, line2 || null, city, state, pincode, isDefault ? 1 : 0]
    );
    res.status(201).json({ success: true, data: { id, label, line1, line2, city, state, pincode, isDefault: !!isDefault } });
  } finally { db.release(); }
};

// DELETE /api/auth/addresses/:id
export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  const db = await pool.getConnection();
  try {
    await db.execute('DELETE FROM addresses WHERE id=? AND user_id=?', [req.params.id, req.user!.userId]);
    res.json({ success: true, message: 'Address deleted' });
  } finally { db.release(); }
};
