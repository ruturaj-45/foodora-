import jwt from 'jsonwebtoken';
import { AuthPayload } from '../types';

const SECRET  = process.env.JWT_SECRET   || 'foodora_secret';
const EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

export const signToken = (payload: AuthPayload): string =>
  jwt.sign(payload, SECRET, { expiresIn: EXPIRES } as jwt.SignOptions);

export const verifyToken = (token: string): AuthPayload =>
  jwt.verify(token, SECRET) as AuthPayload;
