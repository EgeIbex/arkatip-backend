import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AuthRequest } from '../types';

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // 1. Authorization header kontrolü
    const authHeader = req.headers.authorization;
    console.log('1. Auth Header:', authHeader);

    if (!authHeader?.startsWith('Bearer ')) {
      console.log('1.1 Bearer token bulunamadı');
      return res.status(401).json({ 
        error: 'Yetkilendirme gerekli', 
        details: 'Geçerli bir Bearer token gerekli' 
      });
    }

    // 2. Token'ı al
    const token = authHeader.split(' ')[1];
    console.log('2. Token:', token);

    if (!token) {
      console.log('2.1 Token bulunamadı');
      return res.status(401).json({ 
        error: 'Yetkilendirme gerekli', 
        details: 'Token eksik' 
      });
    }

    // 3. JWT_SECRET kontrolü
    if (!process.env.JWT_SECRET) {
      console.error('3.1 JWT_SECRET tanımlı değil!');
      return res.status(500).json({ 
        error: 'Sunucu hatası', 
        details: 'JWT_SECRET tanımlı değil' 
      });
    }

    console.log('3.2 JWT_SECRET:', {
      length: process.env.JWT_SECRET.length,
      first5: process.env.JWT_SECRET.substring(0, 5),
      last5: process.env.JWT_SECRET.substring(process.env.JWT_SECRET.length - 5)
    });

    try {
      // 4. Token'ı decode et (doğrulama olmadan)
      const decodedWithoutVerify = jwt.decode(token);
      console.log('4. Token decode (verify olmadan):', decodedWithoutVerify);

      // 5. Token'ı doğrula
      console.log('5. Token doğrulanıyor...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('5.1 Token doğrulandı:', decoded);
      
      // 6. Token içeriğini kontrol et
      if (typeof decoded === 'object' && 'userId' in decoded) {
        // 7. User bilgisini request'e ekle
        req.user = { userId: decoded.userId as string };
        console.log('6.1 User ID atandı:', req.user.userId);
        next();
      } else {
        console.log('6.2 Geçersiz token içeriği:', decoded);
        return res.status(401).json({ 
          error: 'Yetkilendirme gerekli', 
          details: 'Geçersiz token içeriği' 
        });
      }
    } catch (error) {
      console.error('7. Token doğrulama hatası:', error);
      
      if (error instanceof TokenExpiredError) {
        console.log('7.1 Token süresi dolmuş:', {
          message: error.message,
          expiredAt: error.expiredAt
        });
        return res.status(401).json({ 
          error: 'Yetkilendirme gerekli', 
          details: 'Token süresi dolmuş',
          expiredAt: error.expiredAt
        });
      }
      if (error instanceof JsonWebTokenError) {
        console.log('7.2 JWT hatası:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
        return res.status(401).json({ 
          error: 'Yetkilendirme gerekli', 
          details: 'Geçersiz token',
          message: error.message
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('8. Genel hata:', error);
    return res.status(500).json({ 
      error: 'Sunucu hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
}; 