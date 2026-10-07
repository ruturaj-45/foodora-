import { Request, Response } from 'express';
import pool from '../db/connection';
import type { RowDataPacket } from 'mysql2';

// POST /api/coupons/validate
export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
  const { code, subtotal } = req.body;
  if (!code) { res.status(400).json({ success: false, error: 'Coupon code required' }); return; }

  const db = await pool.getConnection();
  try {
    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM coupons WHERE code=? AND is_active=1', [code.toUpperCase()]
    );
    const coupon = (rows as RowDataPacket[])[0];
    if (!coupon) { res.status(400).json({ success: false, error: 'Invalid coupon code' }); return; }

    const sub = Number(subtotal) || 0;
    if (sub < Number(coupon.min_order)) {
      res.status(400).json({ success: false, error: `Minimum order amount is ₹${coupon.min_order} for this coupon` }); return;
    }

    let discount = 0;
    const DELIVERY_FEE = 40;
    if (coupon.type === 'percentage') {
      discount = Math.round(sub * Number(coupon.value) / 100);
      if (coupon.max_discount) discount = Math.min(discount, Number(coupon.max_discount));
    } else if (coupon.type === 'flat') {
      discount = Math.min(Number(coupon.value), sub);
    } else if (coupon.type === 'free_delivery') {
      discount = DELIVERY_FEE;
    }

    res.json({
      success: true,
      data: {
        code:        coupon.code,
        type:        coupon.type,
        value:       coupon.value,
        description: coupon.description,
        discount,
      },
    });
  } finally { db.release(); }
};
