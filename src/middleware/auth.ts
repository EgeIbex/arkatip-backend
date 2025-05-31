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
  const logs: string[] = [];
  const addLog = (message: string) => {
    logs.push(`[${new Date().toISOString()}] ${message}`);
  };

  try {
    // 1. Authorization header kontrolü
    const authHeader = req.headers.authorization;
    addLog(`1. Auth Header: ${authHeader}`);

    if (!authHeader?.startsWith('Bearer ')) {
      addLog('1.1 Bearer token bulunamadı');
      return res.status(401).json({ 
        error: 'Yetkilendirme gerekli', 
        details: 'Geçerli bir Bearer token gerekli',
        debug: { 
          step: '1.1', 
          error: 'Bearer token bulunamadı',
          logs: logs
        }
      });
    }

    // 2. Token'ı al
    const token = authHeader.split(' ')[1];
    addLog(`2. Token: ${token}`);

    if (!token) {
      addLog('2.1 Token bulunamadı');
      return res.status(401).json({ 
        error: 'Yetkilendirme gerekli', 
        details: 'Token eksik',
        debug: { 
          step: '2.1', 
          error: 'Token bulunamadı',
          logs: logs
        }
      });
    }

    // 3. JWT_SECRET kontrolü
    if (!process.env.JWT_SECRET) {
      addLog('3.1 JWT_SECRET tanımlı değil!');
      return res.status(500).json({ 
        error: 'Sunucu hatası', 
        details: 'JWT_SECRET tanımlı değil',
        debug: { 
          step: '3.1', 
          error: 'JWT_SECRET tanımlı değil',
          logs: logs
        }
      });
    }

    addLog(`3.2 JWT_SECRET: ${JSON.stringify({
      length: process.env.JWT_SECRET.length,
      first5: process.env.JWT_SECRET.substring(0, 5),
      last5: process.env.JWT_SECRET.substring(process.env.JWT_SECRET.length - 5)
    })}`);

    try {
      // 4. Token'ı doğrula
      addLog('4. Token doğrulanıyor...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      addLog(`4.1 Token doğrulandı: ${JSON.stringify(decoded)}`);
      
      // 5. Token içeriğini kontrol et
      if (typeof decoded === 'object' && 'userId' in decoded) {
        // 6. User bilgisini request'e ekle
        req.user = { userId: decoded.userId as string };
        addLog(`5.1 User ID atandı: ${req.user.userId}`);
        next();
      } else {
        addLog(`5.2 Geçersiz token içeriği: ${JSON.stringify(decoded)}`);
        return res.status(401).json({ 
          error: 'Yetkilendirme gerekli', 
          details: 'Geçersiz token içeriği',
          debug: { 
            step: '5.2', 
            error: 'Geçersiz token içeriği',
            decoded: decoded,
            logs: logs
          }
        });
      }
    } catch (error) {
      addLog(`6. Token doğrulama hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
      
      if (error instanceof TokenExpiredError) {
        addLog(`6.1 Token süresi dolmuş: ${JSON.stringify({
          message: error.message,
          expiredAt: error.expiredAt
        })}`);
        return res.status(401).json({ 
          error: 'Yetkilendirme gerekli', 
          details: 'Token süresi dolmuş',
          expiredAt: error.expiredAt,
          debug: { 
            step: '6.1', 
            error: 'Token süresi dolmuş',
            message: error.message,
            expiredAt: error.expiredAt,
            logs: logs
          }
        });
      }
      if (error instanceof JsonWebTokenError) {
        addLog(`6.2 JWT hatası: ${JSON.stringify({
          message: error.message,
          name: error.name
        })}`);
        return res.status(401).json({ 
          error: 'Yetkilendirme gerekli', 
          details: 'Geçersiz token',
          message: error.message,
          debug: { 
            step: '6.2', 
            error: 'JWT hatası',
            message: error.message,
            name: error.name,
            logs: logs
          }
        });
      }
      throw error;
    }
  } catch (error) {
    addLog(`7. Genel hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    return res.status(500).json({ 
      error: 'Sunucu hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata',
      debug: { 
        step: '7', 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
        logs: logs
      }
    });
  }
}; 