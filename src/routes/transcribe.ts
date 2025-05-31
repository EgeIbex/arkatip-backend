import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { TranscribeController } from '../controllers/transcribeController';

const router = express.Router();

// Multer yapılandırması
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    console.log('Dosya yükleniyor:', {
      originalname: file.originalname,
      mimetype: file.mimetype
    });

    if (file.mimetype.startsWith('audio/')) {
      console.log('Geçerli ses dosyası');
      cb(null, true);
    } else {
      console.log('Geçersiz dosya tipi:', file.mimetype);
      cb(new Error('Sadece ses dosyaları kabul edilir'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Multer hata yakalama middleware'i
const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer hatası:', err);
    return res.status(400).json({ error: 'Dosya yükleme hatası', details: err.message });
  } else if (err) {
    console.error('Dosya yükleme hatası:', err);
    return res.status(400).json({ error: err.message });
  }
  next();
};

// Route tanımı
router.post('/', handleMulterError, upload.single('audio'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Transcribe isteği alındı');
    console.log('Headers:', req.headers);
    console.log('Files:', req.file);
    console.log('Body:', req.body);

    if (!req.file) {
      console.log('Hata: Ses dosyası bulunamadı');
      return res.status(400).json({ error: 'Ses dosyası bulunamadı' });
    }

    console.log('Ses dosyası detayları:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer ? 'Buffer mevcut' : 'Buffer yok'
    });

    await TranscribeController.transcribe(req, res);
  } catch (error) {
    next(error);
  }
});

export default router; 