import { Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AuthRequest } from '../types';

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error('Token bulunamadı');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
    // userId'yi doğru şekilde ata
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    console.error('Auth middleware - Hata:', error);
    res.status(401).json({ error: 'Lütfen giriş yapın.' });
  }
}; 