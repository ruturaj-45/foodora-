import { Request, Response } from 'express';
import pool from '../db/connection';
import { AuthRequest } from '../types';
import { toCamel, rowsToCamel, safeJson } from '../utils/helpers';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

const buildRestaurantRow = (r: RowDataPacket) => ({
  ...toCamel(r as Record<string, unknown>),
  cuisine: typeof r.cuisine === 'string' ? r.cuisine.split(',').map((s: string) => s.trim()) : [],
  tags:    typeof r.tags    === 'string' ? r.tags.split(',').map((s: string) => s.trim())    : [],
  isOpen:  r.is_open === 1,
});

// GET /api/restaurants
export const listRestaurants = async (req: Request, res: Response): Promise<void> => {
  const { search = '', cuisine = '', rating = '0', freeDelivery = 'false',
          offersOnly = 'false', sort = 'recommended', limit = '50', offset = '0' } = req.query as Record<string, string>;

  let sql = `SELECT * FROM restaurants WHERE status = 'active'`;
  const params: (string | number)[] = [];

  if (search) {
    sql += ` AND (name LIKE ? OR cuisine LIKE ? OR tags LIKE ?)`;
    const like = `%${search}%`;
    params.push(like, like, like);
  }
  if (cuisine) {
    sql += ` AND cuisine LIKE ?`;
    params.push(`%${cuisine}%`);
  }
  const minRating = parseFloat(rating);
  if (minRating > 0) {
    sql += ` AND rating >= ?`;
    params.push(minRating);
  }
  if (freeDelivery === 'true') {
    sql += ` AND delivery_fee = 0`;
  }
  if (offersOnly === 'true') {
    sql += ` AND offer IS NOT NULL AND offer != ''`;
  }

  // Sorting
  switch (sort) {
    case 'rating':        sql += ` ORDER BY rating DESC`; break;
    case 'delivery_time': sql += ` ORDER BY delivery_time ASC`; break;
    case 'price_low':     sql += ` ORDER BY FIELD(price_range,'₹','₹₹','₹₹₹','₹₹₹₹') ASC`; break;
    case 'price_high':    sql += ` ORDER BY FIELD(price_range,'₹','₹₹','₹₹₹','₹₹₹₹') DESC`; break;
    default:              sql += ` ORDER BY rating DESC, rating_count DESC`; break;
  }
  sql += ` LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));

  const db = await pool.getConnection();
  try {
    const [rows] = await db.execute<RowDataPacket[]>(sql, params);
    const [countRow] = await db.execute<RowDataPacket[]>('SELECT COUNT(*) as total FROM restaurants WHERE status="active"');
    res.json({
      success: true,
      data: (rows as RowDataPacket[]).map(buildRestaurantRow),
      total: (countRow as RowDataPacket[])[0].total,
    });
  } finally { db.release(); }
};

// GET /api/restaurants/:id
export const getRestaurant = async (req: Request, res: Response): Promise<void> => {
  const db = await pool.getConnection();
  try {
    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM restaurants WHERE id = ?', [req.params.id]
    );
    if (!(rows as RowDataPacket[]).length) {
      res.status(404).json({ success: false, error: 'Restaurant not found' }); return;
    }
    const r = (rows as RowDataPacket[])[0];
    // Fetch menu categories
    const [cats] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM menu_categories WHERE restaurant_id=? ORDER BY sort_order', [r.id]
    );
    res.json({
      success: true,
      data: { ...buildRestaurantRow(r), menuCategories: rowsToCamel(cats as Record<string, unknown>[]) },
    });
  } finally { db.release(); }
};

// GET /api/restaurants/:id/menu
export const getMenu = async (req: Request, res: Response): Promise<void> => {
  const db = await pool.getConnection();
  try {
    const [foods] = await db.execute<RowDataPacket[]>(
      `SELECT f.*, GROUP_CONCAT(
         JSON_OBJECT('id', fc.id, 'name', fc.name, 'price', fc.price)
         SEPARATOR '|||'
       ) AS customizations_raw
       FROM foods f
       LEFT JOIN food_customizations fc ON fc.food_id = f.id
       WHERE f.restaurant_id = ?
       GROUP BY f.id
       ORDER BY f.category, f.is_bestseller DESC`,
      [req.params.id]
    );

    const items = (foods as RowDataPacket[]).map((f) => {
      const raw = f.customizations_raw as string | null;
      const customizations = raw
        ? raw.split('|||').map((s: string) => {
            try { return JSON.parse(s); } catch { return null; }
          }).filter(Boolean)
        : [];
      const { customizations_raw: _cr, ...rest } = f;
      return {
        ...toCamel(rest as Record<string, unknown>),
        ingredients: safeJson<string[]>(f.ingredients as string, []),
        tags: typeof f.tags === 'string' ? f.tags.split(',').map((t: string) => t.trim()) : [],
        isBestseller: f.is_bestseller === 1,
        isAvailable:  f.is_available  === 1,
        customizations,
      };
    });
    res.json({ success: true, data: items });
  } finally { db.release(); }
};

// POST /api/restaurants/:id/menu  (restaurant owner)
export const addMenuItem = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, description, price, category, image, vegType, isAvailable, isBestseller } = req.body;
  if (!name || !price || !category) {
    res.status(400).json({ success: false, error: 'name, price and category are required' }); return;
  }
  const db = await pool.getConnection();
  try {
    // Ensure owner matches
    const [owns] = await db.execute<RowDataPacket[]>(
      'SELECT id FROM restaurants WHERE id=? AND owner_id=?', [req.params.id, req.user!.userId]
    );
    if (!(owns as RowDataPacket[]).length) {
      res.status(403).json({ success: false, error: 'Not your restaurant' }); return;
    }
    const { v4: uuidFn } = await import('uuid');
    const id = uuidFn();
    await db.execute(
      `INSERT INTO foods (id,restaurant_id,name,description,price,image,category,veg_type,is_available,is_bestseller)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [id, req.params.id, name, description || '', price, image || '', category, vegType || 'veg', isAvailable ? 1 : 0, isBestseller ? 1 : 0]
    );
    res.status(201).json({ success: true, data: { id, name, price, category }, message: 'Item added' });
  } finally { db.release(); }
};

// PUT /api/restaurants/:id/menu/:foodId
export const updateMenuItem = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, description, price, category, image, vegType, isAvailable, isBestseller } = req.body;
  const db = await pool.getConnection();
  try {
    const [owns] = await db.execute<RowDataPacket[]>(
      'SELECT r.id FROM restaurants r JOIN foods f ON f.restaurant_id=r.id WHERE r.id=? AND r.owner_id=? AND f.id=?',
      [req.params.id, req.user!.userId, req.params.foodId]
    );
    if (!(owns as RowDataPacket[]).length) {
      res.status(403).json({ success: false, error: 'Not your restaurant or item' }); return;
    }
    await db.execute(
      `UPDATE foods SET name=?,description=?,price=?,category=?,image=?,veg_type=?,is_available=?,is_bestseller=? WHERE id=?`,
      [name, description, price, category, image || '', vegType || 'veg', isAvailable ? 1 : 0, isBestseller ? 1 : 0, req.params.foodId]
    );
    res.json({ success: true, message: 'Item updated' });
  } finally { db.release(); }
};

// DELETE /api/restaurants/:id/menu/:foodId
export const deleteMenuItem = async (req: AuthRequest, res: Response): Promise<void> => {
  const db = await pool.getConnection();
  try {
    const [owns] = await db.execute<RowDataPacket[]>(
      'SELECT r.id FROM restaurants r JOIN foods f ON f.restaurant_id=r.id WHERE r.id=? AND r.owner_id=? AND f.id=?',
      [req.params.id, req.user!.userId, req.params.foodId]
    );
    if (!(owns as RowDataPacket[]).length) {
      res.status(403).json({ success: false, error: 'Not your restaurant or item' }); return;
    }
    await db.execute('DELETE FROM foods WHERE id=?', [req.params.foodId]);
    res.json({ success: true, message: 'Item deleted' });
  } finally { db.release(); }
};

// PATCH /api/restaurants/:id/menu/:foodId/availability
export const toggleAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  const db = await pool.getConnection();
  try {
    await db.execute(
      'UPDATE foods SET is_available = NOT is_available WHERE id=? AND restaurant_id=?',
      [req.params.foodId, req.params.id]
    );
    const [rows] = await db.execute<RowDataPacket[]>('SELECT is_available FROM foods WHERE id=?', [req.params.foodId]);
    res.json({ success: true, data: { isAvailable: (rows as RowDataPacket[])[0]?.is_available === 1 } });
  } finally { db.release(); }
};
