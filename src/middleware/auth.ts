import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AuthRequest } from '../types';
import fs from 'fs';
import path from 'path';

// Log dosyası yolu
const logFile = path.join(__dirname, '../../logs/auth.log');

// Log yazma fonksiyonu
const writeLog = (message: string) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  // Log dizinini oluştur
  const logDir = path.dirname(logFile);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  // Log dosyasına yaz
  fs.appendFileSync(logFile, logMessage);
};

interface DebugInfo {
  step: string;
  authHeader?: string;
  timestamp: string;
  requestInfo: {
    method: string;
    path: string;
    headers: any;
    ip?: string;
  };
  token?: {
    full: string;
    length: number;
    first10: string;
    last10: string;
  };
  jwtSecret?: {
    length: number;
    first5: string;
    last5: string;
  };
  decodedWithoutVerify?: any;
  decoded?: any;
  userId?: string;
  error?: string;
  errorType?: string;
  errorDetails?: {
    message: string;
    name: string;
  };
  expiredAt?: Date;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // 1. Authorization header kontrolü
    const authHeader = req.headers.authorization;
    console.log('1. Auth Header:', authHeader);

    if (!authHeader?.startsWith('Bearer ')) {
      console.log('1.1 Bearer token bulunamadı');
      return res.status(401).json({ 
        error: 'Yetkilendirme gerekli', 
        details: 'Geçerli bir Bearer token gerekli',
        debug: { step: '1.1', error: 'Bearer token bulunamadı' }
      });
    }

    // 2. Token'ı al
    const token = authHeader.split(' ')[1];
    console.log('2. Token:', token);

    if (!token) {
      console.log('2.1 Token bulunamadı');
      return res.status(401).json({ 
        error: 'Yetkilendirme gerekli', 
        details: 'Token eksik',
        debug: { step: '2.1', error: 'Token bulunamadı' }
      });
    }

    // 3. JWT_SECRET kontrolü
    if (!process.env.JWT_SECRET) {
      console.error('3.1 JWT_SECRET tanımlı değil!');
      return res.status(500).json({ 
        error: 'Sunucu hatası', 
        details: 'JWT_SECRET tanımlı değil',
        debug: { step: '3.1', error: 'JWT_SECRET tanımlı değil' }
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
          details: 'Geçersiz token içeriği',
          debug: { 
            step: '6.2', 
            error: 'Geçersiz token içeriği',
            decoded: decoded
          }
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
          expiredAt: error.expiredAt,
          debug: { 
            step: '7.1', 
            error: 'Token süresi dolmuş',
            message: error.message,
            expiredAt: error.expiredAt
          }
        });
      }
      if (error instanceof JsonWebTokenError) {
        console.log('7.2 JWT hatası:', {
          message: error.message,
          name: error.name
        });
        return res.status(401).json({ 
          error: 'Yetkilendirme gerekli', 
          details: 'Geçersiz token',
          message: error.message,
          debug: { 
            step: '7.2', 
            error: 'JWT hatası',
            message: error.message,
            name: error.name
          }
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('8. Genel hata:', error);
    return res.status(500).json({ 
      error: 'Sunucu hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata',
      debug: { 
        step: '8', 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      }
    });
  }
}; 