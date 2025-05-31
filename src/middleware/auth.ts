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
    writeLog(`1. Auth Header: ${authHeader}`);

    if (!authHeader?.startsWith('Bearer ')) {
      writeLog('1.1 Bearer token bulunamadı');
      return res.status(401).json({ 
        error: 'Yetkilendirme gerekli', 
        details: 'Geçerli bir Bearer token gerekli' 
      });
    }

    // 2. Token'ı al
    const token = authHeader.split(' ')[1];
    writeLog(`2. Token: ${token}`);

    if (!token) {
      writeLog('2.1 Token bulunamadı');
      return res.status(401).json({ 
        error: 'Yetkilendirme gerekli', 
        details: 'Token eksik' 
      });
    }

    // 3. JWT_SECRET kontrolü
    if (!process.env.JWT_SECRET) {
      writeLog('3.1 JWT_SECRET tanımlı değil!');
      return res.status(500).json({ 
        error: 'Sunucu hatası', 
        details: 'JWT_SECRET tanımlı değil' 
      });
    }

    writeLog(`3.2 JWT_SECRET: ${JSON.stringify({
      length: process.env.JWT_SECRET.length,
      first5: process.env.JWT_SECRET.substring(0, 5),
      last5: process.env.JWT_SECRET.substring(process.env.JWT_SECRET.length - 5)
    })}`);

    try {
      // 4. Token'ı decode et (doğrulama olmadan)
      const decodedWithoutVerify = jwt.decode(token);
      writeLog(`4. Token decode (verify olmadan): ${JSON.stringify(decodedWithoutVerify)}`);

      // 5. Token'ı doğrula
      writeLog('5. Token doğrulanıyor...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      writeLog(`5.1 Token doğrulandı: ${JSON.stringify(decoded)}`);
      
      // 6. Token içeriğini kontrol et
      if (typeof decoded === 'object' && 'userId' in decoded) {
        // 7. User bilgisini request'e ekle
        req.user = { userId: decoded.userId as string };
        writeLog(`6.1 User ID atandı: ${req.user.userId}`);
        next();
      } else {
        writeLog(`6.2 Geçersiz token içeriği: ${JSON.stringify(decoded)}`);
        return res.status(401).json({ 
          error: 'Yetkilendirme gerekli', 
          details: 'Geçersiz token içeriği' 
        });
      }
    } catch (error) {
      writeLog(`7. Token doğrulama hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
      
      if (error instanceof TokenExpiredError) {
        writeLog(`7.1 Token süresi dolmuş: ${JSON.stringify({
          message: error.message,
          expiredAt: error.expiredAt
        })}`);
        return res.status(401).json({ 
          error: 'Yetkilendirme gerekli', 
          details: 'Token süresi dolmuş',
          expiredAt: error.expiredAt
        });
      }
      if (error instanceof JsonWebTokenError) {
        writeLog(`7.2 JWT hatası: ${JSON.stringify({
          message: error.message,
          name: error.name,
          stack: error.stack
        })}`);
        return res.status(401).json({ 
          error: 'Yetkilendirme gerekli', 
          details: 'Geçersiz token',
          message: error.message
        });
      }
      throw error;
    }
  } catch (error) {
    writeLog(`8. Genel hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    return res.status(500).json({ 
      error: 'Sunucu hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
}; 