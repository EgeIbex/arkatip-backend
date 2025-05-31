import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AuthRequest } from '../types';

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth Header:', authHeader);

    if (!authHeader) {
      console.log('Authorization header bulunamadı');
      return res.status(401).json({ error: 'Yetkilendirme gerekli', details: 'Authorization header eksik' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token:', token);

    if (!token) {
      console.log('Token bulunamadı');
      return res.status(401).json({ error: 'Yetkilendirme gerekli', details: 'Token eksik' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET tanımlı değil!');
      return res.status(500).json({ error: 'Sunucu hatası', details: 'JWT_SECRET tanımlı değil' });
    }

    try {
      console.log('Token doğrulanıyor...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token doğrulandı:', decoded);

      if (typeof decoded === 'object' && 'userId' in decoded) {
        req.user = { id: decoded.userId as string };
        console.log('Token içeriği:', decoded);
        console.log('User ID atandı:', req.user.id);
        next();
      } else {
        console.log('Token içeriği geçersiz:', decoded);
        return res.status(401).json({ error: 'Yetkilendirme gerekli', details: 'Token içeriği geçersiz' });
      }
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        console.log('Token süresi dolmuş:', error.message);
        return res.status(401).json({ 
          error: 'Yetkilendirme gerekli', 
          details: 'Token süresi dolmuş',
          expiredAt: error.expiredAt
        });
      }
      if (error instanceof JsonWebTokenError) {
        console.log('Token doğrulama hatası:', error.message);
        return res.status(401).json({ 
          error: 'Yetkilendirme gerekli', 
          details: 'Token doğrulama hatası',
          message: error.message
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Auth middleware hatası:', error);
    return res.status(500).json({ 
      error: 'Sunucu hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
}; 