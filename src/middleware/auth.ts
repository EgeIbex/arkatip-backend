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

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // 1. Authorization header kontrolü
    const authHeader = req.headers.authorization;
    const debugInfo: any = {
      step: '1. Auth Header Kontrolü',
      authHeader: authHeader,
      timestamp: new Date().toISOString()
    };

    if (!authHeader?.startsWith('Bearer ')) {
      debugInfo.error = 'Bearer token bulunamadı';
      return res.status(401).json({ 
        error: 'Yetkilendirme gerekli', 
        details: 'Geçerli bir Bearer token gerekli',
        debug: debugInfo
      });
    }

    // 2. Token'ı al
    const token = authHeader.split(' ')[1];
    debugInfo.step = '2. Token Alındı';
    debugInfo.token = token;

    if (!token) {
      debugInfo.error = 'Token bulunamadı';
      return res.status(401).json({ 
        error: 'Yetkilendirme gerekli', 
        details: 'Token eksik',
        debug: debugInfo
      });
    }

    // 3. JWT_SECRET kontrolü
    if (!process.env.JWT_SECRET) {
      debugInfo.error = 'JWT_SECRET tanımlı değil';
      return res.status(500).json({ 
        error: 'Sunucu hatası', 
        details: 'JWT_SECRET tanımlı değil',
        debug: debugInfo
      });
    }

    debugInfo.step = '3. JWT_SECRET Kontrolü';
    debugInfo.jwtSecret = {
      length: process.env.JWT_SECRET.length,
      first5: process.env.JWT_SECRET.substring(0, 5),
      last5: process.env.JWT_SECRET.substring(process.env.JWT_SECRET.length - 5)
    };

    try {
      // 4. Token'ı decode et (doğrulama olmadan)
      const decodedWithoutVerify = jwt.decode(token);
      debugInfo.step = '4. Token Decode';
      debugInfo.decodedWithoutVerify = decodedWithoutVerify;

      // 5. Token'ı doğrula
      debugInfo.step = '5. Token Doğrulama';
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      debugInfo.decoded = decoded;
      
      // 6. Token içeriğini kontrol et
      if (typeof decoded === 'object' && 'userId' in decoded) {
        // 7. User bilgisini request'e ekle
        req.user = { userId: decoded.userId as string };
        debugInfo.step = '6. User ID Atandı';
        debugInfo.userId = req.user.userId;
        next();
      } else {
        debugInfo.error = 'Geçersiz token içeriği';
        debugInfo.decoded = decoded;
        return res.status(401).json({ 
          error: 'Yetkilendirme gerekli', 
          details: 'Geçersiz token içeriği',
          debug: debugInfo
        });
      }
    } catch (error) {
      debugInfo.step = '7. Token Doğrulama Hatası';
      debugInfo.error = error instanceof Error ? error.message : 'Bilinmeyen hata';
      
      if (error instanceof TokenExpiredError) {
        debugInfo.errorType = 'TokenExpiredError';
        debugInfo.expiredAt = error.expiredAt;
        return res.status(401).json({ 
          error: 'Yetkilendirme gerekli', 
          details: 'Token süresi dolmuş',
          expiredAt: error.expiredAt,
          debug: debugInfo
        });
      }
      if (error instanceof JsonWebTokenError) {
        debugInfo.errorType = 'JsonWebTokenError';
        debugInfo.errorDetails = {
          message: error.message,
          name: error.name
        };
        return res.status(401).json({ 
          error: 'Yetkilendirme gerekli', 
          details: 'Geçersiz token',
          message: error.message,
          debug: debugInfo
        });
      }
      throw error;
    }
  } catch (error) {
    const debugInfo = {
      step: '8. Genel Hata',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      timestamp: new Date().toISOString()
    };
    return res.status(500).json({ 
      error: 'Sunucu hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata',
      debug: debugInfo
    });
  }
}; 