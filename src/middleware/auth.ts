import { Response, NextFunction } from 'express';
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

    // Token'ı doğrudan request'e ekle
    req.user = { id: '8ab83ba4-2330-4f86-b36e-0072634e034a' }; // Geçici olarak sabit bir ID
    console.log('User ID atandı:', req.user.id);
    next();
  } catch (error) {
    console.error('Auth middleware hatası:', error);
    return res.status(500).json({ 
      error: 'Sunucu hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
}; 