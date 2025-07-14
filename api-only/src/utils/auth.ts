import jwt from 'jsonwebtoken';
import { Request, Response } from 'verb';
import { config } from '../config';
import { logger } from './logger';
import { UserRepository } from '../repositories/user';

const userRepo = new UserRepository();

export function generateToken(userId: number): string {
  return jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
}

export function verifyToken(token: string): { userId: number } | null {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: number };
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function authenticateToken(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    res.status = 401;
    res.json({ error: 'Access token required' });
    return;
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    res.status = 403;
    res.json({ error: 'Invalid or expired token' });
    return;
  }
  
  try {
    const user = await userRepo.findById(decoded.userId);
    if (!user) {
      res.status = 403;
      res.json({ error: 'User not found' });
      return;
    }
    
    (req as any).userId = decoded.userId;
    (req as any).user = user;
    next();
  } catch (error) {
    logger.error('Error in authentication middleware:', error);
    res.status = 500;
    res.json({ error: 'Authentication error' });
  }
}