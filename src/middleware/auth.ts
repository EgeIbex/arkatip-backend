import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AuthRequest } from '../types';

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // 1. Authorization header kontrolü
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Yetkilendirme gerekli', 
        details: 'Geçerli bir Bearer token gerekli' 
      });
    }

    // 2. Token'ı al
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        error: 'Yetkilendirme gerekli', 
        details: 'Token eksik' 
      });
    }

    // 3. JWT_SECRET kontrolü
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET tanımlı değil!');
      return res.status(500).json({ 
        error: 'Sunucu hatası', 
        details: 'JWT_SECRET tanımlı değil' 
      });
    }

    try {
      // 4. Token'ı doğrula
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 5. Token içeriğini kontrol et
      if (typeof decoded === 'object' && 'userId' in decoded) {
        // 6. User bilgisini request'e ekle
        req.user = { userId: decoded.userId as string };
        next();
      } else {
        return res.status(401).json({ 
          error: 'Yetkilendirme gerekli', 
          details: 'Geçersiz token içeriği' 
        });
      }
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return res.status(401).json({ 
          error: 'Yetkilendirme gerekli', 
          details: 'Token süresi dolmuş',
          expiredAt: error.expiredAt
        });
      }
      if (error instanceof JsonWebTokenError) {
        return res.status(401).json({ 
          error: 'Yetkilendirme gerekli', 
          details: 'Geçersiz token',
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