import { Request, Response } from 'express';
import { TranscribeService } from '../services/transcribeService';

export class TranscribeController {
  static async transcribe(req: Request, res: Response) {
    try {
      if (!req.file) {
        console.log('Hata: Ses dosyası bulunamadı');
        return res.status(400).json({ error: 'Ses dosyası bulunamadı' });
      }

      const transcript = await TranscribeService.transcribeAudio(req.file.buffer);      
      res.json({ transcript });
    } catch (error) {
      res.status(500).json({ 
        error: 'Ses dosyası dönüştürülemedi',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
    }
  }
} 